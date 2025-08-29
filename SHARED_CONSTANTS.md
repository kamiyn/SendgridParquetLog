# SendGrid WebHook Field Constants

This document describes the shared constants project that provides unified field names for SendGrid WebHook events across the solution.

## Overview

The `SendgridParquet.Shared` project defines constants for SendGrid WebHook field names, ensuring consistency between:
- JSON deserialization (JsonPropertyName attributes)
- Parquet column definitions (DataField names) 
- SQL column names for DuckDB queries

## Project Structure

### SendgridParquet.Shared
- **Target Framework**: netstandard2.0 (for cross-project compatibility)
- **Language Version**: C# 10.0 (enables file-scoped namespaces)
- **Nullable**: enabled

### SendGridWebHookFields Class

Contains constants for all SendGrid WebHook field names based on [official documentation](https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/event):

```csharp
public static class SendGridWebHookFields
{
    // Core event fields
    public const string Email = "email";
    public const string Timestamp = "timestamp";
    public const string Event = "event";
    public const string Category = "category";
    
    // SendGrid identifiers
    public const string SgEventId = "sg_event_id";
    public const string SgMessageId = "sg_message_id";
    public const string SmtpId = "smtp-id";
    
    // Event details
    public const string UserAgent = "useragent";
    public const string Ip = "ip";
    public const string Url = "url";
    public const string Reason = "reason";
    public const string Status = "status";
    public const string Response = "response";
    public const string Tls = "tls";
    public const string Attempt = "attempt";
    public const string Type = "type";
    public const string BounceClassification = "bounce_classification";
    public const string AsmGroupId = "asm_group_id";
    public const string UniqueArgs = "unique_args";
    
    // Marketing campaign
    public const string MarketingCampaignId = "marketing_campaign_id";
    public const string MarketingCampaignName = "marketing_campaign_name";
    
    // Pool information
    public const string Pool = "pool";
    public const string SendAt = "send_at";
    
    // Parquet-specific column names (differ from WebHook field names)
    public const string SmtpIdParquetColumn = "smtp_id";
    public const string PoolNameParquetColumn = "pool_name";
    public const string PoolIdParquetColumn = "pool_id";
    
    // Pool nested fields
    public static class PoolFields
    {
        public const string Name = "name";
        public const string Id = "id";
    }
}
```

## Usage Across Projects

### SendgridParquetLogger
- **Models/SendGridEvent.cs**: Uses constants in JsonPropertyName attributes
- **Services/ParquetService.cs**: Uses constants in DataField definitions

Example:
```csharp
[JsonPropertyName(SendGridWebHookFields.Email)]
public string? Email { get; set; }

new DataField(SendGridWebHookFields.Email, typeof(string))
```

### SendgridParquetViewer
- **Models/SendGridEvent.cs**: Uses constants in SQL SELECT column definitions with nameof() for type safety

Example:
```csharp
public static readonly string SelectColumns = $@"
    {SendGridWebHookFields.Email} AS {nameof(Email)},
    {SendGridWebHookFields.Timestamp} AS {nameof(Timestamp)},
    // ...
";
```

## Benefits

1. **Consistency**: Single source of truth for field names
2. **Maintainability**: Changes to field names only need to be made in one place
3. **Type Safety**: Compile-time checking prevents typos
4. **Documentation**: Clear mapping between WebHook fields and internal representations
5. **Cross-Platform**: netstandard2.0 ensures compatibility across .NET implementations

## Field Name Mappings

Some fields have different names in different contexts:

| WebHook Field | JSON Property | Parquet Column | Reason |
|---------------|---------------|----------------|---------|
| `smtp-id` | `smtp-id` | `smtp_id` | Hyphen not allowed in Parquet column names |
| `pool.name` | `name` | `pool_name` | Flattened structure in Parquet |
| `pool.id` | `id` | `pool_id` | Flattened structure in Parquet |

The constants class provides separate values for these cases to maintain clarity and correctness.