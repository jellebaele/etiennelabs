---
title: 'Domain Events with the Outbox Pattern'
date: '2026-03-12'
tags: ['Design patterns']
excerpt: 'How to handle dual-write challenges and guarantee consistency using the Outbox Pattern.'
---

# Intro

The outbox pattern is a powerful technique for ensuring reliability when business transactions need to trigger side
effects like API calls, email notifications, or internal asynchronous workflows.

# The Core Problem: The Dual-Write Dilemma

In modern application development, a single business action often requires two distinct operations to happen simultaneously:

- Changing State: Saving a new record to your local database (SQL/NoSQL).
- Triggering a Side Effect: Notifying an external system (Email API, Message Bus, or a third-party integration).

A classic example is user registration. You save the new user to your database and then send them a welcome email. The
naive approach creates a critical reliability flaw:
C#

```csharp
public async Task RegisterUser(string email, string password)
{
    // Step 1: Save to the database
    var user = new User(email, password);
    _dbContext.Users.Add(user);
    await _dbContext.SaveChangesAsync(); // <-- Database transaction commits here

    // 💥 DANGER ZONE! What if this fails?
    await _emailService.SendWelcomeEmailAsync(user.Id);
}

```

The issue is that the database commit and the external network call are not part of the same transaction. If the
application crashes or the email service is down after the user is saved, the welcome email is never sent. This leaves
your system in an inconsistent state. This is known as the dual-write problem.

# The Middle Ground

To solve the coupling issue, many developers turn to In-Memory Domain Events. The idea is to capture the "intent" inside the entity and publish it during the saving process.

The implementation usually looks like an override in the `DbContext`:

```cs
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    // 1. Commit the actual business data
    var result = await base.SaveChangesAsync(ct);

    // 2. Publish events to listeners (e.g., using MediatR)
    await PublishDomainEventsAsync();

    return result;
}

private async Task PublishDomainEventsAsync()
{
    var domainEvents = ChangeTracker.Entries<Entity>()
        .Select(e => e.Entity)
        .SelectMany(e => {
            var events = e.GetDomainEvents();
            e.ClearDomainEvents();
            return events;
        }).ToList();

    foreach (var domainEvent in domainEvents)
    {
        await _publisher.Publish(domainEvent);
    }
}
```

**The "False Failure" Trap**
While this code looks cleaner, it introduces a subtle, dangerous bug. If `base.SaveChangesAsync()` succeeds, the user is physically stored in the database. But if one of the event handlers (like the `Email Service`) throws an exception during `_publisher.Publish()`, the entire `SaveChangesAsync` method fails.

- **The User's perspective:** "The website crashed, I'll try registering again."
- **The Database's perspective:** The user was already saved by `base.SaveChangesAsync()`.
- **The Result:** The user tries again, gets a "Duplicate Email" error, and never gets their welcome email. The system is inconsistent.

# The Solution

The outbox pattern solves this by making the "intent to publish an event" a part of the original database transaction.
It turns two separate operations into a single, atomic one.

**Step 1: Atomic Persistence**
We modify SaveChangesAsync to convert Domain Events into OutboxMessages before we hit the database.

```cs
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    var domainEvents = ChangeTracker.Entries<Entity>()
        .Select(e => e.Entity)
        .SelectMany(e => {
            var events = e.GetDomainEvents();
            e.ClearDomainEvents();
            return events;
        }).ToList();

    var outboxMessages = domainEvents.Select(e => new OutboxMessage {
        Id = Guid.NewGuid(),
        Type = e.GetType().Name,
        Content = JsonSerializer.Serialize(e),
        OccurredOnUtc = DateTime.UtcNow
    });

    this.Set<OutboxMessage>().AddRange(outboxMessages);

    // ONE TRANSACTION: Both the User and the Message succeed or fail together.
    return await base.SaveChangesAsync(ct);
}
```

**Step 2: The Background Relay**
Now that the "intent" is safely stored in our DB, a separate Background Service (the Relay) polls the OutboxMessages table.

1. Pick up unprocessed messages.
2. The background process attempts to publish the event to the external system (e.g., an email
   service).
   - On Success: It marks the message in the outbox as "processed" to prevent it from being sent again.
   - On Failure: The message remains in the outbox. The process will automatically retry sending it later, ensuring the
     side effect eventually occurs.

```cs
// Inside your BackgroundService / Quartz Job
var outboxMessages = await _outboxMessagesRepository.GetUnprocessedOutboxMessagesAsync(BatchSize, context.CancellationToken);

foreach (var outboxMessage in outboxMessages)
    try
    {
        var domainEvent = DeserializeDomainEvent(outboxMessage);

        await _domainEventsPublisher.PublishAsync(domainEvent, context.CancellationToken);
        outboxMessage.ProcessedOnUtc = DateTime.UtcNow;
        outboxMessage.Error = null;
    }
    catch (Exception e)
    {
        outboxMessage.AttemptCount++;
        outboxMessage.Error = e.Message;
        if (outboxMessage.AttemptCount >= MaxAttempts)
        {
            outboxMessage.ProcessedOnUtc = DateTime.UtcNow;
            _logger.LogCritical(e,
                "Failed to process outbox message {MessageId} after {MaxAttempts} attempts. Giving up.",
                outboxMessage.Id, MaxAttempts);
        }
        else
        {
            _logger.LogWarning(e,
                "Failed to process outbox message {MessageId}. Attempt {AttemptCount}/{MaxAttempts}. Will be retried.",
                outboxMessage.Id, outboxMessage.AttemptCount, MaxAttempts);
        }
    }

if (outboxMessages.Any())
    await _dbContext.SaveChangesAsync(context.CancellationToken);
```

If e.g. the Email Service is down, the Background Service simply retries later. Consistency is guaranteed.

## Benefits, Drawbacks & Trade-offs

The Outbox Pattern brings significant advantages for reliability and consistency, but it also introduces trade-offs that need consideration. Below is a structured overview to help you weigh the pros and cons.

## Beneftis

Even without microservices, this pattern is incredibly valuable for creating a robust and scalable monolith.

**1. Transactional Consistency**

This is the primary benefit. You eliminate the dual-write problem, guaranteeing that for every business operation, its
intended side effects are reliably queued and will eventually be executed.

**2. Increased Reliability and Resilience**

Your API endpoints no longer depend on the availability of external, third-party systems. If your email provider or a
partner API is down, the user registration still succeeds instantly. The system will self-heal and send the
notifications once the external service is back online.

**3. Improved API Performance**

Your API response time is significantly reduced. The initial request only needs to perform a quick database transaction.
All slow operations (like calling external APIs or CPU-intensive tasks) are offloaded to a background process, resulting
in a much better user experience.

**4. Decoupling of Modules**

In a modular monolith, the outbox pattern is an excellent way to communicate between modules asynchronously.

- The Ordering module can save an order and publish an OrderPlaced event to the outbox.
- The Inventory module's background worker can then process this event to update stock levels.

The two modules are not directly coupled, allowing them to evolve independently.

## Drawbacks & Trade-Offs

The reliability of the outbox pattern comes at a cost. You should be aware of the following trade-offs.

**1. Increased Implementation Complexity**

This pattern is more complex than a simple, direct call. You need to build and maintain:

- An `OutboxMessages` database table.
- Logic in your UnitOfWork to save events.
- A background worker (the "Relay") to process the outbox.
- Monitoring and alerting for the background worker.

**2. Introduced Message Latency**

The pattern introduces a delay. Events are processed eventually, not instantly. The latency depends on how frequently
your background worker polls the outbox table. This makes it unsuitable for operations that require an immediate,
real-time response.

**3. Requires Idempotent Consumers**

The pattern guarantees "at-least-once" delivery. This means a consumer might receive the same message more than once (
e.g., if the worker fails right after sending the message but before marking it processed). Any external systems or
internal modules that consume these events must be designed to be idempotent—that is, they must handle duplicate
messages gracefully without causing incorrect side effects.

**4. Increased Database Load and Storage**

Every event-generating operation now results in an extra `INSERT` into the `OutboxMessages` table. This table can grow large
and requires a cleanup strategy (e.g., purging processed messages after a certain period) to prevent performance
degradation.

# Conclusion

The outbox pattern is a trade-off: you trade simplicity for reliability.

In a modular monolith, you should strongly consider using the outbox pattern when:

- A database transaction must trigger a notification to an external system (email, SMS, third-party API).
- You need to perform slow or resource-intensive tasks in the background without blocking the main API thread.
- You want to facilitate reliable, asynchronous communication between different modules within your monolith.

If the business cost of a failed side effect is high, the added complexity of the outbox pattern is an excellent
investment.
