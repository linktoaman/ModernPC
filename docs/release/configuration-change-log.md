# Configuration Change Log

## Document Control

| Field | Value |
|---|---|
| Product | ModernPC1 Dell Red Witch Gaming Store |
| Owner | Engineering Lead |
| Operations owner | Operations Representative |
| Status | Draft change log |
| Last updated | 2026-11-20 |
| Related requirements | REQ-002, REQ-004 |
| Related architecture | `docs/ard.md` |
| Related release checklist | `docs/release/release-checklist.md` |
| Related rollback plan | `docs/release/rollback-plan.md` |

Use this log for SaaS configuration, storefront theme, app/extension, payment, email, analytics, policy, admin access, and controlled import/export changes. Each production change must reference staging evidence, approval, and rollback notes before release closure.

## Required Fields

| Field | Requirement |
|---|---|
| Date | Calendar date the change is made or scheduled. |
| Change ID | Unique release/change reference. |
| Environment | Sandbox/staging or production. Production rows must link to prior staging evidence. |
| Admin user | Named role-based account that performed the change; shared accounts are prohibited. |
| Area changed | SaaS admin area, theme, app/extension, import, payment, email, analytics, policy, access, or other controlled area. |
| Change summary | Concise description of the approved change. |
| Staging evidence | Preview URL, screenshot, test report, import result, dashboard, or evidence link. |
| Approval | Approver name/role and approval date. |
| Rollback notes | Restore target, corrective import plan, direct admin correction, app disable path, owner, and validation notes. |

## Change Log

| Date | Change ID | Environment | Admin User | Area Changed | Change Summary | Staging Evidence | Approval | Rollback Notes |
|---|---|---|---|---|---|---|---|---|
| 2026-11-20 | REL-000 | Documentation baseline | Engineering Lead | Release controls | Created release checklist, rollback plan, and configuration change-log templates. | Repository documentation review. | Pending Product Owner review. | Documentation-only baseline; update this row after review if approval changes. |

## Production Readiness Rule

A production row is not release-ready unless it has all of the following:

- Date and unique change ID.
- Named admin user with role-based account and MFA.
- Area changed and change summary.
- Staging evidence tied to the same change ID.
- Preview/business approval where customer-facing behavior is affected.
- Production approval before implementation.
- Rollback notes identifying one or more paths from `docs/release/rollback-plan.md`.

If staging evidence or approval is absent, production promotion remains blocked and the release checklist must show the gate as blocked.

## Example Row Format

| Date | Change ID | Environment | Admin User | Area Changed | Change Summary | Staging Evidence | Approval | Rollback Notes |
|---|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | REL-### | Sandbox/staging or production | named.admin@example.com | Theme / app / import / payment / email / analytics / policy / access | What changed and why. | Link to preview, screenshots, test result, import result, or dashboard. | Approver role/name and date. | Prior theme/app version, corrective import file, direct admin value, disable/remove app path, rollback owner, and verification notes. |
