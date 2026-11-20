# Security Controls Baseline

## Document Control

| Field | Value |
|---|---|
| Product | Modern PC E-commerce Website |
| Owner | Engineering Lead |
| Business approver | Business Sponsor |
| Last updated | 2026-11-20 |
| Related architecture | `docs/ard.md` |
| Related requirement | REQ-004 |

This baseline defines the minimum controls for customer, order, admin, import/export, and payment-reference data before production launch. It applies to the SaaS storefront, SaaS admin, hosted checkout, certified payment provider integrations, controlled Excel import/export files, analytics events, logs, alerts, release evidence, and support diagnostics.

## Control Summary

| Control Area | Required Baseline | Evidence Before Launch |
|---|---|---|
| Transport security | All customer, admin, checkout, payment-return, webhook, analytics, and import/export access must use HTTPS or SaaS/vendor-managed encrypted channels. HTTP access must redirect to HTTPS where the platform supports it. | SaaS domain, checkout, admin, and integration configuration review. |
| Payment capture | Payment capture must use SaaS-certified, provider-hosted or tokenized payment flows only. Custom raw-card capture is prohibited. | Payment provider configuration and sandbox/test-mode checkout evidence. |
| Cardholder data | Raw card numbers, CVV/CVC values, magnetic stripe data, PINs, and equivalent sensitive payment credentials must never be stored, imported, exported, logged, captured by custom theme/scripts, or placed in support/release evidence. | Payment configuration review, import/export review, analytics/logging review, and release evidence masking check. |
| Payment references | Store only provider-issued transaction references, tokens, statuses, timestamps, and safe reconciliation fields returned by the SaaS-certified gateway. Treat those values as restricted data. | Order/payment field review and role access review. |
| Admin access | Every admin user must use a named role-based account with MFA. Shared admin accounts, shared mailboxes, and group credentials are prohibited for daily administration. | Completed staff access readiness register and admin audit/activity evidence. |
| Least privilege | Admin roles must be limited to assigned duties for catalogue, stock, order, policy, access, configuration, import/export, payment, app, and owner-level work. | Role matrix approval and periodic access review. |
| Controlled imports/exports | Excel import/export activity must use approved templates, sandbox/staging validation, named MFA admin accounts, and audit records before production changes. | Import run evidence with file name, template version, admin identity, timestamp, result, and approval. |
| Change governance | Production changes must be tested in sandbox/staging and approved before release. Security-sensitive app, theme, payment, access, import/export, or data changes require Engineering Lead or security review. | Release checklist, change log, and rollback plan evidence. |

## ARD-SEC-001 Prohibitions

The following prohibitions are mandatory across storefront theme code, SaaS admin configuration, payment setup, apps/extensions, imports, exports, logs, analytics, monitoring, alerts, screenshots, test evidence, and support attachments:

- Do not collect raw card numbers, CVV/CVC values, magnetic stripe data, PINs, or equivalent sensitive payment credentials in custom storefront code, theme scripts, backend extensions, Excel files, exports, logs, analytics, or evidence.
- Do not store raw card data in a website database, SaaS custom field, customer record, order note, platform metafield, spreadsheet, data warehouse, ticket, or local file.
- Do not implement custom payment capture outside SaaS-certified provider-hosted or tokenized gateway integrations.
- Do not place payment-provider secrets, API keys, gateway credentials, webhook secrets, admin passwords, SSO assertions, checkout tokens, cart tokens, or other secrets in code, analytics payloads, logs, import/export files, screenshots, or release evidence.
- Do not use shared admin accounts, shared mailboxes, group credentials, or unattended owner-level accounts for production administration.
- Do not grant third-party apps or staff roles access to customer, order, payment-reference, import/export, payment, billing, or admin configuration data unless there is an approved business need and least-privilege role assignment.
- Do not expose internal identifiers, customer records, payment details, platform diagnostic traces, or customer/payment existence details in customer-facing errors.
- Do not retain order/customer records, audit logs, import/export files, or diagnostic evidence longer than the approved retention baseline unless domestic legal, tax, privacy, or payment compliance overrides it.

If prohibited data is found, stop the affected workflow, preserve only safe incident evidence, quarantine or delete the unsafe file according to approved incident handling, notify the Engineering Lead and responsible business owner, and restart with sanitized data.

## Data Classification Rules

| Data Type | Classification | Handling Rules |
|---|---|---|
| Public catalogue data | Public | Product names, public descriptions, public images, storefront category metadata, price, and public stock messages may appear on storefront pages and analytics only where approved. |
| Inventory and operational stock | Internal | Limit to staff or safe storefront stock messages. Import/export and audit evidence may include stock values but must avoid customer and payment data unless required for the controlled workflow. |
| Customer checkout and contact data | Confidential | Limit access to order, fulfilment, support, privacy, and approved operations roles. Do not place in analytics events, public logs, screenshots, or release evidence unless masked. |
| Order records | Confidential | Restrict to fulfilment, support, finance, and approved admin roles. Mask customer contact details and addresses in release/test evidence. |
| Admin identities and activity | Confidential | Preserve auditability through named accounts and logs. Do not share admin credentials or expose admin activity details outside approved operational evidence. |
| Import/export files | Confidential | Treat Excel files containing catalogue, inventory, order, customer, fulfilment, or reconciliation data as controlled operational records. Store only in approved locations and review for prohibited payment data before use. |
| Payment references and statuses | Restricted | Store only safe provider-issued references, tokens, statuses, timestamps, response codes where safe, and reconciliation fields. Limit access to payment, finance, order operations, and approved support duties. |
| Secrets and credentials | Restricted secret | Store only in SaaS, payment-provider, or approved secret-management controls. Never commit, export, email, screenshot, log, or include in analytics. |

## Retention Baseline

| Record Type | Baseline Retention | Notes |
|---|---:|---|
| Order/customer records | 12 months | Domestic legal, tax, privacy, or payment compliance may require longer or different retention. Record any override and approver. |
| Admin audit logs | 90 days | Retain named-account activity, configuration changes, app changes, import/export events, payment configuration changes, and security-relevant access events where the SaaS platform supports it. |
| Import/export evidence | 90 days | Keep safe validation summaries, row-count results, approvals, and audit references. Do not retain unsafe files with prohibited payment data. |
| Release/security evidence | 90 days | Mask customer, order, payment-reference, and admin details unless the evidence is stored in an approved restricted location. |
| Analytics events | 90 days unless platform default is shorter | Analytics payloads must avoid personal data, payment data, secrets, checkout tokens, cart tokens, IP addresses, and user-agent strings. |

Domestic compliance decisions remain open and may override these baselines. Any override must be documented with the applicable rule, owner, retention period, and deletion or archive process.

## Operational Requirements

1. Configure the SaaS storefront, checkout, admin, and approved integrations to use HTTPS and vendor-managed secure hosting.
2. Keep checkout and payment capture on certified SaaS/payment-provider surfaces; theme code may initiate checkout but must not collect card data.
3. Review payment, app, and theme changes for raw-card, secret, token, and logging exposure before release.
4. Use the staff access readiness process for named accounts, MFA, least privilege, joiner/mover/leaver changes, and owner-level access exceptions.
5. Test production-bound configuration, theme, import/export, payment, email, analytics, and access changes in sandbox/staging before approval.
6. Mask customer, order, payment-reference, admin, and import/export details in test reports, screenshots, support tickets, and release evidence.
7. Use approved Excel templates and the import runbook for product, inventory, order, customer/order, and reconciliation transfers.
8. Review installed apps and integrations before launch and after changes; remove or disable any unapproved app with customer, order, payment-reference, import/export, payment, billing, or admin access.

