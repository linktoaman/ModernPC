# Analytics Event Schema

## Privacy and Reliability Rules

- Events must not include names, email addresses, phone numbers, shipping or billing addresses, customer IDs, payment details, card data, secrets, API keys, checkout tokens, cart tokens, IP addresses, or user-agent strings.
- Analytics must never block add-to-cart, cart updates, checkout initiation, payment, or Shopify admin operations.
- Theme events dispatch a browser `CustomEvent` and push the same compact payload to `window.dataLayer` only when a data layer is present.
- Numeric IDs and quantities are allowed because they describe catalog and cart state, not customer identity.

## Event: `add_to_cart`

Purpose: confirm product add flows create KPI coverage for customers adding merchandise to the Shopify cart.

Emission point: product add flows should call `window.themeAnalytics.trackAddToCart(...)` after Shopify confirms an add request succeeded. The event must not be emitted for unavailable, rejected, or failed add attempts.

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `event` | string | Yes | Always `add_to_cart`. |
| `product_id` | number | No | Shopify product ID when available. |
| `variant_id` | number | No | Shopify variant ID when available. |
| `quantity` | number | No | Quantity successfully added. |
| `value` | number | No | Added line value in minor currency units when available. |
| `currency` | string | No | Active cart/store currency code. |
| `source` | string | No | Low-cardinality add source such as `product_form` or `quick_add`. |

Acceptance checks:

- In-stock product add succeeds in Shopify and emits one `add_to_cart` event with catalog IDs and quantity.
- Failed or unavailable add attempts do not emit `add_to_cart`; use `out_of_stock_attempted` where applicable.
- Payload contains no personal data, checkout URL, cart token, or payment data.

## Event: `cart_abandoned`

Purpose: document the abandonment approach for KPI monitoring where Shopify or an approved analytics integration supports it.

Emission point: prefer Shopify/platform analytics or approved server-side/customer-events integration that can determine abandonment without browser unload tracking. The theme exposes `window.themeAnalytics.trackCartAbandoned(...)` only as an integration hook; it is not automatically fired by cart page JavaScript.

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `event` | string | Yes | Always `cart_abandoned`. |
| `item_count` | number | No | Cart item count at abandonment decision time. |
| `value` | number | No | Cart value in minor currency units when available. |
| `currency` | string | No | Active cart/store currency code. |
| `cart_age_seconds` | number | No | Age threshold used by the platform/integration. |
| `integration` | string | No | Low-cardinality source, defaults to `shopify_platform`. |

Acceptance checks:

- Abandonment detection is owned by Shopify/platform analytics or an approved integration, not by blocking browser prompts or raw unload beacons.
- Payload excludes customer contact information, address details, customer IDs, checkout tokens, cart tokens, and payment data.
- Missing platform support is acceptable for MVP when documented as not automatically emitted by the theme.

## Event: `out_of_stock_attempted`

Purpose: record inventory enforcement friction when a shopper requests unavailable inventory or a quantity above Shopify/platform limits.

Emission point: cart quantity validation, Shopify cart correction/rejection handling, and checkout blocking for unavailable cart lines.

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `event` | string | Yes | Always `out_of_stock_attempted`. |
| `reason` | string | Yes | Low-cardinality reason such as `stock_limit_exceeded`, `variant_unavailable`, `platform_quantity_corrected`, or `platform_quantity_rejected`. |
| `product_id` | number | No | Shopify product ID when available. |
| `variant_id` | number | No | Shopify variant ID when available. |
| `requested_quantity` | number | No | Shopper-requested quantity. |
| `available_quantity` | number | No | Storefront-visible stock limit when available. |

Acceptance checks:

- Invalid cart quantities above a known stock limit emit `out_of_stock_attempted`.
- Shopify quantity correction or rejection emits `out_of_stock_attempted` with a platform reason.
- Payload contains only catalog IDs, quantities, and the reason; no personal or payment data is included.
