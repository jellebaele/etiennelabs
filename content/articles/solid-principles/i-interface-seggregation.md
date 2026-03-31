---
title: 'I - Interface Seggregation Principle'
position: 4
---

# Definition

**Note:** Seggregation also means _seperation_ in this context.

Interface Segregation Principle (ISP) states that clients should not depend on interfaces they don’t use.

Instead of one large interface:

```cs
interface IMachine {
    void Print();
    void Scan();
    void Fax();
}
```

You split it into smaller ones:

- `IPrinter`
- `IScanner`
- `IFax`

Classes implement only what they need.

# Example

```cs
public interface IMachine
{
    void Print(Document doc);
    void Scan(Document doc);
    void Fax(Document doc);
}
```

Old printer that can only print:

```cs
public class OldPrinter : IMachine
{
    public void Print(Document doc)
    {
        Console.WriteLine("Printing document...");
    }

    public void Scan(Document doc)
    {
        throw new NotImplementedException();
    }

    public void Fax(Document doc)
    {
        throw new NotImplementedException();
    }
}
```

Problem:

- `OldPrinter` is forced to implement methods it doesn’t support
- This creates fragile code and runtime exceptions if someone calls `Scan()`

This breaks the Interface Segregation Principle.

Correct design:

```cs
public interface IPrinter
{
    void Print(Document doc);
}

public interface IScanner
{
    void Scan(Document doc);
}

public interface IFax
{
    void Fax(Document doc);
}
```

Old printer:

```cs
public class OldPrinter : IPrinter
{
    public void Print(Document doc)
    {
        Console.WriteLine("Printing document...");
    }
}
```

Modern all-in-one machine:

```cs
public class MultiFunctionMachine : IPrinter, IScanner, IFax
{
public void Print(Document doc)
{
Console.WriteLine("Printing...");
}

    public void Scan(Document doc)
    {
        Console.WriteLine("Scanning...");
    }

    public void Fax(Document doc)
    {
        Console.WriteLine("Faxing...");
    }
}
```

# Liskov Substition Principle vs. Interface Seggregation Principle

In Liskov Substition Principle:

> Subtypes must be replaceable for their base types without breaking behavior.

- **Focus:** behavioral correctness.
- **Goal:** derived classes behave like their base.

```cs
public interface IShape { int GetArea(); }

public class Rectangle : IShape { ... }
public class Square : IShape { ... }

```

Versus:

```cs
public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }

    public int GetArea()
    {
        return Width * Height;
    }
}

public class Square : Rectangle
{
    public override int Width
    {
        set
        {
            base.Width = value;
            base.Height = value;
        }
    }

    public override int Height
    {
        set
        {
            base.Width = value;
            base.Height = value;
        }
    }
}

public void ResizeRectangle(Rectangle rectangle)
{
    rectangle.Width = 5;
    rectangle.Height = 10;

    Console.WriteLine(rectangle.GetArea());
}

Rectangle rect = new Square();
ResizeRectangle(rect); // -> AREA = 100 instead of the expected 50
```

If Square broke the expected behavior of Rectangle (like in the classic Width/Height example), LSP is violated.

---

In Interface Seggregation Principle:

> Clients should not depend on interfaces they don’t use.

- **Focus:** what methods an interface exposes.
- **Goal:** small, focused interfaces → less fragile code.

```cs
public interface IPrinter { void Print(); }
public interface IScanner { void Scan(); }

public class OldPrinter : IPrinter { ... }
```

Here:

- ISP is followed because OldPrinter only implements what it needs.
- You don’t force it to implement unused methods.
