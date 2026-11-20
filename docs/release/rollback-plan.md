# Rollback Plan

## Document Control

| Field | Value |
|---|---|
| Product | ModernPC1 Dell Red Witch Gaming Store |
| Owner | Engineering Lead |
| Business approver | Product Owner / Business Sponsor |
| Operations owner | Operations Representative |
| Status | Draft rollback control |
| Last updated | 2026-11-20 |
| Related requirements | REQ-002, REQ-004 |
| Related architecture | `docs/ard.md` |
| Related release checklist | `docs/release/release-checklist.md` |
| Related change log | `docs/release/configuration-change-log.md` |

This plan defines rollback options for SaaS configuration, storefront theme, app/extension, and controlled import changes. Each production release must identify the applicable rollback owner, rollback path, and validation evidence before promotion.

## Rollback Decision Rules

| Condition | Decision |
|---|---|
| Customer checkout, hosted payment, or order confirmation is broken after release | Start rollback immediately unless Product Owner and Business Sponsor explicitly hold production with a customer-safe workaround. |
| Product price, stock, availability, or policy content is materially wrong | Use the fastest corrective path: direct admin correction, corrective import, or restore from known-good version. |
| Security, access, raw payment data, or unauthorized app risk is found | Disable or remove the risky change first, then review audit logs and affected data. |
| Analytics-only or non-customer-visible defect is found | Product Owner and Engineering Lead decide whether to roll back, hotfix, or monitor based on severity. |

## Separate Rollback Paths

| Rollback Path | Use When | Primary Action | Validation |
|---|---|---|---|
| SaaS theme/app version restore | A storefront theme, repository-managed theme asset, SaaS app, custom app, or extension release causes a defect. | Restore the prior known-good published theme/app version, unpublished theme copy, vendor app version, or version-controlled release that passed staging. | Verify storefront, cart, checkout, order confirmation, affected app behavior, and monitoring in production. |
| Corrective import | Catalogue, collection, price, stock, customer/order exchange, or other import-managed data is wrong. | Prepare a corrected Excel import/export file from the approved source of record, validate it in sandbox/staging where feasible, import to production with a named admin account, and reconcile results. | Verify product/admin records, storefront availability, cart/checkout behavior, and reconciliation totals. |
| Direct SaaS admin correction | A small production configuration value can be safely corrected through admin without bulk import. | Restore the last approved setting, policy text, navigation value, payment setting, email setting, staff role, or analytics setting. | Verify the exact affected flow and capture admin audit/activity evidence. |
| Disable/remove app or integration | An approved or newly changed app causes customer, order, payment-reference, performance, or security risk. | Disable app feature, remove sales-channel exposure, uninstall where needed, and revoke permissions where supported. | Verify storefront/admin behavior, review audit logs, and confirm no unresolved data exposure. |

## Theme/App Version Restore Procedure

| Step | Action | Owner | Evidence |
|---|---|---|---|
| 1 | Identify the current failed theme/app/version and the prior known-good restore target. | Engineering Lead | Release record and staging evidence. |
| 2 | Confirm restore target passed staging tests and has Product Owner approval as the rollback target. | Engineering Lead / Product Owner | Approval note or release checklist row. |
| 3 | Restore or publish the known-good SaaS theme version, app version, unpublished theme copy, or version-controlled release. | Named admin user / Engineering Lead | Admin activity screenshot or deployment record. |
| 4 | Disable the defective app feature or extension if restore cannot complete immediately. | Named admin user | Admin activity screenshot. |
| 5 | Run production verification for storefront, cart, checkout, order confirmation, and affected app behavior. | Engineering Lead / Operations Representative | Post-rollback verification evidence. |
| 6 | Update the configuration change log with rollback notes and final state. | Release owner | Completed change-log row. |

## Corrective Import Procedure

| Step | Action | Owner | Evidence |
|---|---|---|---|
| 1 | Identify affected records and confirm the external ERP/accounting source of record. | Operations Representative | Record list, export, or ERP/accounting reference. |
| 2 | Prepare a corrected Excel import/export file using the approved template. | Operations Representative | File name, template version, and validation notes. |
| 3 | Validate the corrected file in sandbox/staging when the platform supports safe replay. | Operations Representative / Engineering Lead | Staging import result and reconciliation evidence. |
| 4 | Obtain approval for production corrective import. | Product Owner / Operations Representative | Approval note tied to release/change ID. |
| 5 | Import the corrected file to production using a named admin account with MFA. | Operations Representative | Admin import result and audit/activity evidence. |
| 6 | Reconcile production product, price, stock, order, or customer/order exchange totals. | Operations Representative | Reconciliation note and screenshots. |
| 7 | Update the configuration change log with corrective import and rollback notes. | Release owner | Completed change-log row. |

## Direct Admin Correction Procedure

| Step | Action | Owner | Evidence |
|---|---|---|---|
| 1 | Identify the last approved production value and affected customer/admin flow. | Release owner | Baseline record or prior change-log row. |
| 2 | Confirm direct admin correction is lower risk than bulk import or full version restore. | Engineering Lead / Product Owner | Decision note. |
| 3 | Apply the correction using a named role-based admin account with MFA. | Named admin user | Admin activity evidence. |
| 4 | Verify the affected production flow and update the change log. | Release owner | Verification evidence and rollback notes. |

## Rollback Validation Checklist

| ID | Check | Required Evidence | Result |
|---|---|---|---|
| RB-001 | Rollback owner and approver were available and named. | Owner/approver note. | TBD |
| RB-002 | Rollback path used was identified as theme/app version restore, corrective import, direct admin correction, or disable/remove app. | Change-log rollback notes. | TBD |
| RB-003 | Production rollback was performed by a named account with MFA. | Admin audit/activity record. | TBD |
| RB-004 | Storefront, cart, checkout, order, catalogue, payment, email, analytics, or admin flow affected by the rollback was retested. | Screenshots, logs, or dashboard evidence. | TBD |
| RB-005 | Customer data and payment evidence were masked; raw card number, CVV, and full payment credentials were not recorded. | Evidence review note. | TBD |
| RB-006 | Final production state and any follow-up work were recorded. | Completed change-log row. | TBD |

## Rollback Record Template

| Field | Required Entry |
|---|---|
| Release/change ID | TBD |
| Rollback start time | TBD |
| Rollback end time | TBD |
| Trigger | Defect, failed verification, security risk, incorrect data, or approved business decision |
| Rollback path | Theme/app version restore / corrective import / direct admin correction / disable-remove app |
| Rollback owner | Named individual |
| Production admin user | Named role-based account |
| Approval | Product Owner, Business Sponsor, Engineering Lead, or Operations Representative as applicable |
| Evidence | Links to admin activity, screenshots, import results, dashboards, and verification notes |
| Final state | Restored, corrected, disabled, monitored, or escalated |
