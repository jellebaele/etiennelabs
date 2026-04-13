---
title: 'CQRS-Pattern'
date: '2026-04-13'
tags: ['Design patterns']
excerpt: 'CQRS is a spectrum, not a binary choice. Learn how to evolve your architecture from simple logical separation in code to fully independent data stores.'
---

# Intro

In traditional architectures, we often force a single model to handle two opposing jobs: processing complex business logic and serving high-speed UI views. As systems grow, this "one size fits all" approach creates bloated entities and performance bottlenecks.

Command Query Responsibility Segregation (CQRS) is the solution, but it’s often misunderstood as a "two-database-only" pattern. In reality, CQRS is a spectrum of separation that you can implement in stages:

- **Logical Separation:** You keep your existing database but split your code into distinct paths:
  - Rich Domain Models for Commands (Writes)
  - Thin DTOs for Queries (Reads).
- **Physical Separation:** You move the read and write models into entirely different databases (e.g., SQL for writes, NoSQL for reads) to handle extreme scale.

By treating CQRS as a spectrum, you can start by simply cleaning up your project structure today, while leaving the door open for massive scalability tomorrow.

# Context and problem

In traditional architectures, a single data model is often used for both read and write operations. This approach is simple and works well for basic CRUD-style applications.

However, as the system grows in complexity, several problems tend to emerge:

- **Complex validation logic**
  A single model must support many different use cases, resulting in tangled validation rules that vary depending on whether the data is being created, updated, or merely read.
- **Many different read views**
  The same domain model is forced to support dashboards, lists, reports, detail pages, exports, and APIs, often leading to bloated entities or excessive projection logic.
- **Performance optimizations leaking into the domain**
  Indexing concerns, denormalization, caching flags, or query-specific fields often pollute the domain model to satisfy read-performance requirements.
- **God services and entities**
  Business logic, query logic, validation, and orchestration accumulate in the same services or entities, making them hard to reason about, test, and evolve.
- **Data mismatch between reads and writes**
  Fields required for write operations (for example, invariants or internal state) are often irrelevant for reads, while read operations may need aggregated or derived data that does not naturally belong in the write model.
- **Lock contention**
  Concurrent read and write operations against the same data structures can cause contention, reducing throughput and increasing latency.
- **Performance degradation**
  Complex queries, joins, and ORM mappings required to serve read use cases can negatively impact write performance and overall system responsiveness.
- **Security challenges**
  Mixing read and write concerns makes it harder to apply fine-grained authorization rules. Sensitive fields required for writes might be unintentionally exposed during reads.

For example, consider the following code:

```csharp
public class Order
{
    // Persistence
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } // Draft, Paid, Shipped, Cancelled

    // UI / Read concerns
    public string CustomerName { get; set; }
    public int ItemCount { get; set; }

    // Infrastructure leakage
    public DateTime UpdatedAt { get; set; }

    public void AddItem(OrderItem item)
    {
        if (Status != "Draft")
            throw new InvalidOperationException("Cannot modify order");

        ItemCount++;
        TotalPrice += item.Price;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Pay()
    {
        if (TotalPrice <= 0)
            throw new InvalidOperationException("Order is empty");

        Status = "Paid";
        UpdatedAt = DateTime.UtcNow;
    }

    public bool CanBeCancelled()
    {
        return Status == "Draft" || Status == "Paid";
    }
}
```

Here the following problems occur:

- Domain logic mixed with UI needs
- Read-only data (CustomerName) pollutes the write model
- Stringly-typed state
- No clear intent per use case

```csharp
public class OrderService
{
    private readonly DbContext _db;

    public OrderService(DbContext db)
    {
        _db = db;
    }

    public Order CreateOrder(Guid customerId)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            Status = "Draft",
            UpdatedAt = DateTime.UtcNow
        };

        _db.Add(order);
        _db.SaveChanges();

        return order;
    }

    public Order AddItem(Guid orderId, Guid productId)
    {
        var order = _db.Set<Order>().Single(o => o.Id == orderId);
        var product = _db.Set<Product>().Single(p => p.Id == productId);

        order.AddItem(new OrderItem(product.Price));

        _db.SaveChanges();
        return order;
    }

    public Order Pay(Guid orderId)
    {
        var order = _db.Set<Order>().Single(o => o.Id == orderId);
        order.Pay();

        _db.SaveChanges();
        return order;
    }

    public List<Order> GetOrdersForCustomer(Guid customerId)
    {
        return _db.Set<Order>()
            .Where(o => o.CustomerId == customerId)
            .ToList();
    }
}
```

Problems:

- Commands return domain entities
- Reads and writes are mixed
- Service keeps growing forever
- Impossible to optimize reads without touching write logic
- Hard to test and reason about

Using CQRS, we introduce explicit intent and seperation:

```csharp
public class Order
{
    public Guid Id { get; private set; }
    public Guid CustomerId { get; private set; }
    public decimal TotalPrice { get; private set; }
    public OrderStatus Status { get; private set; }

    private Order() { }

    public static Order Create(Guid customerId)
    {
        return new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            Status = OrderStatus.Draft
        };
    }

    public void AddItem(decimal price)
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Order not editable");

        TotalPrice += price;
    }

    public void Pay()
    {
        if (TotalPrice <= 0)
            throw new InvalidOperationException("Empty order");

        Status = OrderStatus.Paid;
    }
}

public enum OrderStatus
{
    Draft,
    Paid,
    Shipped,
    Cancelled
}
```

✔ No UI fields
✔ No read logic
✔ Pure domain rules

```csharp
public record CreateOrderCommand(Guid CustomerId);
public record AddItemToOrderCommand(Guid OrderId, Guid ProductId);
public record PayOrderCommand(Guid OrderId);

public class CreateOrderHandler
{
    private readonly DbContext _db;

    public CreateOrderHandler(DbContext db)
    {
        _db = db;
    }

    public Guid Handle(CreateOrderCommand command)
    {
        var order = Order.Create(command.CustomerId);
        _db.Add(order);
        _db.SaveChanges();

        return order.Id;
    }
}

public class AddItemToOrderHandler
{
    private readonly DbContext _db;

    public AddItemToOrderHandler(DbContext db)
    {
        _db = db;
    }

    public void Handle(AddItemToOrderCommand command)
    {
        var order = _db.Set<Order>().Single(o => o.Id == command.OrderId);
        var product = _db.Set<Product>().Single(p => p.Id == command.ProductId);

        order.AddItem(product.Price);
        _db.SaveChanges();
    }
}

public class PayOrderHandler
{
    private readonly DbContext _db;

    public PayOrderHandler(DbContext db)
    {
        _db = db;
    }

    public void Handle(PayOrderCommand command)
    {
        var order = _db.Set<Order>().Single(o => o.Id == command.OrderId);
        order.Pay();
        _db.SaveChanges();
    }
}
```

✔ Each handler does one thing
✔ Commands express business intent
✔ No accidental reads

And on the read side:

```csharp
public class OrderSummaryDto
{
    public Guid OrderId { get; init; }
    public string Status { get; init; }
    public decimal TotalPrice { get; init; }
    public int ItemCount { get; init; }
}

public record GetOrdersForCustomerQuery(Guid CustomerId);

public class GetOrdersForCustomerHandler
{
    private readonly DbContext _db;

    public GetOrdersForCustomerHandler(DbContext db)
    {
        _db = db;
    }

    public IReadOnlyList<OrderSummaryDto> Handle(GetOrdersForCustomerQuery query)
    {
        return _db.Set<OrderReadModel>()
            .Where(o => o.CustomerId == query.CustomerId)
            .Select(o => new OrderSummaryDto
            {
                OrderId = o.Id,
                Status = o.Status,
                TotalPrice = o.TotalPrice,
                ItemCount = o.ItemCount
            })
            .ToList();
    }
}
```

✔ No domain rules
✔ Optimized for UI
✔ Can use a different table or DB

# Solution

The idea of CQS is to separate the code paths for operations that change the system from those that simply request data from the system.

By enforcing this separation, the code becomes simpler to understand. Is this changing something, or just fetching something? When a method does both (changes the state of the application and retrieves data), it becomes a lot harder to understand it's true purpose.

This can lead to really hard to reason about application state.

This way, we have two separate code paths: one for changing the system and for pulling data out of the system. We can rest safely knowing that if we change anything with regards to QUERY-ing, it won't break anything in regards to how we execute COMMANDs, and vice-versa.

Use the CQRS pattern to separate write operations, or commands, from read operations, or queries. Commands update data. Queries retrieve data. The CQRS pattern is useful in scenarios that require a clear separation between commands and reads.

CQRS builds on the principle of Command–Query Separation (CQS):

- A command changes system state and returns no data.
- A query returns data and has no side effects.

CQRS applies this principle at the architectural level by separating the code paths, models, and often the data stores for reads and writes.

By enforcing this separation, the intent of each operation becomes explicit:

- _Is this operation changing the system?_
- _Or is it only retrieving data?_

When a single method both modifies state and returns data, understanding its true purpose becomes difficult, and reasoning about application state becomes error-prone.

With CQRS, there are two clearly defined paths:

- One for commands that change the system
- One for queries that read data

This separation provides confidence that changes to query logic will not affect command behavior, and vice versa.

**Commands**

Commands represent business intent, not low-level data manipulation. Instead of modeling actions as technical updates (e.g. “Set ReservationStatus to Reserved”), commands should reflect real-world use cases:

- BookHotelRoom
- CancelOrder
- ApproveFarmerApplication

This approach:

- Aligns the system with the business language
- Makes intent explicit
- Encapsulates validation and invariants in one place

Commands typically:

- Perform validation and domain logic
- Modify the write model.
- Do not return domain data

In practice, a command handler may return:

- void, or
- a technical acknowledgment (e.g. success/failure, or a newly created identifier)

Especially in distributed or asynchronous systems, commands are often processed asynchronously to improve scalability and resilience.

**Queries**

Queries never modify data.

They:

- Retrieve data only
- Return DTOs or projections
- Contain no domain logic or side effects.

The goal of a query is to return exactly the data required by the caller in a format that is easy to consume (for example, for UI rendering or API responses).

Because queries are isolated from business rules and invariants, they are:

- Simple to reason about
- Easier to optimize
- Safe to cache aggressively

# **Separate read models and write models**

Separating the read model from the write model allows each to be designed for its specific purpose:

- **Write models** focus on correctness, invariants, and transactional consistency.
- **Read models** focus on query efficiency, shape, and performance.

This separation improves clarity and scalability but introduces trade-offs. For example, automatic scaffolding via ORM tools becomes less useful, and custom mapping logic is often required.

There are two common implementation approaches:

**Separate models in a single data store**

This approach represents the foundational level of CQRS, where both the read and write models share a single underlying database but
maintain distinct logic for their operations.

A basic CQRS architecture allows you to delineate the write model from the read model while relying on a shared data store.

![1000003289.png](attachment:35f11c66-9f5f-42aa-a26b-6778b47882be:1000003289.png)

This approach improves clarity, performance, and scalability by defining distinct models for handling read and write concerns.

- **A read model** is designed to serve queries for retrieving data. It focuses on generating DTOs or projections that are
  optimized for the presentation layer. It enhances query performance and
  responsiveness by avoiding domain logic.
- **Write model**
  - Handles commands that updates or persists data.
  - Contains validation and business rules
  - Optimized for consistency and correctness
- **Read model**
  - Handles queries for retrieving data
  - Returns DTOs or projections
  - Avoids domain logic
  - Optimized for performance and simplicity

**Separate models in different data store**

A more advanced CQRS implementation uses separate databases for reads and writes.

This allows:

- Independent scaling of read and write workloads
- Different storage technologies per use case
  (e.g. relational DB for writes, document or key-value store for reads). This way you can use a document database for the read data store and a relational database for the write data store.

![1000003290.png](attachment:9d17cfae-5abc-4f53-82ee-1b17baf42b4f:1000003290.png)

When using separate data stores, synchronization becomes essential. A common approach is:

1. The write model persists data
2. The write model publishes domain or integration events
3. The read model consumes these events
4. The read database is updated accordingly

Because databases and message brokers usually cannot participate in a single distributed transaction, systems must handle:

- Duplicate messages
- Out-of-order delivery
- Retry scenarios

This often leads to **eventual** consistency, where read data may temporarily lag behind writes. For more information about how to use events, see [Event-driven architecture style](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven) and [Idempotent message processing](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-mission-critical/mission-critical-data-platform#idempotent-message-processing).

The read data store can use its own data schema that's optimized for queries. For example, it can store a [materialized view](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view) of the data to avoid complex joins or O/RM mappings. The read data store can be a read-only replica of the write store or have a different structure. Deploying multiple read-only replicas can improve performance by reducing latency and increasing availability, especially in distributed scenarios. This avoids complex joins and expensive query logic at read time and enables high-performance querying.

### Benefits of using CQRS

- **Independent scaling.** CQRS enables the read models and write models to scale independently. This approach can help
  minimize lock contention and improve system performance under load.
- **Optimized data schemas.** Read operations can use a schema that's optimized for queries. Write operations use a schema that's optimized for updates.
- **Security.** By separating reads and writes, you
  can ensure that only the appropriate domain entities or operations have
  permission to perform write actions on the data.
- **Separation of concerns.** Separating the read and
  write responsibilities results in cleaner, more maintainable models. The write side typically handles complex business logic. The read side can
  remain simple and focused on query efficiency.
- **Simpler queries.** When you store a materialized view in the read database, the application can avoid complex joins when it queries.

# Problems and considerations

Consider the following points as you decide how to implement this pattern:

- **Increased complexity.** The core concept of CQRS is straightforward, but it can introduce significant complexity into the application design, specifically when combined with the [Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing).
- **Messaging challenges.** Messaging isn't a
  requirement for CQRS, but you often use it to process commands and publish update events. When messaging is included, the system must account for potential problems such as message failures, duplicates, and retries. For more information about strategies to handle commands that have varying priorities, see [Priority queues](https://learn.microsoft.com/en-us/azure/architecture/patterns/priority-queue).
- **Eventual consistency.** When the read databases and write databases are separated, the read data might not show the most recent changes immediately. This delay results in stale data. Ensuring
  that the read model store stays up-to-date with changes in the write model store can be challenging. Also, detecting and handling scenarios where a user acts on stale data requires careful consideration.

# Conclusion

# Sources

- [CQRS Pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Command Query Separation | Object-Oriented Design Principles w/ TypeScript | Khalil Stemmler](https://khalilstemmler.com/articles/oop-design-principles/command-query-separation/)
