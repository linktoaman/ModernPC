# Architecture Requirements Document (ARD)

> Replace all `<PLACEHOLDER>` values. Every material architecture decision or constraint should have a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** Gaming Hardware E-Commerce Website
- **Document ID:** ARD-GAMING-ECOM
- **Version:** 0.1
- **Status:** Draft
- **Architecture Owner:** TBD — Product Owner to assign; see ARC-OQ-001
- **Contributors:** Product Owner, Business Sponsor, Store Staff Administrator, Solution Architect
- **Last Updated:** 2026-11-13
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

The MVP architecture uses Shopify as a hosted commerce platform for the public storefront, product catalog, cart, checkout, payment handoff, order records, customer checkout data, inventory availability, basic administration, and policy pages. Shopify Online Store provides the customer-facing storefront using a configured theme with minimal Liquid/theme customization. Shopify Admin provides staff tools for products, categories, prices, stock, order status, and manual fulfillment workflows.

Shopify is the system of record for product catalog, stock, customer checkout data, and orders. Shopify Payments is the preferred hosted payment provider where available, reducing PCI exposure by ensuring the solution does not store raw payment card details. Store staff use Shopify native staff accounts, least-privilege roles, and multi-factor authentication. Fulfillment remains manually managed using Shopify order and fulfillment status fields without carrier integrations at MVP launch.

The primary architectural drivers are speed to launch for a small business, secure hosted payment handling, customer/order data privacy, basic operational control for staff, and validation of at least one successful paid online order end-to-end.

## 2. Architecture Drivers

- PRD-FR-001 — Customers must browse gaming PCs, gaming laptops, and gaming accessories by category.
- PRD-FR-002 — Customers must search, filter, and sort product listings.
- PRD-FR-003 — Customers must view product details and purchase only in-stock products.
- PRD-FR-004 — Customers must manage cart contents before checkout.
- PRD-FR-005 — Customers must complete guest checkout with optional account creation after purchase.
- PRD-FR-006 — Checkout must collect contact email, shipping address, billing address, shipping method, and payment details through hosted payment.
- PRD-FR-007 — The solution must support card and digital wallet payments through hosted checkout.
- PRD-FR-008 — Customers must receive basic order confirmation after successful payment.
- PRD-FR-009 — The solution must show availability and block out-of-stock checkout.
- PRD-FR-010 — Staff must support manually managed fulfillment for shipped physical products.
- PRD-FR-011 — Staff must manage products, categories, prices, stock, and order status.
- PRD-FR-012 — The storefront must expose shipping, returns/refunds, privacy, and terms of service pages.
- PRD-NFR-001 — The system must not store raw card details and must rely on hosted payment status.
- PRD-NFR-002 — Customer contact, address, order, and payment-reference data must be protected from unauthorized public access.
- CON-001 — The small-business MVP prioritizes essential storefront and operational capabilities over advanced commerce features.
- CON-002 — Payment collection must use hosted checkout for card and digital wallet payments.
- CON-003 — Fulfillment must be manual at launch, without carrier rates, labels, or tracking integrations.
- CON-004 — Shipping, returns/refunds, privacy, and terms of service policies must be visible at launch.
- CON-005 — Target release date is TBD pending business planning.

## 3. Architecture Principles

1. Prefer managed SaaS commerce capabilities over custom implementation where they satisfy MVP requirements.
2. Reduce payment and infrastructure risk by keeping cardholder data and platform operations inside Shopify-managed services.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Minimize custom code and third-party app footprint unless needed to satisfy an approved PRD requirement.
6. Preserve operational simplicity so store staff can manage catalog, stock, orders, and fulfillment status without developer intervention.

## 4. System Context

### 4.1 Actors

- PC Gamer Customer — Browses products, searches/filters/sorts the catalog, manages cart, completes guest checkout, pays through hosted checkout, and views order confirmation.
- Store Staff Administrator — Uses Shopify Admin to manage products, categories, pricing, stock, order status, and manual fulfillment progress.
- Product Owner — Owns launch readiness, policy content availability, and open product/architecture decisions.
- Business Sponsor — Owns commercial approval, target launch timing, and business acceptance.
- Shopify Platform — Hosts storefront, catalog, cart, checkout, admin, orders, customer checkout data, stock, policies, and operational dashboards.
- Shopify Payments — Processes card and digital wallet payments through hosted payment handling where available.
- Customer Email Notification Service — Sends Shopify-managed order and checkout-related email notifications.
- Staff-Managed Shipping Process — External manual operational process used by staff to ship paid orders to customer-provided addresses.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Shopify Online Store and Admin | Hosted storefront, catalog, cart, checkout, admin, inventory, customers, orders, policies, and dashboards | SaaS Web UI / Platform APIs | Shopify / Business |
| EXT-002 | Shopify Payments | Hosted card and digital wallet payment processing with payment status returned to Shopify | Hosted checkout / Payment platform integration | Shopify / Payment provider |
| EXT-003 | Shopify Email Notifications | Customer order and checkout email notifications managed from Shopify | Event-triggered email | Shopify / Business |
| EXT-004 | Staff-Managed Shipping Process | Manual picking, packing, shipping, and fulfillment status updates outside carrier integration | Manual operational workflow | Business |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | Shopify Online Store theme with Liquid/theme configuration | Shopify-hosted current platform; minimal theme customization | Satisfies product discovery, cart, checkout entry, and policy pages quickly with low operational burden |
| Backend | Shopify commerce platform | Shopify SaaS managed service | Provides catalog, cart, checkout, orders, customers, stock, admin, and fulfillment status without custom backend build |
| Data | Shopify-managed data stores | Shopify SaaS managed storage | Keeps catalog, stock, orders, and customer checkout data in one system of record |
| Hosting | Shopify managed SaaS hosting | Shopify owns infrastructure operations | Fits small-business MVP and avoids self-managed infrastructure |
| Payments | Shopify Payments where available | Hosted payment provider checkout; no raw card data stored by the solution | Meets hosted payment and PCI scope-reduction needs |
| Notifications | Shopify customer email notifications | Shopify-managed templates/events | Supports basic order and checkout communications without custom notification infrastructure |
| Development Tooling | Version control for customized theme code; Shopify theme tooling where used | Exact repository/tool versions TBD; see ARC-OQ-005 | Enables controlled theme changes and rollback when customization exists |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — Shopify Storefront Theme

- **Responsibility:** Present public storefront, category pages, product detail pages, product search/filter/sort UI, cart UI, checkout entry points, and policy pages.
- **Inputs:** Product catalog, categories, prices, stock availability, policy content, customer browsing and cart actions.
- **Outputs:** Rendered storefront pages, cart updates, checkout initiation, policy page views.
- **Dependencies:** COMP-002, COMP-003, COMP-004, EXT-001.
- **Repository Area:** `shopify-theme/` if customized; otherwise Shopify Admin theme configuration.

#### COMP-002 — Shopify Catalog and Inventory

- **Responsibility:** Store and expose products, categories/collections, pricing, product availability, and stock values.
- **Inputs:** Staff-administered product, category, price, and stock updates.
- **Outputs:** Catalog listings, product details, availability checks, cart stock validation.
- **Dependencies:** COMP-005, EXT-001.
- **Repository Area:** Shopify Admin; configuration documentation TBD; see ARC-OQ-005.

#### COMP-003 — Shopify Cart and Checkout

- **Responsibility:** Maintain cart contents, enforce checkout prerequisites, collect checkout data, initiate hosted payment checkout, and prevent checkout when items are unavailable.
- **Inputs:** Cart line items, quantities, contact email, shipping address, billing address, shipping method, product availability, payment handoff request.
- **Outputs:** Checkout session, payment handoff, non-confirmed state on cancellation/failure, successful order on payment success.
- **Dependencies:** COMP-002, COMP-004, COMP-006, EXT-001, EXT-002.
- **Repository Area:** Shopify platform configuration; theme customization under `shopify-theme/` if needed.

#### COMP-004 — Shopify Payments Integration

- **Responsibility:** Process hosted card and digital wallet payments and return successful, failed, or canceled payment status to Shopify.
- **Inputs:** Checkout amount, customer checkout context, payment method selection, payment credentials entered in hosted checkout.
- **Outputs:** Payment status, payment provider transaction reference, payment failure/cancellation state.
- **Dependencies:** EXT-002.
- **Repository Area:** Shopify Admin payment configuration.

#### COMP-005 — Shopify Admin

- **Responsibility:** Provide staff administration for products, categories/collections, prices, stock, order status, staff accounts, roles, MFA, and policy content.
- **Inputs:** Staff admin actions, role assignments, policy content, fulfillment status updates.
- **Outputs:** Updated catalog, stock, orders, fulfillment status, policy pages, audit history.
- **Dependencies:** EXT-001.
- **Repository Area:** Shopify Admin; configuration documentation TBD; see ARC-OQ-005.

#### COMP-006 — Shopify Orders and Fulfillment Status

- **Responsibility:** Store paid orders, order identifiers, customer contact and address data, line items, shipping method, payment reference, and manual fulfillment status.
- **Inputs:** Successful payment status, checkout data, staff fulfillment updates.
- **Outputs:** Order confirmation, fulfillment work queue, order status, order audit history.
- **Dependencies:** COMP-003, COMP-004, COMP-005, EXT-003, EXT-004.
- **Repository Area:** Shopify platform.

#### COMP-007 — Shopify Customer Email Notifications

- **Responsibility:** Send platform-managed order and checkout-related email notifications.
- **Inputs:** Order and checkout events, customer email address, notification templates.
- **Outputs:** Customer-facing transactional emails.
- **Dependencies:** COMP-006, EXT-003.
- **Repository Area:** Shopify Admin notification configuration.

#### COMP-008 — Manual Shipping Operations

- **Responsibility:** Pick, pack, ship physical products, and update Shopify order/fulfillment status manually.
- **Inputs:** Paid order details, shipping address, selected shipping method, staff operational actions.
- **Outputs:** Shipped product, updated order/fulfillment status.
- **Dependencies:** COMP-005, COMP-006, EXT-004.
- **Repository Area:** Not applicable; business operations procedure.

### 6.2 Data Flow

1. Store Staff Administrator enters or updates product, category, price, stock, and policy content in Shopify Admin.
2. Shopify Catalog and Inventory makes product data and availability available to the Shopify Storefront Theme.
3. PC Gamer Customer browses categories, searches, filters, sorts, and opens product detail pages on the storefront.
4. Shopify Storefront Theme submits cart actions to Shopify Cart and Checkout for in-stock products.
5. Shopify Cart and Checkout validates cart quantities against Shopify Catalog and Inventory before checkout.
6. PC Gamer Customer enters contact email, shipping address, billing address, and shipping method in Shopify Checkout.
7. Shopify Checkout hands payment collection to Shopify Payments hosted checkout and does not expose raw card details to custom code.
8. Shopify Payments returns payment success, failure, or cancellation status to Shopify Checkout.
9. On successful payment, Shopify Orders and Fulfillment Status creates or updates the paid order and stores the payment provider transaction reference.
10. Shopify Storefront Theme displays the order confirmation only for successful payment status.
11. Shopify Email Notifications sends customer order notifications from Shopify-managed events.
12. Store Staff Administrator uses Shopify Admin to view paid orders, fulfill manually, and update fulfillment/order status.

## 7. Architecture Decisions

### ARD-DEC-001 — Use Shopify as Hosted Commerce Platform

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-005, PRD-FR-006, PRD-FR-008, PRD-FR-009, PRD-FR-010, PRD-FR-011, PRD-FR-012, PRD-NFR-002

**Decision**

The MVP will use Shopify as the hosted commerce platform for storefront, catalog, cart, checkout, admin, orders, stock, customer checkout data, and policy pages.

**Rationale**

Shopify provides the required commerce capabilities with low custom engineering and managed operations, matching the small-business MVP constraint and reducing launch risk.

**Consequences**

- Faster MVP launch than building a custom commerce backend.
- Lower infrastructure and operational burden for the business.
- Architecture depends on Shopify platform capabilities, availability, admin workflows, and data model.
- Deep custom behavior may be constrained by Shopify platform boundaries.

**Alternatives Considered**

- Custom web application using managed cloud services — not selected because it increases implementation, payment, security, and operations scope for MVP.
- Headless commerce backend with custom frontend — not selected because the MVP does not require a fully custom frontend architecture.
- Static storefront with payment links — not selected because it does not sufficiently satisfy cart, stock enforcement, admin, and order management requirements.

### ARD-DEC-002 — Use Shopify Managed SaaS Hosting

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-002

**Decision**

Shopify managed SaaS hosting will host the storefront, checkout, admin, and commerce data services. The business will not operate self-managed servers for the MVP.

**Rationale**

Managed SaaS hosting is aligned with small-business capacity and avoids custom infrastructure, patching, scaling, and hosting operations.

**Consequences**

- Shopify owns infrastructure reliability, platform security controls, and core service operations.
- The business must monitor Shopify platform status and configure the store securely.
- Infrastructure-as-code coverage is limited because platform configuration is largely managed in Shopify Admin.

**Alternatives Considered**

- Cloud PaaS/serverless hosting — not selected because it still requires custom application development and operations.
- Self-managed virtual machines — not selected due to higher security and maintenance burden.
- On-premises hosting — not selected because it is misaligned with an online commerce MVP.

### ARD-DEC-003 — Use Shopify Payments Hosted Checkout Where Available

- **Status:** Accepted
- **Related Requirements:** PRD-FR-007, PRD-NFR-001

**Decision**

The MVP will use Shopify Payments where available for card and digital wallet payments through hosted payment handling.

**Rationale**

This satisfies secure hosted payment requirements, reduces PCI exposure, and avoids the need for the solution to store or process raw card details.

**Consequences**

- Payment success/failure is determined by Shopify payment status and transaction references.
- The solution must not store raw card numbers, CVV, or full payment credentials.
- Availability of Shopify Payments depends on market, business eligibility, and Shopify terms.

**Alternatives Considered**

- Stripe Checkout directly — not selected because Shopify-native payments better fits the selected hosted commerce platform.
- PayPal Checkout first — not selected as primary because the decision is to use platform-native payments where available.
- Provider TBD with adapter — not selected because Shopify-native payment is sufficient for MVP.

### ARD-DEC-004 — Treat Shopify as System of Record

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-009, PRD-FR-010, PRD-FR-011, PRD-NFR-002

**Decision**

Shopify will be the system of record for product catalog, categories/collections, stock, orders, customer checkout data, and payment references.

**Rationale**

A single Shopify system of record reduces data synchronization complexity and supports the MVP admin requirements without separate ERP, inventory, or order management integrations.

**Consequences**

- Staff must keep Shopify catalog and stock accurate.
- Data migration is not required for an existing e-commerce platform.
- Future integrations with accounting, ERP, shipping, or inventory systems may require data ownership reassessment.

**Alternatives Considered**

- Separate inventory system as catalog/stock source — not selected because MVP stock is admin-maintained.
- ERP/accounting system as system of record — not selected because no ERP dependency is in scope.
- TBD per data domain — not selected because MVP simplicity benefits from one system of record.

### ARD-DEC-005 — Use Shopify Native Staff Accounts, Roles, and MFA

- **Status:** Accepted
- **Related Requirements:** PRD-FR-011, PRD-NFR-002

**Decision**

Store staff administrators will use Shopify native staff accounts, least-privilege roles, and multi-factor authentication.

**Rationale**

Native Shopify identity controls satisfy MVP admin security needs without adding SSO complexity.

**Consequences**

- Staff access management happens in Shopify Admin.
- Role assignments and MFA enrollment become launch readiness tasks.
- A later company SSO integration may be considered if business identity maturity increases.

**Alternatives Considered**

- Company SSO integration — not selected because it is not required for MVP and may add setup overhead.
- Shared admin credentials — not selected because it weakens accountability and access control.
- Admin identity TBD — not selected because access control must be defined before launch.

### ARD-DEC-006 — Use Shopify Online Store Theme with Minimal Customization

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-012

**Decision**

The storefront will use a Shopify Online Store theme configured for the business with minimal Liquid/theme customization only where required.

**Rationale**

A theme-based storefront provides required MVP storefront capabilities while minimizing custom code, testing scope, maintenance burden, and deployment risk.

**Consequences**

- Theme configuration should be preferred over code customization.
- Customized theme code must be version controlled and checked before launch.
- Design flexibility is bounded by theme capabilities unless additional customization is approved.

**Alternatives Considered**

- Fully custom headless frontend — not selected because MVP requirements do not justify added complexity.
- Off-the-shelf theme with no code customization — not selected as a hard rule because minor customization may be needed.
- Third-party page builder app — not selected as the primary layer because it adds vendor dependency and possible performance/security risk.

### ARD-DEC-007 — Manage Manual Fulfillment in Shopify Admin

- **Status:** Accepted
- **Related Requirements:** PRD-FR-010, PRD-FR-011

**Decision**

Manual shipping operations will use Shopify Admin order and fulfillment status fields without carrier rate, label, or tracking integrations at launch.

**Rationale**

This satisfies MVP fulfillment support while respecting the PRD scope that integrated carrier rates, labels, and tracking are out of scope.

**Consequences**

- Staff are responsible for shipping execution outside Shopify integrations.
- Order details and status remain visible in Shopify Admin.
- Manual process quality depends on staff training and operational discipline.

**Alternatives Considered**

- Shipping app for labels and tracking from launch — not selected because carrier integration is out of MVP scope.
- Spreadsheet-based fulfillment tracking — not selected because it fragments order status from Shopify.
- External warehouse/fulfillment system — not selected because it is not in MVP scope.

### ARD-DEC-008 — Use Shopify Defaults for Retention with Manual Privacy Request Handling

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-002

**Decision**

Customer and order data will be retained according to Shopify defaults, with deletion/export requests handled manually as needed through Shopify-supported workflows.

**Rationale**

The MVP has no approved custom retention period and relies on Shopify as system of record, so default platform retention plus manual privacy operations is the simplest viable posture.

**Consequences**

- A formal retention schedule remains an open policy/architecture question.
- Privacy request handling requires documented staff procedure.
- Any legal retention requirements must be resolved before expanding beyond MVP.

**Alternatives Considered**

- Indefinite retention without deletion/export support — not selected because it weakens privacy posture.
- Automatic deletion after a short fixed period — not selected because no retention period is approved.
- Retention TBD with no interim posture — not selected because MVP needs an operational approach.

### ARD-DEC-009 — Use Lightweight Shopify-Centered Observability

- **Status:** Accepted
- **Related Requirements:** PRD-FR-007, PRD-FR-008, PRD-FR-010, PRD-NFR-001, PRD-NFR-002

**Decision**

The MVP will use Shopify admin dashboards, payment records, order audit history, basic storefront analytics, and Shopify platform status for observability.

**Rationale**

Shopify-centered observability is sufficient for a small-business MVP with managed SaaS hosting and limited custom code.

**Consequences**

- No separate centralized log aggregation is required for MVP unless custom apps are added.
- Launch validation depends on smoke tests, Shopify dashboards, and order/payment records.
- Advanced synthetic monitoring may be added later if traffic or operational maturity increases.

**Alternatives Considered**

- External monitoring and centralized logging from launch — not selected because MVP platform operations are Shopify-managed.
- Customer reports only — not selected because it lacks adequate launch visibility.
- Observability TBD — not selected because basic launch observability must be defined.

### ARD-DEC-010 — Version Control Customized Theme Code and Document Manual Configuration

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-012, PRD-NFR-002

**Decision**

Any customized Shopify theme code will be version controlled. Manual Shopify configuration changes will be documented. Rollback will revert theme versions and configuration changes.

**Rationale**

This provides change control without overbuilding infrastructure automation for a Shopify SaaS MVP.

**Consequences**

- Some configuration may remain manual and must be documented accurately.
- Rollback depends on known-good theme versions and configuration records.
- Full infrastructure-as-code is not required for MVP.

**Alternatives Considered**

- Direct Shopify Admin changes with no version control — not selected because it weakens rollback and auditability.
- Full infrastructure-as-code for all Shopify configuration — not selected because it is more than the MVP needs and Shopify coverage may be limited.
- Change management TBD — not selected because launch requires controlled rollback.

## 8. API and Integration Architecture

### ARD-API-001 — Customer Storefront Web Interface

- **Type:** REST
- **Operation/Topic:** `HTTPS Shopify storefront pages and cart actions`
- **Provider:** COMP-001, COMP-002, COMP-003
- **Consumers:** PC Gamer Customer browsers
- **Authentication:** Public storefront access; session/cart cookies managed by Shopify where applicable
- **Versioning:** Shopify platform-managed storefront/theme versioning; customized theme changes version controlled

**Request/Input Contract**

Customer browser requests category pages, product detail pages, search/filter/sort URLs, cart actions, and policy pages using Shopify storefront routes and theme forms/links.

**Response/Output Contract**

Rendered HTML storefront pages, product listings, product detail content, cart views, validation messages, checkout entry points, and policy pages.

**Error Handling**

Out-of-stock and invalid quantity states show customer-facing messages and block checkout where required by PRD-FR-004 and PRD-FR-009. Platform errors are handled by Shopify default storefront behavior and launch smoke tests.

### ARD-API-002 — Shopify Hosted Checkout and Payment Handoff

- **Type:** REST
- **Operation/Topic:** `HTTPS hosted checkout and payment flow`
- **Provider:** COMP-003, COMP-004
- **Consumers:** PC Gamer Customer browsers, Shopify Payments
- **Authentication:** Shopify checkout session and hosted payment provider controls
- **Versioning:** Shopify platform-managed checkout and payments versioning

**Request/Input Contract**

Checkout receives cart line items, contact email, shipping address, billing address, selected shipping method, and payment method selection. Raw payment card details are entered only into hosted payment provider controls.

**Response/Output Contract**

Checkout returns successful payment status and transaction reference to Shopify for paid orders, or failure/cancellation status for non-confirmed checkout states.

**Error Handling**

Payment failure or cancellation returns the customer to a non-confirmed order state. Order confirmation is only available when Shopify records successful payment status. Idempotency and duplicate payment prevention rely on Shopify checkout/payment platform controls.

### ARD-API-003 — Shopify Admin Interface

- **Type:** REST
- **Operation/Topic:** `HTTPS Shopify Admin UI and platform operations`
- **Provider:** COMP-005, COMP-006
- **Consumers:** Store Staff Administrator
- **Authentication:** Shopify staff account authentication with MFA
- **Versioning:** Shopify platform-managed Admin versioning

**Request/Input Contract**

Authorized staff submit product, category/collection, price, stock, policy, order status, and fulfillment status changes through Shopify Admin.

**Response/Output Contract**

Shopify persists administrative changes, updates storefront-visible data where applicable, and records order/admin history according to Shopify platform behavior.

**Error Handling**

Unauthorized access is blocked by Shopify authentication and role controls. Invalid admin inputs are rejected by Shopify validation. Staff resolve operational data errors through Shopify Admin edits.

### ARD-API-004 — Shopify Customer Email Notifications

- **Type:** Event
- **Operation/Topic:** `Shopify order and checkout notification events`
- **Provider:** COMP-007
- **Consumers:** PC Gamer Customer email inboxes
- **Authentication:** Shopify-managed email sending controls
- **Versioning:** Shopify notification template configuration versioning; manual change documentation required

**Request/Input Contract**

Shopify order and checkout events trigger configured notification templates using customer email address and order context.

**Response/Output Contract**

Customer receives transactional email notifications generated from Shopify-managed templates.

**Error Handling**

Email delivery visibility is limited to Shopify-managed notification behavior. Failed or missed communications are resolved by staff using Shopify order records and customer contact email.

### ARD-API-005 — Manual Shipping Operations Interface

- **Type:** File
- **Operation/Topic:** `Manual order detail review and fulfillment status update`
- **Provider:** COMP-006, COMP-008
- **Consumers:** Store Staff Administrator, Staff-Managed Shipping Process
- **Authentication:** Shopify staff account authentication with MFA for order access
- **Versioning:** Business operations procedure versioning TBD; see ARC-OQ-006

**Request/Input Contract**

Staff review paid order details, shipping address, selected shipping method, and line items in Shopify Admin for manual shipment handling.

**Response/Output Contract**

Staff ship products using the manual process and update Shopify order/fulfillment status.

**Error Handling**

Manual fulfillment exceptions are handled by staff through Shopify order status updates and customer contact using stored order information. No carrier retry or automated label workflow is in scope.

## 9. Data Architecture

### DATA-001 — Product

- **Purpose:** Represents gaming PCs, gaming laptops, and gaming accessories sold through the storefront.
- **System of Record:** Shopify
- **Classification:** Internal
- **Retention:** Retained according to Shopify defaults and business catalog operations; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Belongs to categories/collections; has price, availability, stock, cart line items, and order line items.

### DATA-002 — Category/Collection

- **Purpose:** Organizes products for storefront category browsing.
- **System of Record:** Shopify
- **Classification:** Public
- **Retention:** Retained according to Shopify defaults and business catalog operations; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Contains products; appears in storefront navigation and category pages.

### DATA-003 — Stock/Inventory Quantity

- **Purpose:** Determines product availability and prevents checkout for unavailable quantities.
- **System of Record:** Shopify
- **Classification:** Internal
- **Retention:** Retained according to Shopify defaults and inventory history behavior; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Associated with products; validated by cart and checkout.

### DATA-004 — Cart

- **Purpose:** Holds customer-selected products and quantities before checkout.
- **System of Record:** Shopify
- **Classification:** Internal
- **Retention:** Managed by Shopify cart/session behavior; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Contains product line items and quantities; converts into checkout/order on successful payment.

### DATA-005 — Checkout

- **Purpose:** Captures customer contact, shipping, billing, shipping method, and payment handoff state before order confirmation.
- **System of Record:** Shopify
- **Classification:** Confidential
- **Retention:** Retained according to Shopify defaults and privacy request workflows; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Contains cart line items, customer contact email, addresses, shipping method, payment handoff, and successful/failed/canceled state.

### DATA-006 — Order

- **Purpose:** Records successful paid purchases, order identifier, order summary, fulfillment status, and payment transaction reference.
- **System of Record:** Shopify
- **Classification:** Confidential
- **Retention:** Retained according to Shopify defaults and privacy request workflows; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Contains customer contact/address data, line items, payment reference, shipping method, and fulfillment status.

### DATA-007 — Customer Contact and Address Data

- **Purpose:** Enables order confirmation, fulfillment, customer contact, and optional account creation after purchase.
- **System of Record:** Shopify
- **Classification:** Confidential
- **Retention:** Retained according to Shopify defaults with manual deletion/export handling as needed; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Associated with checkout, order, and optional customer account.

### DATA-008 — Payment Transaction Reference

- **Purpose:** Records hosted payment outcome without storing raw card details.
- **System of Record:** Shopify / Shopify Payments
- **Classification:** Confidential
- **Retention:** Retained according to Shopify and Shopify Payments defaults; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Associated with checkout and order; no raw card number, CVV, or full payment credentials are stored by the solution.

### DATA-009 — Policy Content

- **Purpose:** Provides storefront-visible shipping, returns/refunds, privacy, and terms of service policy pages.
- **System of Record:** Shopify
- **Classification:** Public
- **Retention:** Retained according to Shopify defaults and business policy update practices; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Referenced from storefront and checkout where applicable.

### DATA-010 — Staff Account and Role Data

- **Purpose:** Controls authorized staff access to Shopify Admin.
- **System of Record:** Shopify
- **Classification:** Confidential
- **Retention:** Retained according to Shopify account and audit behavior; formal retention policy TBD; see ARC-OQ-003
- **Key Relationships:** Governs access to product, order, customer, stock, and policy administration.

### Data Migration

- **Required:** No
- **Approach:** No existing e-commerce migration is in scope. Initial product catalog, categories, prices, stock, and policy content will be entered or imported into Shopify as launch setup activities.

## 10. Security Architecture

### ARD-SEC-001 — Hosted Payment and PCI Scope Reduction

- **Related Requirements:** PRD-FR-007, PRD-NFR-001

The implementation must:

- Use Shopify Payments hosted payment handling where available for card and digital wallet payments.
- Store only payment provider transaction references and payment status needed for order processing.
- Confirm order placement and show order confirmation only after Shopify records successful payment status.
- Maintain payment configuration in Shopify Admin with access limited to authorized staff.

The implementation must not:

- Store raw card numbers, CVV, or full payment credentials in custom theme code, Shopify metafields, notes, logs, exports, or external documents.
- Build custom payment collection forms outside hosted payment provider controls for MVP.
- Treat a canceled or failed payment as a confirmed order.

### ARD-SEC-002 — Customer and Order Data Protection

- **Related Requirements:** PRD-NFR-002

The implementation must:

- Restrict administrative access to customer contact, address, order, and payment-reference data to authorized Shopify staff accounts.
- Prevent public users from viewing another customer’s order details by changing an order identifier or URL.
- Use Shopify platform authorization and order access controls for order confirmation and customer/order data views.
- Keep privacy policy access visible before purchase completion.

The implementation must not:

- Expose customer contact, address, order, or payment-reference data through public storefront pages or theme code.
- Share staff credentials across users.
- Export customer/order data outside Shopify unless needed for approved manual operations or privacy request handling.

### ARD-SEC-003 — Staff Access Control

- **Related Requirements:** PRD-FR-011, PRD-NFR-002

The implementation must:

- Use individual Shopify staff accounts for administrators.
- Require multi-factor authentication for staff accounts.
- Apply least-privilege roles aligned to product, order, stock, policy, and configuration responsibilities.
- Review staff access before launch and after staff changes.

The implementation must not:

- Use shared admin accounts for routine administration.
- Grant broad owner-level privileges to staff who only need catalog or order operations.
- Leave inactive staff accounts enabled.

### ARD-SEC-004 — Custom Code and Dependency Security

- **Related Requirements:** PRD-NFR-001, PRD-NFR-002

The implementation must:

- Minimize custom theme code and third-party apps.
- Run dependency/CVE checks for any custom theme tooling, build tooling, or custom apps introduced.
- Block release when known critical or high security issues exist in custom code dependencies unless formally accepted by the Business Sponsor and Security Reviewer.
- Produce an SBOM for custom code if custom code or custom apps are introduced.

The implementation must not:

- Install third-party apps that can access customer/order/payment-reference data without business approval.
- Include secrets, tokens, customer data, or payment references in version control.
- Suppress critical/high security findings without documented approval.

### Security Controls

- **Authentication:** Shopify native customer/session controls for storefront and checkout; Shopify staff accounts with MFA for admin users.
- **Authorization:** Shopify platform authorization, least-privilege staff roles, and no shared admin credentials.
- **Secrets Management:** Store payment and platform secrets only in Shopify-managed configuration or approved secret stores for custom code; no secrets in repository or theme templates.
- **Encryption:** TLS for storefront, admin, and checkout traffic; Shopify-managed encryption at rest for platform data.
- **Audit Logging:** Shopify order history, admin activity/audit capabilities, payment records, and documented manual configuration changes.
- **Dependency/CVE Scanning:** Required for custom theme tooling, custom apps, and repository dependencies; release blocks on known critical/high issues unless formally accepted.
- **SBOM:** Required for custom code or custom apps if introduced; not applicable to unmodified Shopify SaaS components.

## 11. Reliability, Performance, and Scalability

### ARD-OPS-001 — Launch Transaction Reliability

- **Target:** One test-mode paid order flow must complete end-to-end before launch, including product browse, cart, guest checkout, hosted payment success, order record creation, order confirmation, and staff order visibility.
- **Validation Method:** Manual end-to-end checkout smoke test using Shopify test mode and verification of Shopify order/payment records.

### ARD-OPS-002 — Platform Availability

- **Target:** Shopify platform status must show no active incident blocking storefront, checkout, payment, or admin operations at launch readiness review.
- **Validation Method:** Check Shopify platform status and complete launch smoke tests for storefront, checkout, payment, and admin workflows.

### ARD-OPS-003 — Stock Enforcement Reliability

- **Target:** Out-of-stock products cannot be added to cart or checked out during launch validation.
- **Validation Method:** Manual stock enforcement test using in-stock, low-stock, and out-of-stock product scenarios.

### ARD-OPS-004 — Admin Operational Readiness

- **Target:** Store staff can create/edit/deactivate products, update categories, prices, stock, and order status in Shopify Admin before launch.
- **Validation Method:** Admin workflow smoke test performed by or with Store Staff Administrator.

### ARD-OPS-005 — Storefront Performance

- **Target:** Quantitative page-load threshold is TBD; see ARC-OQ-004.
- **Validation Method:** Launch smoke test confirms key storefront pages render successfully and checkout can be completed; quantitative performance testing pending threshold decision.

### ARD-OPS-006 — Scalability

- **Target:** MVP uses Shopify managed platform scalability; no custom traffic scaling target is defined for flash-sale or high-launch-traffic scenarios because they are out of PRD scope.
- **Validation Method:** Confirm no custom infrastructure exists requiring business-operated scaling and verify Shopify plan/capabilities are active before launch.

## 12. Observability

- **Logging:** Use Shopify order history, admin activity/audit capabilities, payment records, and documented manual change records; custom code logs are required only if custom apps are introduced.
- **Metrics:** Use Shopify dashboards, payment records, order counts, checkout completion evidence, and basic storefront analytics to validate KPI-001 and KPI-002 from the PRD.
- **Tracing:** No distributed tracing is required for the Shopify SaaS MVP; custom tracing is TBD if custom apps are introduced.
- **Alerting:** Use Shopify platform status, Shopify/payment notifications where available, and staff launch monitoring of orders/payments; external synthetic alerting is not required for MVP.
- **Sensitive Data Restrictions:** Logs, analytics, exports, and change records must not include raw card details, CVV, full payment credentials, secrets, or unnecessary customer contact/address data.

## 13. Deployment Architecture

- **Environments:** Shopify development/theme preview or unpublished theme for configuration and testing; production Shopify store for launch; separate stage environment is TBD if needed; see ARC-OQ-007.
- **Deployment Model:** Shopify SaaS deployment with Online Store theme publishing and Shopify Admin configuration changes.
- **CI/CD:** Version control and checks for customized theme code where customized; manual Shopify Admin configuration documented; exact CI/CD tooling TBD; see ARC-OQ-005.
- **Configuration Management:** Shopify Admin configuration documented in launch/configuration runbook; sensitive configuration managed in Shopify platform settings.
- **Rollback:** Revert to prior known-good Shopify theme version and reverse documented configuration changes; payment/admin platform rollback follows Shopify platform controls.
- **Infrastructure as Code:** Full infrastructure-as-code is not required for MVP because hosting is Shopify SaaS; repository-managed theme code and documented configuration provide MVP change control.

## 14. Testing Architecture

Required test levels:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests
- Security tests
- Performance tests, where applicable

Minimum quality expectations:

- **Coverage Threshold:** No numeric coverage threshold is required for unmodified Shopify SaaS configuration; custom theme code or custom apps must include tests/checks appropriate to changed code, with exact threshold TBD if substantial custom code is introduced; see ARC-OQ-008.
- **Blocking Security Severity:** Known critical or high security issues in custom code dependencies, custom apps, or selected third-party apps block release unless formally accepted by the Business Sponsor and Security Reviewer.
- **Required Build/Lint Checks:** Manual end-to-end checkout test in Shopify test mode, admin workflow smoke test, stock enforcement smoke test, policy page availability check, theme lint/checks where customized and available, dependency/CVE scan for custom code/tooling, and verification that no raw card data is stored.

## 15. Architecture Constraints

- ARC-CON-001 — The business is a small technology company; the MVP must prioritize essential storefront and operations capabilities over advanced commerce features.
- ARC-CON-002 — Shopify is the selected hosted commerce platform for the MVP.
- ARC-CON-003 — Shopify managed SaaS hosting is the selected operations model; no self-managed servers are in MVP scope.
- ARC-CON-004 — Payment collection must use hosted checkout for card and digital wallet payments and must not store raw card details.
- ARC-CON-005 — Shopify Payments is the preferred payment provider where available.
- ARC-CON-006 — Shopify is the system of record for catalog, stock, customer checkout data, orders, and payment references.
- ARC-CON-007 — Fulfillment must be manually managed at launch without integrated carrier rates, label generation, or tracking.
- ARC-CON-008 — Customer-facing shipping, returns/refunds, privacy, and terms of service pages must be visible at launch.
- ARC-CON-009 — Store staff administration must use individual Shopify staff accounts, least-privilege roles, and MFA.
- ARC-CON-010 — Customer contact, address, order, and payment-reference data must be protected from unauthorized public access.
- ARC-CON-011 — Custom theme code must be minimized; any customized code must be version controlled and checked before launch.
- ARC-CON-012 — Target release date remains TBD pending Product Owner decision.
- ARC-CON-013 — No existing e-commerce data migration is in scope for the MVP.
- ARC-CON-014 — Third-party apps with access to customer/order/payment-reference data require business approval before installation.

## 16. Risks and Trade-offs

| ID | Risk/Trade-off | Impact | Mitigation |
|---|---|---|---|
| ARC-RISK-001 | Shopify Payments may not be available or approved for the business location/account | Hosted payment readiness could be delayed | Validate Shopify Payments eligibility early; if unavailable, select an approved Shopify-supported hosted payment provider under ARC-OQ-002 |
| ARC-RISK-002 | Manual stock maintenance can become inaccurate | Customers may see incorrect availability or staff may need manual remediation | Use Shopify stock management, block out-of-stock checkout, and perform stock smoke tests before launch |
| ARC-RISK-003 | Manual fulfillment process can create shipping/order status errors | Paid orders may be delayed or updated incorrectly | Use Shopify order/fulfillment status fields, staff training, and a documented fulfillment procedure |
| ARC-RISK-004 | Minimal custom code reduces flexibility | Some storefront design or behavior preferences may not be possible for MVP | Prefer configuration and defer non-essential custom behavior until after MVP validation |
| ARC-RISK-005 | SaaS dependency limits direct control over infrastructure and checkout internals | Outages or platform changes depend on Shopify response and capabilities | Monitor Shopify status, keep customizations small, and validate launch workflows with smoke tests |
| ARC-RISK-006 | Retention and privacy request procedures are not fully formalized | Privacy operations may be inconsistent | Document interim manual request handling and resolve formal retention policy under ARC-OQ-003 |
| ARC-RISK-007 | Missing policy content can delay launch | Storefront may fail launch readiness or customer trust expectations | Product Owner ensures policy content exists before launch readiness review |

## 17. Open Architecture Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| ARC-OQ-001 | Who is the named Architecture Owner for this ARD? | Product Owner | Open | TBD |
| ARC-OQ-002 | If Shopify Payments is unavailable or not approved, which Shopify-supported hosted payment provider will be used? | Product Owner | Open | TBD |
| ARC-OQ-003 | What formal retention schedule applies to customer, order, checkout, inventory, and admin audit data? | Product Owner | Open | TBD |
| ARC-OQ-004 | What quantitative storefront page-load performance threshold should be used after traffic expectations are known? | Product Owner | Open | TBD |
| ARC-OQ-005 | What exact repository, Shopify theme tooling, and CI/CD workflow will be used for customized theme code? | Engineering Lead | Open | TBD |
| ARC-OQ-006 | What versioned business procedure will govern manual shipping operations and exception handling? | Store Staff Administrator | Open | TBD |
| ARC-OQ-007 | Is a separate staging Shopify store required, or is unpublished theme preview sufficient for MVP testing? | Product Owner | Open | TBD |
| ARC-OQ-008 | If substantial custom code or custom apps are introduced, what numeric automated test coverage threshold is required? | Engineering Lead | Open | TBD |

## 18. Feature Mapping

| Feature | Relevant Components | Decision IDs | Interface IDs | Security IDs |
|---|---|---|---|---|
| FEAT-001 | COMP-001, COMP-002 | ARD-DEC-001, ARD-DEC-006, ARD-DEC-010 | ARD-API-001 | ARD-SEC-002, ARD-SEC-004 |
| FEAT-002 | COMP-001, COMP-002, COMP-003 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-006 | ARD-API-001, ARD-API-002 | ARD-SEC-002 |
| FEAT-003 | COMP-003, COMP-004, COMP-006 | ARD-DEC-001, ARD-DEC-003, ARD-DEC-004 | ARD-API-002 | ARD-SEC-001, ARD-SEC-002 |
| FEAT-004 | COMP-003, COMP-004, COMP-006 | ARD-DEC-003 | ARD-API-002 | ARD-SEC-001 |
| FEAT-005 | COMP-006, COMP-007, COMP-008 | ARD-DEC-004, ARD-DEC-007, ARD-DEC-009 | ARD-API-003, ARD-API-004, ARD-API-005 | ARD-SEC-002, ARD-SEC-003 |
| FEAT-006 | COMP-002, COMP-003 | ARD-DEC-001, ARD-DEC-004 | ARD-API-001, ARD-API-002 | ARD-SEC-002 |
| FEAT-007 | COMP-002, COMP-005, COMP-006 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-005, ARD-DEC-010 | ARD-API-003 | ARD-SEC-002, ARD-SEC-003, ARD-SEC-004 |
| FEAT-008 | COMP-001, COMP-005 | ARD-DEC-001, ARD-DEC-006, ARD-DEC-010 | ARD-API-001, ARD-API-003 | ARD-SEC-002 |

## 19. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Solution Architect | TBD | Pending | TBD |
| Security Reviewer | TBD | Pending | TBD |
| Engineering Lead | TBD | Pending | TBD |