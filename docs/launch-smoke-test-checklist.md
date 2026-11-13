# Launch Smoke-Test Checklist

## Document Control

| Field | Value |
|---|---|
| Product | Gaming Hardware E-Commerce Website |
| Project | ModernPc |
| Owner | Product Owner, to be named before launch |
| Test coordinator | Store Staff Administrator, to be named before launch |
| Business approver | Business Sponsor, to be named before launch |
| Last updated | 2026-11-13 |
| Related architecture | `docs/ard.md` |
| Related runbook | `docs/shopify-configuration-runbook.md` |
| Related staff readiness | `docs/staff-access-readiness.md` |
| Related requirement | REQ-004 |

This checklist provides repeatable launch evidence that the Shopify MVP foundation and critical sales flows are ready. Complete it against the launch candidate Shopify storefront, Shopify Admin, and hosted payment test mode before public launch.

## Smoke-Test Preconditions

| Item | Required State | Evidence to Record |
|---|---|---|
| Shopify platform status | Shopify status page shows no active incident affecting storefront, checkout, admin, payments, orders, or inventory for the launch window. | Screenshot or copied status summary with date and time checked. |
| Store availability | Store is active on an approved Shopify plan and reachable through the launch domain, Shopify preview URL, or `.myshopify.com` URL selected for testing. | Store URL, plan/status screenshot from Shopify Admin, and tester name. |
| Theme baseline | Theme name, version, preview/published state, and rollback target are recorded before testing starts. | Shopify Admin theme screenshot plus rollback target from `shopify-theme/README.md` or Admin theme copy. |
| Test products | At least one in-stock product and one out-of-stock product or out-of-stock variant exist for testing. | Product Admin screenshots showing product status, price, variant, and inventory quantity. |
| Payment test mode | Shopify Payments or approved hosted provider test mode is enabled only for the smoke-test window. | Payment settings screenshot showing test mode and approved provider. |
| Staff access | Testers use named Shopify staff accounts with MFA and roles aligned to their smoke-test duties. | Staff access register row or Shopify Admin users screenshot. |
| Policy content | Shipping, returns/refunds, privacy, and terms of service content is approved for smoke testing. | Shopify policy/page Admin screenshots and storefront URLs. |

## Smoke-Test Execution Log

Use one row per run. A run is launch-ready only when every required check below passes or has an approved launch exception.

| Run Date | Store URL | Theme / Version | Payment Provider Test Mode | Tester | Result | Evidence Location | Notes |
|---|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | Complete before launch approval. |

## Customer Storefront Browse

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-001 | Open the storefront home page using the launch URL. | Storefront loads over HTTPS without password, preview-only warnings, broken critical layout, or customer-visible setup text. | Browser screenshot with URL and timestamp. |
| ST-002 | Browse primary navigation and product collections for gaming PCs, gaming laptops, and gaming accessories where configured. | Collection pages load, show customer-facing products, and do not expose unpublished or admin-only content. | Screenshots of each collection and product counts or product tiles. |
| ST-003 | Open an in-stock product detail page. | Product title, images, price, description, availability, and add-to-cart action are visible. | Product page screenshot and matching Shopify Admin product record. |
| ST-004 | Use storefront search, filter, or sort controls where the launch theme exposes them. | Results update without errors and continue to show only storefront-available products. | Screenshot of result state or note that the selected theme does not expose the control. |

## Cart And Guest Checkout

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-005 | Add an in-stock product to the cart from the product detail page. | Cart contains the selected product, quantity, price, and subtotal. | Cart screenshot and product inventory screenshot before checkout. |
| ST-006 | Update cart quantity within available stock. | Cart subtotal and quantity update correctly. | Cart screenshot after quantity update. |
| ST-007 | Remove a cart line item. | Cart updates without the removed item and can return to an empty state. | Cart screenshot after removal. |
| ST-008 | Proceed from cart to checkout without signing in. | Guest checkout starts without requiring account registration before payment. | Checkout contact step screenshot showing guest flow. |
| ST-009 | Enter contact email, shipping address, billing address, and shipping method. | Checkout accepts required information and presents hosted payment collection. | Checkout screenshots with sensitive personal data masked in external evidence. |

## Hosted Payment Test Mode

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-010 | Complete a successful test-mode card payment through Shopify hosted checkout or the approved hosted payment provider. | Payment succeeds, Shopify records a paid or authorized order according to configured payment capture behavior, and no custom payment collection form is used. | Order confirmation screenshot, Shopify payment record, and provider transaction/reference record. |
| ST-011 | Complete a failed or declined test-mode payment. | Customer does not reach a confirmed order state and no paid order is created for the failed payment. | Failed checkout screenshot and Shopify order/payment search showing no paid order for the failed attempt. |
| ST-012 | Cancel or abandon payment from the hosted payment step where the provider supports this path. | Customer is returned to a non-confirmed state or checkout recovery state, and no successful order confirmation is shown. | Browser screenshot and Shopify checkout/order search result. |
| ST-013 | Confirm supported digital wallet test behavior where available in the approved hosted provider. | Digital wallet option works in test mode or is intentionally disabled before launch with Business Sponsor approval. | Provider/payment settings screenshot and test result note. |

## Order Confirmation And Admin Visibility

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-014 | Review the customer order confirmation after successful payment. | Confirmation page shows order number, purchased items, total, and customer-facing confirmation state only after payment success. | Order confirmation screenshot with personal data masked in external evidence. |
| ST-015 | Confirm Shopify sends or queues the customer order notification. | Shopify notification behavior is visible in order timeline, notification settings, or test inbox. | Order timeline screenshot or test inbox email header/screenshot. |
| ST-016 | Open the successful test order in Shopify Admin. | Order is visible with line items, customer contact/shipping details, payment status, transaction reference, and fulfillment status. | Shopify Admin order screenshot and order timeline screenshot. |
| ST-017 | Update manual fulfillment status or add an internal fulfillment note using the approved staff workflow. | Admin workflow supports manual order processing without external fulfillment integrations required for MVP launch. | Order timeline screenshot showing staff action and staff account. |
| ST-018 | Verify payment records for the successful order. | Shopify and hosted provider records show payment status, amount, and transaction/reference ID; raw card number, CVV, and full payment credentials are not visible. | Payment record screenshot from Shopify Admin and provider dashboard. |

## Stock Enforcement

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-019 | View an out-of-stock product or variant on the storefront. | Product availability communicates the out-of-stock state and does not allow checkout for unavailable quantity. | Product page screenshot and Shopify Admin inventory screenshot. |
| ST-020 | Attempt to add an out-of-stock product or unavailable quantity to cart. | Add-to-cart is blocked or cart quantity is limited to available stock. | Storefront/cart screenshot of blocked action or validation message. |
| ST-021 | Reduce inventory for a carted item below the cart quantity before payment, then continue checkout. | Checkout blocks completion for unavailable quantity or requires quantity correction before payment. | Shopify Admin inventory screenshot, cart/checkout validation screenshot, and order search showing no paid order for unavailable quantity. |
| ST-022 | Restore stock to the approved launch quantity after stock enforcement tests. | Shopify Admin inventory reflects the intended launch quantity and storefront availability updates. | Final inventory screenshot and product page screenshot. |

## Policy Page Availability

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-023 | Open shipping policy from storefront navigation, footer, or policy link location. | Shipping policy page is reachable by customers and contains approved launch content. | Policy page screenshot and URL. |
| ST-024 | Open returns/refunds policy from storefront navigation, footer, or policy link location. | Returns/refunds policy page is reachable by customers and contains approved launch content. | Policy page screenshot and URL. |
| ST-025 | Open privacy policy before checkout completion. | Privacy policy is reachable before purchase completion and contains approved launch content. | Policy page screenshot from storefront or checkout policy link. |
| ST-026 | Open terms of service from storefront navigation, footer, or checkout policy link location. | Terms of service page is reachable by customers and contains approved launch content. | Policy page screenshot and URL. |

## Security And Data-Handling Checks

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-027 | Inspect repository-managed theme code and documentation for payment capture behavior. | No custom card collection form, raw card field, CVV field, payment credential storage, or custom payment capture path exists in repository-managed code. | Search output or reviewer note with repository path and commit/reference. |
| ST-028 | Review Shopify metafields, product/order/customer notes, tags, and order timeline entries created during testing. | No raw card number, CVV, full payment credential, or sensitive payment credential fragment is stored in metafields, notes, tags, or timelines. | Shopify Admin screenshots or checklist note identifying reviewed areas. |
| ST-029 | Review logs, exports, downloaded evidence, and external launch documents created during smoke testing. | Evidence stores only masked customer data and payment references; no raw card data, CVV, full payment credentials, or unmasked sensitive payment details are stored outside Shopify/provider systems. | Evidence folder review note and sample redacted evidence screenshot. |
| ST-030 | Review installed Shopify apps and sales channels. | Any app with customer, order, or payment-reference access has Business Sponsor approval; unapproved apps are removed before launch. | Apps and sales channels screenshot plus approval reference where needed. |
| ST-031 | Confirm Admin access used for smoke testing. | Only named staff accounts with MFA perform Admin checks; no shared admin credentials are used. | Staff access register reference or Shopify Admin user/security screenshot. |

## Platform Status And Operational Dashboards

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-032 | Review Shopify Admin dashboards after the successful test order. | Dashboard/order summary reflects the test order consistently with the order record. | Shopify Admin dashboard screenshot. |
| ST-033 | Review order records and payment records for reconciliation. | Order total, payment total, transaction/reference ID, customer email, and line items reconcile across order and payment records. | Reconciliation note with order ID and provider reference ID; do not record raw card data. |
| ST-034 | Review Shopify platform status at test start and immediately before launch approval. | No relevant active incident remains open for storefront, checkout, Admin, payments, orders, inventory, or customer notifications. | Status screenshots or copied summaries with timestamps. |

## Rollback Validation

| ID | Check | Expected Result | Evidence |
|---|---|---|---|
| ST-035 | Confirm theme rollback target. | Prior known-good published theme, unpublished theme copy, or version-controlled theme release is identified and restorable. | Shopify Admin theme screenshot and rollback note. |
| ST-036 | Confirm payment rollback path. | Store staff know how to disable test mode, disable failed or unapproved payment methods, and restore the last verified hosted payment configuration without adding custom payment capture. | Payment settings screenshot and rollback owner note. |
| ST-037 | Confirm catalog, price, and stock rollback path. | Incorrect product, price, collection, or inventory values can be corrected directly in Shopify Admin and retested through storefront/cart/checkout. | Product/inventory Admin screenshot and rollback owner note. |
| ST-038 | Confirm policy rollback path. | Last approved shipping, returns/refunds, privacy, and terms content is available for restoration in Shopify pages/policies. | Policy Admin screenshot or approved policy source reference. |
| ST-039 | Confirm app/access rollback path. | Unapproved apps can be removed and incorrect staff access can be suspended or corrected before launch resumes. | Apps screenshot, staff access screenshot, and named rollback owner. |
| ST-040 | Confirm launch hold decision path. | Product Owner and Business Sponsor can hold launch if storefront, checkout, payment, order, stock, policy, security, platform, or rollback checks fail. | Approval record naming decision makers and launch gate status. |

## Launch Gate

Launch smoke testing passes only when all of the following are true:

- Storefront browse, cart, guest checkout, hosted payment test mode, order confirmation, Admin order visibility, stock enforcement, policy availability, and Shopify platform status checks have passed.
- Evidence is captured from Shopify dashboards, Shopify Admin order records, hosted payment records, provider transaction/reference records, and admin workflow checks.
- One successful test-mode paid order flow is completed end-to-end and reconciles across confirmation page, Shopify order record, and hosted payment record.
- Failed, canceled, or out-of-stock checkout attempts do not create paid confirmed orders.
- No raw card number, CVV, full payment credential, or unmasked payment credential data is stored in custom code, Shopify metafields, notes, logs, exports, or external launch documents.
- Test mode is disabled or production payment settings are restored before public launch, according to the approved payment provider process.
- Rollback owners and rollback targets are recorded for theme, payment, catalog/stock, policy content, apps, and staff access.

## Launch Approval Record

| Approval Area | Owner | Result | Evidence Location | Approval Date | Notes |
|---|---|---|---|---|---|
| Storefront, cart, and checkout | Product Owner | TBD | TBD | TBD | TBD |
| Hosted payment and order records | Business Sponsor | TBD | TBD | TBD | TBD |
| Admin order workflow and stock | Store Staff Administrator | TBD | TBD | TBD | TBD |
| Policy pages | Product Owner | TBD | TBD | TBD | TBD |
| Security and no raw card data | Engineering Lead / Solution Architect | TBD | TBD | TBD | TBD |
| Platform status and rollback | Product Owner / Business Sponsor | TBD | TBD | TBD | TBD |
