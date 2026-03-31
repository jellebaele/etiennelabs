---
sidebar_position: 2
title: 'S - Single Responsibility Principle'
---

# S - Single Responsibility Principle

## Defintion

The Single Responsibility Principle (SRP) states that a class should have only one reason to change.

**Meaning:** a class should handle one responsibility or concern.

## Example

- A `UserRepository` that both saves users and sends emails violates SRP.
- Email sending should be in a `EmailService`

Benefit:

- Easier to maintain and test.
