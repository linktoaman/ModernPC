# Staff Access Readiness

## Document Control

| Field | Value |
|---|---|
| Product | Gaming Hardware E-Commerce Website |
| Project | ModernPc |
| Owner | Store Staff Administrator, to be named before launch |
| Business approver | Business Sponsor, to be named before launch |
| Last updated | 2026-11-13 |
| Related architecture | `docs/ard.md` |
| Related runbook | `docs/shopify-configuration-runbook.md` |
| Related requirement | REQ-003 |

This readiness record defines the secure Shopify Admin access baseline for launch. It is the evidence checklist for confirming that staff use individual accounts, multi-factor authentication, and least-privilege roles before they manage catalog, order, stock, policy, or store configuration duties.

## Access Baseline

| Control | Required Baseline | Evidence to Record Before Launch |
|---|---|---|
| Individual accounts | Every Shopify Admin user has a named individual staff account tied to one person. Shared admin credentials are not approved. | Staff access register completed with one row per person and no shared mailbox or group account used for daily administration. |
| MFA | Every staff account with Shopify Admin access has multi-factor authentication enabled before production work. | Shopify Admin user/security screen reviewed for each account and MFA status recorded in the staff access register. |
| Least privilege | Staff are assigned only the Shopify role or permissions needed for their assigned duties. Owner-level or full-admin access is limited to the accountable store owner and approved backup administrator. | Role assignment matrix completed and approved by the Store Staff Administrator and Business Sponsor. |
| Staff changes | Access is reviewed before launch and after every joiner, mover, or leaver event. | Review log updated with reviewer, date, change summary, removals, and residual risks. |

## Least-Privilege Role Matrix

Use Shopify native roles and permissions to implement these duty groups. If the Shopify plan exposes different role names, record the Shopify role name that best matches the allowed duties and keep disallowed duties removed.

| Duty Group | Allowed Duties | Disallowed Duties | Suggested Shopify Role Scope | Approval Required |
|---|---|---|---|---|
| Product management | Create, edit, and deactivate products; update product media, descriptions, category assignments, tags, and prices. | View or edit payment settings, staff accounts, apps, billing, customer payment references, and unrelated order data. | Product and collection administration only. | Store Staff Administrator |
| Stock operations | Update inventory quantities and availability for gaming PCs, gaming laptops, and accessories. | Edit payment settings, policies, staff accounts, apps, billing, and customer records unless needed for another approved duty. | Inventory administration only. | Store Staff Administrator |
| Order operations | View paid orders, shipping details, fulfillment status, and update manual fulfillment progress. | Edit products, prices, payment settings, policies, staff accounts, apps, or billing unless separately approved. | Orders and fulfillment administration only. | Store Staff Administrator |
| Policy content | Edit shipping, returns/refunds, privacy, and terms of service pages or policy configuration. | View full order/customer data, edit payments, staff accounts, apps, billing, or product pricing unless separately approved. | Online Store content and policy administration only. | Product Owner |
| Store configuration | Configure checkout, shipping, domains, notifications, theme settings, and approved storefront configuration. | Change billing ownership, install apps with customer/order/payment-reference access, or grant staff access without Business Sponsor approval. | Store settings administration with sensitive billing, staff, and app permissions withheld where Shopify supports separation. | Product Owner and Business Sponsor |
| Access administration | Invite, suspend, remove, and change roles for staff accounts according to this readiness record. | Daily catalog, order, and stock work unless separately approved; app installation without required business approval. | Users and permissions administration for the Store Staff Administrator and approved backup only. | Business Sponsor |
| Store owner / emergency backup | Perform owner-only recovery, billing, payment-provider, legal, and emergency access actions. | Routine operational use when a narrower staff role can complete the task. | Owner or full-admin access, limited to named accountable owner and named backup. | Business Sponsor |

## Staff Access Register

Complete this register from Shopify Admin before launch and keep it current after staff changes.

| Person | Business Role | Shopify Account Email | Duty Group(s) | Shopify Role / Permission Set | MFA Enabled | Shared Account Check | Approved By | Evidence Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Store Staff Administrator | Access administration and launch configuration | TBD | Access administration, store configuration | TBD | TBD | Must be individual | Business Sponsor | TBD | Name before launch. |
| Product Owner | Policy approval and launch readiness | TBD | Policy content | TBD | TBD | Must be individual | Business Sponsor | TBD | Name before launch if Admin access is required. |
| Catalog Manager | Product and stock maintenance | TBD | Product management, stock operations | TBD | TBD | Must be individual | Store Staff Administrator | TBD | Optional role if separate from administrator. |
| Order Fulfillment Staff | Manual fulfillment updates | TBD | Order operations | TBD | TBD | Must be individual | Store Staff Administrator | TBD | Optional role if separate from administrator. |
| Emergency Backup Administrator | Owner-level recovery backup | TBD | Store owner / emergency backup | TBD | TBD | Must be individual | Business Sponsor | TBD | Use only for recovery and owner-only actions. |

## Pre-Launch Review Steps

1. Open Shopify Admin `Settings > Users and permissions`.
2. Confirm every active staff user maps to a named person in the staff access register.
3. Confirm there are no shared daily-use admin accounts, shared mailboxes, contractor group accounts, or unused launch setup accounts.
4. Confirm MFA is enabled for every active staff account before production catalog, order, customer, payment-reference, stock, policy, or configuration work begins.
5. Compare each user role to the least-privilege role matrix and remove permissions outside the user's duty group.
6. Confirm only the accountable store owner and approved emergency backup have owner-level or full-admin permissions.
7. Confirm no staff role can install or approve third-party apps with customer, order, or payment-reference access without Business Sponsor approval.
8. Record the review result in the review log and update `docs/shopify-configuration-runbook.md` launch readiness evidence when the baseline passes.

## Post-Staff-Change Review Steps

Run this review after each joiner, mover, leaver, contractor end date, role change, or suspected account compromise.

1. Identify the staff change, effective date, and affected Shopify account.
2. For a joiner, create an individual account only after the duty group and approver are known.
3. For a mover, remove old-duty permissions before adding any new-duty permissions.
4. For a leaver or expired contractor, suspend or remove Shopify Admin access on the effective date.
5. Reconfirm MFA on any remaining active account.
6. Review recent Shopify Admin activity where available when removing access or responding to suspected compromise.
7. Update the staff access register and review log within one business day of the change.
8. Escalate to the Business Sponsor if owner-level access, billing, payment settings, or third-party app permissions were changed.

## Review Log

| Date | Review Type | Reviewer | Accounts Reviewed | Changes Made | Exceptions / Risks | Approver |
|---|---|---|---|---|---|---|
| 2026-11-13 | Baseline document created | Engineering Lead / Solution Architect | No live Shopify Admin accounts reviewed from repository task | Readiness evidence template created for Store Staff Administrator completion | Live Shopify Admin verification remains required before launch | Pending Product Owner and Business Sponsor review |

## Launch Gate

Staff access is launch-ready only when all of the following are true:

- Each active Shopify Admin user is listed in the staff access register as an individual named account.
- MFA is recorded as enabled for every listed active staff account.
- Each account has one or more duty groups and a Shopify role or permission set aligned to the least-privilege role matrix.
- Owner-level or full-admin access is limited to the accountable store owner and approved emergency backup.
- The pre-launch review log has a passing entry approved by the Store Staff Administrator and Business Sponsor.
