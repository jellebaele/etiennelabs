---
title: 'The Result Pattern'
date: '2026-03-04'
tags: ['Design patterns']
excerpt: 'Explicitly model expected failures and maintain predictable error handling with the Result Pattern.'
---

Error handling is a critical architectural decision that affects how maintainable and predictable your code becomes. In C#, exceptions are a powerful feature, but using them for regular control flow can lead to unclear contracts, tightly coupled code, and code that is difficult to reason about. The Result pattern offers an explicit and predictable alternative for handling expected failures—making error cases first-class citizens of your return types.

This guide explores when to use exceptions, when to use the Result pattern, and why this distinction matters for building robust applications.

# The Problem with `null` and Exceptions

A common approach to signal failure is returning `null`:

```cs
public async Task<PostDto?> GetPost(Guid postId)
{
    var post = await _postRepository.GetPostByIdAsync(postId);
    if (post == null)
        return null; // What does null mean? Not found or an error?

    return _mapper.Map<PostDto>(post);
}
```

The issue is ambiguity. Does `null` mean the post does not exist? That validation failed? That a database error occurred? The method signature does not communicate intent clearly. Anyone calling this method must check the documentation or inspect the implementation to understand what `null` really means.

An alternative is throwing exceptions. This allows you to distinguish between different failure types:

```cs
public async Task<PostDto?> GetPost(Guid postId)
{
    var post = await _postRepository.GetPostByIdAsync(postId);
    if (post == null)
        throw new PostNotFoundException(accountId);

    return _mapper.Map<PostDto>(post);
}
```

While this makes failures explicit at runtime, it introduces another problem: **the method signature does not indicate which exceptions might be thrown.** The caller must rely on documentation or implementation details to know what to handle. In large systems, this leads to incomplete error handling and surprises at runtime when an unexpected exception escapes from a method you thought was safe.

# When to Use Exceptions

**Why this distinction matters:** Mixing expected failures with unexpected failures makes code harder to reason about. If every data retrieval method might throw, and every validation might return null, calling code becomes defensive chaos. Clear contracts allow focused error handling at the right layer.

Exceptions should represent situations that are genuinely exceptional—errors you cannot meaningfully recover from at the current level. Common examples:

- **Infrastructure failures:** Database connection lost, network timeout, file system error
- **Unexpected system states:** Out of memory, stack overflow, missing required configuration
- **Contract violations:** Code should never reach this point (e.g., invalid logic flow)

These errors should typically be caught at a higher boundary (e.g., middleware, API error handler) and translated into an appropriate response. The infrastructure layer should throw exceptions for technical failures; the application layer should translate business failures into Results.

## Advantages of using Exceptions

- Clear separation of normal and error paths
- Built-in language support
- Stack trace preservation for debugging
- Suitable for truly unexpected failures

## Disadvantages of using Exceptions

- Hidden from method signatures
- Encourages flow control via try/catch
- Performance overhead when used frequently
- Harder to reason about in large systems
- Can blur the boundary between expected and unexpected failures

# The result pattern

For failures you expect and know how to handle (e.g., validation errors, not found scenarios, business rule violations), the Result pattern provides a more explicit alternative.

Instead of throwing an exception, you return an object that represents either success or failure:

```cs
public async Task<Result<PostDto>> GetPost(Guid postId)
{
    var post = await _postRepository.GetPostByIdAsync(postId);
    if (post == null)
        return Result.Failure(UserErrors.NotFound);

    return _mapper.Map<PostDto>(post);
}
```

Notice the difference: the return type explicitly states that this operation can fail. Callers must handle both success and failure cases. There are no hidden exceptions, no ambiguous `null` values.

## Where to Use the Result Pattern

**Why this layered approach works:** Different layers have different responsibilities. The database layer simply retrieves data; the application layer interprets and validates it. By using Results in the application layer and exceptions in infrastructure, you achieve clear separation of concerns.

### Application Layer

For business rules and application flow, the Result pattern shines:

- **Validation errors:** "Email already exists", "Password too weak"
- **Not found scenarios:** "User not found", "Post not found"
- **Business rule violations:** "Cannot delete active orders", "Insufficient funds"
- **Authorization failures:** "User lacks permission"

At this layer, you interpret repository outcomes and translate them into meaningful business responses. Results clearly express what can go wrong and force calling code to handle each case.

### Infrastructure Layer

In repositories and external service calls, keep things simple:

- Return `null` if an entity is not found (this is expected behavior for database retrieval)
- Throw exceptions for technical failures (connection lost, SQL errors, timeout)
- Let technical errors propagate up to be caught in middleware

The infrastructure layer should not return Results. Its job is to fetch data or throw on connection failures. The application layer translates infrastructure outcomes into business Results.

# Summary: When to Use Each Pattern

| Scenario                    | Use                       | Why                                                                |
| --------------------------- | ------------------------- | ------------------------------------------------------------------ |
| Database not found          | Return `null`             | It's an expected outcome, the repository's job is to retrieve data |
| Database connection fails   | Throw exception           | It's unexpected; the caller cannot meaningfully recover            |
| Validation fails            | Return `Result.Failure()` | It's expected and the caller must handle it explicitly             |
| Business rule violated      | Return `Result.Failure()` | It's expected and part of normal application flow                  |
| Unexpected error (OOM, bug) | Throw exception           | It should crash; you cannot continue safely                        |

# Conclusion: A Principled Approach to Error Handling

The distinction between Results and exceptions is not about preference, it's about clarity and maintainability.

**Use Results to model business outcomes.** When code has a choice between success and failure paths that the caller must handle, use a Result type. This makes the contract explicit in your method signature. Callers cannot accidentally skip error handling. Over time, code that uses Results becomes easier to reason about because error cases are not hidden.

**Use exceptions for technical failures.** When something goes wrong that you cannot meaningfully recover from, let it throw. Let it propagate to middleware or a global error handler. This keeps happy-path code clean and reserves exceptions for truly exceptional situations.

This layered approach—Results in application logic, exceptions in infrastructure, clear translation at system boundaries—creates code that is predictable, testable, and maintainable. Your future self (and your team) will thank you for this clarity.
