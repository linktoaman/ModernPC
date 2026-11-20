# Catalogue Configuration

## Document Control

| Field | Value |
|---|---|
| Product | ModernPC1 Dell Red Witch Gaming Store |
| Document owner | Operations Representative |
| Technical owner | Engineering Lead |
| Status | Draft configuration |
| Last updated | 2026-11-20 |
| Related requirements | REQ-001, REQ-002, REQ-003 |
| Related templates | `ops/import-templates/product-catalogue-template.md`, `ops/import-templates/inventory-template.md` |

This record defines the Dell-only catalogue fields, categories, and publication controls that must be configured in the selected SaaS commerce platform and enforced by import validation.

## Customer-Visible Category Taxonomy

Only these customer-visible categories may be published, searched, filtered, linked, or displayed in storefront navigation for launch.

| Customer category | Import value | Route slug | Publication rule |
|---|---|---|---|
| Dell gaming PCs | `Dell Gaming PC` | `/category/gaming-desktops` | Publish only active Dell desktop/tower gaming PC products. |
| Dell gaming laptops | `Dell Gaming Laptop` | `/category/gaming-laptops` | Publish only active Dell gaming laptop products. |
| Dell accessories | `Dell Accessory` | `/category/gaming-accessories` | Publish only active Dell accessories approved for gaming PC or laptop use. |

Legacy or vendor-neutral category names such as `Gaming PC`, `Gaming Laptop`, and `Gaming Accessory` are not customer-visible launch categories unless mapped to the Dell-approved values above before publication.

## Required Product Fields

Each published product record must support these storefront and operational fields.

| Field | Required for publication | Source / Validation |
|---|---:|---|
| Brand / vendor | Yes | Must be exactly `Dell`. Non-Dell values are rejected by import validation or forced to `Deactivated`/unpublished before storefront sync. |
| Category | Yes | Must be one of `Dell Gaming PC`, `Dell Gaming Laptop`, or `Dell Accessory`. |
| Name | Yes | Customer-facing product name; blank values block publication. |
| Description / specifications | Yes | Listing description and product-detail specifications must be customer-safe and include relevant model details. |
| Image reference or placeholder | Yes | Use approved image asset references where available; if a launch image is pending, use approved placeholder asset `placeholder-dell-product`. |
| USD price | Yes | `price_usd` must be present, non-negative, and formatted with two decimal places for the United States launch market. |
| Stock status | Yes | Must be one of `In Stock`, `Low Stock`, `Out of Stock`, `Preorder`, or `Backorder`. |
| Delivery estimate | Yes | Customer-safe delivery text, for example `3-5 business days`; internal supply-chain notes are prohibited. |
| Active/deactivated status | Yes | Only `Active` records are eligible for customer visibility. `Draft` and `Deactivated` records must remain hidden from category, search, filter, product detail, cart, and checkout pages. |

## Dell-Only Publication Controls

The SaaS catalogue configuration and import process must apply these controls before customer visibility:

1. Reject any product import row where `vendor` is not exactly `Dell`.
2. Reject any product import row where `category` is not one of the three Dell launch categories.
3. If the SaaS import tool cannot hard-reject a row, import it as `Deactivated` and exclude it from all customer-visible surfaces.
4. Block publication when required display fields are missing: price, stock status, delivery estimate, image reference or placeholder, name, and description/specifications.
5. Keep unpublished records out of category pages, search results, filters, product detail routes, cart, and checkout.
6. Capture rejected or deactivated row counts in the import evidence required by `ops/import-templates/import-runbook.md`.

## SaaS Field Mapping

| SaaS field | Import column | Customer-visible use |
|---|---|---|
| Brand / vendor | `vendor` | Brand validation, filters where enabled, product detail metadata. |
| Category / collection | `category` | Category navigation and routes `/category/{gaming-desktops|gaming-laptops|gaming-accessories}`. |
| Product title | `product_name` | Product cards, product detail, cart and checkout line titles. |
| Listing description | `short_description` | Product cards and search result summaries. |
| Product specifications | `specifications` | Product detail specifications section. |
| Primary media | `image_reference_primary` | Product card image and product detail primary media. |
| Gallery media | `image_reference_gallery` | Product detail gallery when available. |
| Price | `price_usd` | USD product card, product detail, cart, and checkout price display. |
| Publication status | `active_status` | Customer visibility gate. |
| Stock status | `stock_status` | Product card stock tag, product detail availability, cart and checkout availability checks. |
| Quantity | `stock_quantity` and inventory import quantities | Checkout availability and out-of-stock blocking. |
| Delivery estimate | `delivery_estimate` | Product card/detail delivery messaging where supported. |

## Operational Review

Before production import, the Operations Representative must confirm that all published rows are Dell-branded, use the approved Dell launch categories, include required display fields, and have `Active` status only when ready for customer visibility. Any non-Dell, unsupported category, missing-field, or unresolved validation row must be rejected or left unpublished.
