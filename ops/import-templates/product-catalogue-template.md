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
| Catalogue configuration | `docs/platform/catalogue-configuration.md` |

## Sensitive Data Prohibition

This template must never contain raw payment card numbers, CVV/CVC values, magnetic stripe data, PINs, payment-provider secrets, API keys, gateway credentials, or other sensitive payment credentials. Payment references, if ever needed for reconciliation, belong in approved order/payment records only and must be tokenized or provider-issued non-sensitive references.

## Required Columns

| Column | Required | Type / Format | Validation |
|---|---:|---|---|
| `template_version` | Yes | Text, fixed value `v1.0` | Every row must match the workbook header version. |
| `erp_product_id` | Yes | Text | Must be unique in the file and match the ERP/accounting product identifier. |
| `sku` | Yes | Text | Must be unique in the file and stable across imports. |
| `vendor` | Yes | Text | Must be exactly `Dell`. Non-Dell rows must be rejected by validation or imported only as `Deactivated` and excluded from all customer-visible surfaces. |
| `category` | Yes | Controlled text | Customer-visible launch categories only: `Dell Gaming PC`, `Dell Gaming Laptop`, `Dell Accessory`. These map to `/category/gaming-desktops`, `/category/gaming-laptops`, and `/category/gaming-accessories`. |
| `product_name` | Yes | Text | Customer-facing name; must not be blank. |
| `short_description` | Yes | Text | Plain-language listing description. |
| `specifications` | Yes | Text or structured text | Include relevant CPU, GPU, memory, storage, display, accessory compatibility, or other product-specific specifications. |
| `image_reference_primary` | Yes | URL or approved asset reference | Must point to an approved product image already uploaded or staged for upload. If a final product image is pending, use approved placeholder asset `placeholder-dell-product`. |
| `image_reference_gallery` | No | Semicolon-separated URLs or asset references | Use approved image references only. |
| `price_usd` | Yes | Decimal, USD | Must be greater than or equal to `0.00`; use two decimal places for the United States launch market. |
| `compare_at_price_usd` | No | Decimal, USD | If present, must be greater than or equal to `price_usd`. |
| `taxable` | Yes | Boolean `TRUE`/`FALSE` | Must reflect approved tax configuration. |
| `active_status` | Yes | Controlled text | Allowed values: `Active`, `Draft`, `Deactivated`. Only `Active` Dell rows in approved categories may be visible to customers. |
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
- `vendor` is exactly `Dell`; any non-Dell row is rejected or remains `Deactivated` and unpublished.
- Category is one of `Dell Gaming PC`, `Dell Gaming Laptop`, or `Dell Accessory`.
- Category, status, stock, and boolean fields use only allowed values.
- Published rows have valid USD price, stock status, delivery estimate, active status, and image reference or approved placeholder fields.
- Prices, stock quantities, image references or placeholders, and customer-facing text are valid.
- No raw card data, CVV/CVC values, secrets, API keys, or sensitive payment credentials are present.

## Customer Visibility Rules

The import is not production-ready unless the SaaS validation or post-import review confirms:

- Non-Dell product records are rejected or left `Deactivated`.
- Rows outside the approved Dell launch categories are rejected or left `Deactivated`.
- `Draft` and `Deactivated` products do not appear in category pages, search results, filters, product detail routes, cart, or checkout.
- Active products without `price_usd`, `stock_status`, `delivery_estimate`, and `image_reference_primary` or approved placeholder are blocked from publication.

## Production Import Controls

Production imports are allowed only after sandbox/staging import evidence is captured according to `ops/import-templates/import-runbook.md`. The final import record must capture admin identity, MFA-protected account used, file name, timestamp, template version, import result, rejected row count, audit log reference, and reconciliation sample notes.
