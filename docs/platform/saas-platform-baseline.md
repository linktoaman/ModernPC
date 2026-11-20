# SaaS Platform Baseline

## Document Control

| Field | Value |
|---|---|
| Product | ModernPC1 Dell Red Witch Gaming Store |
| Document owner | Engineering Lead |
| Business owner | Product Owner |
| Operations owner | Operations Representative |
| Payments owner | Payments/Finance Representative |
| Status | Draft baseline |
| Last updated | 2026-11-20 |
| Related requirements | REQ-001, REQ-002 |
| Related architecture | `docs/ard.md` |
| Environment inventory | `docs/platform/environment-inventory.md` |

This document is the controlled baseline for SaaS storefront, admin, payment, email, analytics, and environment configuration. It records the configuration fields that must be known before launch without selecting a vendor that the ARD has not selected.

## ARD Decision Alignment

| Area | Baseline |
|---|---|
| Commerce platform | Vendor-neutral SaaS e-commerce platform; exact vendor is `TBD` per ARD-DEC-001. |
| Hosting | Vendor-managed cloud/SaaS hosting; no business-operated commerce hosting for MVP per ARD-DEC-002. |
| System of record | External ERP/accounting remains the business system of record; the SaaS platform holds the operational storefront copy per ARD-DEC-003. |
| ERP integration | Controlled manual Excel import/export using approved templates, validation, audit logging, and sandbox/staging testing per ARD-DEC-004. |
| Payments | SaaS-certified payment gateway integrations only; payment provider is `TBD` per ARD-DEC-005. |
| Customer accounts | Guest checkout only for MVP per ARD-DEC-006. |
| Admin access | Named role-based admin accounts with MFA; shared admin accounts are prohibited per ARD-DEC-007. |
| Release management | Separate sandbox/staging and production stores with approval before production changes per ARD-DEC-010 and ARC-CON-015. |
| Quality gates | Production changes require applicable build, lint, test, security, import, payment sandbox, performance, and SBOM evidence per ARD-DEC-011. |

## Selected SaaS Platform Fields

Use `TBD` only where the ARD still leaves the decision open.

| Field | Value | Owner | Evidence / Record Location |
|---|---|---|---|
| SaaS platform vendor | `TBD` | Product Owner / Engineering Lead | Platform evaluation record `TBD` |
| SaaS plan / edition | `TBD` | Product Owner / Business Sponsor | Vendor plan approval `TBD` |
| Vendor-managed hosting region | `TBD` | Engineering Lead | Vendor contract or admin record `TBD` |
| Published vendor SLA | `TBD` | Engineering Lead | SLA evidence placeholder in `docs/platform/environment-inventory.md` |
| Domestic launch country | United States | Product Owner | PRD launch-market baseline |
| Store currency | USD | Product Owner / Payments owner | Store admin currency record |
| ERP/accounting product | `TBD` | Operations Representative / Finance owner | ERP selection record `TBD` |
| Payment provider | `TBD` | Payments/Finance Representative | Payment provider approval `TBD` |
| Email delivery capability | `TBD` | Operations Representative / Engineering Lead | SaaS-native email or approved provider record `TBD` |
| Analytics / monitoring tooling | `TBD` | Engineering Lead / Product Owner | Analytics and uptime-monitoring approval `TBD` |
| Primary production domain | `TBD` | Product Owner / Engineering Lead | DNS and SaaS domain record `TBD` |
| Sandbox/staging store name | See `docs/platform/environment-inventory.md` | Engineering Lead | Environment record |
| Production store name | See `docs/platform/environment-inventory.md` | Product Owner | Environment record |

## Configuration Domains

| Domain | Baseline Control | Owner | Notes |
|---|---|---|---|
| Storefront theme | SaaS storefront theme plus approved repository-managed custom theme/scripts only where required. | Engineering Lead | Custom theme/script code belongs in `theme/`, `storefront-theme/`, or the selected platform theme path once finalized. |
| Catalogue and stock | SaaS platform holds the operational storefront copy imported from ERP/accounting-approved data. | Operations Representative | Production imports must have sandbox/staging evidence first. |
| Admin operations | Admin users manage catalogue, stock, orders, imports, and configuration through role-based accounts with MFA. | Operations Representative | Shared admin accounts are not allowed. |
| Payments | Use certified hosted/tokenized payment gateway configuration exposed by the selected SaaS platform. | Payments/Finance Representative | Raw card data must not enter custom code, imports, exports, or logs. |
| Transactional email | Order confirmation email fires only after successful paid order creation. | Operations Representative | Provider/template selection remains `TBD`. |
| Analytics and monitoring | Use platform analytics, ecommerce funnel events, uptime checks, checkout-error alerts, payment/order logs, and admin audit evidence where available. | Engineering Lead / Product Owner | Analytics implementation details remain `TBD` until tooling is selected. |
| Data retention | Order/customer records retained for 12 months and audit logs for 90 days unless legal/tax/privacy/payment rules require a different period. | Product Owner / Engineering Lead | Compliance overrides remain `TBD` until confirmed. |
| Release approval | Test in sandbox/staging, collect evidence, then approve production changes. | Product Owner / Engineering Lead | Applies to SaaS config, apps/extensions, payment settings, imports, email templates, analytics, and custom theme/scripts. |

## Repository Paths

| Record Type | Repository Path | Owner | Purpose |
|---|---|---|---|
| Platform baseline | `docs/platform/saas-platform-baseline.md` | Engineering Lead | Controlled SaaS platform baseline and open platform decisions. |
| Environment inventory | `docs/platform/environment-inventory.md` | Engineering Lead | Separate sandbox/staging and production environment records. |
| Platform configuration records | `docs/platform/` | Engineering Lead / Operations Representative | Store/admin/payment/email/analytics configuration evidence and change notes. |
| Release checklists | `docs/release/` or `docs/launch-smoke-test-checklist.md` until `docs/release/` exists | Product Owner / Engineering Lead | Release readiness and approval evidence. |
| Custom theme/scripts | `theme/`, `storefront-theme/`, or selected platform theme path | Engineering Lead | Version-controlled storefront customization. |
| Import templates | `ops/import-templates/` | Operations Representative | Controlled Excel templates for catalogue, stock, order, and customer/order exchange. |
| Observability notes | `docs/observability/`, `observability/`, and `docs/analytics/` | Engineering Lead / Product Owner | Analytics schema, uptime monitoring notes, alert evidence, and incident notes. |
| Security/admin access records | `docs/security/` and `docs/staff-access-readiness.md` | Engineering Lead / Operations Representative | MFA, role, staff access, and sensitive-data controls. |

## Required Configuration Records

Each configuration record should name the environment, owner, approver, change date, rollback notes, and evidence link.

| Configuration Record | Minimum Fields |
|---|---|
| Storefront record | Store name, domain/preview URL, theme name/version, custom code reference, enabled storefront modules, rollback target. |
| Admin record | Named admin users or role groups, MFA evidence, least-privilege role set, import/export permission holders, audit log source. |
| Payment record | Provider, gateway mode, supported methods, test evidence, production enablement approval, settlement/reconciliation owner. |
| Email record | Provider, sender identity, order confirmation template/version, delivery diagnostics source, approval evidence. |
| Analytics record | Analytics provider/tooling, event schema reference, dashboards, access owners, data retention and consent notes where applicable. |
| Import record | Template version, validation rules, sandbox/staging test file, production file name, admin identity, import result, reconciliation notes. |
| SLA/operability record | Published vendor SLA, support tier, support contact route, uptime monitor, incident escalation owner. |

## Baseline Change Log

| Date | Change | Owner | Approval | Notes |
|---|---|---|---|---|
| 2026-11-20 | Initial vendor-neutral SaaS platform baseline created from ARD decisions. | Engineering Lead | Pending Product Owner review | No SaaS vendor selected by this document. |
