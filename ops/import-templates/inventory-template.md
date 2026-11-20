# Inventory Import Template

| Control | Value |
|---|---|
| Template name | Inventory Import |
| Template version | `v1.0` |
| Required file name pattern | `inventory-import-v1.0-YYYYMMDD.xlsx` |
| Required workbook header | Cell `A1` on the first worksheet must read `Inventory Import Template v1.0`. |
| Direction | ERP/accounting system to SaaS platform |
| System of record | External ERP/accounting system |
| SaaS role | Operational stock copy for storefront availability and checkout blocking |
| Owner | Operations Representative |

## Sensitive Data Prohibition

This template must never contain raw payment card numbers, CVV/CVC values, magnetic stripe data, PINs, payment-provider secrets, API keys, gateway credentials, or other sensitive payment credentials. Inventory imports must contain product and stock data only.

## Required Columns

| Column | Required | Type / Format | Validation |
|---|---:|---|---|
| `template_version` | Yes | Text, fixed value `v1.0` | Every row must match the workbook header version. |
| `erp_product_id` | Yes | Text | Must match an existing ERP/accounting product identifier. |
| `sku` | Yes | Text | Must match an existing SaaS product SKU before import. |
| `inventory_location_id` | Yes | Text | Use approved ERP or SaaS stock location identifier. |
| `inventory_location_name` | Yes | Text | Human-readable stock location name. |
| `stock_status` | Yes | Controlled text | Allowed values: `In Stock`, `Low Stock`, `Out of Stock`, `Preorder`, `Backorder`. |
| `available_quantity` | Yes | Integer | Must be `0` or greater; storefront-checkout availability is based on this value. |
| `reserved_quantity` | Yes | Integer | Must be `0` or greater; must not exceed available plus on-order quantity unless approved by Operations. |
| `safety_stock_quantity` | No | Integer | Must be `0` or greater when present. |
| `backorder_allowed` | Yes | Boolean `TRUE`/`FALSE` | Must align with approved product selling policy. |
| `preorder_allowed` | Yes | Boolean `TRUE`/`FALSE` | Must align with approved product selling policy. |
| `delivery_estimate` | Yes | Text | Customer-safe estimate shown before payment where supported. |
| `stock_effective_at` | Yes | ISO 8601 datetime | Date/time the stock snapshot became effective in the ERP/accounting system. |
| `last_updated_at` | Yes | ISO 8601 datetime | Export or operations update timestamp. |
| `change_reason` | Yes | Text | Operational reason for the stock update. |

## Row-Level Validation Review

Before production import, the Operations Representative must review the SaaS import preview or validation report at row level and confirm:

- Required columns are present and match the `v1.0` template.
- Every SKU maps to one existing SaaS product.
- Quantity fields are non-negative integers.
- Stock status is consistent with available quantity and selling policy.
- Delivery estimates are customer-safe and do not expose internal supply-chain notes.
- No raw card data, CVV/CVC values, secrets, API keys, or sensitive payment credentials are present.

## Production Import Controls

Production imports are allowed only after sandbox/staging import evidence is captured according to `ops/import-templates/import-runbook.md`. The final import record must capture admin identity, MFA-protected account used, file name, timestamp, template version, import result, rejected row count, audit log reference, and reconciliation sample notes.
