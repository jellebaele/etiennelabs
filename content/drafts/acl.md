## Anti-Corruption Layer (ACL)

### Definition

The Anti-Corruption Layer (ACL) is essentially a specialized integration pattern—a translator or bridge—that isolates your clean domain from the “corrupting” influences of external systems. Imagine it as a skilled diplomat translating between two very different cultures, ensuring neither side misinterprets or negatively impacts the other.

The ACL achieves this by creating a dedicated layer responsible for translation and communication, significantly reducing direct coupling between your domain and external systems. The key advantage is maintaining your domain’s purity and integrity, preventing external complexities from polluting your core logic.

The Anti-Corruption layer consists of three parts:

- Adapter: It adapts one interface to another
- Facade: An interface between callers and targets
- Translator: It converts one data structure to another.

[Mastering the Anti-Corruption Layer (ACL) Pattern in .NET | A Guide for Software Architects](https://developersvoice.com/blog/cloud-design-patterns/anti-corruption-layer/)

### ACL in DDD

ACL in a DDD-context is a pattern used to protect your Bounded Context's domain integrity from "leaky" or "messy" influences from external systems or other modules. Think of it as a translator or a mediator that sits at the boundary of your module.

If multiple modules need an ACL tonthe same module, ACL should still never be shared. In strict DDD, you should avoid sharing an ACL. Instead, each module should have its own ACL (or its own Service implementation), even if they look similar.

Here is why and how you should handle it.

1. The "Different Needs" Principle: Even if two modules talk to the same "Upstream" (Inventory), they usually want different things from it:
   1. Catalog Module ACL: Needs to know roughly if an item is in stock to show "In Stock" or "Out of Stock" labels on the website. It doesn't care about exact numbers.
   2. Orders Module ACL: Needs to know the exact quantity and must be able to reserve it. It cares about transactional integrity.

   If you share one ACL, you end up with a "Fat Service" that has 50 methods, most of which aren't used by half the callers.

2. Duplication vs. Coupling: In DDD, a little duplication is better than a lot of coupling.It is perfectly okay to have:
   1. Shop.Modules.Orders.Infrastructure.InventoryService
   2. Shop.Modules.Catalog.Infrastructure.InventoryService

   They might both call the same InventoryRepository, but they map the data to their own internal needs.

When should you "Centralize" it? If you find that 5 different modules are doing the exact same complex translation of Inventory data, you have two cleaner options than sharing an ACL:

- Option A - The "Refined Contract" (Upstream Improvement): If everyone is asking the same question, the Inventory Module itself should provide a better "Public API" (Contract). Instead of Inventory giving you raw data that needs an ACL to clean up, the Inventory team should provide a clean Integration Service or DTO that is easy for everyone to use.
- Option B - The "Shared Kernel" (Use with Caution): You can create a Shared.Infrastructure project containing a base client for the Inventory module. However, each module still wraps that base client in its own Module-Specific Service.

Instead of using a shared ACL, you can also throw integration events.

### Benefits of using an ACL

- Decoupling: If the e.g. Inventory module team changes their data structure, you only change the ACL. Your core business logic remains untouched.
- Cleaner Domain: Your domain code stays focused on its own business rules, not the technical quirks of other modules.
- Preparation for Microservices: If you ever move a module to its own server, the ACL is where you put the HTTP/gRPC call. The rest of your application won't even know the module moved.

### Code examples

```csharp
// Domain model
public record CustomerDomainModel(Guid Id, string Name, string Email, DateTimeOffset CreatedAt);

// Legacy entity
public class LegacyCustomerEntity
{
    public string CustomerId { get; set; }
    public string FullName { get; set; }
    public string ContactEmail { get; set; }
    public string CreatedDate { get; set; }
}

// AutoMapper profile
public class CustomerMappingProfile : Profile
{
    public CustomerMappingProfile()
    {
        CreateMap<LegacyCustomerEntity, CustomerDomainModel>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.CustomerId)))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.ContactEmail))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.Parse(src.CreatedDate)));
    }
}
```

```csharp
public class LegacyProductUpdatedEvent
{
    public string ProductCode { get; set; }
    public string UpdatedName { get; set; }
}

public class ProductCatalogUpdatedEvent
{
    public string SKU { get; init; }
    public string Name { get; init; }
}

// MassTransit Consumer
public class LegacyProductUpdatedConsumer : IConsumer<LegacyProductUpdatedEvent>
{
    private readonly IPublishEndpoint _publisher;

    public LegacyProductUpdatedConsumer(IPublishEndpoint publisher)
    {
        _publisher = publisher;
    }

    public async Task Consume(ConsumeContext<LegacyProductUpdatedEvent> context)
    {
        var legacyEvent = context.Message;

        var domainEvent = new ProductCatalogUpdatedEvent
        {
            SKU = legacyEvent.ProductCode,
            Name = legacyEvent.UpdatedName
        };

        await _publisher.Publish(domainEvent);
    }
}
```

```csharp
public interface ILegacyOrderService
{
    Task<OrderDetails> GetOrderAsync(Guid orderId);
}

public class LegacyOrderServiceFacade : ILegacyOrderService
{
    private readonly SoapOrderClient _soapClient;

    public LegacyOrderServiceFacade(SoapOrderClient soapClient)
    {
        _soapClient = soapClient;
    }

    public async Task<OrderDetails> GetOrderAsync(Guid orderId)
    {
        var legacyOrder = await _soapClient.FetchOrderAsync(orderId.ToString());

        return new OrderDetails(
            OrderId: Guid.Parse(legacyOrder.OrderId),
            TotalAmount: decimal.Parse(legacyOrder.Total),
            OrderedAt: DateTimeOffset.Parse(legacyOrder.Date));
    }
}
```
