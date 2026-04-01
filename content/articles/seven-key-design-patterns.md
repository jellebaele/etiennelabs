---
title: 'Seven key design patterns'
date: '2026-03-25'
tags: [Design patterns]
excerpt: 'Seven essential patterns that every developer should have in their toolkit.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Seven key design patterns

Software development is often a battle against complexity. As systems grow, the "quick fix" of today becomes the technical debt of tomorrow. To build systems that are resilient to change, we rely on Design Patterns—proven, repeatable solutions to commonly occurring problems in software design.

This guide explores seven essential patterns that every developer should have in their toolkit, moving beyond simple implementation to understand the why behind the architecture.

## What are design patterns?

A design pattern is not a finished piece of code that can be copy-pasted into a codebase. Instead, it is a **description** or **template** for solving a recurring problem in a given context—one that has been encountered and solved many times before.

These patterns are battle-tested solutions to common problems in software design. In fact, developers often apply them without even realizing it, since they naturally emerge in everyday programming. Design patterns aim to formalize these solutions and give them a shared structure and vocabulary.

Using design patterns allows teams to communicate more effectively by speaking a common language. For example, referring to a “Factory” or “Observer” pattern immediately conveys a specific approach without needing to explain the full implementation. Moreover, because these patterns are well-established, they help avoid common pitfalls in object-oriented design.

## The three types of patterns

Design patterns are generally categorized into three groups based on their intent:

1. **Creational:** Deal with object creation mechanisms, aiming to create objects in a flexible and reusable way.
2. **Structural:** focus on how classes and objects are composed to form larger structures.
3. **Behavioral:** deal with communication and responsibility between objects.

### 1. Creational patterns

Creational patterns describe how to create objects in a flexible and reusable way. Instead of creating objects directly, creational patterns abstract the instantiation process. In a poorly designed system, objects are often instantiated directly throughout the codebase. This can lead to tight coupling and poor testability.

- **Goal:** Encapsulate the knowledge of which concrete classes the system uses.
- **Common Examples:** Singleton, Factory Method, Builder.

### 2. Structural

Structural patterns focus on how classes and objects are related to each other. These are blueprint for building larger structures from individual pieces. The goal is to ensure that changes in one part of the system do not require widespread modifications elsewhere. It's like Lego: you get a set of instructions to create a complex structure.

- **Goal:** Use inheritance and interfaces to allow different objects to work together seamlessly.
- **Common Examples:** Adapter, Facade.

### 3. Behavioral

Behavioral patterns are concerned with handilng communication between objects. How objects and collaborate, helping to keep the system loosely coupled and easier to extend.

- **Goal:** Simplify communication and responsibility distribution between objects.
- **Common Examples:** Observer, Strategy, Command.

## The seven key design patterns

While there are many design patterns, some appear far more frequently in real-world applications. The following seven patterns were selected because they cover a wide range of common design challenges and provide a solid foundation for building maintainable systems.

For each pattern, we will look at:

- The problem it solves
- The core idea behind the solution
- When to use it (and when not to)

### 1. Singleton - Creational

#### Problem:

1. Ensure that a class has just a single instance. Why would anyone want to control how many instances a class has? The most common reason for this is to control access to some shared resource—for example, a database or a file.
   <br /><br />Here’s how it works: imagine that you created an object, but after a while decided to create a new one. Instead of receiving a fresh object, you’ll get the one you already created.
   <br /><br />Note that this behavior is impossible to implement with a regular constructor since a constructor call must always return a new object by design.
2. Provide a global access point to that instance. Remember those global variables that you (all right, me) used to store some essential objects? While they’re very handy, they’re also very unsafe since any code can potentially overwrite the contents of those variables and crash the app.
   <br /><br />Just like a global variable, the Singleton pattern lets you access some object from anywhere in the program. However, it also protects that instance from being overwritten by other code.
   <br /><br />There’s another side to this problem: you don’t want the code that solves problem #1 to be scattered all over your program. It’s much better to have it within one class, especially if the rest of your code already depends on it.

#### Solution:

- Make the default constructor private, to prevent other objects from using the new operator with the Singleton class.
- Create a static creation method that acts as a constructor. Under the hood, this method calls the private constructor to create an object and saves it in a static field. All following calls to this method return the cached object.

If your code has access to the Singleton class, then it’s able to call the Singleton’s static method. So whenever that method is called, the same object is always returned.

#### Example:

When errors happen, you want one consistent logger with consistent formatting and style that logs errors to e.g. a file.

_Bad example:_

```cs
public class Logger
{
    private readonly string _level;
    private readonly StreamWriter _writer;

    public Logger(string level, string filePath)
    {
        _level = level;
        _writer = new StreamWriter(filePath, append: true);
    }

    public void Log(string level, string message)
    {
        if (level == _level)
        {
            _writer.WriteLine(message);
            _writer.Flush();
        }
    }
}

// Usage
var logger1 = new FileLogger("info", "app.log");
var logger2 = new FileLogger("error", "app.log");

logger1.Log("info", "Hello");
logger2.Log("info", "World");
```

Output:

```bash
Hello
```

Here several issues arise. Several logging instances can interfere with each other and this can create:

- inconsistent styles
- race conditions & locks as different loggers want to log to the same file
- differenc configurations

_Fix:_

It’s pretty easy to implement a sloppy Singleton. You just need to hide the constructor and implement a static creation method. However, in a multithreaded environment, multiple threads can call the creation method simultaneously and get several instances of Singleton class.

<Tabs>
<TabItem value="naive" label="Naïve Singleton">

```cs
public sealed class LoggerSingleton
{
  private static LoggerSingleton _instance;

  private LoggerSingleton() {
  }

  public static LoggerSingleton GetInstance()
  {
    if (_instance == null)
    {
        _instance = new LoggerSingleton();
    }

    return _instance;
  }

  public void Log(string level, string message)
  {
      // ...
  }
}

// Usage
LoggerSingleton s1 = LoggerSingleton.GetInstance();
LoggerSingleton s2 = LoggerSingleton.GetInstance();

if (s1 == s2)
{
    Console.WriteLine("Singleton works, both variables contain the same instance.");
}
else
{
    Console.WriteLine("Singleton failed, variables contain different instances.");
}
```

</TabItem>
<TabItem value="thread" label="Thread-safe Singleton">

```cs
public sealed class LoggerSingleton
{
  private static LoggerSingleton _instance;

  // We now have a lock object that will be used to synchronize threads
  // during first access to the Singleton.
  private static readonly object _lock = new object();

  private LoggerSingleton() {
  }

  public static LoggerSingleton GetInstance()
  {
    if (_instance == null)
    {
        // Now, imagine that the program has just been launched. Since
        // there's no Singleton instance yet, multiple threads can
        // simultaneously pass the previous conditional and reach this
        // point almost at the same time. The first of them will acquire
        // lock and will proceed further, while the rest will wait here.
        lock(_lock)
        {
          // The first thread to acquire the lock, reaches this
          // conditional, goes inside and creates the Singleton
          // instance. Once it leaves the lock block, a thread that
          // might have been waiting for the lock release may then
          // enter this section. But since the Singleton field is
          // already initialized, the thread won't create a new
          // object.
          if (_instance == null)
          {
              _instance = new Singleton();
          }
        }
    }
    return _instance;
  }

  public void Log(string level, string message)
  {
      // ...
  }
}

// Usage
LoggerSingleton s1;
LoggerSingleton s2;

Thread process1 = new Thread(() => s1 = LoggerSingleton.GetInstance());
Thread process2 = new Thread(() => s2 = LoggerSingleton.GetInstance());

process1.Start();
process2.Start();

process1.Join();
process2.Join();

if (s1 == s2)
{
    Console.WriteLine("Singleton works, both variables contain the same instance.");
}
else
{
    Console.WriteLine("Singleton failed, variables contain different instances.");
}
```

</TabItem>
</Tabs>
Output:

```
Singleton works, both variables contain the same instance.
```

<details>
  <summary>Configuration issues</summary>

It is hard to add configuration on creation:

```cs
private LoggerSingleton(string level, string filePath)
{
    _level = level;
    _writer = new StreamWriter(filePath, append: true);
}

public static LoggerSingleton GetInstance(string level, string filePath)
{
    if (_instance == null)
    {
        _instance = new LoggerSingleton(level, filePath);
    }

    return _instance;
}

LoggerSingleton.GetInstance("info", "app.log"); // first call
LoggerSingleton.GetInstance("error", "other.log"); // ignored
```

You can avoid this by doing:

```cs
private LoggerSingleton() { }

public static void Initialize(string level, string filePath)
{
    if (_instance != null)
        throw new InvalidOperationException("Already initialized");

    _instance = new LoggerSingleton
    {
        _level = level,
        _writer = new StreamWriter(filePath, append: true)
    };
}

public static LoggerSingleton Instance =>
    _instance ?? throw new InvalidOperationException("Not initialized");


// Usage
LoggerSingleton.Initialize("info", "app.log");
LoggerSingleton.Log("info", "Hello"); // You MUST remember to call 'Initialize' first.
```

To avoid the problem to remember you have to call the `Initialize()` function first, in modern .Net projects you use dependency injection:

```cs
public class Logger
{
    private readonly string _level;
    private readonly StreamWriter _writer;

    public Logger(string level, string filePath)
    {
        _level = level;
        _writer = new StreamWriter(filePath, append: true);
    }

    public void Log(string level, string message)
    {
        if (level == _level)
        {
            _writer.WriteLine(message);
            _writer.Flush();
        }
    }
}


// Usage
builder.Services.AddSingleton<Logger>(sp =>
    new Logger("info", "app.log"));
```

</details>

#### Cons

- Not easy to mock
- Threading issues
- Is is basically a glorified `Global`

### 2. Builder - Creational

#### Problem:

Imagine a complex object that requires laborious, step-by-step initialization of many fields and nested objects. Such initialization code is usually buried inside a monstrous constructor with lots of parameters. Or even worse: scattered all over the client code.

In most cases most of the parameters will be unused, making the constructor calls pretty ugly.

#### Solution:

The Builder pattern suggests that you extract the object construction code out of its own class and move it to separate objects called builders. The Builder pattern suggests that you extract the object construction code out of its own class and move it to separate objects called builders.

#### Example:

Image a HTTPRequest class with all of these optional parameters:

_Bad implementation:_

```cs
public class HTTPRequest
{
    private readonly string _url;
    private readonly string _method;
    private readonly string _authorization;
    private readonly string _body;
    private readonly int _timeout;
    private readonly int _retry;
    private readonly string _queryParams;
    private readonly bool _validateStatus;
    private readonly bool _cache;
    private readonly bool _followRedirect;

    // Constructor with all parameters (bad: too many params)
    public HTTPRequest(
        string url,
        string method,
        string authorization,
        string body,
        int timeout,
        int retry,
        string queryParams,
        bool validateStatus,
        bool cache,
        bool followRedirect)
    {
        _url = url;
        _method = method;
        _authorization = authorization;
        _body = body;
        _timeout = timeout;
        _retry = retry;
        _queryParams = queryParams;
        _validateStatus = validateStatus;
        _cache = cache;
        _followRedirect = followRedirect;
    }
}

// Usage
var request = new HTTPRequest(
    "https://example.com/api",
    "POST",
    "Bearer token",
    "{ \"name\": \"Jelle\" }",
    5000,
    3,
    "id=1",
    true,
    false,
    true
);
```

_Good implementation_

```cs
public class HTTPRequest
{
    public string Url { get; private set; } = "";
    public string Method { get; private set; } = "GET";
    public string Authorization { get; private set; } = null;
    public string Body { get; private set; } = null;
    public int Timeout { get; private set; } = 3000; // 3 seconds
    public int Retry { get; private set; } = 0;
    public string QueryParams { get; private set; } = "";
    public bool ValidateStatus { get; private set; } = true;
    public bool Cache { get; private set; } = false;
    public bool FollowRedirect { get; private set; } = true;

    // Each setter returns `this` to allow chaining
    public HTTPRequest SetUrl(string url) { Url = url; return this; }
    public HTTPRequest SetMethod(string method) { Method = method; return this; }
    public HTTPRequest SetAuthorization(string auth) { Authorization = auth; return this; }
    public HTTPRequest SetBody(string body) { Body = body; return this; }
    public HTTPRequest SetTimeout(int timeout) { Timeout = timeout; return this; }
    public HTTPRequest SetRetry(int retry) { Retry = retry; return this; }
    public HTTPRequest SetQueryParams(string queryParams) { QueryParams = queryParams; return this; }
    public HTTPRequest SetValidateStatus(bool validateStatus) { ValidateStatus = validateStatus; return this; }
    public HTTPRequest SetCache(bool cache) { Cache = cache; return this; }
    public HTTPRequest SetFollowRedirect(bool followRedirect) { FollowRedirect = followRedirect; return this; }
}

// Usage
var req1 = new HTTPRequest()
    .SetUrl("https://example.com/api");

var req2 = new HTTPRequest()
    .SetUrl("https://example.com/api")
    .SetMethod("POST")
    .SetAuthorization("Bearer token")
    .SetBody("{\"name\":\"Jelle\"}")
    .SetTimeout(5000)
    .SetRetry(3)
    .SetValidateStatus(true)
    .SetCache(false)
    .SetFollowRedirect(false);
```

<details>
  <summary>Extended example with a `Director`</summary>

You can also use a `Director` to construct a HTTPRequest into a separate class called director. The director class defines the order in which to execute the building steps, while the builder provides the implementation for those steps.

Having a director class in your program isn’t strictly necessary. You can always call the building steps in a specific order directly from the client code. However, the director class might be a good place to put various construction routines so you can reuse them across your program.

```cs
public interface IHttpRequestBuilder
{
    void BuildMinimal();
    void BuildFull();
    HTTPRequest GetRequest();
}

public class HTTPRequestConcreteBuilder : IHttpRequestBuilder
{
    private HTTPRequest _request = new HTTPRequest();

    public void Reset() => _request = new HTTPRequest();

    public void BuildMinimal()
    {
        Reset();
        _request.SetUrl("https://api.example.com/minimal")
                .SetMethod("GET");
    }

    public void BuildFull()
    {
        Reset();
        _request.SetUrl("https://api.example.com/full")
                .SetMethod("POST")
                .SetAuthorization("Bearer token")
                .SetBody("{\"name\":\"Jelle\"}")
                .SetTimeout(5000)
                .SetRetry(3)
                .SetValidateStatus(true)
                .SetCache(true)
                .SetFollowRedirect(true);
    }

    public HTTPRequest GetRequest() => _request;
}

public class HTTPRequestDirector
{
    private IHttpRequestBuilder _builder;

    public IHttpRequestBuilder Builder
    {
        set { _builder = value; }
    }

    public void ConstructMinimalRequest() => _builder.BuildMinimal();
    public void ConstructFullRequest() => _builder.BuildFull();
}

// Usage
var director = new HTTPRequestDirector();
var builder = new HTTPRequestConcreteBuilder();
director.Builder = builder;

// Minimal request
director.ConstructMinimalRequest();
var minimalReq = builder.GetRequest();

// Full request
director.ConstructFullRequest();
var fullReq = builder.GetRequest();

// Custom request (without director)
builder.BuildFull();
var customReq = builder
      .GetRequest()
      .SetTimeout(10000)
      .SetCache(false);
```

</details>

#### Cons:

- You end up writing more code

### 3. Factory - Creational

#### Problem:

Imagine you have a class you instantiate in several places. However, when you want to extend the creation depending on a condition, you want to create a different object. The original class however is instantiated in several places, so you have to adjust a great part of your application.

#### Solution:

The creation of objects is abstracted away in a factory. The complexities of creating the object is put into one single class that you can reuse accross your codebase.

#### Example:

_Bad implementation:_

```cs
public abstract class Notification
{
    public abstract void Send(string message);
}

public class EmailNotification : Notification
{
    public override void Send(string message)
    {
        Console.WriteLine($"Sending Email: {message}");
    }
}

public class SMSNotification : Notification
{
    public override void Send(string message)
    {
        Console.WriteLine($"Sending SMS: {message}");
    }
}

public class PushNotification : Notification
{
    public override void Send(string message)
    {
        Console.WriteLine($"Sending Push: {message}");
    }
}

class Program
{
    static void Main(string[] args)
    {
        // Many scattered instantiations with inline logic
        Notification notif1;
        if (DateTime.Now.Hour < 12)
        {
            notif1 = new EmailNotification(); // morning emails
        }
        else
        {
            notif1 = new SMSNotification(); // afternoon SMS
        }
        notif1.Send("Good morning or afternoon!");

        // Another scattered creation
        Notification notif2 = new PushNotification();
        notif2.Send("Breaking news!");

        // Yet another
        string preferredType = "email";
        Notification notif3;
        switch (preferredType)
        {
            case "email": notif3 = new EmailNotification(); break;
            case "sms": notif3 = new SMSNotification(); break;
            case "push": notif3 = new PushNotification(); break;
            default: throw new Exception("Unknown type");
        }
        notif3.Send("Personalized message!");

        // Imagine this pattern repeats dozens of times across different classes
        // Now you want to add a new type (like SlackNotification)
        // You must touch every conditional and scattered instantiation
    }
}
```

Issues:

1. Object creation is everywhere → impossible to maintain.
2. Conditionals are duplicated → e.g., if/else or switch for type.
3. Adding a new notification type requires changing dozens of places.
4. Very easy to introduce bugs, e.g., wrong type, inconsistent logic.

_Fix:_

```cs
// Base class
public abstract class Notification
{
    public abstract void Send(string message);
}

public class EmailNotification : Notification
{
    public override void Send(string message)
    {
        Console.WriteLine($"Sending Email: {message}");
    }
}

public class SMSNotification : Notification
{
    public override void Send(string message)
    {
        Console.WriteLine($"Sending SMS: {message}");
    }
}

public class PushNotification : Notification
{
    public override void Send(string message)
    {
        Console.WriteLine($"Sending Push: {message}");
    }
}

public class SlackNotification : Notification
{
    public override void Send(string message)
    {
        Console.WriteLine($"Sending Slack: {message}");
    }
}

// Factory class
public static class NotificationFactory
{
    public static Notification CreateNotification(string type)
    {
        return type.ToLower() switch
        {
            "email" => new EmailNotification(),
            "sms" => new SMSNotification(),
            "push" => new PushNotification(),
            "slack" => new SlackNotification(),
            _ => throw new ArgumentException("Unknown notification type")
        };
    }
}

class Program
{
    static void Main(string[] args)
    {
        // All scattered conditionals are gone
        // The logic is now centralized in the factory

        // Morning vs afternoon logic
        string type1 = DateTime.Now.Hour < 12 ? "email" : "sms";
        Notification notif1 = NotificationFactory.CreateNotification(type1);
        notif1.Send("Good morning or afternoon!");

        // Breaking news
        Notification notif2 = NotificationFactory.CreateNotification("push");
        notif2.Send("Breaking news!");

        // User preference
        string preferredType = "email";
        Notification notif3 = NotificationFactory.CreateNotification(preferredType);
        notif3.Send("Personalized message!");

        // New type (Slack) added easily
        Notification notif4 = NotificationFactory.CreateNotification("slack");
        notif4.Send("Team update!");

        // Now, adding a new notification type doesn't require touching any other code
        // Only the factory is updated
    }
}

```

#### Cons:

- Add another layer of abstraction
- You add a dependency and coupling on the factory

### 4. Facade - Structural

Facade is a structural design pattern that provides a simplified interface to a library, a framework, or any other complex set of classes. This is basically encapsulation.

#### Problem:

Imagine that you must make your code work with a broad set of objects that belong to a sophisticated library or framework. Ordinarily, you’d need to initialize all of those objects, keep track of dependencies, execute methods in the correct order, and so on.

As a result, the business logic of your classes would become tightly coupled to the implementation details of 3rd-party classes, making it hard to comprehend and maintain.

_Note:_ This looks a lot like the factory pattern, BUT this is not creating any objects. This is how objects relate to each other.

#### Solution:

A facade is a class that provides a simple interface to a complex subsystem which contains lots of moving parts. A facade might provide limited functionality in comparison to working with the subsystem directly. However, it includes only those features that clients really care about.

Having a facade is handy when you need to integrate your app with a sophisticated library that has dozens of features, but you just need a tiny bit of its functionality.

For instance, an app that uploads short funny videos with cats to social media could potentially use a professional video conversion library. However, all that it really needs is a class with the single method `encode(filename, format)`. After creating such a class and connecting it with the video conversion library, you’ll have your first facade.

#### Example:

_Bad implementation:_

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

_Fix:_

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

#### Cons

- A facade could beome a god object.

### 5. Adapter - Structural

Adapter is a structural design pattern that allows objects with incompatible interfaces to collaborate.

#### Problem:

Imagine that you’re creating a stock market monitoring app. The app downloads the stock data from multiple sources in XML format and then displays nice-looking charts and diagrams for the user.

At some point, you decide to improve the app by integrating a smart 3rd-party analytics library. But there’s a catch: the analytics library only works with data in JSON format.

You could change the library to work with XML. However, this might break some existing code that relies on the library. And worse, you might not have access to the library’s source code in the first place, making this approach impossible.

#### Solution:

You can create an adapter. This is a special object that converts the interface of one object so that another object can understand it.

An adapter wraps one of the objects to hide the complexity of conversion happening behind the scenes. The wrapped object isn’t even aware of the adapter. For example, you can wrap an object that operates in meters and kilometers with an adapter that converts all of the data to imperial units such as feet and miles.

Adapters can not only convert data into various formats but can also help objects with different interfaces collaborate. Here’s how it works:

1. The adapter gets an interface, compatible with one of the existing objects.
2. Using this interface, the existing object can safely call the adapter’s methods.
3. Upon receiving a call, the adapter passes the request to the second object, but in a format and order that the second object expects.

Sometimes it’s even possible to create a two-way adapter that can convert the calls in both directions.

#### Example:

Imagine we have a third-party API interface:

```cs
public interface IWeatherApi {
  public decimal GetTempC();
  public decimal GetHumidity();
  public decimal GetWindSpeedKPH();
}

public class ThirdPartyWeatherAPI : IWeatherApi {
  public decimal GetTempC() {
    return 22;
  }

  public decimal GetHumidity() {
    return 65;
  }

  public decimal GetWindSpeedKPH() {
    return 15;
  }
}
```

However, our application expects different units:

```cs
public interface IWeatherApp {
  public decimal GetTempF();
  public decimal GetHumidity();
  public decimal GetWindSpeedMPH();
}
```

_Bad implementation:_

```cs
// Without adapt - scattered conversions everywhere
var weatherApi = new ThirdPartyWeatherAPI();
if (weatherApi.GetTempC() * 9/5 + 32 > 75) {
  Console.WriteLine("It's hot!");
}

if (weatherApi.GetWindSpeedKPH() * 0.621371 > 10) {
  Console.WriteLine("It's windy!");
}
```

_Fix_:

```cs
public class WeatherAdapter : WeatherApp
{
  private readonly _thirdPartyWeatherApi;

  public WeatherAdapter() {
    _thirdPartyWeatherApi = new ThirdPartyWeatherAPI();
  }

  public decimal GetTempF() {
    return _weatherApi.GetTempC() * 9/5 + 32;
  }
  public decimal GetHumidity() {
    return _weatherApi.GetHumidity();
  }
  public decimal GetWindSpeedMPH() {
    return _weatherApi.GetWindSpeedKPH() * 0.621371;
  }
}

var weatherApi = new WeatherAdapter();
if (weatherApi.GetTempF() > 75) {
  Console.WriteLine("It's hot!");
}

if (weatherApi.GetWindSpeedMPH() > 10) {
  Console.WriteLine("It's windy!");
}
```

#### Cons

- Code complexity might increase as another layer of abstractions is introduced

### 6. Strategy - Behavioral

Strategy is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.

#### Problem:

One day you decided to create a navigation app for casual travelers. The app was centered around a beautiful map which helped users quickly orient themselves in any city.

One of the most requested features for the app was automatic route planning. A user should be able to enter an address and see the fastest route to that destination displayed on the map.

The first version of the app could only build the routes over roads. People who traveled by car were bursting with joy. But apparently, not everybody likes to drive on their vacation. So with the next update, you added an option to build walking routes. Right after that, you added another option to let people use public transport in their routes.

However, that was only the beginning. Later you planned to add route building for cyclists. And even later, another option for building routes through all of a city’s tourist attractions.

Each time you added a new routing algorithm, the main class of the navigator doubled in size. At some point, the beast became too hard to maintain.
Any change to one of the algorithms, whether it was a simple bug fix or a slight adjustment of the street score, affected the whole class, increasing the chance of creating an error in already-working code.

#### Solution:

The Strategy pattern suggests that you take a class that does something specific in a lot of different ways and extract all of these algorithms into separate classes called strategies.

The original class, called context, must have a field for storing a reference to one of the strategies. The context delegates the work to a linked strategy object instead of executing it on its own.

#### Example:

_Bad implementation:_

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

_Fix:_

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

#### Strategy vs. Factory

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

#### Cons

- You end up with a lot of subclasses

### 7. Observer - Behavioral

Observer is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they’re observing.

#### Problem:

Imagine that you have two types of objects: a Customer and a Store. The customer is very interested in a particular brand of product (say, it’s a new model of the iPhone) which should become available in the store very soon.

The customer could visit the store every day and check product availability. But while the product is still en route, most of these trips would be pointless.

On the other hand, the store could send tons of emails (which might be considered spam) to all customers each time a new product becomes available. This would save some customers from endless trips to the store. At the same time, it’d upset other customers who aren’t interested in new products.

#### Solution:

The object that has some interesting state is often called subject, but since it’s also going to notify other objects about the changes to its state, we’ll call it publisher. All other objects that want to track changes to the publisher’s state are called subscribers.

The Observer pattern suggests that you add a subscription mechanism to the publisher class so individual objects can subscribe to or unsubscribe from a stream of events coming from that publisher. Fear not! Everything isn’t as complicated as it sounds. In reality, this mechanism consists of:

1. an array field for storing a list of references to subscriber objects and
2. several public methods which allow adding subscribers to and removing them from that list.

#### Example:

_Bad implementation:_

```cs
public class BadStockTicker
{
    // We are forced to hold specific references to concrete classes
    private List<RetailInvestor> _retailers;
    private readonly INotificationService _mailNotifier = new MailNotifier();

    public void AddRetailer(RetailInvestor retailer) => _retailers.Add(retailer);

    public void UpdatePrice(string symbol, double price)
    {
        // Somehow notify each investor
        foreach (var r in _retailers) _mailNotifier.Send(symbol, price);
    }
}
```

What if we now want to add:

- A `InstitutionalInvestor` class for big banks
- A `MobileAppNotifier`
- A `Logger` to save prices to the database

```cs
public class BadStockTicker
{
    // We are forced to hold specific references to concrete classes
    private List<RetailInvestor> _retailers;
    private List<InstitutionalInvestor> _banks = new();
    private List<Logger> _loggers = new();
    private readonly INotificationService _mailNotifier = new MailNotifier();
    private readonly INotificationService _mobileAppNotifier = new MobileAppNotifier();

    public void AddRetailer(RetailInvestor retailer) => _retailers.Add(retailer);
    public void AddBank(InstitutionalInvestor bank) => _banks.Add(retailer);
    public void AddLogger(Logger logger) => _loggers.Add(logger);

    public void UpdatePrice(string symbol, double price)
    {
        // Somehow notify each investor
        foreach (var r in _retailers) {
          _mailNotifier.Send(symbol, price);
          _mobileAppNotifier.Send(symbol, price);
        }

        foreach (var b in _banks) {
          _mobileAppNotifier.Send(symbol, price);
        }

        foreach (var l in _loggers) {
          Console.WriteLine("...")
        }
    }
}

// Usage
var ticker = new BadStockTicker();

var alice = new RetailInvestor("Alice");
var wallStreetBank = new InstitutionalInvestor("Goldman Sachs");
var fileLogger = new Logger();

// We have to use different methods for different types
ticker.AddRetailer(alice);
ticker.AddBank(wallStreetBank);
ticker.AddLogger(fileLogger);

// This triggers a mess of hard-coded loops inside the ticker
ticker.UpdatePrice("MSFT", 420.50);
```

_Fix:_

```cs
public interface IObserver
{
    void Update(string symbol, double price);
}

public class RetailInvestor : IObserver
{
    private readonly INotificationService _mail = new MailNotifier();
    public void Update(string symbol, double price) => _mail.Send(symbol, price);
}

public class InstitutionalInvestor : IObserver
{
    private readonly INotificationService _terminal = new BloombergTerminal();
    public void Update(string symbol, double price) => _terminal.Send(symbol, price);
}

public class Logger : IObserver
{
    public void Update(string symbol, double price) => Console.WriteLine($"Logged: {symbol} at {price}");
}

public class StockTicker
{
    private readonly List<IInvestor> _subscribers = new();

    public void Subscribe(IInvestor investor) => _subscribers.Add(investor);
    public void Unsubscribe(IInvestor investor) => _subscribers.Remove(investor);

    public void UpdatePrice(string symbol, double price)
    {
        foreach (var subscriber in _subscribers)
        {
            subscriber.Update(symbol, price);
        }
    }
}

// Usage
var ticker = new StockTicker();

// Any class implementing IInvestor works here
ticker.Subscribe(new RetailInvestor());
ticker.Subscribe(new InstitutionalInvestor());
ticker.Subscribe(new Logger());

ticker.UpdatePrice("MSFT", 420.50);
```

#### Pros

- Open/Closed Principle. You can introduce new subscriber classes without having to change the publisher’s code (and vice versa if there’s a publisher interface).
- You can establish relations between objects at runtime.

#### Cons

- Subscribers are notified in random order.
- Event trigger hell (if you have an endless loop of events linked to each other)

#### Observer vs. Mediator

Observer:

> “Hey everyone, something changed!”

Common example: A Youtube channel that notifies subscribers when a new video is uploaded.

- Channel doesn’t know what subscribers do
- Just broadcasts an event

Mediator:

> “Don’t talk to each other — talk to me, I’ll handle it.”

Common example: A chat room where users communicate via a central mediator

- Users don’t communicate directly
- Mediator controls interactions

<details>
  <summary>Coding examples</summary>

#### Observer Pattern

```cs
public interface IObserver
{
    void Update(string videoTitle);
}

public class Subscriber : IObserver
{
    private string _name;

    public Subscriber(string name)
    {
        _name = name;
    }

    public void Update(string videoTitle)
    {
        Console.WriteLine($"{_name} got notified: {videoTitle}");
    }
}

public class YouTubeChannel
{
    private List<IObserver> _subscribers = new();

    public void Subscribe(IObserver observer)
    {
        _subscribers.Add(observer);
    }

    public void UploadVideo(string title)
    {
        Console.WriteLine($"New video uploaded: {title}");

        foreach (var sub in _subscribers)
        {
            sub.Update(title);
        }
    }
}

// Usage
var channel = new YouTubeChannel();

channel.Subscribe(new Subscriber("Jelle"));
channel.Subscribe(new Subscriber("Alice"));

channel.UploadVideo("Observer Pattern Explained");
```

#### Mediator Pattern

```cs
public interface IChatMediator
{
    void SendMessage(string message, User user);
}

public class ChatMediator : IChatMediator
{
    private List<User> _users = new();

    public void AddUser(User user)
    {
        _users.Add(user);
    }

    public void SendMessage(string message, User sender)
    {
        foreach (var user in _users)
        {
            if (user != sender)
            {
                user.Receive(message);
            }
        }
    }
}

public class User
{
    private readonly string _name;
    private readonly IChatMediator _mediator;

    public User(string name, IChatMediator mediator)
    {
        _name = name;
        _mediator = mediator;
    }

    public void Send(string message)
    {
        Console.WriteLine($"{_name} sends: {message}");
        _mediator.SendMessage(message, this);
    }

    public void Receive(string message)
    {
        Console.WriteLine($"{_name} received: {message}");
    }
}

// Usage
var mediator = new ChatMediator();

var user1 = new User("Jelle", mediator);
var user2 = new User("Alice", mediator);

mediator.AddUser(user1);
mediator.AddUser(user2);

user1.Send("Hello!");
```

</details>
