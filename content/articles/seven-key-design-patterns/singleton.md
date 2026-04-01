---
title: 'Singleton - Creational'
position: 2
---

# The Problem

1. Ensure that a class has just a single instance. Why would anyone want to control how many instances a class has? The most common reason for this is to control access to some shared resource—for example, a database or a file.
   <br /><br />Here’s how it works: imagine that you created an object, but after a while decided to create a new one. Instead of receiving a fresh object, you’ll get the one you already created.
   <br /><br />Note that this behavior is impossible to implement with a regular constructor since a constructor call must always return a new object by design.
2. Provide a global access point to that instance. Remember those global variables that you (all right, me) used to store some essential objects? While they’re very handy, they’re also very unsafe since any code can potentially overwrite the contents of those variables and crash the app.
   <br /><br />Just like a global variable, the Singleton pattern lets you access some object from anywhere in the program. However, it also protects that instance from being overwritten by other code.
   <br /><br />There’s another side to this problem: you don’t want the code that solves problem #1 to be scattered all over your program. It’s much better to have it within one class, especially if the rest of your code already depends on it.

# The Solution

- Make the default constructor private, to prevent other objects from using the new operator with the Singleton class.
- Create a static creation method that acts as a constructor. Under the hood, this method calls the private constructor to create an object and saves it in a static field. All following calls to this method return the cached object.

If your code has access to the Singleton class, then it’s able to call the Singleton’s static method. So whenever that method is called, the same object is always returned.

# Example

When errors happen, you want one consistent logger with consistent formatting and style that logs errors to e.g. a file.

## Bad implementation

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

## The fix

It’s pretty easy to implement a sloppy Singleton. You just need to hide the constructor and implement a static creation method. However, in a multithreaded environment, multiple threads can call the creation method simultaneously and get several instances of Singleton class:

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

To make it thread-safe, you can add a lock:

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

Output:

```bash
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

# Cons

- Not easy to mock
- Threading issues
- Is is basically a glorified `Global`
