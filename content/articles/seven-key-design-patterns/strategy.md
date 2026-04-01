---
title: 'Strategy - Behavioral'
position: 7
---

Strategy is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.

# Problem

One day you decided to create a navigation app for casual travelers. The app was centered around a beautiful map which helped users quickly orient themselves in any city.

One of the most requested features for the app was automatic route planning. A user should be able to enter an address and see the fastest route to that destination displayed on the map.

The first version of the app could only build the routes over roads. People who traveled by car were bursting with joy. But apparently, not everybody likes to drive on their vacation. So with the next update, you added an option to build walking routes. Right after that, you added another option to let people use public transport in their routes.

However, that was only the beginning. Later you planned to add route building for cyclists. And even later, another option for building routes through all of a city’s tourist attractions.

Each time you added a new routing algorithm, the main class of the navigator doubled in size. At some point, the beast became too hard to maintain.
Any change to one of the algorithms, whether it was a simple bug fix or a slight adjustment of the street score, affected the whole class, increasing the chance of creating an error in already-working code.

# Solution

The Strategy pattern suggests that you take a class that does something specific in a lot of different ways and extract all of these algorithms into separate classes called strategies.

The original class, called context, must have a field for storing a reference to one of the strategies. The context delegates the work to a linked strategy object instead of executing it on its own.

# Example

## Bad implementation

```cs
public class Commuter {
  public void GoToWork(TransportType type) {
    if (type = TransportType.Car) {
      // Start car
      // Check gas
      // Navigate traffic
      // Park car in garage
    } else if (type = TransportType.Bus) {
      // Check schedule
      // Wait at stop
      // Pay fare
      // Find seat
    } else if (type = TransportType.Bike) {
      // Check tires
      // Put on helmet
      // Navigate traffic
      // Lock bike
      // Change clothes
    }
    // This keeps on growing with each transport type
  }
}
```

## Fix

```cs
public interface ITransportStrategy {
  public void Transport();
}

public class CarStrategy : ITransportStrategy {
  public void Transport() {
    // Specific logic
  }
}

public class BusStrategy : ITransportStrategy {
  public void Transport() {
    // Specific logic
  }
}

public class BikeStrategy : ITransportStrategy {
  public void Transport() {
    // Specific logic
  }
}

public class Commuter {
  private readonly ITransportStrategy _strategy;

  public void SetStrategy(ITransportStrategy strategy) {
    _strategy = strategy;
  }

  public void GoToWork(TransportType type) {
    if (_strategy is null) throw new Exception("Transport strategy not set");

    _strategy.Transport();
  }
}

// Usage
var commuter = new Commuter();
commuter.SetStrategy(new CarStrategy());
commuter.GoToWork();

commuter.SetStrategy(new BikeStrategy());
commuter.GoToWork();
```

<br/>

# Strategy vs. Factory

> Factory decides what to create

> Strategy decides how to behave

Imagine you want to add logging behaviour. If you would just use the Factory pattern:

```cs
var strategy = StrategyFactory.CreateStrategy(TransportType.Bike)
strategy.Transport();
```

To add logging to each and every 'Transport' method, you would need to either go to every strategy and add logging or, make the strategy abstract, and extend it.

With the Strategy pattern however, you can simply do this:

```cs
public class Commuter {
  private readonly ITransportStrategy _strategy;

  public void SetStrategy(ITransportStrategy strategy) {
    _strategy = strategy;
  }

  public void GoToWork(TransportType type) {
    if (_strategy is null) throw new Exception("Transport strategy not set");
    // highlight-next-line
    Console.WriteLine("Start transportation");
    _strategy.Transport();
    // highlight-next-line
    Console.WriteLine("Commuter arrived");
  }
}
```

# Cons

- You end up with a lot of subclasses
