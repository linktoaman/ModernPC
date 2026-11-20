# Product Catalogue Import Template

| Control | Value |
|---|---|
| Template name | Product Catalogue Import |
| Template version | `v1.0` |
| Required file name pattern | `product-catalogue-import-v1.0-YYYYMMDD.xlsx` |
| Required workbook header | Cell `A1` on the first worksheet must read `Product Catalogue Import Template v1.0`. |
| Direction | ERP/accounting system to SaaS platform |
| System of record | External ERP/accounting system |
| SaaS role | Operational storefront copy for catalogue display, search/filter/sort, cart, checkout, and admin review |
| Owner | Operations Representative |

## Sensitive Data Prohibition

This template must never contain raw payment card numbers, CVV/CVC values, magnetic stripe data, PINs, payment-provider secrets, API keys, gateway credentials, or other sensitive payment credentials. Payment references, if ever needed for reconciliation, belong in approved order/payment records only and must be tokenized or provider-issued non-sensitive references.

## Required Columns

| Column | Required | Type / Format | Validation |
|---|---:|---|---|
| `template_version` | Yes | Text, fixed value `v1.0` | Every row must match the workbook header version. |
| `erp_product_id` | Yes | Text | Must be unique in the file and match the ERP/accounting product identifier. |
| `sku` | Yes | Text | Must be unique in the file and stable across imports. |
| `vendor` | Yes | Text | Must be `Dell` for launch catalogue scope. |
| `category` | Yes | Controlled text | Allowed launch categories: `Gaming PC`, `Gaming Laptop`, `Gaming Accessory`. |
| `product_name` | Yes | Text | Customer-facing name; must not be blank. |
| `short_description` | Yes | Text | Plain-language listing description. |
| `specifications` | Yes | Text or structured text | Include relevant CPU, GPU, memory, storage, display, accessory compatibility, or other product-specific specifications. |
| `image_reference_primary` | Yes | URL or approved asset reference | Must point to an approved product image already uploaded or staged for upload. |
| `image_reference_gallery` | No | Semicolon-separated URLs or asset references | Use approved image references only. |
| `price_usd` | Yes | Decimal, USD | Must be greater than or equal to `0.00`; use two decimal places. |
| `compare_at_price_usd` | No | Decimal, USD | If present, must be greater than or equal to `price_usd`. |
| `taxable` | Yes | Boolean `TRUE`/`FALSE` | Must reflect approved tax configuration. |
| `active_status` | Yes | Controlled text | Allowed values: `Active`, `Draft`, `Deactivated`. |
| `stock_status` | Yes | Controlled text | Allowed values: `In Stock`, `Low Stock`, `Out of Stock`, `Preorder`, `Backorder`. |
| `stock_quantity` | Yes | Integer | Must be `0` or greater; `Out of Stock` rows must use `0`. |
| `delivery_estimate` | Yes | Text | Customer-safe estimate, for example `3-5 business days`; no internal notes. |
| `seo_title` | No | Text | Customer-safe metadata. |
| `seo_description` | No | Text | Customer-safe metadata. |
| `last_updated_at` | Yes | ISO 8601 datetime | Timestamp from ERP/accounting export or approved operations update. |
| `change_reason` | Yes | Text | Operational reason for the row update. |

## Row-Level Validation Review

Before production import, the Operations Representative must review the SaaS import preview or validation report at row level and confirm:

- Required columns are present and match the `v1.0` template.
- Product identifiers and SKUs are unique.
- Category, status, stock, and boolean fields use only allowed values.
- Prices, stock quantities, image references, and customer-facing text are valid.
- No raw card data, CVV/CVC values, secrets, API keys, or sensitive payment credentials are present.

## Production Import Controls

Production imports are allowed only after sandbox/staging import evidence is captured according to `ops/import-templates/import-runbook.md`. The final import record must capture admin identity, MFA-protected account used, file name, timestamp, template version, import result, rejected row count, audit log reference, and reconciliation sample notes.
