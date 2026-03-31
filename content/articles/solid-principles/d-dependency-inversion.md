---
title: 'D - Dependency Inversion Principle'
position: 5
---

# Defintion

Dependency Inversion Principle (DIP) states that high-level modules should not depend on low-level modules. Both should depend on abstractions.

# Example

Instead of:

```cs
public class SqlOrderRepository
{
    public void Save(Order order)
    {
        // Save to SQL database
    }
}

public class OrderService
{
    private readonly SqlOrderRepository _repository;

    public OrderService()
    {
        _repository = new SqlOrderRepository();
    }

    public void PlaceOrder(Order order)
    {
        // Some business logic
        _repository.Save(order);
    }
}
```

Problems:

- OrderService depends directly on a low-level module (SqlOrderRepository)
- Hard to swap repository (e.g., MongoDB, in-memory, mock for testing)
- Hard to unit-test OrderService without hitting a database

**-> This violates DIP.**

Correct design:

```cs
public interface IOrderRepository
{
    void Save(Order order);
}
```

Implement low-level modules:

```cs
public class SqlOrderRepository : IOrderRepository
{
    public void Save(Order order)
    {
        // Save to SQL database
        Console.WriteLine("Saved order to SQL");
    }
}

public class InMemoryOrderRepository : IOrderRepository
{
    private readonly List<Order> _orders = new List<Order>();

    public void Save(Order order)
    {
        _orders.Add(order);
        Console.WriteLine("Saved order in memory");
    }
}
```

High-level module depends on abstraction:

```cs
public class OrderService
{
    private readonly IOrderRepository _repository;

    public OrderService(IOrderRepository repository)
    {
        _repository = repository;
    }

    public void PlaceOrder(Order order)
    {
        // Business logic
        _repository.Save(order);
    }
}

// Usage
// In Program.cs or Startup.cs
IOrderRepository repository = new SqlOrderRepository();
var service = new OrderService(repository);

service.PlaceOrder(new Order());
```

This ensures that:

1. High-level OrderService does not care about the implementation of the repository
2. It is easy to mock repository for unit tests
3. Makes code flexible and maintainable
4. Then you can easily swap implementations:
   - SQL
   - MongoDB
   - In-memory for testing

This is commonly used with dependency injection (= the pattern).
