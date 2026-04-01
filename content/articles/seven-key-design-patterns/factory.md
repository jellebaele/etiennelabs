---
title: 'Factory - Creational'
position: 4
---

# Problem

Imagine you have a class you instantiate in several places. However, when you want to extend the creation depending on a condition, you want to create a different object. The original class however is instantiated in several places, so you have to adjust a great part of your application.

# Solution

The creation of objects is abstracted away in a factory. The complexities of creating the object is put into one single class that you can reuse accross your codebase.

# Example

## Bad implementation

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

## The fix

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

# Cons

- Add another layer of abstraction
- You add a dependency and coupling on the factory
