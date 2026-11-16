# FEAT-001 Product Discovery Acceptance Checklist

## Scope

This checklist covers storefront product discovery across browse, search/filter/sort, product cards, and product detail pages for the Shopify-hosted theme.

## Analytics Checks

| ID | Event | Check | Expected Result | Status |
|---|---|---|---|---|
| ANL-001 | `product_viewed` | Open a product detail page. | Product detail initialization can emit one `product_viewed` event with product and initially selected variant IDs when available. | Pass - source review |
| ANL-002 | `product_viewed` | Inspect the event payload. | Payload is limited to event name, catalog IDs, currency, and low-cardinality source; it excludes product title, URL, referrer, customer identifiers, contact data, checkout/cart tokens, and payment data. | Pass - source review |
| ANL-003 | `product_viewed` | Review event delivery behavior. | Event dispatch uses non-blocking browser analytics hooks and must not block page rendering, variant selection, add-to-cart, checkout, payment, or admin operations. | Pass - source review |

## Responsive QA

| ID | Viewport | Journey | Check | Expected Result | Status |
|---|---|---|---|---|---|
| RWD-001 | Mobile, 360px wide | Browse collections | Review category navigation, filters, product cards, empty states, and pagination. | Content remains readable without horizontal scrolling; product card images, titles, prices, availability, and pagination controls fit the viewport. | Pass - source review |
| RWD-002 | Mobile, 390px wide | Search/filter/sort | Search for a product, apply filters, clear filters, and review sorted result links. | Search input, submit button, filter groups, sort controls, result count, and clear actions remain operable and do not overlap. | Pass - source review |
| RWD-003 | Tablet, 768px wide | Browse and search | Review collection/search layouts with filters and product grids. | Sidebar filters and result grids preserve hierarchy, readable spacing, and visible focus/active states. | Pass - source review |
| RWD-004 | Desktop, 1280px wide | Browse, search, and sort | Review collection categories, facets, sort controls, result grid, and pagination. | Discovery controls are easy to scan; grid columns, result controls, and pagination align without clipped text. | Pass - source review |
| RWD-005 | Mobile, 360px wide | Product detail | Review media gallery, thumbnails, variant selector, availability, add-to-cart, description, and product details. | Primary media, variant choices, price, availability, and purchase controls are readable and operable without overlap. | Pass - source review |
| RWD-006 | Tablet and desktop | Product detail | Switch variants and media thumbnails. | Media, price, availability, and submit button updates remain visible and stable across breakpoints. | Pass - source review |

## Accessibility QA

| ID | Area | Check | Expected Result | Status |
|---|---|---|---|---|
| A11Y-001 | Keyboard navigation | Tab through header navigation, collection filters, search form, sort control, product cards, pagination, product gallery thumbnails, variant radios, and add-to-cart. | Interactive controls are reachable in logical order with native keyboard operation and visible focus styles from the theme. | Pass - source review |
| A11Y-002 | Skip link and landmarks | Load collection, search, and product detail pages and use the skip link. | Header, navigation, main content, form, and status regions are exposed with semantic elements or ARIA labels. | Pass - source review |
| A11Y-003 | Filter/search updates | Apply filters or search terms. | Results containers expose status changes through live regions and maintain focusable targets for updated results. | Pass - source review |
| A11Y-004 | Product variant selection | Change size/colour radios and unavailable options. | Variant options use grouped radio inputs, unavailable choices expose `aria-disabled`, and availability changes are announced through live status text. | Pass - source review |
| A11Y-005 | Product media | Review gallery images and thumbnails. | Product images use staff-provided media alt text when available and fall back to the product title; decorative placeholders are hidden from assistive technology. | Pass - source review |
| A11Y-006 | Contrast | Review text, links, filters, cards, availability badges, form controls, and buttons against theme colors. | Source-level color review found no release-blocking low-contrast discovery text or controls; visual QA should confirm in the Shopify preview before launch. | Pass - source review |

## Release Blockers

No release-blocking discovery analytics, responsive, keyboard, contrast, or image-alt issues were found in this source-level review.

## Evidence Notes

- Analytics review is based on `theme/analytics/events.js`, `docs/analytics/event-schema.md`, and product detail initialization in `theme/assets/product.js`.
- Browse and search review is based on `theme/sections/main-collection-product-grid.liquid`, `theme/sections/main-search.liquid`, `theme/snippets/facets.liquid`, `theme/snippets/sort-controls.liquid`, and `theme/snippets/product-card.liquid`.
- Product detail review is based on `theme/sections/main-product.liquid`, `theme/snippets/product-media-gallery.liquid`, `theme/snippets/variant-selector.liquid`, and `theme/assets/product.js`.
- Final launch should repeat the responsive and contrast checks in a Shopify preview with staff-provided product content and media.
