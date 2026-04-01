---
position: 2
title: 'O - Open/Closed Principle'
---

# Definition

The Open/Closed Principle (OCP) states that software entities should be **open** for extension but **closed** for modification.

**Meaning:** you should add new behavior without changing existing code.

# Example

Instead of modifying a PaymentProcessor every time you add a new payment type, you use an interface:

```cs
interface IPaymentMethod {
    void Pay();
}
```

Then create:

- `CreditCardPayment`
- `PaypalPayment`

The processor just depends on `IPaymentMethod` and is closed for modifications.

```cs
public class PaymentProcessor
{
    public void Process(IPaymentMethod paymentMethod, decimal amount)
    {
        paymentMethod.Pay(amount);
    }
}
```

**Note:** This example is also the `Strategy` pattern. Key difference between OCP and Strategy pattern:

- OCP -> is the principle
- Stategy -> is the design pattern to implement the principle
