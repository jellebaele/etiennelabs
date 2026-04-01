---
title: Builder - Creational
position: 3
---

# Problem

Imagine a complex object that requires laborious, step-by-step initialization of many fields and nested objects. Such initialization code is usually buried inside a monstrous constructor with lots of parameters. Or even worse: scattered all over the client code.

In most cases most of the parameters will be unused, making the constructor calls pretty ugly.

# Solution

The Builder pattern suggests that you extract the object construction code out of its own class and move it to separate objects called builders. The Builder pattern suggests that you extract the object construction code out of its own class and move it to separate objects called builders.

# Example

Imagine a `HTTPRequest` class with all of these optional parameters:

## Bad implementation

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

## The fix

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

# Cons

- You end up writing more code
