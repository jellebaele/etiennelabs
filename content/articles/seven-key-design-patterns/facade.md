---
title: 'Facade - Structural'
position: 5
---

Facade is a structural design pattern that provides a simplified interface to a library, a framework, or any other complex set of classes. This is basically encapsulation.

# Problem

Imagine that you must make your code work with a broad set of objects that belong to a sophisticated library or framework. Ordinarily, you’d need to initialize all of those objects, keep track of dependencies, execute methods in the correct order, and so on.

As a result, the business logic of your classes would become tightly coupled to the implementation details of 3rd-party classes, making it hard to comprehend and maintain.

_Note:_ This looks a lot like the factory pattern, BUT this is not creating any objects. This is how objects relate to each other.

# Solution

A facade is a class that provides a simple interface to a complex subsystem which contains lots of moving parts. A facade might provide limited functionality in comparison to working with the subsystem directly. However, it includes only those features that clients really care about.

Having a facade is handy when you need to integrate your app with a sophisticated library that has dozens of features, but you just need a tiny bit of its functionality.

For instance, an app that uploads short funny videos with cats to social media could potentially use a professional video conversion library. However, all that it really needs is a class with the single method `encode(filename, format)`. After creating such a class and connecting it with the video conversion library, you’ll have your first facade.

# Example

## Bad implementation

```cs
var paymentProcessor = new PaymentProcessor();
var inventorySystem = new InventorySystem();
var shippingCalculator = new ShippingCalculator();
var fraudChecker = new FraudChecker();

if (fraudChecker.verify(user)) {
  if (inventorySystem.checkStock(product)) {
    var shippingCost = shippingCalculator.comput(address);

    if (paymentProcessor.charge(user, product.price + shippingCost)) {
      inventorySystem.reserve(product);
    }
  }
}
```

## The fix

```cs
public class OrderFacade
{
  private readonly PaymentProcessor _paymentProcessor;
  private readonly InventorySystem _inventorySystem;
  private readonly ShippingCalculator _shippingCalculator;
  private readonly FraudChecker _fraudChecker;

  public OrderFacade() {
    _paymentProcessor = new PaymentProcessor();
    _inventorySystem = new InventorySystem();
    _shippingCalculator = new ShippingCalculator();
    _fraudChecker = new FraudChecker();
  }

  public bool PlaceOrder(User user, Product product, Address address) {
    if (!_fraudChecker.Verify(user))
    {
        Console.WriteLine("Fraud check failed.");
        return false;
    }

    if (!_inventorySystem.CheckStock(product))
    {
        Console.WriteLine("Product out of stock.");
        return false;
    }

    var shippingCost = _shippingCalculator.ComputeCost(address);

    if (!_paymentProcessor.Charge(user, product.Price + shippingCost))
    {
        Console.WriteLine("Payment failed.");
        return false;
    }

    _inventorySystem.Reserve(product);

    Console.WriteLine("Order placed successfully!");
    return true;
  }
}

var orderSystem = new OrderFacade();
orderSystem.placeOrder(user, product, address);
```

Benefits:

1. Simplified interface — clients don’t need to know about all subsystem classes.
2. Decouples business logic from complex libraries or subsystems.
3. Easier maintenance — you can change subsystems without touching client code.
4. Encapsulates orchestration — all the steps of a process are in one place.

# Cons

- A facade could beome a god object.
