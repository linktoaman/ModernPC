# Deployment Operations

## Release gates

Every pull request and main-branch push runs the CI workflow in `.github/workflows/ci.yml`.
The required verification sequence is:

1. Install dependencies with `npm ci`.
2. Generate the Prisma client with `npm run prisma:generate`.
3. Run the TypeScript compiler with `npm run typecheck`.
4. Run ESLint with `npm run lint`.
5. Run the unit tests with `npm test`.
6. Create a production build with `npm run build`.
7. Run the dependency audit with `npm run security:audit`.
8. Run the repository secret scan with `npm run secrets:scan`.
9. Run the accessibility smoke check with `npm run accessibility`.
10. Generate and upload the SBOM with `npm run sbom`.

The workflow uses local defaults for staff authentication and disables telemetry, so the gates do not require real identity-provider, database, payment, notification, or cloud credentials.
Provider and runtime versions remain configurable through environment variables and deployment-system configuration.

## Security, accessibility, and SBOM gates

The dependency audit defaults to `NPM_AUDIT_LEVEL=critical` in CI so that newly published critical advisories fail the release gate immediately.
Teams can raise the threshold to `high` once upstream Next.js and Prisma advisories are remediated without breaking-version upgrades.

The secret scan checks the repository for high-confidence credential patterns before deployment hooks run.
Real provider credentials must be stored in the target platform secret manager and injected only into protected deployment environments.

The accessibility gate performs a lightweight page-level smoke check for landmarks, headings, image alternatives, and named interactive controls.
Full browser accessibility testing can be added behind the same `npm run accessibility` command when the runtime provider is selected.

`scripts/generate-sbom.sh` writes a CycloneDX JSON SBOM to `artifacts/sbom.cdx.json`.
The script uses `npm sbom` when available and falls back to package-lock metadata so an SBOM artifact is still produced in locked-down CI runners.

## Staged deployment

The CI workflow includes a `staged-deployment` job that runs only for manual dispatches or tag-based releases after all verification gates pass.
The job is bound to the `staging` GitHub environment so repository maintainers can add required reviewers, protected secrets, and environment-specific deployment commands without changing the verification job.

Recommended staged release flow:

1. Create a release candidate from a commit that has passed CI.
2. Trigger the workflow manually or push a release tag.
3. Deploy to staging through the staged deployment hook.
4. Run product smoke tests against patient booking, staff access, API health, audit logging, and observability dashboards.
5. Promote the same artifact to production only after staging sign-off.

## Rollback

The workflow includes a rollback hook that activates if the staged deployment job fails.
Until a provider is selected, the hook records the rollback reference and marks where provider-specific commands should run.

Production rollback should use the last known good artifact or image, not a rebuild from source.
The operator should capture the release identifier, SBOM artifact, deployment timestamp, database migration status, and reason for rollback in the incident or change record.

Rollback checklist:

1. Stop further promotion from the failing release candidate.
2. Restore the last known good application artifact.
3. Confirm database migrations are backward-compatible or execute the approved down plan.
4. Verify patient booking, staff access, API health, audit logging, and metrics.
5. Document the rollback reference and follow-up remediation before reattempting release.
