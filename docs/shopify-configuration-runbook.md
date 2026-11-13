# Shopify Configuration Runbook

## Document Control

| Field | Value |
|---|---|
| Product | Gaming Hardware E-Commerce Website |
| Project | ModernPc |
| Runbook owner | Product Owner, to be named before launch |
| Configuration owner | Store Staff Administrator, to be named before launch |
| Technical owner | Engineering Lead or Solution Architect, to be named before customized theme work |
| Business approver | Business Sponsor, to be named before launch |
| Last updated | 2026-11-13 |
| Related architecture | `docs/ard.md` |
| Related requirements | REQ-001, REQ-004 |

This runbook records the Shopify SaaS baseline for the MVP storefront and the manual configuration areas that must be verified in Shopify Admin before launch. It is the change-control record for Shopify Admin choices that are not represented as repository-managed theme code.

## Store Baseline

| Area | Baseline Decision | Owner | Rollback / Recovery Notes |
|---|---|---|---|
| Commerce platform | Shopify Online Store and Shopify Admin are the MVP commerce platform. | Product Owner / Business Sponsor | Reconfirm ARD-DEC-001 before replacing Shopify. Reverting away from Shopify is outside MVP scope. |
| Hosting model | Shopify managed SaaS hosting. No business-operated storefront, checkout, catalog, order, customer, payment, or inventory servers are in MVP scope. | Product Owner / Engineering Lead | Remove or disable any unapproved custom hosting introduced during buildout; return customer traffic to Shopify storefront and hosted checkout. |
| Store status | Shopify store must be active on an appropriate Shopify plan before launch readiness review. Actual plan and billing owner must be recorded in Shopify Admin. | Business Sponsor | If plan activation or billing fails, pause launch and keep the storefront password-protected or unpublished until the plan is restored. |
| Store URL | Primary domain is TBD. Until a primary domain is approved, use the Shopify preview or `.myshopify.com` URL for smoke testing. | Product Owner / Store Staff Administrator | If DNS or domain configuration fails, revert storefront links to the known-working Shopify preview or `.myshopify.com` URL and keep public launch blocked. |
| Theme baseline | Use a Shopify Online Store theme with minimal configuration-first customization. The exact theme name, version, and preview/published status must be recorded before launch. | Store Staff Administrator / Engineering Lead | Revert to the prior known-good Shopify theme version or unpublished theme copy. For repository-managed theme code, redeploy the last passing version. |
| Catalog and inventory | Shopify is the system of record for product catalog, categories/collections, prices, stock, and storefront availability. | Store Staff Administrator | Correct product, collection, price, or stock issues directly in Shopify Admin. No separate catalog or inventory database should be used for MVP recovery. |
| Checkout and payments | Shopify hosted checkout collects checkout details. Shopify Payments is preferred where available; otherwise use an approved Shopify-supported hosted payment provider. | Business Sponsor / Store Staff Administrator | Disable failed or unapproved payment methods in Shopify Admin and restore the last verified hosted payment configuration. Do not introduce custom payment capture. |
| Orders and fulfillment | Shopify is the system of record for paid orders, payment references, customer checkout data, and fulfillment status. Fulfillment is manually managed from Shopify Admin at launch. | Store Staff Administrator | Resolve order and fulfillment exceptions in Shopify Admin using order history and staff procedure. Carrier label, tracking, or warehouse integrations are not part of MVP rollback. |
| Policy content | Shipping, returns/refunds, privacy, and terms of service content live in Shopify policy/page configuration and must be storefront-visible at launch. | Product Owner / Store Staff Administrator | Revert policy text to the last approved Shopify page/policy version or restore from this runbook's change log when policy changes are documented. |
| Staff access | Shopify native staff accounts, least-privilege roles, and MFA are required for Admin access. Shared admin credentials are not approved. | Store Staff Administrator / Business Sponsor | Remove or suspend incorrect staff access in Shopify Admin. Restore least-privilege roles and MFA before resuming launch activity. |
| Third-party apps | No app with customer, order, or payment-reference access may be installed without Business Sponsor approval. | Business Sponsor / Store Staff Administrator | Uninstall unapproved apps, revoke app permissions, and review any accessed data in Shopify Admin audit/activity records where available. |

## System of Record Boundary

Shopify is the system of record for the MVP data domains below:

| Data Domain | Shopify-Owned Record |
|---|---|
| Product catalog | Products, variants, descriptions, prices, media, product status |
| Categories / collections | Product grouping, navigation-visible collections, collection membership |
| Stock | Inventory quantities, availability state, stock enforcement for cart and checkout |
| Cart and checkout | Cart contents, checkout session state, contact email, shipping address, billing address, shipping method |
| Orders | Paid order record, order identifier, line items, order status, fulfillment status |
| Customer data | Checkout contact and address data, optional customer account data where enabled |
| Payment references | Hosted payment status and transaction references from Shopify / Shopify Payments |
| Policy content | Shipping, returns/refunds, privacy, and terms of service pages or policies |
| Staff access | Shopify staff accounts, roles, MFA enrollment, and admin activity where available |

The MVP must not operate a separate commerce backend, product database, inventory service, checkout service, order database, customer database, payment vault, or self-managed hosting layer. Exports outside Shopify are limited to approved manual operations, privacy request handling, or approved business reporting.

## Manual Shopify Admin Configuration Checklist

Record each Admin change in the change log below before launch. Include the person who made the change, the Shopify Admin area, a short reason, and rollback notes.

| Admin Area | Required Baseline |
|---|---|
| Settings > Store details | Store name, business contact, customer-facing email, timezone, currency, and legal business details reviewed. |
| Settings > Plan / Billing | Active Shopify plan selected and billing owner confirmed. |
| Settings > Domains | Primary domain or preview URL recorded; TLS/Shopify-managed domain status verified before public launch. |
| Online Store > Themes | Baseline theme name, version, current status, and any repository-managed customization reference recorded. |
| Products | Initial gaming PCs, gaming laptops, and gaming accessories entered or imported into Shopify. |
| Collections / Navigation | Product categories and storefront navigation configured for gaming PCs, gaming laptops, and gaming accessories. |
| Inventory | Stock tracking enabled where applicable; out-of-stock purchase behavior reviewed against MVP requirements. |
| Settings > Checkout | Guest checkout enabled; optional customer account creation after purchase reviewed where Shopify plan/settings support it. |
| Settings > Payments | Shopify Payments or approved hosted payment provider configured; test mode smoke test planned before launch. |
| Settings > Shipping and delivery | MVP shipping methods configured for manual fulfillment; no launch dependency on carrier rates, labels, or tracking integrations. |
| Settings > Policies / Online Store pages | Shipping, returns/refunds, privacy, and terms of service content added and storefront-visible. |
| Settings > Notifications | Shopify-managed order and checkout notifications reviewed for basic customer order communication. |
| Users and permissions | Individual staff accounts created with least-privilege roles and MFA enabled. |
| Apps and sales channels | Installed apps reviewed; any app with customer, order, or payment-reference access has Business Sponsor approval. |

## Change Log Template

| Date | Admin Area | Change Summary | Owner | Approval | Rollback Notes |
|---|---|---|---|---|---|
| 2026-11-13 | Baseline | Initial configuration runbook created from ARD decisions; no live Shopify Admin changes performed by repository task. | Engineering Lead / Solution Architect | Pending Product Owner review | Use this runbook as the baseline checklist for future Admin changes. |

## Rollback Principles

1. Prefer Shopify-native rollback first: restore the last known-good theme copy, page/policy content, product settings, payment settings, or staff role configuration in Shopify Admin.
2. For customized theme code, restore the last version-controlled commit or tagged release that passed theme checks and launch smoke tests.
3. For payment issues, disable only the affected payment method or provider and return to the last verified hosted payment configuration. Never add custom raw-card handling.
4. For catalog, collection, price, or stock mistakes, correct the Shopify record directly and rerun product, cart, and checkout smoke tests.
5. For app risk, uninstall or disable the app, revoke permissions where possible, and document Business Sponsor review before reinstalling.
6. For domain issues, use the known-working Shopify preview or `.myshopify.com` URL until the primary domain is corrected and verified.

## Explicit Non-Goals for MVP Configuration

- No self-managed storefront, checkout, catalog, inventory, order, customer, or payment servers.
- No existing e-commerce migration.
- No custom payment collection, raw card storage, card-number logging, or payment credential export.
- No carrier-rate, label-generation, or tracking integration requirement at launch.
- No third-party apps with customer, order, or payment-reference access unless approved by the Business Sponsor.
- No full infrastructure-as-code requirement for Shopify Admin settings; manual configuration is documented here.

## Launch Readiness Evidence

Before launch, attach or reference the following evidence in the project's launch records:

| Evidence | Owner | Status |
|---|---|---|
| Active Shopify plan and store status confirmed | Business Sponsor | TBD |
| Primary domain or preview URL recorded | Product Owner | TBD |
| Theme name, version, status, and rollback target recorded | Store Staff Administrator / Engineering Lead | TBD |
| Product catalog, collections, pricing, and stock verified in Shopify Admin | Store Staff Administrator | TBD |
| Hosted checkout and payment test completed in Shopify test mode | Store Staff Administrator / Business Sponsor | TBD |
| Policy pages visible from storefront and checkout where applicable | Product Owner | TBD |
| Staff accounts use individual access, least privilege, and MFA | Store Staff Administrator | TBD |
| Third-party apps reviewed and approved where required | Business Sponsor | TBD |
| No self-managed commerce infrastructure exists for MVP | Engineering Lead / Solution Architect | TBD |

