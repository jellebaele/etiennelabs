---
title: 'Unit of Work'
date: '2026-03-07'
tags: ['Design patterns']
excerpt: 'Centralize transaction management to ensure atomic operations, consistent data, and predictable application behavior with the Unit of Work pattern.'
---

# Intro

Managing data consistency across multiple operations is a fundamental challenge in application design. When multiple repositories and changes are involved in a single business operation, ensuring everything either succeeds or fails together becomes critical. Without a clear strategy, you risk partial updates, inconsistent data, and hard-to-debug issues.

The Unit of Work pattern provides a structured way to group related operations into a single transaction. It ensures that all changes are committed together—or rolled back entirely—bringing predictability and consistency to your data layer.

This guide explores the problem Unit of Work solves, how it compares to naïve approaches, and how to apply it effectively in a layered architecture.

# The Problem

Consider a simple example where you create a user and assign a role:

```cs
public async Task CreateUser(CreateUserDto dto)
{
    var user = new User(dto.Email);
    await _userRepository.AddAsync(user);

    var role = await _roleRepository.GetByNameAsync("User");
    user.AssignRole(role);

    await _userRepository.UpdateAsync(user);
}
```

At first glance, this looks fine. But what happens if something fails halfway?

- The user might be created, but the role assignment fails
- The system is left in an inconsistent state
- There is no clear transaction boundary

A quick fix is to add transactions manually:

```cs
public async Task CreateUser(CreateUserDto dto)
{
    using var transaction = await _dbContext.Database.BeginTransactionAsync();

    try
    {
        var user = new User(dto.Email);
        _userRepository.Add(user);

        var role = await _roleRepository.GetByNameAsync("User");
        user.AssignRole(role);

        _userRepository.Update(user);

        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

While this works, it introduces new problems:

- Transaction logic is duplicated across methods
- Business logic is mixed with infrastructure concerns
- Easy to forget committing or rolling back
- Harder to test and maintain

<details>
  <summary>Note on Add vs AddAsync</summary>

You might notice that AddAsync and UpdateAsync were replaced with synchronous methods:

```cs
_userRepository.Add(user);
_userRepository.Update(user);
```

This is intentional.

In Entity Framework Core, methods like Add and Update do not perform any database I/O. They simply register changes in the change tracker. The actual database interaction only happens when SaveChangesAsync is called.

Because of that:

- There is no benefit in making these methods asynchronous
- Using async here can be misleading, suggesting that a database call is happening
- It adds unnecessary complexity to your repository interfaces

`AddAsync` exists, but is only relevant in very specific scenarios (e.g., async value generation). In typical applications, it should be avoided.

**Key takeaway:**

Use `async` only for operations that actually involve I/O (like SaveChangesAsync or queries). Keep in-memory operations synchronous to make your code clearer and more intentional.

</details>

# The fix: Unit of Work design pattern

## What is the Unit of Work?

The Unit of Work pattern is a behavioral pattern that centralizes transaction management. Instead of each service managing its own transaction, a single unit coordinates all changes and persists them together.

A typical abstraction looks like this:

```cs
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

In many .NET applications, the implementation is simply a wrapper around Entity Framework Core's `DbContext`:

```cs
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}
```

The key idea: **track all changes and commit them in one place.**

## Example

Let’s revisit the earlier example using Unit of Work:

```cs
public async Task<Result> CreateUser(CreateUserDto dto)
{
    var user = new User(dto.Email);
    _userRepository.Async(user);

    var role = await _roleRepository.GetByNameAsync("User");
    if (role == null)
        return Result.Failure(RoleErrors.NotFound);

    user.AssignRole(role);

    await _unitOfWork.SaveChangesAsync();

    return Result.Success();
}
```

What changed?

- No manual transaction handling
- Repositories only track changes
- The Unit of Work commits everything at once

If anything fails before SaveChangesAsync, nothing is persisted. If it fails during commit, the transaction is rolled back automatically by the ORM.

# Why this works

Why this pattern matters: It aligns transaction boundaries with business operations.

A single application use case (e.g., "Create User") becomes a single unit of work:

- All changes are grouped
- Either everything succeeds or nothing does
- The system remains consistent

This avoids the "half-finished operation" problem that often appears in naïve implementations.

# Where to Use Unit of Work

The Unit of Work belongs in the **application layer**, where business operations are orchestrated. This layer defines the boundaries of a single operation and decides **when** changes should be persisted. Typical scenarios include:

Typical use cases:

- Creating aggregates with multiple entities
- Updating multiple related records
- Handling workflows that span multiple repositories

Meanwhile, repositories should remain focused on their core responsibility: tracking changes. They should not commit data themselves:

```cs
public async Task AddAsync(User user)
{
    await _context.Users.AddAsync(user);
    // No SaveChanges here
}
```

This keeps repositories simple:

- They only track changes, without committing them
- They do not manage transactions
- They defer persistence decisions to the Unit of Work

This separation ensures a clear boundary between orchestrating business operations and handling data access, keeping your code predictable and maintainable.

# Conclusion: Consistency Through Clear Boundaries

The Unit of Work pattern is not about adding abstraction—it’s about enforcing consistency.

**Group related operations into a single transaction.** Let the application layer define when a business operation starts and ends. Use the Unit of Work to ensure that boundary is respected.

**Keep repositories simple.** They should track changes, not decide when to persist them.

**Commit once, at the right moment.** This ensures atomicity and prevents inconsistent state.

When combined with clear error handling (like the Result pattern), the Unit of Work helps you build systems that are predictable, maintainable, and resilient—where every operation either fully succeeds or cleanly fails.
