# Release Checklist

## Document Control

| Field | Value |
|---|---|
| Product | ModernPC1 Dell Red Witch Gaming Store |
| Release owner | Engineering Lead |
| Business approver | Product Owner / Business Sponsor |
| Operations approver | Operations Representative |
| Status | Draft release control |
| Last updated | 2026-11-20 |
| Related requirements | REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006 |
| Related architecture | `docs/ard.md` |
| Related platform baseline | `docs/platform/saas-platform-baseline.md` |
| Related rollback plan | `docs/release/rollback-plan.md` |
| Related change log | `docs/release/configuration-change-log.md` |
| Related catalogue evidence | `tests/e2e/catalogue.spec.md` |

This checklist controls promotion of SaaS configuration, storefront theme, app/extension, payment, email, analytics, and controlled import changes from sandbox/staging into production. Production changes must be tested in sandbox/staging and approved before release.

## Release Scope

| Field | Required Entry |
|---|---|
| Release ID | TBD |
| Planned production date/time | TBD |
| Change type | SaaS configuration / theme / app or extension / import / payment / email / analytics / other |
| Affected environments | Sandbox/staging and production |
| Affected customer flows | Browse / cart / checkout / payment / order confirmation / admin operations / other |
| Release owner | Named individual |
| Production implementer | Named admin account; shared admin accounts are prohibited |
| Change-log row | Link or row reference in `docs/release/configuration-change-log.md` |

## Mandatory Promotion Gate

Production promotion is blocked unless every required gate below is complete.

| Gate | Required Evidence | Status | Block Rule |
|---|---|---|---|
| Staging test evidence | Sandbox/staging screenshots, test notes, import result, preview URL, or test report covering the affected flow. | TBD | Block production promotion when staging evidence is absent, incomplete, or not tied to the release ID. |
| Preview approval | Product Owner or delegated business approver has reviewed the staging preview and approved the visible/customer-facing change. | TBD | Block production promotion when preview approval is absent for storefront, content, theme, payment, email, or customer-visible changes. |
| Production approval | Product Owner/Business Sponsor and Engineering Lead approve production release timing and scope. | TBD | Block production promotion when production approval is absent or does not name the release ID. |
| Named admin access | The production implementer uses an individual role-based account with MFA. | TBD | Block production promotion when a shared account, missing MFA evidence, or excessive role assignment would be used. |
| Rollback path | Applicable rollback/version restore path is identified in `docs/release/rollback-plan.md`. | TBD | Block production promotion when rollback owner, rollback target, or corrective import path is unknown. |
| Post-release verification | Verification checks, owner, and evidence location are ready before the change starts. | TBD | Block production promotion when no verification path exists for the affected flow. |

## Quality Gate Checklist

Complete the applicable quality gates before requesting production approval.

| Quality Gate | Applies To | Required Result | Evidence Location |
|---|---|---|---|
| Build and lint | Repository-managed custom theme, scripts, apps, or extensions | Build and lint pass, or documented non-applicability when no custom code is included. | TBD |
| Automated and manual tests | Theme, app/extension, import, payment, checkout, order, analytics, or admin workflow changes | Tests pass in sandbox/staging for affected flows. | TBD |
| Catalogue and detail evidence | Catalogue, category, search/filter, product detail, cart, checkout, stock, or import changes | `tests/e2e/catalogue.spec.md` is completed in sandbox/staging and confirms Dell-only visibility, required card/detail fields, in-stock add-to-cart, and out-of-stock blocked state. | `tests/e2e/catalogue.spec.md` |
| Security scan review | Custom code, apps/extensions, third-party app changes, payment/email/analytics configuration | Security scan or review has no unresolved high-risk findings. | TBD |
| SBOM | Custom code, custom app/extension, or packaged dependency change | SBOM is generated or updated for custom code/extensions and reviewed before release. | TBD |
| Admin audit review | SaaS configuration, app, staff, payment, import, or policy changes | Admin activity/audit evidence confirms named account usage. | TBD |
| Import validation | Catalogue, stock, price, order, or customer/order exchange import | Sandbox/staging import validates and reconciles before production import. | TBD |

## Staging Evidence Checklist

| ID | Check | Required Evidence | Result |
|---|---|---|---|
| REL-001 | Release scope is deployed or configured in sandbox/staging first. | Preview URL, environment name, theme/app/config version, or import file name. | TBD |
| REL-002 | Affected storefront browse, cart, checkout, payment, order confirmation, admin, analytics, or import flows are tested. | Test notes, screenshots, logs, dashboard references, or import output. | TBD |
| REL-003 | Evidence masks customer data and never records raw card numbers, CVV, or full payment credentials. | Evidence review note. | TBD |
| REL-004 | Staging result is linked to the exact release ID and production change-log row. | Link to evidence and change-log reference. | TBD |
| REL-005 | Any launch exception is approved by Product Owner/Business Sponsor and Engineering Lead. | Exception note with approver, date, scope, and expiry. | TBD |
| REL-006 | Dell catalogue and detail release evidence is complete when catalogue/product visibility is affected. | Completed `tests/e2e/catalogue.spec.md` with route, non-Dell exclusion, required fields, in-stock add-to-cart, and out-of-stock blocked-state evidence. | TBD |

## Approval Record

| Approval Area | Approver | Required Before Production | Approval Status | Evidence / Notes |
|---|---|---|---|---|
| Staging evidence complete | Engineering Lead | Yes | TBD | TBD |
| Preview/business approval | Product Owner | Yes | TBD | TBD |
| Operations readiness | Operations Representative | Yes, when admin/import/order operations are affected | TBD | TBD |
| Payment/finance approval | Payments/Finance Representative | Yes, when payment, tax, price, or settlement behavior is affected | TBD | TBD |
| Security review | Engineering Lead / Security reviewer | Yes, when custom code, app/extension, access, data, or payment behavior is affected | TBD | TBD |
| Production release approval | Product Owner / Business Sponsor | Yes | TBD | TBD |

## Production Release Steps

1. Confirm the mandatory promotion gate is complete and all blocking statuses are cleared.
2. Confirm the rollback owner is available for the release window.
3. Record the production start time, implementer, environment, and release ID in the change log.
4. Apply only the approved production changes named in the release scope.
5. Capture admin audit/activity evidence showing the named account used for production changes.
6. Run post-release verification before closing the release.

## Post-Release Verification

| Verification | Required For | Evidence |
|---|---|---|
| Storefront preview/public page loads correctly | Theme, content, navigation, policy, app, analytics changes | Screenshot with production URL and timestamp. |
| Cart and checkout still complete expected paths | Theme, app, payment, catalog, stock, shipping, tax changes | Test order or approved non-payment verification note. |
| Order confirmation and admin order visibility work | Checkout, payment, email, order workflow changes | Confirmation/admin screenshots with sensitive data masked. |
| Catalogue, price, and stock reconcile | Import, product, collection, pricing, inventory changes | Production admin record and reconciliation note. |
| Analytics/monitoring events and alerts remain healthy | Analytics, scripts, app, theme, checkout-related changes | Dashboard screenshot, log sample, or monitor check. |
| No unauthorized access/app change occurred | Admin, app/extension, security-sensitive changes | Admin audit/activity review note. |

## Release Closure

| Closure Item | Required State |
|---|---|
| Change-log row completed | Date, admin user, area changed, staging evidence, approval, production notes, and rollback notes are recorded. |
| Rollback window decision | Release owner records whether rollback window is closed or monitoring remains active. |
| Issues documented | Any defect, exception, or follow-up is recorded with owner and due date. |
| Evidence archived | Staging, approval, production, and post-release evidence locations are linked from the release record. |
