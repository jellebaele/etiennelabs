---
title: 'MVC and the Missing Layer'
date: '2026-03-31'
tags: ['Architectural Patterns']
excerpt: 'The MVC pattern, also known as Model-View-Controller, separates concerns in an application—but in complex systems, a “missing layer” emerges to handle business rules and domain logic.'
---

The Model–View–Controller (MVC) pattern is one of the most well-established architectural patterns in software development. It divides an application into three core components:

1. Model
2. View
3. Controller

Each component has a clearly defined responsibility. The Model manages the application’s data and business rules, the View is responsible for presenting that data, and the Controller handles incoming input and coordinates interactions between the Model and the View.

This separation of concerns allows applications to be more structured, maintainable, and scalable. For that reason, MVC has been widely adopted—from early desktop graphical user interfaces (GUIs) to modern web development frameworks.

However, in more complex applications, strictly adhering to these three layers can introduce challenges. Important application logic often does not fit naturally within either the Model or the Controller, which can lead to overly complex or tightly coupled components. This has led to ongoing discussions about whether MVC, in its traditional form, fully addresses the separation of concerns required by modern software systems.

# Components of MVC

The MVC pattern is built around three core components, each with a clearly defined responsibility. Together, they form a structure that separates concerns and promotes maintainability.

<p align="center">
  <img src="/images/articles/mvc-pattern/MVC-diagram.png" alt="MVC Model"/>
</p>

<details>
<summary>Why some diagrams show View → Model</summary>
Some MVC diagrams illustrate a direct interaction between the View and the Model. This originates from the original interpretation of MVC in early UI frameworks, rather than modern web applications.

In that context:

- The View can directly read data from the Model.
- The Model notifies the View when its state changes.

This results in the following interaction pattern:

- Controller → Model (updates state)
- View → Model (reads data)
- Model → View (notifies changes)

In modern web applications, this direct relationship is often reduced or removed, with the Controller acting as the primary intermediary between the View and the Model.

</details>

## Controller

The Controller acts as the intermediary between the View and the Model. It is responsible for handling incoming requests, coordinating application flow, and delegating work to the appropriate components.

The Controller does not contain business logic itself; instead, it instructs the Model on what actions to perform and determines which View should be returned.

**Responsibilities:**

- Receiving and interpreting user input.
- Delegating actions to the Model.
- Selecting and returning the appropriate View.

**Example:**
In a bookstore application, the Controller handles actions such as searching for a book, adding a book to the cart, or initiating the checkout process.

## View

The View is responsible for the presentation layer of the application. It defines how data is displayed to the user and manages the user interface.

The View does not contain business logic and does not directly interact with the Model. Instead, it receives data from the Controller and renders it accordingly.

**Responsibilities:**

- Rendering data in a specific format.
- Displaying user interface elements.
- Reflecting updates based on data provided by the Controller.

**Example:**
In a bookstore application, the View displays the list of books, detailed information about a selected book, and input fields for searching or filtering.

## Model

The Model represents the data and the business rules of the application. It is responsible for managing application state, enforcing domain logic, and interacting with the data source.

The Model operates independently of both the View and the Controller. It does not concern itself with how data is presented or how requests are handled.

**Responsibilities:**

- Managing data (CRUD operations).
- Enforcing business rules and domain logic.
- Interacting with the database or external data sources.

**Example:**
In a bookstore application, the Model manages data related to books, such as title, author, price, and stock levels, and ensures that business rules (e.g., stock availability) are respected.

# Flow of the MVC Framework

Rather than looking at MVC as three static components, it is more useful to understand it as a request–response pipeline. Each step in this pipeline hands over responsibility to the next, forming a chain of interactions.

To illustrate this, consider a simple scenario: a user wants to view the details of a specific task.

## 1. The request enters the system

Everything starts with an HTTP request.

A user navigates to:

```bash
GET /tasks/42
```

At this point, the application has no context—just a URL and an incoming request that needs to be interpreted.

## 2. The Controller defines the intent

The routing layer maps the request to a Controller action. This is where the intent of the request is first made explicit.

```cs
public class TaskController : Controller
{
    private readonly TaskRepository _repository = new TaskRepository();

    public IActionResult Details(int id)
    {
        var task = _repository.FindById(id);

        if (task == null)
        {
            return NotFound();
        }

        return View(task);
    }
}
```

At this point, the Controller:

- Interprets the request (/tasks/42 → “get task with id 42”)
- Coordinates the next steps
- Decides how the application should respond

This is where application flow begins to take shape, not just data retrieval.

## 3. The Model provides meaning to data

The Controller delegates to the Model to retrieve the required data.

```cs
public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; }
    public bool IsCompleted { get; set; }

    public string StatusLabel()
    {
        return IsCompleted ? "Completed" : "Pending";
    }
}

public class TaskRepository
{
    private static readonly List<TaskItem> _tasks = new()
    {
        new TaskItem { Id = 42, Title = "Prepare presentation", IsCompleted = false }
    };

    public TaskItem? FindById(int id)
    {
        return _tasks.FirstOrDefault(t => t.Id == id);
    }
}
```

Here, the Model:

- Encapsulates the structure of the data
- Provides domain-related behavior (e.g., StatusLabel)
- Retrieves data from a data source

However, even in this small example, a question starts to emerge:
_Where should more complex business rules live?_

## 4. The Controller composes the response

Once the data is available, the Controller prepares the response:

```cs
return View(task);
```

This step may appear trivial, but it is where the Controller:

- Decides what data is exposed
- Shapes the response
- Couples the request to a specific View

As complexity grows, this “composition” responsibility tends to expand.

## 5. The View renders the result

The View transforms the data into something the user can see:

```html
@model YourApp.Models.TaskItem

<h1>@Model.Title</h1>
<span>@Model.StatusLabel()</span>
```

The View is intentionally limited in scope:

- It focuses on presentation only
- It does not fetch or manipulate data
- It depends entirely on what it receives

## 6. The cycle repeats

Once rendered, the response is sent back to the browser. Any further interaction—clicking a button, submitting a form—starts the same cycle again.

## A structural observation

Seen as a pipeline, MVC appears clean and predictable. Each component has a role, and the flow is easy to follow.

At the same time, this flow exposes an important characteristic:

- The Controller orchestrates both request handling and application decisions
- The Model often combines data access and domain logic

In simple applications, this works well. In more complex systems, this distribution of responsibilities can become less natural, as certain types of logic do not clearly belong to either layer.

# The Missing Layer in MVC

MVC provides a clean separation of responsibilities—but only at first glance. In real-world applications, most of the “intelligence” of a system doesn’t fit neatly into Model, View, or Controller.

Imagine a moderately complex system. Somewhere, you need to handle:

- Validation rules
- Domain invariants
- Complex business processes
- Domain events
- Multi-step use cases
- Advanced queries and calculations

Trying to stuff all of that into a “thin” Model or scatter it across Controllers quickly becomes brittle, hard to maintain, and unclear in responsibility.

This "gap", the space between a simple Model and the Controller, is the missing layer. It isn’t a flaw in MVC; it’s a reflection of the pattern’s original intent. MVC never dictated how to organize domain logic.

Think of this layer as the brain of your application. It’s where the rules, behaviors, and constraints that actually define your software live. It can’t be auto-generated, copied, or outsourced. It’s the code that gives the system meaning.

Forcing this logic into Controllers or a simple data structure is like trying to fit an entire library into a shoebox: it might work temporarily, but eventually it bursts at the seams.

A well-designed missing layer allows you to:

- Capture business rules in a clear, maintainable way
- Keep Controllers focused on orchestration rather than decision-making
- Build Models that are behavior-rich, not mere data holders
- Make complex processes and use cases explicit, testable, and robust

In short, this “hidden core” is the **heart of your software**. Recognizing it is the first step toward an architecture that can scale gracefully as your application grows.

> In modern architecture, this layer often becomes what architects call a **domain layer** or **domain model**, an explicit structure for business logic, rules, and domain-specific behaviors. It’s what gives life to MVC, turning it from a simple scaffold into a system that can evolve and endure.

# Conclusion

MVC remains a reliable framework for structuring applications, providing clear separation between user interface, input handling, and data. It improves maintainability, supports collaboration, and helps developers reason about application flow.

Yet, as applications grow in complexity, the limitations of a naive MVC implementation become apparent. Thin Models and Controllers overloaded with logic lead to scattered responsibilities and code that is difficult to maintain or extend.

Recognizing the missing layer—the rich domain layer—is essential. This layer centralizes business rules, domain behaviors, and complex processes, allowing Controllers and Views to focus on orchestration and presentation.

Investing in a well-designed domain layer ensures that your Models are expressive and behavior-rich, business rules remain consistent and testable, and the application scales gracefully as requirements evolve.

MVC is more than a pattern; it is a scaffold. The domain layer is the engine that drives it, giving structure, meaning, and resilience to your software. Understanding both is key to building applications that can grow, evolve, and stand the test of time.
