# Architecture Requirements Document (ARD)

> Every material architecture decision or constraint has a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** TBD — see ARC-OQ-001
- **Document ID:** ARD-LOGIN
- **Version:** 0.1
- **Status:** Draft
- **Architecture Owner:** TBD — see ARC-OQ-002
- **Contributors:** TBD — see ARC-OQ-003
- **Last Updated:** 2026-11-20
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

This ARD defines a frontend-only architecture for FEAT-001, a red-themed UI-only login page for a small financial services business operating under FedRAMP, GDPR, HIPAA, PCI DSS, and SOC 2 compliance requirements. The page will be implemented inside the existing frontend application using the existing repository standard, with the exact frontend framework still TBD. No new backend component, authentication service, data store, registration flow, or account recovery capability will be introduced.

The login page will render a logo, page title, one configured SSO provider button shown by name, a help link to a login troubleshooting knowledge base article, and an error/status message area. The SSO button will use configured frontend values for provider display name and redirect URL, but the page will not implement authentication logic. Hosting must use a FedRAMP-authorized cloud environment aligned to existing compliance controls. Delivery will use the existing frontend CI/CD pipeline, normal release gates, and rollback by redeploying the previous frontend build artifact.

Key architecture drivers are minimal scope, compliance-aware UI behavior, no sensitive data collection, accessible red theme, measurable page render performance under 5 seconds on standard broadband, and release controls including dependency scanning, SBOM generation, build, lint, unit, accessibility, visual regression, E2E smoke, and performance checks.

## 2. Architecture Drivers

- PRD-FR-001 — Display a red-themed login page with all required layout elements.
- PRD-FR-002 — Display the logo and page title so users can identify the login page.
- PRD-FR-003 — Display exactly one configured SSO provider button shown by name.
- PRD-FR-004 — Display a help link pointing to a login troubleshooting knowledge base article.
- PRD-FR-005 — Include an error/status message area as a UI element only, without specified error-handling behavior.
- PRD-NFR-001 — Render the initial login page in under 5 seconds on standard broadband.
- PRD-NFR-002 — Avoid collection or display of financial, health, payment card, or other sensitive personal data.
- PRD-NFR-003 — Use the red primary theme without making required text or controls unreadable.
- CON-001 — Company is a small business in financial services.
- CON-002 — Compliance environment includes FedRAMP, GDPR, HIPAA, PCI DSS, and SOC 2.
- CON-003 — First version is UI-only and does not define real authentication behavior.
- CON-004 — Single sign-on is the only selected login method.
- CON-005 — SSO provider display name is TBD and must be resolved before final UI content approval.
- CON-006 — Registration and account recovery are out of scope.
- CON-007 — Target release has no fixed deadline; release occurs when approved.

## 3. Architecture Principles

1. Keep the first version frontend-only and avoid backend, authentication, storage, registration, or account recovery changes.
2. Minimize sensitive data exposure by collecting no user-entered financial, health, payment card, or sensitive personal data on the login page.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Prefer configuration-driven page content for provider name, redirect URL, help URL, logo reference, and page title.
6. Apply compliance-aware release controls even though the feature is UI-only.

## 4. System Context

### 4.1 Actors

- Authorized Application User — Opens the login page, views the red-themed UI, selects the configured SSO button, or follows the help link.
- Product Owner — Provides final product/application name, SSO provider display name, logo asset, help URL, and final content approval.
- Frontend Application — Hosts the login page component and reads existing frontend configuration.
- External SSO Provider — Owns authentication after the browser is redirected from the UI-only page.
- Login Troubleshooting Knowledge Base — Hosts the help article reached from the login page help link.
- Frontend Hosting/CDN Platform — Delivers the frontend assets from a FedRAMP-authorized cloud environment aligned to existing compliance controls.
- Observability Platform — Receives client-side page render metrics, navigation error events without sensitive data, and standard frontend availability signals.
- CI/CD and Security Scanning Toolchain — Builds, tests, scans, generates SBOM, and deploys the frontend change.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Configured SSO Provider | Performs authentication after the UI-only page redirects the browser | REST | External identity provider owner — TBD, see ARC-OQ-004 |
| EXT-002 | Login Troubleshooting Knowledge Base | Provides user-facing login help content | REST | Knowledge base owner — TBD, see ARC-OQ-005 |
| EXT-003 | Frontend Hosting/CDN Platform | Delivers frontend assets in a FedRAMP-authorized cloud environment aligned to existing compliance controls | REST | Platform/Infrastructure owner — TBD, see ARC-OQ-006 |
| EXT-004 | Observability Platform | Receives render metrics, navigation error events without sensitive data, and availability monitoring signals | REST | Operations owner — TBD, see ARC-OQ-007 |
| EXT-005 | CI/CD and Security Scanning Toolchain | Builds, tests, scans, produces SBOM, and deploys the frontend | REST | Engineering/DevSecOps owner — TBD, see ARC-OQ-008 |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | Existing repository standard | Exact framework/version TBD — see ARC-OQ-009 | User selected existing repository standard with exact framework TBD; supports frontend-only delivery without introducing new technology unnecessarily |
| Backend | No new backend component | Not applicable for first version | PRD states UI-only scope and no real authentication behavior; user selected existing frontend application only |
| Data | Existing frontend application configuration | Configuration source of record for provider name, redirect URL, help URL, logo reference, and page title | User selected existing frontend application configuration as system of record |
| Hosting | FedRAMP-authorized cloud environment aligned to existing compliance controls | Existing hosting platform; no new infrastructure expected | User selected FedRAMP-authorized hosting alignment and existing IaC for hosting platform |
| CI/CD | Existing frontend CI/CD pipeline | Normal release gates | User selected existing frontend CI/CD pipeline with normal release gates |
| Observability | Existing observability platform | Client-side render metric, navigation error logging without sensitive data, and standard frontend availability monitoring | User selected this observability model for the UI-only page |
| Security Scanning | Existing dependency/CVE scanning and SBOM tooling | Blocks high and critical findings; SBOM required | User selected high/critical blocking threshold and SBOM requirement |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — Login Page UI

- **Responsibility:** Render the red-themed login page with logo, page title, one named SSO button, help link, and error/status message area.
- **Inputs:** Page route request, frontend configuration from COMP-002, static assets from COMP-003.
- **Outputs:** Rendered login page, user navigation to configured SSO redirect URL, user navigation to configured help URL, client-side render metric.
- **Dependencies:** COMP-002, COMP-003, COMP-004, EXT-001, EXT-002.
- **Repository Area:** `TBD` — see ARC-OQ-010

#### COMP-002 — Frontend Login Configuration

- **Responsibility:** Provide login page configuration values including SSO provider display name, SSO redirect URL, help URL, logo reference, and page title.
- **Inputs:** Existing frontend application configuration managed through the existing repository/deployment process.
- **Outputs:** Runtime or build-time configuration values consumed by COMP-001.
- **Dependencies:** Existing frontend configuration management, CI/CD pipeline.
- **Repository Area:** `TBD` — see ARC-OQ-011

#### COMP-003 — Static Asset Delivery

- **Responsibility:** Deliver frontend bundle and logo/static assets through the existing hosting/CDN platform.
- **Inputs:** Built frontend artifact from COMP-005, logo asset reference from COMP-002.
- **Outputs:** Browser-delivered HTML, CSS, JavaScript, and static assets.
- **Dependencies:** EXT-003, existing infrastructure as code.
- **Repository Area:** `TBD` — see ARC-OQ-012

#### COMP-004 — Client Observability Adapter

- **Responsibility:** Emit page render metric, navigation error logging without sensitive data, and standard frontend availability signals.
- **Inputs:** Page render timing, navigation outcome signals, non-sensitive technical context.
- **Outputs:** Observability events/metrics to EXT-004.
- **Dependencies:** EXT-004, compliance-safe logging restrictions.
- **Repository Area:** `TBD` — see ARC-OQ-013

#### COMP-005 — Frontend CI/CD Pipeline

- **Responsibility:** Build, lint, test, scan, generate SBOM, package, and deploy the frontend change using normal release gates.
- **Inputs:** Source code, frontend configuration, tests, dependency manifests, pipeline definitions.
- **Outputs:** Versioned frontend build artifact, SBOM, scan results, deployed frontend assets.
- **Dependencies:** EXT-005, existing frontend hosting/CDN platform, existing infrastructure as code.
- **Repository Area:** `TBD` — see ARC-OQ-014

### 6.2 Data Flow

1. Authorized Application User requests the login page from the frontend hosting/CDN platform.
2. Frontend Hosting/CDN Platform returns the existing frontend application bundle and static assets for the login page.
3. Login Page UI reads existing frontend application configuration for page title, logo reference, SSO provider display name, SSO redirect URL, and help URL.
4. Login Page UI renders the red-themed page with logo, title, one named SSO button, help link, and empty or populated error/status message area.
5. Login Page UI emits a client-side page render metric and standard availability/navigation signals without sensitive data.
6. If the user selects the SSO button, the browser navigates to the configured SSO redirect URL; authentication behavior is owned by the external SSO provider and is outside this feature.
7. If the user selects the help link, the browser navigates to the configured login troubleshooting knowledge base article.
8. CI/CD builds and validates the frontend change, generates an SBOM, blocks high and critical CVE findings, and deploys the approved build artifact.
9. Rollback redeploys the previous frontend build artifact through the existing pipeline if needed.

## 7. Architecture Decisions

### ARD-DEC-001 — Implement Login Page as Frontend-Only Change

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-005, PRD-NFR-002

**Decision**

Implement the login page inside the existing frontend application only, with no new backend component, no data store, and no implementation of real authentication behavior.

**Rationale**

The PRD defines a UI-only login page and explicitly states the first version does not define real authentication behavior. The user selected existing frontend application only with no new backend component.

**Consequences**

- Keeps scope small and aligned to the approved PRD.
- Avoids introducing backend compliance, storage, and authentication responsibilities.
- Leaves authentication behavior, SSO callback processing, registration, and account recovery outside this architecture.

**Alternatives Considered**

- Existing full-stack application with backend changes — not selected because the PRD and interview constrain the feature to UI-only frontend scope.
- Standalone static frontend page — not selected because the user selected the existing frontend application.

### ARD-DEC-002 — Use Existing Repository Standard for Frontend Technology

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-NFR-001, PRD-NFR-003

**Decision**

Use the existing repository standard for frontend implementation. The exact framework and version remain TBD and must be resolved before implementation planning is finalized.

**Rationale**

The user selected “Existing repository standard, exact framework TBD,” which avoids inventing a framework while preserving alignment with established engineering patterns.

**Consequences**

- Reduces technology adoption risk.
- Requires ARC-OQ-009 to be resolved before implementation specifications can name exact framework conventions.
- Feature specifications must reference repository-standard styling, routing, testing, and accessibility patterns once identified.

**Alternatives Considered**

- React/TypeScript — not selected because the exact repository standard was not confirmed.
- Plain HTML/CSS/JavaScript static page — not selected because the feature fits into the existing frontend application.

### ARD-DEC-003 — Configure SSO Button Without Implementing Authentication Logic

- **Status:** Accepted
- **Related Requirements:** PRD-FR-003, PRD-NFR-002

**Decision**

Render a configured provider name and configured redirect URL for the SSO button. The page may navigate the browser to the configured redirect URL, but it must not implement authentication logic.

**Rationale**

The PRD requires one configured SSO provider button shown by name, and the user selected configured provider name plus configured redirect URL without authentication logic.

**Consequences**

- The login page can support SSO initiation visually and navigationally.
- SSO provider display name and redirect URL remain required configuration inputs.
- Authentication success, failure, callback handling, token processing, and authorization remain outside the feature.

**Alternatives Considered**

- Visual-only SSO button with no navigation — not selected because the user selected configured redirect URL.
- Calling an authentication service endpoint — not selected because no backend authentication behavior is in scope.

### ARD-DEC-004 — Use Existing Frontend Configuration as System of Record

- **Status:** Accepted
- **Related Requirements:** PRD-FR-002, PRD-FR-003, PRD-FR-004

**Decision**

Use existing frontend application configuration as the system of record for provider display name, SSO redirect URL, help URL, logo reference, and page title.

**Rationale**

The user selected existing frontend application configuration for login page configuration ownership.

**Consequences**

- Page content can be managed consistently with the existing frontend application.
- Missing configuration values must block final UI content approval where required by the PRD.
- Configuration must not contain secrets or sensitive user data.

**Alternatives Considered**

- Environment variables injected at build/deploy time — not selected by the user.
- Content management system — not selected by the user.

### ARD-DEC-005 — Host in FedRAMP-Authorized Cloud Environment Using Existing Hosting Controls

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-002, PRD-NFR-001

**Decision**

Deliver the login page through the existing hosting platform in a FedRAMP-authorized cloud environment aligned to existing compliance controls, with no new infrastructure expected.

**Rationale**

The company operates under FedRAMP, GDPR, HIPAA, PCI DSS, and SOC 2 compliance requirements, and the user selected FedRAMP-authorized hosting alignment plus existing infrastructure as code.

**Consequences**

- Preserves compliance boundary expectations for a financial services environment.
- Avoids new hosting infrastructure for a UI-only page.
- Requires the existing hosting platform and IaC ownership to be identified.

**Alternatives Considered**

- Static hosting/CDN outside the established compliance boundary — not selected due to compliance requirements.
- TBD hosting — not selected because the user chose FedRAMP-authorized cloud alignment.

### ARD-DEC-006 — Release Through Existing Frontend CI/CD With Security Gates

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-002, PRD-NFR-003

**Decision**

Deploy the login page through the existing frontend CI/CD pipeline with normal release gates, including build, lint, unit, accessibility, visual regression, E2E smoke, dependency scan, SBOM generation, and performance checks.

**Rationale**

The user selected existing frontend CI/CD with normal gates and identified required testing/security controls.

**Consequences**

- Provides a controlled, auditable release path.
- High and critical dependency/CVE findings block release.
- Rollback uses redeployment of the previous frontend build artifact.

**Alternatives Considered**

- Manual deployment after stakeholder approval — not selected because the existing CI/CD path provides stronger controls.
- Separate static-site pipeline — not selected because the page belongs in the existing frontend application.

### ARD-DEC-007 — Apply Compliance-Safe Observability Only

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-002

**Decision**

Collect client-side page render metrics, navigation error logging without sensitive data, and standard frontend availability monitoring.

**Rationale**

The user selected this observability approach and the PRD requires page-load validation while prohibiting collection/display of sensitive personal, financial, health, or payment data.

**Consequences**

- Enables validation of the page render target.
- Avoids logging sensitive user data.
- Requires observability events to be reviewed for compliance-safe payloads.

**Alternatives Considered**

- No dedicated observability — not selected because performance must be measurable.
- Server logs only — not sufficient for client-side render timing.

## 8. API and Integration Architecture

### ARD-API-001 — SSO Redirect Navigation

- **Type:** REST
- **Operation/Topic:** `GET <configured_sso_redirect_url>`
- **Provider:** EXT-001 / External SSO Provider
- **Consumers:** COMP-001 / Login Page UI through browser navigation
- **Authentication:** None performed by the login page; authentication is owned by the external SSO provider after navigation
- **Versioning:** Configuration-managed URL; versioning strategy TBD by SSO provider owner, see ARC-OQ-015

**Request/Input Contract**

Browser navigation to a configured HTTPS SSO redirect URL. The UI-only login page must not append user-entered financial, health, payment card, or sensitive personal data. Required provider-specific query parameters are TBD and owned by the SSO provider integration owner.

**Response/Output Contract**

Response is controlled by the external SSO provider and is outside the UI-only login page scope. The login page does not process tokens, credentials, callbacks, or authentication responses.

**Error Handling**

The approved PRD does not define SSO failure behavior. The page may log non-sensitive navigation error telemetry if observable in the browser, but must not display undefined placeholder errors, collect credentials, process authentication failures, retry authentication, or implement idempotency logic.

### ARD-API-002 — Login Help Article Navigation

- **Type:** REST
- **Operation/Topic:** `GET <configured_login_help_url>`
- **Provider:** EXT-002 / Login Troubleshooting Knowledge Base
- **Consumers:** COMP-001 / Login Page UI through browser navigation
- **Authentication:** Determined by the knowledge base; the login page does not authenticate the request
- **Versioning:** Configuration-managed URL; content versioning owned by knowledge base owner

**Request/Input Contract**

Browser navigation to a configured HTTPS URL for the login troubleshooting knowledge base article. No user-entered data is sent by the login page.

**Response/Output Contract**

Knowledge base article content rendered by the external knowledge base system. The login page does not control the article response.

**Error Handling**

The approved PRD does not define help-link failure behavior. Navigation failures may be recorded only as non-sensitive client telemetry if supported by existing observability patterns.

### ARD-API-003 — Client Observability Events

- **Type:** REST
- **Operation/Topic:** `POST <observability_ingest_endpoint>`
- **Provider:** EXT-004 / Observability Platform
- **Consumers:** COMP-004 / Client Observability Adapter
- **Authentication:** Existing frontend observability authentication or ingestion token mechanism; exact method TBD, see ARC-OQ-016
- **Versioning:** Existing observability event schema versioning; exact schema TBD, see ARC-OQ-017

**Request/Input Contract**

Non-sensitive event payloads for page render metric, navigation error logging, and standard frontend availability monitoring. Payloads must exclude credentials, tokens, financial data, health data, payment card data, and sensitive personal data.

**Response/Output Contract**

Observability platform acknowledgement or client-side best-effort delivery result, following existing frontend observability behavior.

**Error Handling**

Observability delivery must be non-blocking and must not prevent the login page from rendering. Retries, if any, must follow existing frontend observability standards and must not create duplicate user-facing behavior.

## 9. Data Architecture

### DATA-001 — Login Page Configuration

- **Purpose:** Store non-secret configuration for page title, logo reference, SSO provider display name, SSO redirect URL, and help URL.
- **System of Record:** Existing frontend application configuration.
- **Classification:** Internal.
- **Retention:** Existing configuration retention policy; exact policy TBD, see ARC-OQ-018.
- **Key Relationships:** Consumed by COMP-001; managed through COMP-002 and deployed by COMP-005.

### DATA-002 — Static Login Page Assets

- **Purpose:** Provide frontend bundle, styles, and logo/static assets required to render the login page.
- **System of Record:** Existing frontend repository/build artifact store and hosting/CDN platform.
- **Classification:** Internal.
- **Retention:** Existing build artifact and static asset retention policy; exact policy TBD, see ARC-OQ-019.
- **Key Relationships:** Built by COMP-005, delivered by COMP-003, rendered by COMP-001.

### DATA-003 — Client Render and Navigation Telemetry

- **Purpose:** Measure page render time, capture navigation error logging without sensitive data, and support standard frontend availability monitoring.
- **System of Record:** Existing observability platform.
- **Classification:** Internal, provided payloads contain no sensitive data.
- **Retention:** Existing observability retention policy; exact policy TBD, see ARC-OQ-020.
- **Key Relationships:** Emitted by COMP-004, used to validate PRD-NFR-001 and monitor frontend behavior.

### Data Migration

- **Required:** No
- **Approach:** Not applicable. The feature is UI-only, stores no user-entered data, introduces no new datastore, and requires no migration.

## 10. Security Architecture

### ARD-SEC-001 — Compliance-Safe UI-Only Login Boundary

- **Related Requirements:** PRD-NFR-002, PRD-FR-003, PRD-FR-005

The implementation must:

- Keep the page UI-only and avoid implementing authentication, token processing, credential handling, registration, account recovery, or user profile management.
- Avoid requesting, collecting, displaying, storing, logging, or transmitting financial data, health data, payment card data, credentials, tokens, or sensitive personal data from this page.
- Use HTTPS URLs for SSO redirect, help navigation, asset delivery, and observability event submission.
- Keep SSO provider display name, redirect URL, help URL, page title, and logo reference in non-secret frontend configuration.
- Preserve FedRAMP, GDPR, HIPAA, PCI DSS, and SOC 2 compliance expectations by using the existing compliant hosting, CI/CD, scanning, logging, and observability controls.

The implementation must not:

- Add username, password, payment card, health information, financial information, or sensitive personal data fields to the page.
- Store credentials, tokens, SSO assertions, authentication responses, or user profile data.
- Log query strings or payloads that contain credentials, tokens, financial data, health data, payment card data, or sensitive personal data.
- Add a backend authentication endpoint or new datastore for this feature.
- Implement registration or account recovery flows.

### ARD-SEC-002 — Public Page With No Authorization Grant

- **Related Requirements:** PRD-NFR-002, PRD-FR-003

The implementation must:

- Allow the login page itself to be publicly reachable as an entry point.
- Ensure the login page grants no application access by itself.
- Leave authentication and downstream authorization enforcement to the external SSO provider and downstream application.

The implementation must not:

- Treat page access as proof of identity or authorization.
- Reveal protected application data before successful downstream authentication and authorization.
- Perform role authorization in the login page UI.

### ARD-SEC-003 — Frontend Supply Chain Controls

- **Related Requirements:** PRD-NFR-002

The implementation must:

- Run dependency/CVE scanning in the existing frontend CI/CD pipeline.
- Block release on high and critical dependency/CVE findings.
- Generate an SBOM for the frontend build artifact.
- Run required build, lint, and test gates before deployment.

The implementation must not:

- Deploy when high or critical dependency/CVE findings remain unresolved or unapproved through existing exception processes.
- Include secrets in frontend code, frontend configuration, SBOM output, logs, or static assets.

### Security Controls

- **Authentication:** The login page performs no authentication; authentication is delegated to the configured external SSO provider after browser navigation.
- **Authorization:** The page is publicly reachable but grants no application access; authorization remains with the external SSO provider and downstream application.
- **Secrets Management:** No secrets may be stored in frontend code or frontend configuration for this feature; any existing observability ingestion token handling must follow existing frontend secret/configuration standards.
- **Encryption:** HTTPS/TLS is required in transit for page delivery, SSO redirect navigation, help navigation, and observability submission; no new data at rest is introduced beyond existing frontend configuration, artifacts, and telemetry stores.
- **Audit Logging:** CI/CD build, test, scan, SBOM, deployment, and rollback events must follow existing audit logging controls; client telemetry must exclude sensitive data.
- **Dependency/CVE Scanning:** Existing scanning must block high and critical findings before release.
- **SBOM:** Required for the frontend build artifact.

## 11. Reliability, Performance, and Scalability

### ARD-OPS-001 — Initial Page Render Performance

- **Target:** Initial login page renders in under 5 seconds on standard broadband.
- **Validation Method:** Browser performance measurement in a representative test environment, using the same standard broadband definition required by PRD-NFR-001 and tracked in ARC-OQ-021.

### ARD-OPS-002 — Non-Blocking Observability

- **Target:** Observability event delivery must not block rendering of COMP-001.
- **Validation Method:** Frontend test or browser inspection confirming the page renders when observability submission fails or is unavailable.

### ARD-OPS-003 — Rollback Readiness

- **Target:** The previous frontend build artifact can be redeployed through the existing frontend CI/CD pipeline.
- **Validation Method:** Non-production rollback exercise or documented pipeline evidence showing prior artifact redeployment.

### ARD-OPS-004 — Accessibility of Red Theme

- **Target:** Required text, controls, links, and focus states remain readable and visually identifiable under the red theme.
- **Validation Method:** Accessibility check covering contrast/readability and keyboard focus behavior for SSO button and help link.

## 12. Observability

- **Logging:** Capture navigation error logging only when supported by existing frontend patterns and only without credentials, tokens, financial data, health data, payment card data, or sensitive personal data.
- **Metrics:** Capture client-side page render metric sufficient to validate initial render under 5 seconds on standard broadband.
- **Tracing:** No new distributed tracing requirement for this UI-only page; any existing frontend tracing may be used only if it excludes sensitive data.
- **Alerting:** Use standard frontend availability monitoring alerts from the existing observability platform; exact thresholds are TBD and owned by Operations in ARC-OQ-022.
- **Sensitive Data Restrictions:** Observability payloads must exclude credentials, tokens, SSO assertions, financial data, health data, payment card data, query strings containing sensitive values, and sensitive personal data.

## 13. Deployment Architecture

- **Environments:** Dev, test, stage, and prod.
- **Deployment Model:** Existing frontend application deployment to a FedRAMP-authorized cloud environment aligned to existing compliance controls.
- **CI/CD:** Existing frontend CI/CD pipeline with normal release gates, including build, lint, unit, accessibility, visual regression, E2E smoke, dependency scan, SBOM generation, and performance check.
- **Configuration Management:** Existing frontend application configuration is the system of record for provider display name, SSO redirect URL, help URL, logo reference, and page title.
- **Rollback:** Redeploy the previous frontend build artifact through the existing frontend CI/CD pipeline.
- **Infrastructure as Code:** Use existing infrastructure as code for the hosting platform; no new infrastructure expected.

## 14. Testing Architecture

Required test levels:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests
- Security tests
- Performance tests, where applicable

Minimum quality expectations:

- **Coverage Threshold:** 80% line coverage for changed frontend code.
- **Blocking Security Severity:** High and critical dependency/CVE findings block release.
- **Required Build/Lint Checks:** Existing frontend build and lint checks must pass.
- **Required Accessibility Checks:** Red-theme readability, contrast, and keyboard focus behavior for the SSO button and help link must pass.
- **Required Visual Regression Checks:** Login page layout must show logo, page title, one named SSO button, help link, and error/status message area.
- **Required E2E Smoke Checks:** Login page route renders; SSO button and help link are visible; configured navigation targets are present without testing real authentication behavior.
- **Required Performance Check:** Initial login page render validates PRD-NFR-001 target of under 5 seconds on standard broadband.
- **Required Security Checks:** Dependency/CVE scan and SBOM generation must complete successfully according to ARD-SEC-003.

## 15. Architecture Constraints

- ARC-CON-001 — The solution is for a small business in financial services.
- ARC-CON-002 — Compliance requirements include FedRAMP, GDPR, HIPAA, PCI DSS, and SOC 2.
- ARC-CON-003 — The first version is UI-only and must not define or implement real authentication behavior.
- ARC-CON-004 — The solution must use the existing frontend application only and introduce no new backend component.
- ARC-CON-005 — Single sign-on is the only selected login method.
- ARC-CON-006 — Registration and account recovery are out of scope.
- ARC-CON-007 — The page must display a red primary theme with accessible/readable required content.
- ARC-CON-008 — The page must display logo, page title, one named SSO button, help link, and error/status message area.
- ARC-CON-009 — SSO provider display name is TBD and must be resolved before final UI content approval.
- ARC-CON-010 — The SSO button must use configured provider name and configured redirect URL without implementing authentication logic.
- ARC-CON-011 — Existing frontend application configuration is the system of record for login page configuration values.
- ARC-CON-012 — Hosting must use a FedRAMP-authorized cloud environment aligned to existing compliance controls.
- ARC-CON-013 — Existing frontend CI/CD pipeline with normal release gates must be used.
- ARC-CON-014 — Dependency/CVE scanning blocks high and critical findings, and SBOM is required.
- ARC-CON-015 — No user-entered data is stored by this feature; configuration is Internal; client metrics/logs retain no sensitive data and follow existing retention policy.
- ARC-CON-016 — Environments are dev, test, stage, and prod.
- ARC-CON-017 — Rollback is by redeploying the previous frontend build artifact.
- ARC-CON-018 — Existing infrastructure as code must be used for the hosting platform; no new infrastructure is expected.
- ARC-CON-019 — The page is publicly reachable but grants no application access; access control remains with the external SSO provider and downstream application.
- ARC-CON-020 — Target release has no fixed deadline; release occurs when approved.

## 16. Risks and Trade-offs

| ID | Risk/Trade-off | Impact | Mitigation |
|---|---|---|---|
| ARC-RISK-001 | SSO provider name remains TBD and blocks final button copy | Medium | Track ARC-OQ-004 and resolve before final UI content approval |
| ARC-RISK-002 | SSO redirect URL remains TBD and blocks navigational implementation | Medium | Track ARC-OQ-015 and require configured HTTPS redirect URL before release |
| ARC-RISK-003 | Exact frontend framework and repository paths are TBD | Medium | Track ARC-OQ-009 through ARC-OQ-014 before feature specification or implementation |
| ARC-RISK-004 | Red theme may reduce readability or focus visibility | Medium | Require accessibility checks for contrast/readability and keyboard focus behavior |
| ARC-RISK-005 | Compliance expectations may expand beyond UI-only scope | High | Enforce ARD-SEC-001 boundary and avoid sensitive data collection, logging, storage, authentication, and backend changes |
| ARC-RISK-006 | Observability payloads may accidentally include sensitive data | High | Restrict telemetry schema to non-sensitive render/navigation metadata and review against FedRAMP, GDPR, HIPAA, PCI DSS, and SOC 2 constraints |
| ARC-RISK-007 | Performance target depends on an undefined “standard broadband” test environment | Medium | Track ARC-OQ-021 and define representative browser/network test setup before final performance validation |
| ARC-RISK-008 | Using existing repository standard reduces architecture specificity until implementation planning | Low | Accept as a trade-off to avoid inventing stack details not confirmed by the PRD or interview |

## 17. Open Architecture Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| ARC-OQ-001 | What exact product/application name should appear in ARD metadata and page title configuration? | Product Owner | Open | TBD |
| ARC-OQ-002 | Who is the Architecture Owner for this ARD? | Engineering Lead | Open | TBD |
| ARC-OQ-003 | Who are the ARD contributors? | Engineering Lead | Open | TBD |
| ARC-OQ-004 | What configured SSO provider display name and provider owner should be used? | Product Owner | Open | TBD |
| ARC-OQ-005 | Who owns the login troubleshooting knowledge base article? | Product Owner | Open | TBD |
| ARC-OQ-006 | Who owns the frontend hosting/CDN platform? | Platform/Infrastructure Lead | Open | TBD |
| ARC-OQ-007 | Who owns the observability platform for frontend metrics/logging? | Operations Lead | Open | TBD |
| ARC-OQ-008 | Who owns the CI/CD and security scanning toolchain? | DevSecOps Lead | Open | TBD |
| ARC-OQ-009 | What exact frontend framework and version define the existing repository standard? | Engineering Lead | Open | TBD |
| ARC-OQ-010 | What repository path will contain the Login Page UI component? | Engineering Lead | Open | TBD |
| ARC-OQ-011 | What repository path will contain frontend login configuration? | Engineering Lead | Open | TBD |
| ARC-OQ-012 | What repository path or artifact location controls static asset delivery? | Engineering Lead | Open | TBD |
| ARC-OQ-013 | What repository path will contain the client observability adapter changes? | Engineering Lead | Open | TBD |
| ARC-OQ-014 | What repository path contains the frontend CI/CD pipeline definitions? | DevSecOps Lead | Open | TBD |
| ARC-OQ-015 | What exact configured HTTPS SSO redirect URL and provider URL versioning strategy should be used? | Product Owner / SSO Provider Owner | Open | TBD |
| ARC-OQ-016 | What existing frontend observability authentication or ingestion token method applies? | Operations Lead | Open | TBD |
| ARC-OQ-017 | What existing observability event schema/version should the page render metric use? | Operations Lead | Open | TBD |
| ARC-OQ-018 | What exact retention policy applies to frontend login configuration? | Compliance Owner | Open | TBD |
| ARC-OQ-019 | What exact retention policy applies to frontend build artifacts and static assets? | Platform/Infrastructure Lead | Open | TBD |
| ARC-OQ-020 | What exact retention policy applies to client render and navigation telemetry? | Compliance Owner | Open | TBD |
| ARC-OQ-021 | What exact browser, device class, and network profile define “standard broadband” for PRD-NFR-001 validation? | Product Owner / QA Lead | Open | TBD |
| ARC-OQ-022 | What alert thresholds apply to standard frontend availability monitoring for this page? | Operations Lead | Open | TBD |
| ARC-OQ-023 | What exact logo asset should be used on the login page? | Product Owner | Open | TBD |
| ARC-OQ-024 | What exact HTTPS URL should the login troubleshooting knowledge base help link use? | Product Owner | Open | TBD |

## 18. Feature Mapping

| Feature | Relevant Components | Decision IDs | Interface IDs | Security IDs |
|---|---|---|---|---|
| FEAT-001 | COMP-001, COMP-002, COMP-003, COMP-004, COMP-005 | ARD-DEC-001, ARD-DEC-002, ARD-DEC-003, ARD-DEC-004, ARD-DEC-005, ARD-DEC-006, ARD-DEC-007 | ARD-API-001, ARD-API-002, ARD-API-003 | ARD-SEC-001, ARD-SEC-002, ARD-SEC-003 |

## 19. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Solution Architect | TBD | Pending | TBD |
| Security Reviewer | TBD | Pending | TBD |
| Engineering Lead | TBD | Pending | TBD |