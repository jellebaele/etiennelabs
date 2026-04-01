---
title: 'Adapter - Structural'
position: 6
---

Adapter is a structural design pattern that allows objects with incompatible interfaces to collaborate.

# Problem

Imagine that you’re creating a stock market monitoring app. The app downloads the stock data from multiple sources in XML format and then displays nice-looking charts and diagrams for the user.

At some point, you decide to improve the app by integrating a smart 3rd-party analytics library. But there’s a catch: the analytics library only works with data in JSON format.

You could change the library to work with XML. However, this might break some existing code that relies on the library. And worse, you might not have access to the library’s source code in the first place, making this approach impossible.

# Solution

You can create an adapter. This is a special object that converts the interface of one object so that another object can understand it.

An adapter wraps one of the objects to hide the complexity of conversion happening behind the scenes. The wrapped object isn’t even aware of the adapter. For example, you can wrap an object that operates in meters and kilometers with an adapter that converts all of the data to imperial units such as feet and miles.

Adapters can not only convert data into various formats but can also help objects with different interfaces collaborate. Here’s how it works:

1. The adapter gets an interface, compatible with one of the existing objects.
2. Using this interface, the existing object can safely call the adapter’s methods.
3. Upon receiving a call, the adapter passes the request to the second object, but in a format and order that the second object expects.

Sometimes it’s even possible to create a two-way adapter that can convert the calls in both directions.

# Example

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

## Bad implementation

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

## The fix

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

# Cons

- Code complexity might increase as another layer of abstractions is introduced
