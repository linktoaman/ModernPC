# Shopify Theme Change Control

## Current Theme Code Decision

This repository does not currently contain custom Shopify theme Liquid, JavaScript, CSS, templates, sections, snippets, assets, or third-party frontend dependencies.

The MVP baseline is Shopify Online Store theme configuration managed in Shopify Admin. Custom theme code should be added here only when an approved requirement cannot be met through Shopify Admin configuration or native theme settings.

## Scope Rules

- Keep custom Liquid, JavaScript, CSS, and theme assets minimal.
- Prefer Shopify Admin theme settings, navigation, product data, collections, policies, and native checkout behavior before adding code.
- Do not add third-party apps or dependencies with customer, order, or payment-reference access without Business Sponsor approval.
- Do not add custom payment handling, raw card collection, self-managed checkout, or self-managed storefront hosting.
- Keep generated files, local credentials, store passwords, and Shopify access tokens out of the repository.

## Required Record Before Customization

Before the first custom theme code is committed, record these details in this file or a dated change note in this directory:

| Field | Required Value |
|---|---|
| Shopify store | Store name and `.myshopify.com` URL |
| Baseline theme | Theme name, version, and whether it is published or unpublished |
| Baseline backup | Name or ID of the duplicate unpublished theme kept as rollback target |
| Reason for customization | Approved requirement or defect that cannot be solved by configuration |
| Owner | Engineer responsible for the theme change |
| Approver | Product Owner or Business Sponsor, depending on impact |
| Rollback target | Git commit/tag and Shopify theme copy to restore |

## Pull Workflow

1. Duplicate the current Shopify theme in Shopify Admin before pulling code.
2. Confirm the duplicated theme is unpublished and clearly named with the date and purpose.
3. Install Shopify theme tooling only when needed for custom code work.
4. Pull the target unpublished theme into this directory.
5. Commit the pulled baseline before making custom edits.
6. Keep each change focused on the approved storefront requirement.

## Review Workflow

Every custom theme change must be reviewed before publish:

1. Review the diff for Liquid, JavaScript, CSS, JSON template, asset, and dependency changes.
2. Confirm no secrets, access tokens, customer data, order data, payment references, or raw card data are committed.
3. Confirm new dependencies are necessary, actively maintained, and do not require customer, order, or payment-reference access unless approved.
4. Confirm cart, checkout entry, product availability display, policy links, and basic navigation behavior are not regressed.
5. Record the review outcome in the pull request or release notes.

## Checks

Run available checks before preview or publish. The exact commands depend on the theme tooling installed for the work.

Recommended checks when Shopify CLI/theme tooling is present:

```sh
shopify theme check
```

Recommended repository checks when package tooling is introduced:

```sh
npm test
npm run lint
npm run build
```

If no tooling exists yet, perform manual review of changed Liquid, JSON, CSS, and JavaScript files and record that automated theme checks are not available.

## Preview Workflow

1. Push changes only to an unpublished Shopify theme.
2. Open the Shopify theme preview link.
3. Smoke test the storefront paths affected by the change.
4. At minimum, verify category browsing, product detail display, in-stock add-to-cart, cart updates, checkout entry, and policy page links when those paths could be affected.
5. Do not publish if preview testing finds a cart, checkout, product availability, policy, or navigation regression.

## Publish Workflow

1. Confirm the change has an approved review and passing available checks.
2. Confirm the unpublished preview theme passed smoke testing.
3. Record the Git commit or tag, Shopify theme name/ID, reviewer, approver, and publish time.
4. Publish from Shopify Admin or approved Shopify tooling.
5. Run the launch smoke test checklist after publish.

## Rollback Workflow

Use the fastest safe rollback path for the failure mode:

1. If the published theme breaks storefront behavior, publish the previous known-good Shopify theme copy from Shopify Admin.
2. If the Shopify theme copy is not available, redeploy the last known-good repository commit or tag to an unpublished theme, preview it, then publish it.
3. If a dependency introduced the issue, remove or pin the dependency and redeploy only after review and checks pass.
4. Re-run product, cart, checkout entry, and policy link smoke tests after rollback.
5. Record the incident, rollback target, rollback time, and follow-up owner.

## Change Log

| Date | Change | Owner | Notes |
|---|---|---|---|
| 2026-11-13 | Created theme change-control runbook. No custom theme code exists in the repository. | Engineering Lead / Solution Architect | Shopify Admin theme configuration remains the MVP baseline. |
