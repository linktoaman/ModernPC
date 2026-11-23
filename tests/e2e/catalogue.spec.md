# Catalogue and Detail E2E Evidence

## Scope

This manual e2e spec verifies the Dell-only catalogue visibility rules and product detail stock gating for the SaaS storefront. Run it in sandbox/staging before production promotion whenever catalogue, import, product card, category, search/filter, detail, cart, or checkout behaviour changes.

## References

| Reference | Location |
|---|---|
| Dell catalogue configuration | `docs/platform/catalogue-configuration.md` |
| Product catalogue import controls | `ops/import-templates/product-catalogue-template.md` |
| Category route contract | `/category/{gaming-desktops|gaming-laptops|gaming-accessories}` |
| Product detail route contract | `/products/{productSlug}` |
| Release checklist evidence gate | `docs/release/release-checklist.md` |

## Test Data Requirements

The sandbox/staging catalogue must contain the following records or equivalent controlled fixtures before this evidence is captured.

| Fixture | Vendor | Category | Active Status | Stock Status | Expected Visibility |
|---|---|---|---|---|---|
| Dell desktop in stock | `Dell` | `Dell Gaming PC` | `Active` | `In Stock` or `Low Stock` | Visible in `/category/gaming-desktops`; detail add-to-cart enabled when variant is available. |
| Dell laptop out of stock | `Dell` | `Dell Gaming Laptop` | `Active` | `Out of Stock` | Visible in `/category/gaming-laptops`; detail add-to-cart blocked. |
| Dell accessory active | `Dell` | `Dell Accessory` | `Active` | Any allowed stock status | Visible only in `/category/gaming-accessories`. |
| Non-Dell product | Any value other than `Dell` | Any category | Any status | Any stock status | Hidden from category, search, filter, detail, cart, and checkout surfaces; rejected or deactivated by import evidence. |
| Dell draft/deactivated product | `Dell` | Approved Dell category | `Draft` or `Deactivated` | Any stock status | Hidden from customer-visible surfaces. |

## Evidence Capture Rules

- Record sandbox/staging environment name, preview URL, release ID, import file name or fixture source, tester, and UTC timestamp.
- Capture screenshots or test notes for each check below. Mask customer data and never record raw card numbers, CVV, payment credentials, secrets, API keys, customer addresses, or customer contact data.
- Where the selected SaaS platform cannot automate a check, mark the check as manual and attach screenshots, import validation output, admin catalogue screenshots, storefront screenshots, or browser notes.
- Do not use production customer data. Use sandbox/staging products, approved fixture products, or masked admin exports only.

## Manual E2E Checks

| ID | Area | Steps | Expected Result | Evidence Required | Result |
|---|---|---|---|---|---|
| CAT-001 | Category access | Open `/category/gaming-desktops`, `/category/gaming-laptops`, and `/category/gaming-accessories` in sandbox/staging. | Each route loads the Dell category page and exposes navigation for Dell gaming PCs, Dell gaming laptops, and Dell accessories. | Screenshot or notes for each route. | TBD |
| CAT-002 | Dell-only visibility | Review every product card shown on each category route. Compare against the admin/import fixture set. | Only active products with vendor exactly `Dell` and category matching the route are visible. No non-Dell, unsupported category, draft, or deactivated products appear. | Storefront screenshots plus import/admin evidence showing hidden non-Dell or inactive rows. | TBD |
| CAT-003 | Non-Dell exclusion | Search or filter for a known non-Dell fixture, then attempt direct access if the SaaS platform exposes a predictable test slug. | The non-Dell fixture is absent from category, search, and filters. If a detail URL is reachable, it displays the unavailable Dell catalogue state or remains unpublished according to platform behaviour. | Search/filter screenshots and admin/import validation output. | TBD |
| CAT-004 | Required card fields | Inspect at least one visible card from each category route. | Each visible card shows image or approved Dell placeholder, product name, listing description, stock tag, delivery estimate, USD price, and `View details`. | Screenshot for each category with the card fields visible. | TBD |
| CAT-005 | Product detail route | Select `View details` for a visible Dell product from each category. | Each link opens `/products/{productSlug}` for the selected product and displays the Dell product detail page. | Screenshot or browser note with product route and title. | TBD |
| DET-001 | Required detail fields | Inspect an active Dell product detail page. | Detail page shows product image or approved placeholder, category breadcrumb, product name, USD price, stock status, delivery estimate, description, and specifications. | Detail page screenshot with required fields visible. | TBD |
| DET-002 | In-stock add-to-cart | Open an active Dell product with `In Stock` or `Low Stock` status and an available variant, then inspect and activate the add-to-cart control. | `Add to cart` is enabled; successful cart add proceeds through the SaaS/platform cart flow for the selected variant. | Screenshot before activation and cart/add confirmation evidence. | TBD |
| DET-003 | Out-of-stock blocked state | Open an active Dell product with `Out of Stock` status. | Add-to-cart is disabled with `aria-disabled="true"` or equivalent platform-disabled state, button copy is blocked/unavailable, and customer-facing out-of-stock messaging is visible. | Detail screenshot showing disabled control and message. | TBD |
| DET-004 | Preorder/backorder blocked state | If preorder or backorder products are present, open one active Dell product with `Preorder` or `Backorder` status. | Add-to-cart is blocked unless a separately approved preorder/backorder purchasing configuration exists for the release. | Screenshot or note confirming not applicable. | TBD |
| DET-005 | Cart and checkout exclusion | Attempt to add hidden non-Dell, draft, deactivated, or out-of-stock fixtures through any visible route or direct URL available in sandbox/staging. | Hidden or unavailable fixtures cannot be added to cart or advanced to checkout. | Browser notes, storefront screenshots, or platform validation notes. | TBD |

## Release Evidence Summary

Complete this table before linking the evidence from the release checklist.

| Field | Value |
|---|---|
| Release ID | TBD |
| Environment | Sandbox/staging |
| Preview URL | TBD |
| Import file or fixture source | TBD |
| Tester | TBD |
| Test date/time UTC | TBD |
| Product/category sample count | TBD |
| Non-Dell exclusion evidence | TBD |
| In-stock add-to-cart evidence | TBD |
| Out-of-stock blocked evidence | TBD |
| Exceptions approved | None / TBD |

## Pass Criteria

Catalogue evidence passes only when:

- Active customer-visible products are Dell-only and belong to one of the three approved Dell launch categories.
- Non-Dell, unsupported category, draft, and deactivated products are absent from customer-facing category, search, filter, product detail, cart, and checkout surfaces.
- Product cards expose the required customer-facing fields: image or approved placeholder, name, description, stock tag, delivery estimate, USD price, and `View details`.
- Product detail pages expose image or approved placeholder, category breadcrumb, product name, USD price, stock status, delivery estimate, description, and specifications.
- Add-to-cart is enabled only for visible Dell products with an available in-stock or low-stock variant, and blocked for out-of-stock products.
