# Monitoring and Alerting Baseline

## Document Control

| Field | Value |
|---|---|
| Product | Modern PC E-commerce Website |
| Owner | Engineering Lead |
| Business approver | Business Sponsor |
| Last updated | 2026-11-20 |
| Related architecture | `docs/ard.md` |
| Related security baseline | `docs/security/security-controls.md` |
| Related requirement | REQ-004 |

This baseline defines the minimum observability coverage for the SaaS storefront, SaaS admin, hosted checkout, payment integration, order confirmation email, controlled Excel import/export, analytics, and operational alerts.

## Sensitive Data Rules

Logs, analytics events, dashboards, traces, alert payloads, support tickets, screenshots, import reports, release evidence, and monitoring exports must not contain raw card numbers, CVV/CVC values, magnetic stripe data, PINs, payment-provider secrets, API keys, gateway credentials, webhook secrets, admin passwords, SSO assertions, checkout tokens, cart tokens, or confidential Excel file contents.

Observability records may contain low-risk operational metadata such as event name, safe catalogue IDs, item counts, status code category, non-secret integration name, file name, template version, row counts, rejected row counts, order reference where approved, payment status, provider transaction reference/token where required for reconciliation, timestamp, and named admin identity where audit evidence requires it.

Customer contact details, addresses, order line detail, payment references, admin identity, and import/export details must be masked or stored only in approved restricted systems. Customer-facing errors must not expose internal identifiers, customer records, payment details, platform diagnostic traces, or customer/payment existence details.

## Required Monitoring Coverage

| Area | Required Coverage | Minimum Evidence |
|---|---|---|
| Platform analytics | Track safe storefront and commerce events for browse, product view, add to cart, cart friction, checkout initiation where supported, and conversion outcomes using approved payloads. | Analytics schema review and sample safe event payloads. |
| Uptime monitoring | Monitor storefront availability, core category/product pages, cart entry, checkout entry, and order confirmation reachability where vendor tooling allows. | Uptime dashboard or SaaS/vendor status evidence with alert recipients. |
| Checkout errors | Alert on elevated checkout failures, cart-to-checkout handoff failures, validation spikes, or hosted checkout unavailability. | Alert rule with threshold, destination, owner, and recent test or dashboard reference. |
| Payment errors | Alert on elevated payment failures, provider callback/webhook failures, gateway configuration errors, pending-payment backlogs, or mismatched paid order status. | Alert rule and safe diagnostic fields limited to status, reference/token where approved, provider code where safe, timestamp, and order reference where approved. |
| Import failures | Alert or notify operations on failed imports, malformed templates, validation rejection spikes, partial import completion, missing template version, or reconciliation mismatch. | Import run evidence with file name, template version, admin identity, timestamp, imported count, rejected count, and failure summary. |
| Order-confirmation email failures | Log every confirmation email delivery failure and alert operations when failures exceed the configured threshold. | Email delivery dashboard, failure log, and threshold configuration once selected by Engineering Lead. |
| Admin audit activity | Preserve available SaaS admin audit/activity logs for access, role, app, payment, configuration, import/export, catalogue, stock, order, and policy changes. | Audit log retention setting or vendor capability evidence. |
| Release and rollback evidence | Monitor affected flows after production changes and capture safe evidence for rollback decisions. | Release checklist, change log, smoke test results, and rollback verification notes. |

## Alerts

| Alert | Trigger | Owner | First Response |
|---|---|---|---|
| Storefront unavailable | Uptime check fails or SaaS status indicates customer-impacting outage. | Engineering Lead | Confirm vendor/platform status, notify Business Sponsor for customer-impacting outage, and follow release or vendor incident process. |
| Checkout unavailable or elevated checkout errors | Checkout entry, hosted checkout, or checkout validation errors exceed the configured threshold. | Engineering Lead | Confirm recent changes, check SaaS/vendor status, review safe diagnostics, and roll back or disable affected configuration where applicable. |
| Elevated payment errors | Payment failures, gateway errors, callback failures, or pending-payment backlogs exceed the configured threshold. | Payments/Finance Representative with Engineering Lead | Confirm provider and SaaS payment status, verify no orders are incorrectly marked paid, and disable only the affected payment method if required. |
| Import failure or partial import | Import validation fails, production import partially succeeds, or reconciliation counts mismatch. | Operations Representative | Stop additional imports, capture safe run evidence, reconcile affected records, and obtain approval before remediation. |
| Order-confirmation email failure spike | Confirmation email failures exceed the configured threshold. | Operations Representative with Engineering Lead | Review provider/SaaS email diagnostics, resend only where safe and approved, and confirm successful paid orders still have admin-visible order records. |
| Sensitive data detected in logs or evidence | Any log, alert, analytics event, import report, screenshot, ticket, or support artifact contains prohibited data. | Engineering Lead | Stop the workflow, restrict access to unsafe evidence, quarantine or delete according to incident handling, notify responsible owners, and restart with sanitized data. |
| Unauthorized or excessive admin activity | SaaS admin audit records show shared account use, missing MFA, unexpected role changes, unapproved app access, or suspicious payment/import configuration changes. | Store Staff Administrator | Suspend or restrict access where appropriate, review recent activity, notify Business Sponsor, and restore least-privilege roles. |

Alert thresholds remain TBD until the SaaS platform, payment provider, email capability, and monitoring tools are selected. Each threshold must define the measured signal, window, severity, destination, owner, and customer-impact note before production launch.

## Logging Baseline

1. Log import/export outcomes with admin identity, file name, template version, timestamp, imported row count, rejected row count, failure category, and audit reference.
2. Log payment outcomes only through SaaS/payment-provider safe fields: status, timestamp, order reference where approved, transaction reference/token where required, and safe provider response code.
3. Log order-confirmation email delivery accepted/failed status, timestamp, order reference where approved, and safe provider diagnostic code.
4. Log admin activity through SaaS-native audit records for access, role, app, payment, configuration, import/export, catalogue, stock, order, policy, and release-sensitive changes.
5. Log customer-facing errors by type and page/flow only; do not log full customer-entered checkout values, card data, secrets, confidential Excel file contents, or raw request payloads.
6. Analytics events must follow `docs/analytics/event-schema.md` and must not block storefront, cart, checkout, payment, admin, or import/export operations.

## Retention and Review

| Record Type | Baseline Retention | Review Cadence |
|---|---:|---|
| Admin audit logs | 90 days | Review before launch, after access changes, and during incidents. |
| Import/export run evidence | 90 days | Review each production import/export and during reconciliation. |
| Monitoring and alert history | 90 days | Review after incidents and before launch readiness approval. |
| Security-sensitive release evidence | 90 days | Review per release and rollback checklist. |
| Analytics events | 90 days unless platform default is shorter | Review when changing event schema, analytics provider, or payload fields. |

Order/customer records are retained for 12 months under the security baseline unless domestic legal, tax, privacy, or payment compliance overrides the period. Monitoring and alerting data must not be used to extend retention of customer, order, payment-reference, admin, or import/export details outside approved systems.

## Launch Readiness Checklist

- Platform analytics payloads are reviewed and confirmed free of personal data, payment data, secrets, checkout tokens, cart tokens, IP addresses, and user-agent strings.
- Storefront uptime monitoring or equivalent SaaS/vendor status monitoring is configured with alert recipients.
- Checkout and payment error alerts have named owners, thresholds, and safe diagnostic fields.
- Import failure notifications capture validation and row-count evidence without confidential Excel file contents.
- Order-confirmation email delivery failures are logged and have an alert threshold.
- Admin audit/activity logs are available or vendor limitations are documented.
- Monitoring and release evidence is masked before sharing outside approved restricted systems.

