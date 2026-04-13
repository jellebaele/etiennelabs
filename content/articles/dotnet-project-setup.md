---
title: 'Dotnet setup: A Checlist'
date: '2026-04-13'
tags: ['.Net']
excerpt: 'A professional guide to establishing a scalable .NET 10 foundation using centralized configurations and observability.'
---

A well-architected .NET solution begins with a foundation that prioritizes consistency, maintainability, and observability. While default templates offer a starting point, enterprise-grade development requires a more deliberate configuration. This guide outlines a comprehensive checklist for initializing a modern .NET 10 project using industry best practices.

# 1. Solution Initialization and Port Standardization

Effective local development starts with an Empty Solution to maintain full control over the folder structure. Upon adding an ASP.NET Core API project, the first step is to standardize communication ports within the `launchSettings.json` file. Utilizing fixed ports—such as 5000 (HTTP) and 5001 (HTTPS)—simplifies cross-service communication and Docker networking configurations.

# 2. Global Configuration

To eliminate redundancy and enforce a unified build strategy, implement a `Directory.Build.props` file at the solution root. This file centralizes compiler settings and ensures that every project within the solution adheres to the same quality standards.

```xml
<Project>
  <PropertyGroup>
      <TargetFramework>net10.0</TargetFramework>
      <ImplicitUsings>enable</ImplicitUsings>
      <Nullable>enable</Nullable>
      <AnalysisLevel>latest</AnalysisLevel>
      <AnalysisMode>All</AnalysisMode>
      <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
      <CodeAnalysisTreatWarningsAsErrors>true</CodeAnalysisTreatWarningsAsErrors>
      <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
  </PropertyGroup>
</Project>
```

<details>
<summary>Pro-Tip: Managing Solution Items</summary>

The following steps outline a generic approach to adding non-project files (such as `.props`, `.editorconfig`, or `.json` configurations) to a .NET solution so they remain visible and editable within the IDE:

1. **Create the Physical File:** Navigate to the solution's root directory using the file system or the terminal and create the new file (e.g., `Directory.Build.props`).
2. **Create a Solution Folder:** Within the IDE’s Solution Explorer, right-click the Solution node, select Add > New Solution Folder, and name it `Solution Items`. (Note: This is a virtual folder that does not exist on the disk).
3. **Link the File to the Solution:** Right-click the newly created Solution Items folder, select Add > Existing Item, and select the file created in step 1.
</details>

This approach enables solution-wide updates, such as migrating Target Framework Versions, through a single file modification.

# 3. Central Package Management (CPM)

Managing NuGet dependencies individually across projects often leads to version drift. Utilizing `Directory.Packages.props` enables Central Package Management, ensuring that every project in the solution utilizes the same library versions. Place this file in the `Solution Items` folder:

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <ItemGroup>
    <PackageVersion Include="Microsoft.AspNetCore.OpenApi" Version="10.0.5" />
    <PackageVersion Include="SonarAnalyzer.CSharp" Version="10.23.0.137933" />
  </ItemGroup>
</Project>
```

</br>

# 4. Integrating Static Code Analysis

To maintain high code quality, SonarAnalyzer can be injected globally. By updating the `Directory.Build.props` file, the analyzer is applied to all C# projects while automatically excluding infrastructure-specific projects like Docker Compose:

```xml
<Project>
    <PropertyGroup>
        <TargetFramework>net10.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
        <AnalysisLevel>latest</AnalysisLevel>
        <AnalysisMode>All</AnalysisMode>
        <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
        <CodeAnalysisTreatWarningsAsErrors>true</CodeAnalysisTreatWarningsAsErrors>
        <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    </PropertyGroup>

    <!-- Add these lines: -->
    <ItemGroup Condition="'$(MSBuildProjectExtension)' != '.dcproj'">
        <PackageReference Include="SonarAnalyzer.CSharp">
            <PrivateAssets>all</PrivateAssets>
            <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
        </PackageReference>
    </ItemGroup>
</Project>

```

</br>

# 5. Code Style Enforcement

Strict build rules occasionally require fine-tuning to balance productivity and code quality. A `.editorconfig` file should be added to the solution to define naming conventions, formatting rules, and diagnostic severities. This ensures a consistent developer experience across different IDEs and prevents unnecessary build failures due to minor stylistic preferences. In order to achieve this, you can add an `.editorconfig` file to the `Solution Items` folder.

<details>
<summary>.editorconfig</summary>

```cs
root = true

# C# files
[*.cs]

#### Core EditorConfig Options ####

# Indentation and spacing
indent_size = 4
indent_style = space
tab_width = 4

# New line preferences
end_of_line = crlf
insert_final_newline = true

#### .NET Coding Conventions ####

# Organize usings
dotnet_separate_import_directive_groups = false
dotnet_sort_system_directives_first = true

# this. and Me. preferences
dotnet_style_qualification_for_event = false:error
dotnet_style_qualification_for_field = false:error
dotnet_style_qualification_for_method = false:error
dotnet_style_qualification_for_property = false:error

# Language keywords vs BCL types preferences
dotnet_style_predefined_type_for_locals_parameters_members = true:error
dotnet_style_predefined_type_for_member_access = true:error

# Parentheses preferences
dotnet_style_parentheses_in_arithmetic_binary_operators = never_if_unnecessary:error
dotnet_style_parentheses_in_other_binary_operators = never_if_unnecessary:error
dotnet_style_parentheses_in_other_operators = never_if_unnecessary:error
dotnet_style_parentheses_in_relational_binary_operators = never_if_unnecessary:error

# Modifier preferences
dotnet_style_require_accessibility_modifiers = for_non_interface_members:error

# Expression-level preferences
dotnet_style_coalesce_expression = true:none
dotnet_style_collection_initializer = true:error
dotnet_style_explicit_tuple_names = true:error
dotnet_style_null_propagation = true:error
dotnet_style_object_initializer = true:error
dotnet_style_prefer_auto_properties = true:warning
dotnet_style_prefer_compound_assignment = true:error
dotnet_style_prefer_conditional_expression_over_assignment = true:error
dotnet_style_prefer_conditional_expression_over_return = true:none
dotnet_style_prefer_inferred_anonymous_type_member_names = true:error
dotnet_style_prefer_inferred_tuple_names = true:error
dotnet_style_prefer_is_null_check_over_reference_equality_method = true:error
csharp_indent_labels = one_less_than_current
csharp_using_directive_placement = outside_namespace:error
csharp_prefer_simple_using_statement = true:error
csharp_prefer_braces = true:error
csharp_style_namespace_declarations = file_scoped:error
csharp_style_prefer_method_group_conversion = true:silent
csharp_style_prefer_top_level_statements = true:silent
csharp_style_prefer_primary_constructors = true:none
csharp_style_expression_bodied_methods = false:silent
csharp_style_expression_bodied_constructors = false:silent
csharp_style_expression_bodied_operators = true:error
csharp_style_expression_bodied_properties = true:error
csharp_style_expression_bodied_indexers = true:error
csharp_style_expression_bodied_accessors = true:error
csharp_style_expression_bodied_lambdas = true:none
csharp_style_expression_bodied_local_functions = true:error

[*.{cs,vb}]
dotnet_style_prefer_simplified_boolean_expressions = true:suggestion
dotnet_style_prefer_simplified_interpolation = true:suggestion
dotnet_style_namespace_match_folder = true:suggestion

# Field preferences
dotnet_style_readonly_field = true:error

# Parameter preferences
dotnet_code_quality_unused_parameters = all:error

#### C# Coding Conventions ####

# Namespace preferences
csharp_style_namespace_declarations= file_scoped:error

# var preferences
csharp_style_var_elsewhere = false:error
csharp_style_var_for_built_in_types = false:error
csharp_style_var_when_type_is_apparent = true:error

# Expression-bodied members
csharp_style_expression_bodied_accessors = true:error
csharp_style_expression_bodied_constructors = false:silent
csharp_style_expression_bodied_indexers = true:error
csharp_style_expression_bodied_lambdas = true:none
csharp_style_expression_bodied_local_functions = true:error
csharp_style_expression_bodied_methods = false:silent
csharp_style_expression_bodied_operators = true:error
csharp_style_expression_bodied_properties = true:error

# Pattern matching preferences
csharp_style_pattern_matching_over_as_with_null_check = true:error
csharp_style_pattern_matching_over_is_with_cast_check = true:error
csharp_style_prefer_switch_expression = true:error

# Null-checking preferences
csharp_style_conditional_delegate_call = true:error

# Modifier preferences
csharp_prefer_static_local_function = true:error
csharp_preferred_modifier_order = public,private,protected,internal,static,extern,new,virtual,abstract,sealed,override,readonly,unsafe,volatile,async

# Code-block preferences
csharp_prefer_braces = true:error
csharp_prefer_simple_using_statement = true:error

# Expression-level preferences
csharp_prefer_simple_default_expression = true:error
csharp_style_deconstructed_variable_declaration = true:suggestion
csharp_style_inlined_variable_declaration = true:error
csharp_style_pattern_local_over_anonymous_function = true:error
csharp_style_prefer_index_operator = true:suggestion
csharp_style_prefer_range_operator = true:suggestion
csharp_style_throw_expression = true:suggestion
csharp_style_unused_value_assignment_preference = discard_variable:silent
csharp_style_unused_value_expression_statement_preference = discard_variable:none
csharp_style_prefer_method_group_conversion = true:silent
csharp_style_prefer_top_level_statements = true:silent

# 'using' directive preferences
csharp_using_directive_placement = outside_namespace:error

#### C# Formatting Rules ####

# New line preferences
csharp_new_line_before_catch =true
csharp_new_line_before_else =true
csharp_new_line_before_finally =true
csharp_new_line_before_members_in_anonymous_types = false,
csharp_new_line_before_members_in_object_initializers = false,
csharp_new_line_before_open_brace = all
csharp_new_line_between_query_expression_clauses = true

# Indentation preferences
csharp_indent_block_contents = true
csharp_indent_braces = false
csharp_indent_case_contents = true
csharp_indent_case_contents_when_block = true
csharp_indent_labels = one_less_than_current
csharp_indent_switch_labels = true

# Space preferences
csharp_space_after_cast = false
csharp_space_after_colon_in_inheritance_clause = true
csharp_space_after_comma = true
csharp_space_after_dot = false
csharp_space_after_keywords_in_control_flow_statements = true
csharp_space_after_semicolon_in_for_statement = true
csharp_space_around_binary_operators = before_and_after
csharp_space_around_declaration_statements = false
csharp_space_before_colon_in_inheritance_clause = true
csharp_space_before_comma = false
csharp_space_before_dot = false
csharp_space_before_open_square_brackets = false
csharp_space_before_semicolon_in_for_statement = false
csharp_space_between_empty_square_brackets = false
csharp_space_between_method_call_empty_parameter_list_parentheses = false
csharp_space_between_method_call_name_and_opening_parenthesis = false
csharp_space_between_method_call_parameter_list_parentheses = false
csharp_space_between_method_declaration_empty_parameter_list_parentheses = false
csharp_space_between_method_declaration_name_and_open_parenthesis = false
csharp_space_between_method_declaration_parameter_list_parentheses = false
csharp_space_between_parentheses = false
csharp_space_between_square_brackets = false

# Wrapping preferences
csharp_preserve_single_line_blocks = true
csharp_preserve_single_line_statements = false

#### Naming styles ####

# Naming rules

dotnet_naming_rule.interface_should_be_begins_with_i.severity = suggestion
dotnet_naming_rule.interface_should_be_begins_with_i.symbols = interface
dotnet_naming_rule.interface_should_be_begins_with_i.style = begins_with_i

dotnet_naming_rule.types_should_be_pascal_case.severity = suggestion
dotnet_naming_rule.types_should_be_pascal_case.symbols = types
dotnet_naming_rule.types_should_be_pascal_case.style = pascal_case

dotnet_naming_rule.non_field_members_should_be_pascal_case.severity = suggestion
dotnet_naming_rule.non_field_members_should_be_pascal_case.symbols = non_field_members
dotnet_naming_rule.non_field_members_should_be_pascal_case.style = pascal_case

# Symbol specifications

dotnet_naming_symbols.interface.applicable_kinds = interface
dotnet_naming_symbols.interface.applicable_accessibilities = public, internal, private, protected, protected_internal, private_protected
dotnet_naming_symbols.interface.required_modifiers =

dotnet_naming_symbols.types.applicable_kinds = class, struct, interface, enum
dotnet_naming_symbols.types.applicable_accessibilities = public, internal, private, protected, protected_internal, private_protected
dotnet_naming_symbols.types.required_modifiers =

dotnet_naming_symbols.non_field_members.applicable_kinds = property, event, method
dotnet_naming_symbols.non_field_members.applicable_accessibilities = public, internal, private, protected, protected_internal, private_protected
dotnet_naming_symbols.non_field_members.required_modifiers =

# Naming styles

dotnet_naming_style.pascal_case.required_prefix =
dotnet_naming_style.pascal_case.required_suffix =
dotnet_naming_style.pascal_case.word_separator =
dotnet_naming_style.pascal_case.capitalization = pascal_case

dotnet_naming_style.begins_with_i.required_prefix = I
dotnet_naming_style.begins_with_i.required_suffix =
dotnet_naming_style.begins_with_i.word_separator =
dotnet_naming_style.begins_with_i.capitalization = pascal_case

# Custom Rules - configure these as required

# .NET Code Analyzers rules

# CA1000: Do not declare static members on generic types
dotnet_diagnostic.CA1000.severity = none

# CA1002: Do not expose generic lists
dotnet_diagnostic.CA1002.severity = none

# CA1008: Enums should have zero value
dotnet_diagnostic.CA1008.severity = none

# CA1019: Define accessors for attribute arguments
dotnet_diagnostic.CA1019.severity = none

# CA1024: Use properties where appropriate
dotnet_diagnostic.CA1024.severity = none

# CA1030: Use events where appropriate
dotnet_diagnostic.CA1030.severity = none

# CA1031: Do not catch general exception types
dotnet_diagnostic.CA1031.severity = none

# CA1032: Implement standard exception constructors
dotnet_diagnostic.CA1032.severity = none

# CA1034: Nested types should not be visible
dotnet_diagnostic.CA1034.severity = none

# CA1040: Avoid empty interfaces
dotnet_diagnostic.CA1040.severity = none

# CA1051: Do not declare visible instance fields
dotnet_diagnostic.CA1051.severity = none

# CA1054: URI-like parameters should not be strings
dotnet_diagnostic.CA1054.severity = none

# CA1056: URI-like properties should not be strings
dotnet_diagnostic.CA1056.severity = none

# CA1062: Validate arguments of public methods
dotnet_diagnostic.CA1062.severity = none

# CA1063: Implement IDisposable Correctly
dotnet_diagnostic.CA1063.severity = none

# CA1304: Specify CultureInfo
dotnet_diagnostic.CA1304.severity = none

# CA1307: Specify StringComparison for clarity
dotnet_diagnostic.CA1307.severity = none

# CA1308: Normalize strings to uppercase
dotnet_diagnostic.CA1308.severity = none

# CA1309: Use ordinal string comparison
dotnet_diagnostic.CA1309.severity = none

# CA1311: Specify a culture or use an invariant version
dotnet_diagnostic.CA1311.severity = none

# CA1515: Consider making public types internal
dotnet_diagnostic.CA1515.severity = none

# CA1700: Do not name enum values 'Reserved'
dotnet_diagnostic.CA1700.severity = none

# CA1707: Identifiers should not contain underscores
dotnet_diagnostic.CA1707.severity = none

# CA1711: Identifiers should not have incorrect suffix
dotnet_diagnostic.CA1711.severity = none

# CA1716: Identifiers should not match keywords
dotnet_diagnostic.CA1716.severity = none

# CA1724: Type names should not match namespaces
dotnet_diagnostic.CA1724.severity = none

# CA1812: Avoid uninstantiated internal classes
dotnet_diagnostic.CA1812.severity = none

# CA1816: Dispose methods should call SuppressFinalize
dotnet_diagnostic.CA1816.severity = none

# CA1819: Properties should not return arrays
dotnet_diagnostic.CA1819.severity = none

# CA1822: Mark members as static
dotnet_diagnostic.CA1822.severity = none

# CA1848: Use the LoggerMessage delegates
dotnet_diagnostic.CA1848.severity = none

# CA1860: Avoid using 'Enumerable.Any()' extension method
dotnet_diagnostic.CA1860.severity = none

# CA2007: Consider calling ConfigureAwait on the awaited task
dotnet_diagnostic.CA2007.severity = none

# CA2201: Do not raise reserved exception types
dotnet_diagnostic.CA2201.severity = none

# CA2211: Non-constant fields should not be visible
dotnet_diagnostic.CA2211.severity = none

# CA2213: Disposable fields should be disposed
dotnet_diagnostic.CA2213.severity = none

# CA2225: Operator overloads have named alternates
dotnet_diagnostic.CA2225.severity = none

# CA2227: Collection properties should be read only
dotnet_diagnostic.CA2227.severity = none

# CA2234: Pass system uri objects instead of strings
dotnet_diagnostic.CA2234.severity = none

# CA2326: Do not use TypeNameHandling values other than None
dotnet_diagnostic.CA2326.severity = none

# CA2326: Do not use insecure JsonSerializerSettings
dotnet_diagnostic.CA2327.severity = none

# CA5394: Do not use insecure randomness
dotnet_diagnostic.CA5394.severity = none

# CA5401: Do not use CreateEncryptor with non-default IV
dotnet_diagnostic.CA5401.severity = none

# CS8600: Converting null literal or possible null value to non-nullable type.
dotnet_diagnostic.CS8600.severity = none

# CS8603: Possible null reference return.
dotnet_diagnostic.CS8603.severity = none

# CS8618: Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
dotnet_diagnostic.CS8618.severity = none

# IDE Code Analyzers rules

# IDE0005: Remove unnecessary using directives
dotnet_diagnostic.IDE0005.severity = none

# IDE0046: Convert to conditional expression
dotnet_diagnostic.IDE0046.severity = none

# IDE0053: Use expression body for lambda expression
dotnet_diagnostic.IDE0053.severity = none

# IDE0270: Use coalesce expression
dotnet_diagnostic.IDE0270.severity = none

# IDE0290: Use primary constructor
dotnet_diagnostic.IDE0290.severity = none

# SonarAnalyzer.CSharp rules

# S112: General or reserved exceptions should never be thrown
dotnet_diagnostic.S112.severity = none

# S125: Remove this commented out code
dotnet_diagnostic.S125.severity = none

# S1075: URIs should not be hardcoded
dotnet_diagnostic.S1075.severity = none

# S2094: Utility classes should not have public constructors
dotnet_diagnostic.S1118.severity = none

# S1144: Unused private types or members should be removed
dotnet_diagnostic.S1144.severity = none

# S2094: Classes should not be empty
dotnet_diagnostic.S2094.severity = none

# S2139: Exceptions should be either logged or rethrown but not both
dotnet_diagnostic.S2139.severity = none

# S2325: Methods and properties that don't access instance data should be static
dotnet_diagnostic.S2325.severity = none

# S2365: Properties should not make collection or array copies
dotnet_diagnostic.S2365.severity = none

# S3267: Loops should be simplified with "LINQ" expressions
dotnet_diagnostic.S3267.severity = none

# S3881: "IDisposable" should be implemented correctly
dotnet_diagnostic.S3881.severity = none

# S4136: Method overloads should be grouped together
dotnet_diagnostic.S4136.severity = none

# S6605: Collection-specific "Exists" method should be used instead of the "Any" extension
dotnet_diagnostic.S6605.severity = none

# S6781: JWT secret keys should not be disclosed
dotnet_diagnostic.S6781.severity = none
```

</details>

# 6. Modern API Configuration

In .NET 10, the `Program.cs` file should be streamlined for clarity. Leveraging asynchronous entry points and modern middleware registration results in a cleaner, more readable bootstrap process:

```cs
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

await app.RunAsync();
```

</br>

# 7. Containerization

Container support is essential for modern deployment pipelines.

- **Dockerfile:** Right-click the API project and select Add > Docker Support.
- **Docker Compose:** Right-click the project and select Add > Container Orchestrator Support to generate a docker-compose.yml for orchestrating the API and its dependencies.
  ```yml
  services:
    devhabit.api:
      image: devhabit.api
      build:
        context: .
        dockerfile: DevHabit.Api/Dockerfile
      ports:
        - '5000:8080'
        - '5001:8081'
  ```

</br>

# 8. Distributed Tracing and Metrics

Observability is a first-class citizen in modern cloud-native applications. Integrating OpenTelemetry allows for the seamless collection of traces, metrics, and logs. Register the instrumentation in `Program.cs`:

```cs
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(builder.Environment.ApplicationName))
    .WithTracing(tracing => tracing
        .AddHttpClientInstrumentation()
        .AddAspNetCoreInstrumentation())
    .WithMetrics(metrics => metrics
        .AddHttpClientInstrumentation()
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation())
    .UseOtlpExporter();

builder.Logging.AddOpenTelemetry(options =>
{
    options.IncludeFormattedMessage = true;
    options.IncludeScopes = true;
});
```

## Visualization with Aspire Dashboard

```yml
services:
  devhabit.api:
    image: devhabit.api
    build:
      context: .
      dockerfile: DevHabit.Api/Dockerfile
    ports:
      - '5000:8080'
      - '5001:8081'
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://devhabit.aspire-dashboard:18889
      - OTEL_EXPORTER_OTLP_PROTOCOL=grpc

  devhabit.aspire-dashboard:
    image: mcr.microsoft.com/dotnet/aspire-dashboard:13
    environment:
      DOTNET_DASHBOARD_UNSECURED_ALLOW_ANONYMOUS: true
    ports:
      - '18888:18888'
```

## Visualizatoin with Seq

```yml
services:
  devhabit.api:
    image: devhabit.api
    build:
      context: .
      dockerfile: DevHabit.Api/Dockerfile
    ports:
      - '5000:8080'
      - '5001:8081'
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://devhabit.seq:5341/ingest/otlp
      - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

  devhabit.seq:
    image: datalust/seq:latest
    environment:
      ACCEPT_EULA: 'Y'
    volumes:
      - ./.containers/seq_data:/data
    ports:
      - '8080:80'
      - '5341:5341'
```

</br>

# 9.Continuous Integration (CI)

A robust setup requires automated validation. A GitHub Actions workflow ensures that every push to the main branch is verified. Create `.github/workflows/build.yml` at the solution root:

```yml
name: Build

on:
workflow_dispatch:
push:
  branches:
    - main

env:
DOTNET_VERSION: '10.x'

jobs:
build:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}

    - name: Restore
      run: dotnet restore DevHabit.sln

    - name: Build
      run: dotnet build DevHabit.sln --configuration Release --no-restore

    - name: Test
      run: dotnet test DevHabit.sln --configuration Release --no-restore --no-build

    - name: Publish
      run: dotnet publish DevHabit.sln --configuration Release --no-restore --no-build
```

</br>

# Conclusion

By implementing central configuration files, strict static analysis, and integrated observability from the start, a .NET solution becomes significantly more resilient. This professional setup minimizes technical debt and ensures the project is prepared for the complexities of modern software delivery.
