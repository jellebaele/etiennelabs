---
title: 'Observer - Behavioral'
position: 8
---

Observer is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they’re observing.

# Problem

Imagine that you have two types of objects: a Customer and a Store. The customer is very interested in a particular brand of product (say, it’s a new model of the iPhone) which should become available in the store very soon.

The customer could visit the store every day and check product availability. But while the product is still en route, most of these trips would be pointless.

On the other hand, the store could send tons of emails (which might be considered spam) to all customers each time a new product becomes available. This would save some customers from endless trips to the store. At the same time, it’d upset other customers who aren’t interested in new products.

# Solution

The object that has some interesting state is often called subject, but since it’s also going to notify other objects about the changes to its state, we’ll call it publisher. All other objects that want to track changes to the publisher’s state are called subscribers.

The Observer pattern suggests that you add a subscription mechanism to the publisher class so individual objects can subscribe to or unsubscribe from a stream of events coming from that publisher. Fear not! Everything isn’t as complicated as it sounds. In reality, this mechanism consists of:

1. an array field for storing a list of references to subscriber objects and
2. several public methods which allow adding subscribers to and removing them from that list.

# Example

## Bad implementation

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

## Fix

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

# Pros

- Open/Closed Principle. You can introduce new subscriber classes without having to change the publisher’s code (and vice versa if there’s a publisher interface).
- You can establish relations between objects at runtime.

# Cons

- Subscribers are notified in random order.
- Event trigger hell (if you have an endless loop of events linked to each other)

# Observer vs. Mediator

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

## Observer Pattern

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

## Mediator Pattern

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
