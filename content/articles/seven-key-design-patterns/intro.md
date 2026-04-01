---
title: 'Intro'
position: 1
---

Software development is often a battle against complexity. As systems grow, the "quick fix" of today becomes the technical debt of tomorrow. To build systems that are resilient to change, we rely on Design Patterns—proven, repeatable solutions to commonly occurring problems in software design.

This guide explores seven essential patterns that every developer should have in their toolkit, moving beyond simple implementation to understand the why behind the architecture.

# What are design patterns?

A design pattern is not a finished piece of code that can be copy-pasted into a codebase. Instead, it is a **description** or **template** for solving a recurring problem in a given context—one that has been encountered and solved many times before.

These patterns are battle-tested solutions to common problems in software design. In fact, developers often apply them without even realizing it, since they naturally emerge in everyday programming. Design patterns aim to formalize these solutions and give them a shared structure and vocabulary.

Using design patterns allows teams to communicate more effectively by speaking a common language. For example, referring to a “Factory” or “Observer” pattern immediately conveys a specific approach without needing to explain the full implementation. Moreover, because these patterns are well-established, they help avoid common pitfalls in object-oriented design.

# The three types of patterns

Design patterns are generally categorized into three groups based on their intent:

1. **Creational:** Deal with object creation mechanisms, aiming to create objects in a flexible and reusable way.
2. **Structural:** focus on how classes and objects are composed to form larger structures.
3. **Behavioral:** deal with communication and responsibility between objects.

## 1. Creational patterns

Creational patterns describe how to create objects in a flexible and reusable way. Instead of creating objects directly, creational patterns abstract the instantiation process. In a poorly designed system, objects are often instantiated directly throughout the codebase. This can lead to tight coupling and poor testability.

- **Goal:** Encapsulate the knowledge of which concrete classes the system uses.
- **Common Examples:** Singleton, Factory Method, Builder.

## 2. Structural

Structural patterns focus on how classes and objects are related to each other. These are blueprint for building larger structures from individual pieces. The goal is to ensure that changes in one part of the system do not require widespread modifications elsewhere. It's like Lego: you get a set of instructions to create a complex structure.

- **Goal:** Use inheritance and interfaces to allow different objects to work together seamlessly.
- **Common Examples:** Adapter, Facade.

## 3. Behavioral

Behavioral patterns are concerned with handilng communication between objects. How objects and collaborate, helping to keep the system loosely coupled and easier to extend.

- **Goal:** Simplify communication and responsibility distribution between objects.
- **Common Examples:** Observer, Strategy, Command.

# The seven key design patterns

While there are many design patterns, some appear far more frequently in real-world applications. The following seven patterns were selected because they cover a wide range of common design challenges and provide a solid foundation for building maintainable systems.

For each pattern, we will look at:

- The problem it solves
- The core idea behind the solution
- When to use it (and when not to)
