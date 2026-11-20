# Analytics Event Schema

## Privacy and Reliability Rules

- Events must not include names, email addresses, phone numbers, shipping or billing addresses, customer IDs, payment details, card data, secrets, API keys, checkout tokens, cart tokens, IP addresses, or user-agent strings.
- Analytics must never block add-to-cart, cart updates, checkout initiation, payment, or Shopify admin operations.
- Theme events dispatch a browser `CustomEvent` and push the same compact payload to `window.dataLayer` only when a data layer is present.
- Numeric IDs and quantities are allowed because they describe catalog and cart state, not customer identity.

## Event: `login_page_initial_render`

Purpose: confirm that the public login page reached its initial client-side render target without collecting authentication, navigation, or user data.

Emission point: the login page schedules one event after `DOMContentLoaded` using `window.themeAnalytics.trackLoginPageInitialRender()` when the shared theme analytics helper is available. The call is wrapped so missing analytics ingestion or runtime analytics errors cannot block page rendering, SSO navigation, or help-link navigation.

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `event` | string | Yes | Always `login_page_initial_render`. |
| `render_target` | string | Yes | Always `login_page`. |
| `source` | string | Yes | Always `shopify_theme`. |

Acceptance checks:

- Login page initialization emits one `login_page_initial_render` event when the shared analytics helper is present.
- Payload contains no username, password, SSO assertion, token, URL, query string, referrer, customer identifier, contact data, financial data, health data, payment data, card data, or personal data.
- Missing or failing analytics ingestion does not block initial rendering, SSO navigation, help navigation, checkout, payment, or admin operations.

## Event: `product_viewed`

Purpose: measure product detail engagement for discovery and merchandising KPI coverage.

Emission point: product detail views should emit one event after the product page script initializes and product catalog metadata is available. Theme code can call `window.themeAnalytics.trackProductViewed(...)`; existing product detail initialization may dispatch the same compact event directly when the shared helper is unavailable.

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `event` | string | Yes | Always `product_viewed`. |
| `product_id` | number | No | Shopify product ID when available. |
| `variant_id` | number | No | Initially selected Shopify variant ID when available. |
| `currency` | string | No | Active cart/store currency code when available. |
| `source` | string | No | Low-cardinality source, defaults to `product_detail`. |

Acceptance checks:

- Product detail page initialization emits one `product_viewed` event with catalog IDs when available.
- Payload contains no product title, URL, collection path, referrer, customer identifiers, contact data, cart token, checkout token, or payment data.
- Event dispatch does not block product page rendering, variant selection, add-to-cart, checkout, payment, or admin operations.

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
