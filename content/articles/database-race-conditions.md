---
title: 'Database Race Conditions'
date: '2026-01-15'
tag: 'backend'
excerpt: 'A deep dive into race conditions...'
---

## Intro

In a perfect world, database transactions would happen in total isolation. But in modern, high-concurrency applications, thousands of users often attempt to read and write to the same data simultaneously. When the outcome of these operations depends on the specific timing or sequence of events, you have a Race Condition.

Without proper management, these races lead to data corruption, financial discrepancies, and a poor user experience. Whether you are building a simple registration form or a global e-commerce checkout, understanding how to prevent these conflicts is a fundamental skill for any software engineer.

## What is a Race Condition?

At its core, a race condition in a database occurs when two or more transactions access the same data and try to modify it at the same time.

A classic example is the Lost Update Anomaly, which often occurs under "Read Committed" isolation levels:

1. Alice reads her account balance ($100).
2. Bob reads the same account balance ($100).
3. Alice withdraws $40 and updates the balance to $60.
4. Bob withdraws $80. Based on his initial read of $100, he believes he has enough funds, so he updates the balance to $20.

The Result: Alice’s transaction is "lost." The final balance is $20, even though $120 total was withdrawn from a $100 account.

## Techniques to Prevent Race Condtions

To maintain integrity, we generally choose between three strategies: avoiding the conflict, detecting the conflict, or using a tailored architectural solution.

### A. Optimimistic Locking

| Optimistic locking is a non-locking concurrency control method. Before committing, each transaction verifies that no other transaction has modified the data it has read. If the check reveals conflicting modifications, the committing transaction rolls back and can be restarted. | Optimistic locking assumes that **conflicts are rare**. It allows multiple users to read and modify data simultaneously without locks.

#### How it works

| Optimistic locking doesn't use a database "lock" in the traditional sense. Instead, it uses a version check within the UPDATE statement itself.

- **Step 1: The Initial Read:**

  ```sql
  SELECT id, name, stock, version
  FROM products
  WHERE id = 42;
  -- Result: stock = 10, version = 5
  ```

- **Step 2: The Logic Phase:** <br/>
  The application performs its work. This happens entirely in the application memory, not the database. Alice decides to buy 2 items, so the app calculates the new stock should be 8.
- **Step 3: The Conditional Update**:<br/>
  When Alice saves, the application sends an update that includes the original version she read in Step 1.
  ```sql
  -- Attempt to update only if the version hasn't changed
  UPDATE products
  SET stock = 8, version = version + 1
  WHERE id = 42 AND version = 5;
  ```

**The Two Possible Outcomes:**

- **Success:**
  If no one else touched the row, the database finds a match for `id=42` and `version=5`. It updates the row and returns `Rows Affected: 1`.

- **Conflict:**
  If Bob updated the stock while Alice was thinking, the version in the database is now `6`. Alice's `UPDATE` statement will find zero rows matching both the ID and the old version. The database returns `Rows Affected: 0`.

  **Note:** When the application sees `0` rows affected, it knows a race condition occurred. At this point, you usually catch this "stale data" error and ask the user to refresh or automatically retry the process.

#### Advantages

- Allows high concurrency and throughput, as there are no locks during read and modify phases.
- Avoids blocking and deadlock scenarios.
- Ideal for read-heavy applications with low conflict rates.

#### Disadvantages

- Requires retry logic for failed transactions.
- May lead to wasted computation if conflicts are detected late.
- Not suitable for high-conflict scenarios as many transactions can fail at the very end. This can result in a high retry rate.

### B. Pessimistic Locking (Conflict Avoidance)

Pessimistic locking assumes the worst: that **a conflict will happen**. It works by "locking" the record as soon as it is read. It prevents race conditions by "locking" a record as soon as it is read, ensuring that no other transaction can modify or even lock the same data until the first transaction is complete. It is essentially an "exclusive access" strategy.

#### How it works

Unlike optimistic locking, which checks for changes at the very end, pessimistic locking prevents changes from the very beginning using a specific database syntax (usually `FOR UPDATE`).

- **Step1: The locked Read:**
  When the transaction starts, the application requests an exclusive lock on the row.

  ```sql
  -- Alice starts a transaction and locks the row
  BEGIN;
  SELECT id, name, stock
  FROM products
  WHERE id = 42
  FOR UPDATE;
  -- Result: stock = 10 (Row is now locked by Alice)
  ```

- **Step 2: The Logic Phase (Blocked):**
  If Bob tries to read the same row using FOR UPDATE while Alice’s transaction is still open, his database connection will simply hang (wait). He cannot proceed until Alice commits or rolls back.

- **Step 3: The Secure Update:**
  Since Alice knows she is the only one with access to this row, she can safely update it.

  ```sql
    -- Alice performs her update
    UPDATE products
    SET stock = 8
    WHERE id = 42;

    COMMIT;
    -- The lock is released only AFTER the commit.
    -- Bob’s pending request now finally receives the data.
  ```

**The Two Possible Outcomes:**

- **Success:** The transaction completes smoothly. Because the row was locked, there is a 0% chance of a "Lost Update." The data integrity is guaranteed.
- **Wait / Timeout:** If the lock is held for too long by Alice, Bob’s connection might eventually hit a Lock Wait Timeout. In a high-traffic system, this can lead to a "queue" of blocked users, causing the application to feel slow or unresponsive.

#### Advantages

- Guarantees Data Integrity: It is the safest way to prevent conflicts in high-stakes environments like banking or core inventory.
- Simplifies Application Logic: You don't need to write complex "retry" loops in your code because the database manages the queuing for you.
- Immediate Consistency: You are always working with the most "locked-in" version of the truth.

#### Disadvantages

- Low Concurrency: Other users are physically blocked from the data, even if they only want to perform a small update.
- Risk of Deadlocks: If Transaction A locks Row 1 and wants Row 2, while Transaction B locks Row 2 and wants Row 1, the system can freeze entirely.
- Scalability Bottleneck: On "hot" rows (like a viral product's stock), the lock becomes a bottleneck that limits the entire system's throughput to a crawl.

### C. Tailored Logic (The "Condition-as-Lock" Strategy)

Tailored solutions move the business logic directly into the UPDATE statement. Instead of using generic version numbers or broad table locks, you write a query where the WHERE clause acts as the gatekeeper for that specific transaction.

#### How it works

This method is "tailored" because the SQL changes depending on what you are trying to protect (e.g., stock levels, account balances, or unique status). You don't "read then write"; you "write if the condition is met."

- **Scenario: Inventory Management:**
  The goal is to prevent overselling. The "tailored" logic is: Only subtract if the result is zero or higher.

  ```sql
  -- The logic is embedded in the command
  UPDATE products
  SET stock = stock - 1
  WHERE id = 42 AND stock >= 1;
  ```

- **Scenario: Email Uniqueness**
  The goal is to prevent duplicate registrations. The "tailored" logic is a Unique Constraint at the database schema level.

  ```sql
  -- The DB handles the race condition internally
  ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
  ```

- **Scenario: Account Balance**
  The goal is to prevent an overdraft. The "tailored" logic is: Only withdraw if the balance covers the amount.

  ```sql
  UPDATE accounts
  SET balance = balance - 50
  WHERE user_id = 101 AND balance >= 50;
  ```

#### Why it's "Tailored"

- Context-Specific: You aren't just checking a version number; you are checking the actual business state (Is there enough stock? Is the email taken?).
- Efficiency: It eliminates the "Read" step entirely. You send one command instead of two, reducing network latency and database load.
- Scalability: This is how high-throughput systems (like flash sales) work. It avoids the bottleneck of a long-lived pessimistic lock and the "retry-loop" frustration of optimistic locking.

#### Advantages

- The Database as the Evaluator: The database engine receives the request and evaluates the WHERE clause at the exact microsecond the row is updated. If Alice and Bob both try to take the last item, the database processes Alice first (Success: 1 row affected) and Bob second (Fail: 0 rows affected because stock >= 1 is no longer true).

- Handling the Result: The application doesn't look for a "Conflict Error." It simply checks the count of affected rows. If it's 0, the app tells the user: "Sorry, someone beat you to it!"

#### Disadvantages

- No "Read" Data: Since you didn't SELECT the data first, the application doesn't know the new value unless you use a returning clause (e.g., RETURNING stock in PostgreSQL).
- Harder for Complex Logic: If your business rule requires checking five different tables before updating, a single tailored SQL statement might become too complex to maintain.

## Implementation in .Net with EFCore

### 1. Optimistic Locking (Version Numbers)

EF Core has built-in support for optimistic concurrency using a RowVersion or ConcurrencyCheck. The most common way is using a uint or byte[] version column.

```cs title="Domain/Entities/Product.cs"
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Stock { get; set; }
}
```

```cs title="Persistence/Configuration/ProductConfiguration.cs"
internal sealed class ProductConfiguration: IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(x => x.Id);
        // ...

        // Shadow property
        builder.Property<uint>("Version").IsRowVersion();
    }
}
```

```cs title="Application/Product/Commands/UpdateProduct"
try
{
    var product = await _context.Products.FindAsync(42);

    // Logic Phase
    product.Stock -= 1;

    // EF Core generates: UPDATE products SET stock = @p0 WHERE id = 42 AND Version = @p1
    await _context.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException)
{
    // The database returned 0 rows affected because the Version changed
    // Handle conflict: Refresh data, notify user, or retry
    Console.WriteLine("Conflict detected! Data was modified by another user.");
}
```

### 2. Pessimistic Locking (Using Transactions)

Pessimistic locking is used when you cannot afford a "retry" and want to guarantee that once you read the data, no one else can touch it until you are done. In .NET, this requires an explicit transaction and a SQL hint, as EF Core doesn't have a built-in `Lock()` method yet.

```cs title="Application/Product/Commands/UpdateProduct"
using var transaction = await _context.Database.BeginTransactionAsync();

try
{
    // 1. Read with a 'FOR UPDATE' lock (PostgreSQL/MySQL) or 'UPDLOCK' (SQL Server)
    // This blocks other transactions from reading/writing this row
    // EF Core does not natively support true pessimistic locking APIs, so raw SQL is often the only way to be explicit
    var product = await _context.Products
        .FromSqlRaw("SELECT * FROM products WHERE id = {0} FOR UPDATE", 42)
        .SingleAsync();

    // 2. Logic Phase: You are the exclusive owner of this row right now
    if (product.Stock >= 1)
    {
        product.Stock -= 1;
        await _context.SaveChangesAsync();
    }

    // 3. Commit releases the lock for the next person in line
    await transaction.CommitAsync();
}
catch (Exception)
{
    // If anything fails, the lock is released during Rollback
    await transaction.RollbackAsync();
}
```

| **Feature**        | **Optimistic (RowVersion)**             | **Pessimistic (Transaction)**                    |
| ------------------ | --------------------------------------- | ------------------------------------------------ |
| **Code Style**     | Clean, uses standard `SaveChangesAsync` | Requires Raw SQL and explicit `BeginTransaction` |
| **DB Interaction** | Fails after the work is done (on Save)  | Blocks others before the work starts (on Read)   |
| **Best For**       | High-scale, low-contention web apps     | High-integrity, high-contention logic (Finance)  |
