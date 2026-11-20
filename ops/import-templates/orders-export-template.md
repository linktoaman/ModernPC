# Orders Export Template

| Control | Value |
|---|---|
| Template name | Orders Export |
| Template version | `v1.0` |
| Required file name pattern | `orders-export-v1.0-YYYYMMDD.xlsx` |
| Required workbook header | Cell `A1` on the first worksheet must read `Orders Export Template v1.0`. |
| Direction | SaaS platform to ERP/accounting system |
| System of record | External ERP/accounting system for business records; SaaS platform for operational commerce order records |
| SaaS role | Source export for ERP reconciliation and customer/order record update |
| Owner | Operations Representative |

## Sensitive Data Prohibition

This template must never contain raw payment card numbers, CVV/CVC values, magnetic stripe data, PINs, payment-provider secrets, API keys, gateway credentials, or other sensitive payment credentials. Only provider-issued non-sensitive payment references and payment statuses may be exported where required for reconciliation.

## Required Columns

| Column | Required | Type / Format | Validation |
|---|---:|---|---|
| `template_version` | Yes | Text, fixed value `v1.0` | Every row must match the workbook header version. |
| `saas_order_id` | Yes | Text | Must match the SaaS platform order identifier. |
| `erp_order_id` | No | Text | Required after ERP has accepted or created the corresponding order. |
| `order_number` | Yes | Text | Customer/order support reference. |
| `order_created_at` | Yes | ISO 8601 datetime | SaaS order creation timestamp. |
| `order_updated_at` | Yes | ISO 8601 datetime | SaaS order update timestamp. |
| `order_status` | Yes | Controlled text | Allowed values: `Pending`, `Paid`, `Processing`, `Fulfilled`, `Partially Fulfilled`, `Cancelled`, `Refunded`, `Failed`. |
| `payment_status` | Yes | Controlled text | Allowed values: `Unpaid`, `Authorized`, `Paid`, `Failed`, `Cancelled`, `Pending`, `Refunded`, `Partially Refunded`. |
| `payment_reference` | Conditional | Text | Provider-issued non-sensitive transaction/reference token only; never card number or CVV. Required when payment status is `Authorized`, `Paid`, `Refunded`, or `Partially Refunded`. |
| `currency` | Yes | ISO currency code | Launch value is `USD` unless approved configuration changes. |
| `order_subtotal_usd` | Yes | Decimal, USD | Must be greater than or equal to `0.00`. |
| `shipping_total_usd` | Yes | Decimal, USD | Must be greater than or equal to `0.00`. |
| `tax_total_usd` | Yes | Decimal, USD | Must be greater than or equal to `0.00`. |
| `discount_total_usd` | Yes | Decimal, USD | Must be greater than or equal to `0.00`. |
| `order_total_usd` | Yes | Decimal, USD | Must equal subtotal plus shipping and tax minus discounts, subject to platform rounding. |
| `customer_email` | Yes | Email address | Required for guest checkout confirmation and support; handle as confidential. |
| `customer_first_name` | Yes | Text | Required customer/order record field. |
| `customer_last_name` | Yes | Text | Required customer/order record field. |
| `customer_phone` | No | Text | Include only if collected and approved for operations. |
| `shipping_address_line1` | Yes | Text | Required fulfilment field. |
| `shipping_address_line2` | No | Text | Optional fulfilment field. |
| `shipping_city` | Yes | Text | Required fulfilment field. |
| `shipping_region` | Yes | Text | State/region; launch country is United States. |
| `shipping_postal_code` | Yes | Text | Postal code; validate against launch-country expectations where supported. |
| `shipping_country` | Yes | ISO country code | Launch value is `US` unless approved configuration changes. |
| `billing_address_matches_shipping` | Yes | Boolean `TRUE`/`FALSE` | Do not export payment card billing details beyond approved address fields. |
| `line_item_sku` | Yes | Text | One row per order line item. |
| `line_item_product_name` | Yes | Text | Product name at time of order. |
| `line_item_quantity` | Yes | Integer | Must be greater than `0`. |
| `line_item_unit_price_usd` | Yes | Decimal, USD | Must be greater than or equal to `0.00`. |
| `line_item_total_usd` | Yes | Decimal, USD | Must equal quantity multiplied by unit price, subject to platform discounts and rounding. |
| `fulfillment_status` | Yes | Controlled text | Allowed values: `Unfulfilled`, `Partially Fulfilled`, `Fulfilled`, `Cancelled`, `Returned`, `Not Applicable`. |
| `exported_at` | Yes | ISO 8601 datetime | SaaS export timestamp. |

## Row-Level Validation Review

Before ERP import or production reconciliation, the Operations Representative must review exported rows and confirm:

- Required columns are present and match the `v1.0` template.
- Order totals reconcile with line items, taxes, shipping, discounts, and payment status.
- Customer/order fields are limited to approved operational and accounting needs.
- Payment references are non-sensitive provider-issued references only.
- No raw card data, CVV/CVC values, secrets, API keys, or sensitive payment credentials are present.

## Export Controls

Exports for ERP/accounting import or reconciliation must be generated by a named MFA-protected admin account. The export record must capture admin identity, file name, timestamp, template version, source environment, export result, audit log reference, and reconciliation sample notes.
