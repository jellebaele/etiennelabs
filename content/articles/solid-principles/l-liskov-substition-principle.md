---
title: 'L - Liskov Substition Principle'
position: 3
---

# Defintion

The Liskov Substitution Principle (LSP) states that subtypes must be replaceable for their base types without breaking behavior.

**Meaning:** if a class inherits from another, it should not break the expected behavior.

# Example

Suppose we have a storage abstraction.

```cs
public interface IFileStorage
{
    void Save(string fileName, byte[] content);
    byte[] Read(string fileName);
    void Delete(string fileName);
}
```

Now we create a local storage implementation:

```cs
public class LocalFileStorage : IFileStorage
{
    public void Save(string fileName, byte[] content)
    {
        File.WriteAllBytes(fileName, content);
    }

    public byte[] Read(string fileName)
    {
        return File.ReadAllBytes(fileName);
    }

    public void Delete(string fileName)
    {
        File.Delete(fileName);
    }
}
```

Now someone adds read-only cloud storage:

```cs
public class ReadOnlyCloudStorage : IFileStorage
{
    public void Save(string fileName, byte[] content)
    {
        throw new NotSupportedException();
    }

    public byte[] Read(string fileName)
    {
        // download from cloud
        return new byte[] { };
    }

    public void Delete(string fileName)
    {
        throw new NotSupportedException();
    }
}
```

Now imagine business logic:

```cs
public void ReplaceFile(IFileStorage storage)
{
    storage.Delete("data.txt");
    storage.Save("data.txt", new byte[] { 1, 2, 3 });
}

ReplaceFile(new ReadOnlyCloudStorage());
```

Even though ReadOnlyCloudStorage implements IFileStorage, it cannot actually behave like one.

**This breaks Liskov Substitution Principle:** the interface promised Save/Delete, but the implementation cannot fulfill that contract.

Correct design:

```cs
public interface IFileReader
{
    byte[] Read(string fileName);
}

public interface IFileWriter
{
    void Save(string fileName, byte[] content);
    void Delete(string fileName);
}
```

Now implementations become correct:

```cs
public class LocalFileStorage : IFileReader, IFileWriter
{
    public byte[] Read(string fileName)
    {
        return File.ReadAllBytes(fileName);
    }

    public void Save(string fileName, byte[] content)
    {
        File.WriteAllBytes(fileName, content);
    }

    public void Delete(string fileName)
    {
        File.Delete(fileName);
    }
}

public class ReadOnlyCloudStorage : IFileReader
{
    public byte[] Read(string fileName)
    {
        return new byte[] { };
    }
}

public void ReplaceFile(IFileWriter storage)
{
    storage.Delete("data.txt");
    storage.Save("data.txt", new byte[] { 1, 2, 3 });
}
```
