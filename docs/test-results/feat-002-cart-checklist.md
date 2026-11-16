# FEAT-002 Cart Acceptance Checklist

## Scope

This checklist covers shopping cart behavior for the Shopify-hosted storefront cart page and the cart analytics responsibilities for `add_to_cart`, `cart_abandoned`, and inventory-friction events.

## Functional Checks

| ID | Area | Check | Expected Result | Status |
|---|---|---|---|---|
| CART-001 | Line display | Open a cart containing at least one product variant with image, title, size, colour, item price, quantity, and line total. | Cart displays each line with product media or placeholder, product title link, selected size/colour, quantity controls, item price, and line total. | Documented |
| CART-002 | Quantity increase | Increase an item quantity by one valid increment. | Shopify cart change request succeeds, the quantity input updates, line total refreshes, cart subtotal/total refresh, and checkout remains available. | Documented |
| CART-003 | Quantity decrease | Decrease an item quantity without going below the minimum. | Shopify cart change request succeeds, the quantity input updates, line total refreshes, and cart subtotal/total refresh. | Documented |
| CART-004 | Removal | Select Remove for a cart line. | Line is removed, item count and totals refresh, and an empty cart reloads to the empty-cart state when no lines remain. | Documented |
| CART-005 | Totals | Apply quantity changes and removals across multiple lines. | Subtotal, discounts when present, cart total, and item count reflect the latest Shopify cart response. | Documented |
| CART-006 | Invalid non-integer | Enter a decimal quantity such as `1.5`. | Cart blocks the update, marks the input invalid, shows a whole-number error, and does not initiate checkout. | Documented |
| CART-007 | Invalid below minimum | Enter `0` or a value below the variant minimum in the quantity field. | Cart blocks the update, explains that Remove should be used to delete the item, and keeps checkout protected until valid. | Documented |
| CART-008 | Invalid above stock | Enter a quantity above the storefront stock limit for a tracked inventory item. | Cart blocks or Shopify corrects/rejects the quantity, shows available-stock messaging, and emits `out_of_stock_attempted` without personal data. | Documented |
| CART-009 | Unavailable item | Load a cart containing a variant that is no longer available. | Quantity controls are disabled, checkout is disabled, the line is visually marked unavailable, and the shopper is asked to remove it before checkout. | Documented |
| CART-010 | Checkout validation | Attempt checkout while any line has an invalid quantity or unavailable variant. | Checkout submission is prevented, focus moves to the invalid quantity input, and the relevant cart or line error is announced. | Documented |

## Responsive QA

| ID | Viewport | Check | Expected Result | Status |
|---|---|---|---|---|
| RWD-001 | Mobile, 360px wide | Review populated cart lines and summary. | Product information, quantity controls, item price, line total, summary totals, update, and checkout controls remain readable without horizontal scrolling. | Documented |
| RWD-002 | Mobile, 390px wide | Change quantities and remove an item. | Controls are large enough to operate, status/error messages remain visible, and layout does not overlap. | Documented |
| RWD-003 | Tablet, 768px wide | Review cart with multiple lines. | Cart preserves product, quantity, price, and total hierarchy with clear spacing and no clipped text. | Documented |
| RWD-004 | Desktop, 1280px wide | Review cart table header, lines, and summary. | Header columns align with line content, totals are easy to scan, and primary checkout action is visible after cart lines. | Documented |

## Analytics Checks

| ID | Event | Check | Expected Result | Status |
|---|---|---|---|---|
| ANL-001 | `add_to_cart` | Add an in-stock product from a product add flow after Shopify confirms success. | One `add_to_cart` event is available via `CustomEvent` and `dataLayer` when configured, with catalog IDs, quantity, value/currency when known, and no personal data. | Documented |
| ANL-002 | `add_to_cart` | Attempt to add an unavailable product. | No `add_to_cart` event is emitted for the failed add; inventory friction is recorded through `out_of_stock_attempted` where the flow supports it. | Documented |
| ANL-003 | `cart_abandoned` | Review Shopify/platform analytics integration for abandoned carts. | Abandonment is tracked by Shopify/platform analytics or an approved integration where supported; the theme does not rely on blocking browser unload tracking. | Documented |
| ANL-004 | `cart_abandoned` | Inspect the abandonment payload contract. | Payload is limited to item count, cart value, currency, cart age, and integration name; no contact, address, customer ID, cart token, checkout token, or payment data is sent. | Documented |
| ANL-005 | `out_of_stock_attempted` | Trigger invalid cart quantity or unavailable-line checkout prevention. | Event contains reason, product/variant IDs where available, requested quantity, available quantity where available, and no personal data. | Documented |

## Evidence Notes

- Cart quantity and removal checks are based on the Shopify `/cart/change.js` response used by `theme/assets/cart.js`.
- Inventory enforcement remains Shopify/platform-managed; theme validation provides earlier messaging and analytics but does not replace Shopify inventory validation.
- `cart_abandoned` is documented as an integration-level event for MVP because reliable abandonment detection depends on Shopify/platform analytics support.
