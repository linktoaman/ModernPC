# Excel Import/Export Runbook

| Control | Value |
|---|---|
| Runbook version | `v1.0` |
| Required evidence header | Import/export evidence must reference `Excel Import/Export Runbook v1.0`. |
| Scope | Product catalogue imports, inventory imports, orders exports, and customer/order record reconciliation between ERP/accounting and SaaS platform |
| Owners | Operations Representative, Engineering Lead, Product Owner for production approval |
| Architecture basis | ARD-DEC-003, ARD-DEC-004, ARD-DEC-005, ARD-API-005 |

## Sensitive Data Prohibition

No Excel template, import file, export file, validation report, screenshot, audit log note, reconciliation sample, or support attachment may contain raw card numbers, CVV/CVC values, magnetic stripe data, PINs, payment-provider secrets, API keys, gateway credentials, or other sensitive payment credentials. If prohibited data is found, stop the run, delete/quarantine the file according to approved incident handling, notify Engineering Lead and Payments/Finance Representative, and restart with a sanitized approved file.

## Approved Templates

| Data flow | Template | Required file name pattern | Required workbook header |
|---|---|---|---|
| Product catalogue import | `ops/import-templates/product-catalogue-template.md` | `product-catalogue-import-v1.0-YYYYMMDD.xlsx` | `Product Catalogue Import Template v1.0` |
| Inventory import | `ops/import-templates/inventory-template.md` | `inventory-import-v1.0-YYYYMMDD.xlsx` | `Inventory Import Template v1.0` |
| Orders export | `ops/import-templates/orders-export-template.md` | `orders-export-v1.0-YYYYMMDD.xlsx` | `Orders Export Template v1.0` |

## Required Roles

| Role | Responsibility |
|---|---|
| Operations Representative | Prepares files, performs row-level validation review, runs sandbox/staging test, performs approved production import/export, and records reconciliation notes. |
| Engineering Lead | Confirms environment, audit log availability, and template/version compatibility where platform behavior changes. |
| Product Owner | Approves production import/export when customer-visible catalogue, stock, price, or order status behavior can change. |
| Payments/Finance Representative | Reviews payment-reference handling and settlement implications where order/payment exports are involved. |

All admin actions must use named role-based accounts with MFA. Shared admin accounts are prohibited.

## Pre-Import Checklist

1. Confirm the source file uses an approved `v1.0` file name pattern and workbook header.
2. Confirm the file contains only columns defined in the approved template unless Engineering Lead has approved a compatible template update.
3. Confirm all required fields are populated and row-level validation rules pass.
4. Confirm there is no raw card data, CVV/CVC value, payment-provider secret, API key, gateway credential, or other sensitive payment credential.
5. Confirm the source environment, target environment, admin identity, and template version are recorded.
6. Save the source file, validation report, and review notes in the approved operations evidence location.

## Sandbox/Staging Test Requirement

Production import is blocked until sandbox/staging test evidence exists for the exact template version and a representative file from the same import batch.

Required staging evidence:

- Source file name and checksum or immutable storage reference.
- Template name and version from file name and workbook header.
- Sandbox/staging environment name.
- Named admin account used for upload/export, with MFA requirement confirmed.
- SaaS import preview or validation result.
- Row-level validation error report, including rejected row count.
- Screenshot or export of import success/failure summary.
- Audit log reference showing admin identity, timestamp, file name, template version, and result.
- Reconciliation sample comparing ERP/accounting source rows with SaaS sandbox/staging records.
- Explicit approval note that no prohibited sensitive payment data was present.

## Production Import Gate

Before production import, the Operations Representative must attach or reference staging evidence and obtain required approval. The production gate fails if any of the following are true:

- No staging test evidence exists.
- The production file uses a different template version from the staged file.
- Required row-level validation has not been reviewed.
- Rejected rows remain unresolved or unapproved.
- Audit log capture is unavailable.
- Reconciliation sampling has not been completed.
- The file, logs, screenshots, or notes contain raw card data, CVV/CVC values, secrets, API keys, gateway credentials, or sensitive payment credentials.

## Production Procedure

1. Open the production SaaS admin using a named MFA-protected account with import/export permission.
2. Verify production target, source file name, workbook header, and template version.
3. Run the platform import preview or validation mode when available.
4. Review row-level validation results and stop if unexpected errors appear.
5. Perform the production import only after the Product Owner or delegated approver confirms the production gate.
6. Capture the import success/failure summary, imported row count, rejected row count, and platform audit log reference.
7. Sample reconciled records in SaaS production against the ERP/accounting source file.
8. Record any corrective actions, rollback needs, or follow-up imports.

## Export Procedure

1. Open the production SaaS admin using a named MFA-protected account with export permission.
2. Select the approved export scope and `orders-export-v1.0-YYYYMMDD.xlsx` file naming convention.
3. Confirm exported fields match `ops/import-templates/orders-export-template.md`.
4. Confirm payment fields contain only approved non-sensitive provider references and statuses.
5. Capture export timestamp, admin identity, source environment, file name, template version, and audit log reference.
6. Reconcile a sample of exported orders against SaaS order records before ERP/accounting import.

## Reconciliation Sampling

For each production import/export batch, sample at least the greater of 10 rows or 5% of changed rows, capped at a practical operations limit approved by the Product Owner. The sample must include high-impact records where present: price changes, out-of-stock products, paid orders, cancelled orders, and records rejected in staging.

Record the sampled identifiers, source values, SaaS values, reviewer, timestamp, mismatches found, and resolution.

## Required Evidence Record

| Field | Required |
|---|---:|
| Evidence title referencing `Excel Import/Export Runbook v1.0` | Yes |
| Template name and version | Yes |
| Source file name | Yes |
| Source file checksum or immutable storage reference | Yes |
| Source and target environments | Yes |
| Named admin identity | Yes |
| MFA confirmation | Yes |
| Sandbox/staging validation result | Yes |
| Row-level validation report | Yes |
| Production approval | Yes for production imports/exports |
| Production import/export result | Yes for production imports/exports |
| Imported/exported row count | Yes |
| Rejected row count | Yes |
| Audit log reference | Yes |
| Reconciliation sample notes | Yes |
| Sensitive payment data prohibition confirmation | Yes |

## Failure Handling

If validation fails, do not edit files directly in production or bypass row-level errors. Correct the source in ERP/accounting or the approved operational staging process, generate a new versioned file, retest in sandbox/staging, and repeat the production gate.

If production import partially succeeds, stop additional imports, capture the audit log and rejected row report, reconcile affected records, and obtain Product Owner and Engineering Lead approval before remediation.
