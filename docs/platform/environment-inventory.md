# Environment Inventory

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
| Related baseline | `docs/platform/saas-platform-baseline.md` |
| Related architecture | `docs/ard.md` |

This inventory separates sandbox/staging and production SaaS store records so configuration, ownership, release approval, and SLA evidence can be controlled before launch.

## Environment Summary

| Environment | Store Name | Purpose | Named Owner | Access Model | Production Data Allowed |
|---|---|---|---|---|---|
| Sandbox/Staging | `TBD` | Test SaaS configuration, theme/app preview, Excel imports, payment sandbox flows, email templates, analytics, and release evidence before production. | Engineering Lead | Named role-based accounts with MFA; least-privilege access for Product, Operations, Payments, QA, and Engineering roles. | No, except sanitized or approved test fixtures. |
| Production | `TBD` | Public customer storefront, checkout, admin operations, production imports/exports, transactional email, analytics, payment/order records, and operational monitoring. | Product Owner | Named role-based accounts with MFA; no shared admin accounts; production access restricted to approved business and operational roles. | Yes, according to retention, privacy, tax, payment, and support obligations. |

## Sandbox/Staging Configuration Record

| Field | Value |
|---|---|
| Store name | `TBD` |
| Store URL / preview URL | `TBD` |
| Named environment owner | Engineering Lead |
| Business approver | Product Owner |
| Operations owner | Operations Representative |
| Payments owner | Payments/Finance Representative |
| Access model | Named role-based admin accounts with MFA; no shared accounts; temporary access reviewed before each release. |
| Admin role groups | Product approver, operations importer, payments tester, QA tester, engineering theme/config maintainer. |
| Enabled storefront modules | Catalogue browsing, product search/filter/sort, product detail, cart, guest checkout entry, order confirmation preview, analytics test events. |
| Enabled admin modules | Catalogue, pricing, stock, images/media, orders, import/export, platform configuration, audit logs. |
| Payment mode | Payment sandbox/test mode only; provider is `TBD`. |
| Email mode | Test/sandbox delivery or non-customer recipient allowlist; provider is `TBD`. |
| Analytics mode | Test property/workspace or tagged staging stream; tooling is `TBD`. |
| Import/export mode | Controlled Excel import/export tests using approved templates from `ops/import-templates/`. |
| Theme/custom script source | `theme/`, `storefront-theme/`, or selected platform theme path once finalized. |
| Configuration record path | `docs/platform/` |
| Observability notes path | `docs/observability/`, `observability/`, and `docs/analytics/` |
| Release evidence path | `docs/release/` or `docs/launch-smoke-test-checklist.md` until `docs/release/` exists. |
| Vendor SLA evidence | `TBD` |
| Support tier / contact route | `TBD` |
| Rollback mechanism | Platform theme/app preview rollback, configuration restore notes, and repository-managed custom code rollback to last passing version. |
| Required before production promotion | Sandbox/staging evidence for configuration changes, import validation, payment success/failure/cancel/pending flows where applicable, email confirmation, admin authorization, analytics safety, and approval. |

## Production Configuration Record

| Field | Value |
|---|---|
| Store name | `TBD` |
| Primary domain | `TBD` |
| Named environment owner | Product Owner |
| Business approver | Product Owner |
| Operations owner | Operations Representative |
| Payments owner | Payments/Finance Representative |
| Technical owner | Engineering Lead |
| Access model | Named role-based admin accounts with MFA; no shared admin accounts; least privilege; production access reviewed during onboarding, offboarding, and release readiness. |
| Admin role groups | Product approver, operations admin/importer, payments/finance admin, engineering release maintainer, support viewer where approved. |
| Enabled storefront modules | Catalogue browsing, product search/filter/sort, product detail, cart, guest checkout, hosted payment continuation, order confirmation, approved analytics. |
| Enabled admin modules | Catalogue, pricing, stock, images/media, orders, import/export, platform configuration, transactional email, audit logs, approved analytics/monitoring. |
| Payment mode | Production hosted/tokenized payment provider; provider is `TBD`; raw card data prohibited in custom code, imports, exports, and logs. |
| Email mode | Production order confirmation email after successful paid order only; provider is `TBD`. |
| Analytics mode | Production analytics/funnel monitoring with no checkout-blocking dependency; tooling is `TBD`. |
| Import/export mode | Controlled production Excel imports/exports only after sandbox/staging test evidence and approval. |
| Theme/custom script source | `theme/`, `storefront-theme/`, or selected platform theme path once finalized. |
| Configuration record path | `docs/platform/` |
| Observability notes path | `docs/observability/`, `observability/`, and `docs/analytics/` |
| Release checklist path | `docs/release/` or `docs/launch-smoke-test-checklist.md` until `docs/release/` exists. |
| Vendor SLA evidence | `TBD` |
| Support tier / contact route | `TBD` |
| Uptime monitor | `TBD` |
| Rollback mechanism | Platform-supported rollback/version restore plus repository-managed custom code rollback to last passing version. |
| Production change approval | Product Owner and Engineering Lead approval after sandbox/staging evidence; Payments owner approval required for payment changes; Operations owner approval required for import/catalogue changes. |

## Vendor SLA Evidence Placeholders

| Environment | Evidence Needed | Owner | Status |
|---|---|---|---|
| Sandbox/Staging | Vendor SLA/support documentation, staging-store availability expectations, support route, and known limitations. | Engineering Lead | `TBD` |
| Production | Published SaaS availability SLA, support tier, escalation path, status-page URL, checkout/payment reliability notes, and exception approval if SLA cannot meet ARD target. | Engineering Lead / Product Owner | `TBD` |

## Release and Configuration Evidence

| Evidence | Environment | Owner | Record Location |
|---|---|---|---|
| Storefront theme/version and rollback target | Sandbox/Staging and Production | Engineering Lead | `docs/platform/` and theme repository path |
| Admin account roles and MFA evidence | Sandbox/Staging and Production | Operations Representative | `docs/security/` or `docs/staff-access-readiness.md` |
| Excel import template version and staging result | Sandbox/Staging | Operations Representative | `ops/import-templates/` and `docs/platform/` |
| Production import approval and reconciliation | Production | Operations Representative | `docs/platform/` |
| Payment sandbox success/failure/cancel/pending evidence | Sandbox/Staging | Payments/Finance Representative | `docs/platform/` |
| Production payment enablement approval | Production | Payments/Finance Representative | `docs/platform/` |
| Order confirmation email template/version evidence | Sandbox/Staging and Production | Operations Representative | `docs/platform/` |
| Analytics and uptime monitoring evidence | Sandbox/Staging and Production | Engineering Lead / Product Owner | `docs/observability/`, `observability/`, and `docs/analytics/` |
| Release approval checklist | Production | Product Owner / Engineering Lead | `docs/release/` or `docs/launch-smoke-test-checklist.md` |

## Inventory Change Log

| Date | Change | Owner | Approval | Notes |
|---|---|---|---|---|
| 2026-11-20 | Initial sandbox/staging and production SaaS environment inventory created. | Engineering Lead | Pending Product Owner review | Store names, vendor SLA evidence, support route, and provider selections remain `TBD` where the ARD keeps them open. |
