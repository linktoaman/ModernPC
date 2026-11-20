# Architecture Requirements Document (ARD)

> Every material architecture decision or constraint has a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** Patient Portal Login Page
- **Document ID:** ARD-PPL
- **Version:** 0.1
- **Status:** Draft
- **Architecture Owner:** TBD — Solution Architect, see ARC-OQ-001
- **Contributors:** TBD — Engineering Lead, Security Reviewer, Product Owner, see ARC-OQ-001
- **Last Updated:** 2026-11-20
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

The Patient Portal Login Page will be implemented inside the existing patient portal application by adding patient-facing pages and backend endpoints for email/password login, required email one-time-code MFA, password reset by email link, and post-login redirect to the portal home dashboard.

Authentication will be delegated to a managed healthcare-ready identity provider integrated with the portal. The identity provider will validate credentials, enforce email MFA for every patient login, send MFA codes and password reset emails through its built-in email delivery, and maintain its own identity-provider session. After MFA succeeds, the portal will establish a secure, HTTP-only application session cookie and redirect the patient to the portal home dashboard.

The architecture is driven by protected health information access after login, applicable healthcare privacy/security obligations, WCAG 2.1 AA accessibility, generic authentication error handling to reduce account enumeration risk, 99.9% monthly availability for core login flows, centralized security logging, account synchronization between the portal and managed identity provider, and HIPAA-eligible managed cloud hosting with a signed BAA.

## 2. Architecture Drivers

- PRD-FR-001 — Existing patients must submit email and password to start portal authentication.
- PRD-FR-002 — Every patient login must complete email one-time-code MFA before portal access.
- PRD-FR-003 — Authentication errors must be generic and must not reveal whether email, password, code, or account state caused failure.
- PRD-FR-004 — Existing patients must be able to reset passwords using an email reset link.
- PRD-FR-005 — Authenticated patients must be redirected to the portal home dashboard.
- PRD-NFR-001 — Login, MFA, and password reset flows must support healthcare privacy and security obligations for PHI access.
- PRD-NFR-002 — Login, MFA, and password reset user interfaces must meet WCAG 2.1 AA.
- PRD-NFR-003 — Core flows must present recoverable errors when authentication, MFA email, or password reset services are unavailable.
- CON-001 — The product is for a small healthcare business and must account for PHI access after login.
- CON-002 — First release supports existing patient accounts only.
- CON-003 — First release supports email/password login only as the primary authentication method.
- CON-004 — First release requires email one-time-code MFA for every patient login.
- CON-005 — First release must align with the broader patient portal release date, which is not yet finalized.

## 3. Architecture Principles

1. Prefer managed healthcare-ready identity capabilities over custom authentication implementation.
2. Minimize PHI exposure in the login layer and never log passwords, MFA codes, reset tokens, or unnecessary patient data.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Fail safely with generic authentication errors and clear service-unavailable messaging.
6. Design all login, MFA, and reset screens to meet WCAG 2.1 AA from the start.

## 4. System Context

### 4.1 Actors

- Existing Patient — Uses the login page, submits email/password, completes email MFA, requests password reset, and reaches the portal dashboard.
- Office Support Staff — Indirectly benefits from fewer routine login/access support calls; does not use this patient login page directly.
- Product Owner — Owns PRD open questions, success metrics, and release alignment with the broader portal.
- Security Reviewer — Reviews privacy/security controls before release for flows that provide access to PHI.
- Engineering Lead — Owns implementation details, CI/CD integration, route naming, and repository placement.
- Managed Identity Provider — Validates credentials, enforces email MFA, manages password reset, emits identity events, and maintains the identity-provider session.
- Existing Patient Portal — Hosts the login pages/backend endpoints, establishes the application session, protects dashboard access, and redirects authenticated patients.
- Centralized Logging/Security Monitoring — Receives application/security logs for authentication review without secrets or MFA codes.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Managed healthcare-ready identity provider | Credential validation, required email MFA, password reset, IdP session, identity audit logs | REST/OIDC or provider SDK, exact protocol TBD | Identity Provider Vendor / Engineering Lead |
| EXT-002 | Identity provider built-in email delivery | Send email one-time MFA codes and password reset links | Provider-managed email | Identity Provider Vendor |
| EXT-003 | Portal home dashboard | Destination after successful authentication and application session creation | Internal web route | Patient Portal Team |
| EXT-004 | Centralized application/security logging | Store and review authentication-related audit events | Log/event ingestion | Security/Operations Team |
| EXT-005 | Existing portal CI/CD and infrastructure-as-code platform | Build, test, scan, deploy, configure, and roll back portal changes | Pipeline/IaC tooling | Engineering/Operations Team |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | Existing patient portal frontend stack | TBD — Engineering Lead, see ARC-OQ-002 | The approved approach adds pages inside the existing patient portal application rather than creating a separate app. |
| Backend | Existing patient portal backend stack | TBD — Engineering Lead, see ARC-OQ-002 | Backend endpoints should reuse established portal patterns for session creation, auth orchestration, logging, and deployment. |
| Data | Managed identity provider identity store plus existing patient portal account data | Must synchronize existing patient account records between portal and IdP | Existing patient accounts remain the business basis for access while the IdP handles authentication capabilities. |
| Hosting | HIPAA-eligible managed cloud services with a signed BAA | Must support applicable healthcare privacy/security obligations for PHI access | PHI is accessible after login, so hosting must be appropriate for healthcare workloads. |
| Email | Managed identity provider built-in email delivery | Used for MFA codes and password reset links only | Keeps authentication email delivery within the managed identity boundary. |
| Observability | Centralized application/security logging plus managed IdP logs | Must not capture passwords, MFA codes, reset tokens, or unnecessary PHI | PRD-NFR-001 requires authentication events sufficient for security review. |
| CI/CD | Existing portal CI/CD and infrastructure-as-code standards | Must include build, lint, unit tests, integration tests, accessibility checks, and security scans | Reuses established deployment path while adding required gates for healthcare authentication. |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — Patient Authentication UI

- **Responsibility:** Render WCAG 2.1 AA-compliant login, MFA, password reset request, and reset completion pages inside the existing portal.
- **Inputs:** Patient email, password, MFA code, password reset request email, new password, validation states.
- **Outputs:** Form submissions to authentication orchestration endpoints; accessible field validation and generic/recoverable errors.
- **Dependencies:** COMP-002, existing portal frontend framework, WCAG 2.1 AA implementation patterns.
- **Repository Area:** `TBD — Engineering Lead, see ARC-OQ-003`

#### COMP-002 — Authentication Orchestration Endpoints

- **Responsibility:** Coordinate login, MFA verification, password reset, error handling, session establishment, logging, and redirect behavior inside the existing portal backend.
- **Inputs:** Login form submissions, MFA submissions, password reset requests, reset completion submissions, IdP responses.
- **Outputs:** Generic auth errors, recoverable service errors, application session cookie, redirect to portal dashboard, audit log events.
- **Dependencies:** COMP-003, COMP-004, COMP-005, COMP-006, EXT-001, EXT-004.
- **Repository Area:** `TBD — Engineering Lead, see ARC-OQ-003`

#### COMP-003 — Managed Identity Provider Integration

- **Responsibility:** Integrate with the managed healthcare-ready identity provider for credential validation, required email MFA, password reset, and identity-provider session handling.
- **Inputs:** Authentication requests, MFA verification requests, password reset requests, account synchronization records.
- **Outputs:** Authentication status, MFA challenge status, reset status, identity-provider audit events, IdP session.
- **Dependencies:** EXT-001, EXT-002, COMP-007.
- **Repository Area:** `TBD — Engineering Lead, see ARC-OQ-003`

#### COMP-004 — Application Session Manager

- **Responsibility:** Establish and validate the secure, HTTP-only application session cookie after successful IdP authentication and MFA.
- **Inputs:** Verified identity assertion/session from COMP-003.
- **Outputs:** Secure, HTTP-only application session cookie; authorization decision for portal dashboard access.
- **Dependencies:** COMP-002, COMP-003, existing portal session framework.
- **Repository Area:** `TBD — Engineering Lead, see ARC-OQ-003`

#### COMP-005 — Audit Logging Adapter

- **Responsibility:** Emit sanitized authentication, MFA, password reset, session, and service-error events to centralized application/security logging.
- **Inputs:** Authentication outcomes, MFA outcomes, password reset outcomes, service availability errors, session creation events.
- **Outputs:** Security-reviewable audit events without passwords, MFA codes, reset tokens, or unnecessary PHI.
- **Dependencies:** EXT-004, COMP-002, COMP-003.
- **Repository Area:** `TBD — Engineering Lead, see ARC-OQ-003`

#### COMP-006 — Portal Dashboard Access Gate

- **Responsibility:** Deny dashboard access unless email/password and MFA have completed and a valid application session exists.
- **Inputs:** Patient request for portal dashboard, application session cookie, identity/session state.
- **Outputs:** Redirect to login or allow portal dashboard access.
- **Dependencies:** COMP-004, EXT-003.
- **Repository Area:** `TBD — Engineering Lead, see ARC-OQ-003`

#### COMP-007 — Patient Account Synchronization

- **Responsibility:** Synchronize existing patient account records between the portal and managed identity provider before launch and as required operationally.
- **Inputs:** Existing patient account records from the portal identity/account system.
- **Outputs:** Corresponding patient identity records in the managed identity provider; sync status/audit records.
- **Dependencies:** Existing portal account data, EXT-001, COMP-005.
- **Repository Area:** `TBD — Engineering Lead, see ARC-OQ-003`

### 6.2 Data Flow

1. Existing Patient opens the login page rendered by COMP-001 inside the existing patient portal.
2. COMP-001 submits email and password to COMP-002 over HTTPS.
3. COMP-002 calls COMP-003 to validate credentials with EXT-001.
4. EXT-001 accepts valid credentials, starts a required email MFA challenge, and sends the one-time code through EXT-002.
5. COMP-002 returns the MFA step to COMP-001 without exposing credential validation details beyond the expected next step.
6. Existing Patient submits the email one-time code through COMP-001 to COMP-002.
7. COMP-002 calls COMP-003 to verify the MFA code with EXT-001.
8. After MFA succeeds, COMP-004 establishes a secure, HTTP-only application session cookie using the verified identity/session from EXT-001.
9. COMP-005 emits sanitized authentication and session events to EXT-004 while relying on EXT-001 for provider-side identity audit logs.
10. COMP-002 redirects the patient to EXT-003, and COMP-006 permits access only when the application session is valid.
11. For password reset, COMP-001 submits an email address to COMP-002, COMP-002 calls COMP-003, EXT-001 sends a reset link through EXT-002 if eligible, and COMP-001 displays a neutral confirmation regardless of account existence.
12. COMP-007 synchronizes existing patient account records between the portal and EXT-001 before launch and according to the operational sync design.

## 7. Architecture Decisions

### ARD-DEC-001 — Use Managed Healthcare-Ready Identity Provider

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-004, PRD-NFR-001, PRD-NFR-003

**Decision**

The login page will use a managed healthcare-ready identity provider integrated with the existing patient portal for email/password authentication, required email MFA, password reset, identity-provider session handling, and identity audit logs.

**Rationale**

The product is a healthcare patient portal entry point that may expose PHI after login. A managed identity provider reduces custom authentication risk, supports healthcare-oriented security capabilities, and accelerates delivery for a small business.

**Consequences**

- Reduces custom credential, MFA, and reset-token implementation responsibility.
- Introduces dependency on IdP availability, configuration, logs, and contractual eligibility for healthcare workloads.
- Requires integration and account synchronization between the portal and the IdP.

**Alternatives Considered**

- Build a custom authentication service — not selected because custom authentication increases security, maintenance, and compliance review burden.
- Use the existing portal identity/account system directly — not selected because the chosen direction is a managed healthcare-ready IdP integrated with the portal.

### ARD-DEC-002 — Implement Inside Existing Patient Portal Application

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-004, PRD-FR-005, PRD-NFR-002

**Decision**

The login, MFA, password reset, and post-login redirect capabilities will be added as pages and backend endpoints inside the existing patient portal application.

**Rationale**

This avoids a separate application boundary for a simple first release, reuses portal routing, session, deployment, observability, and accessibility patterns, and keeps the patient experience aligned with the existing portal.

**Consequences**

- Faster delivery if existing portal patterns are mature.
- Requires coordination with the portal release schedule and repository structure.
- The exact frontend/backend technology remains TBD and must be documented before implementation details are finalized.

**Alternatives Considered**

- Separate frontend app with backend-for-frontend — not selected because it adds deployment and integration complexity for a simple login page.
- Dedicated server-rendered authentication app — not selected because existing portal integration is the approved approach.

### ARD-DEC-003 — Host on HIPAA-Eligible Managed Cloud Services With Signed BAA

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-003

**Decision**

The application and supporting services for the login flows will run on HIPAA-eligible managed cloud services with a signed BAA.

**Rationale**

The login flows grant access to PHI after authentication, and the company is in healthcare. Hosting must support applicable healthcare privacy/security obligations.

**Consequences**

- Narrows provider/service choices to healthcare-eligible configurations.
- Requires operations and procurement to confirm BAA coverage for selected cloud and identity services.
- Supports the pre-release privacy/security review required by PRD-NFR-001.

**Alternatives Considered**

- Same hosting environment without explicit HIPAA-eligible/BAA constraint — not selected because PHI access after login requires healthcare-appropriate hosting assurances.
- On-premises infrastructure — not selected because managed cloud services better fit the small-business delivery model.

### ARD-DEC-004 — Use Identity Provider Built-In Email Delivery

- **Status:** Accepted
- **Related Requirements:** PRD-FR-002, PRD-FR-004, PRD-NFR-003

**Decision**

Email one-time MFA codes and password reset links will be sent using the managed identity provider’s built-in email delivery.

**Rationale**

This keeps authentication-related email generation, token handling, and delivery workflows within the managed identity boundary and avoids separate transactional-email integration for the first release.

**Consequences**

- Simplifies implementation and reduces token exposure outside the IdP.
- Email deliverability and template constraints depend on the IdP.
- Monitoring and recoverable error handling must account for IdP email-delivery failures.

**Alternatives Considered**

- Existing patient portal email service — not selected because it would move MFA/reset email responsibilities outside the IdP.
- Separate HIPAA-eligible transactional email provider — not selected for first release simplicity.

### ARD-DEC-005 — Use IdP Session Plus Secure HTTP-Only Application Session Cookie

- **Status:** Accepted
- **Related Requirements:** PRD-FR-002, PRD-FR-005, PRD-NFR-001

**Decision**

After successful email/password authentication and MFA, the system will rely on the managed identity provider session and establish a secure, HTTP-only application session cookie for the patient portal.

**Rationale**

The IdP session preserves the external identity context while the portal application session supports existing dashboard access control and server-side enforcement.

**Consequences**

- Prevents browser JavaScript access to the application session cookie.
- Requires session lifecycle coordination between the portal and IdP.
- Avoids storing bearer tokens directly in browser-accessible storage.

**Alternatives Considered**

- Stateless signed JWT stored by the browser — not selected because browser-stored tokens can increase exposure risk.
- Server-side session only with no IdP session — not selected because the IdP remains the source of authentication state.

### ARD-DEC-006 — Record Audit Events in IdP Logs and Centralized Security Logging

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-003

**Decision**

Authentication audit events will be available in both managed identity provider logs and centralized application/security logging, with application logs sanitized to exclude passwords, MFA codes, reset tokens, and unnecessary PHI.

**Rationale**

PRD-NFR-001 requires authentication events sufficient for security review without exposing secrets. IdP logs provide provider-side evidence, while centralized logs support cross-application monitoring and review.

**Consequences**

- Improves security review and operational troubleshooting.
- Requires log field controls and retention alignment with the healthcare business’s existing audit-log policy.
- Requires clear separation between audit metadata and sensitive authentication secrets.

**Alternatives Considered**

- IdP logs only — not selected because portal session and redirect behavior also need application-level visibility.
- Application logs only — not selected because IdP-side credential, MFA, and reset events are authoritative for authentication.

### ARD-DEC-007 — Synchronize Existing Patient Accounts With Managed Identity Provider

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-004

**Decision**

Existing patient account records will be synchronized between the patient portal and the managed identity provider before launch and maintained according to the operational sync design.

**Rationale**

The first release supports existing patient accounts only, while the selected authentication architecture delegates authentication to the IdP. Account synchronization is required so eligible existing patients can authenticate through the managed provider.

**Consequences**

- Requires a migration/synchronization design, validation, and rollback plan.
- Creates dependency on data quality in existing patient account records.
- Must avoid synchronizing unnecessary PHI into the IdP.

**Alternatives Considered**

- No migration or synchronization — not selected because the IdP must recognize existing patient accounts.
- Full patient data migration — not selected because authentication should require only the minimum identity/account data needed.

### ARD-DEC-008 — Use Existing Portal CI/CD and Infrastructure-as-Code Standards

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-002, PRD-NFR-003

**Decision**

Deployment will use the existing patient portal CI/CD and infrastructure-as-code standards, with required gates for build, lint, unit tests, integration tests, accessibility checks, and security scans that block high and critical findings.

**Rationale**

The implementation is inside the existing portal application, so the safest and simplest delivery model is to reuse established portal deployment and infrastructure patterns while adding required healthcare/security gates.

**Consequences**

- Keeps release mechanics consistent with the broader portal.
- Requires CI/CD updates if existing pipelines do not already include all required gates.
- Enables rollback through existing portal release mechanisms.

**Alternatives Considered**

- Manual deployment — not selected because healthcare authentication changes require repeatable, auditable deployment controls.
- IdP configuration only — not selected because application pages, endpoints, sessions, and logging also change.

### ARD-DEC-009 — Require SBOM and High/Critical Security Blocking

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001

**Decision**

The release process will scan dependencies and container/images where applicable, block high and critical security findings, and generate an SBOM for each release.

**Rationale**

The login flows protect access to PHI, so dependency and supply-chain visibility must be included in release evidence.

**Consequences**

- Improves vulnerability visibility and release governance.
- May require remediation or documented risk acceptance before release if scans identify high or critical issues.
- Requires artifact retention for SBOMs.

**Alternatives Considered**

- Block critical only — not selected because high findings are also material for a healthcare authentication surface.
- No SBOM — not selected because release-level supply-chain visibility is required.

## 8. API and Integration Architecture

### ARD-API-001 — Patient Login Submission

- **Type:** REST
- **Operation/Topic:** `POST TBD-login-route`
- **Provider:** COMP-002
- **Consumers:** COMP-001
- **Authentication:** Anonymous pre-authentication over HTTPS; protected by rate limiting and generic errors
- **Versioning:** Existing portal API versioning standard; exact route/version TBD, see ARC-OQ-004

**Request/Input Contract**

Fields: email address and password. Password must be transmitted only over HTTPS and must not be logged.

**Response/Output Contract**

On accepted credentials, returns an MFA-required state for the current authentication transaction. On invalid credentials, returns a generic authentication failure. On authentication service outage, returns a recoverable service-unavailable error that does not imply credentials are invalid.

**Error Handling**

Invalid credentials use generic error messaging per PRD-FR-003. Service failures use recoverable errors per PRD-NFR-003. Retries are patient-initiated. Backend must apply rate limiting and avoid account enumeration.

### ARD-API-002 — Email MFA Verification

- **Type:** REST
- **Operation/Topic:** `POST TBD-mfa-verification-route`
- **Provider:** COMP-002
- **Consumers:** COMP-001
- **Authentication:** In-progress authentication transaction over HTTPS; no portal dashboard access until success
- **Versioning:** Existing portal API versioning standard; exact route/version TBD, see ARC-OQ-004

**Request/Input Contract**

Fields: authentication transaction reference and email one-time code. MFA code must not be logged.

**Response/Output Contract**

On valid code, establishes the application session via COMP-004 and returns/initiates redirect to the portal home dashboard. On invalid code, returns a generic authentication failure.

**Error Handling**

Invalid or expired code conditions must not reveal account state or code validity details beyond a generic error. IdP/email service unavailability must produce a recoverable error per PRD-NFR-003. Verification must be non-idempotent from a security perspective and must follow IdP attempt limits.

### ARD-API-003 — Password Reset Request

- **Type:** REST
- **Operation/Topic:** `POST TBD-password-reset-request-route`
- **Provider:** COMP-002
- **Consumers:** COMP-001
- **Authentication:** Anonymous pre-authentication over HTTPS; protected by rate limiting and neutral confirmation
- **Versioning:** Existing portal API versioning standard; exact route/version TBD, see ARC-OQ-004

**Request/Input Contract**

Fields: email address. The endpoint must not reveal whether the email belongs to an account.

**Response/Output Contract**

Returns a neutral confirmation for all accepted requests. If the account is eligible, EXT-001 sends a reset link through EXT-002.

**Error Handling**

Account existence must not be disclosed. Email/IdP service unavailability returns a clear recoverable error indicating the action cannot be completed right now. Repeated requests must be rate limited.

### ARD-API-004 — Password Reset Completion

- **Type:** REST
- **Operation/Topic:** `POST TBD-password-reset-completion-route`
- **Provider:** COMP-002 / EXT-001 depending on IdP implementation
- **Consumers:** COMP-001 and/or EXT-001 hosted reset page, exact ownership TBD
- **Authentication:** Reset token/link from managed IdP over HTTPS
- **Versioning:** Existing portal or IdP versioning standard; exact route/version TBD, see ARC-OQ-004

**Request/Input Contract**

Fields: reset token or IdP reset context and new password. Reset token and password must not be logged.

**Response/Output Contract**

On success, old password no longer grants access and patient can return to login. On invalid/expired token, returns a recoverable reset failure without exposing sensitive token details.

**Error Handling**

Invalid or expired reset links must be handled without exposing token internals. Service failures return recoverable errors per PRD-NFR-003. Successful reset must invalidate the prior password through the IdP.

### ARD-API-005 — Patient Account Synchronization

- **Type:** Event
- **Operation/Topic:** `TBD-patient-account-sync-operation`
- **Provider:** COMP-007
- **Consumers:** EXT-001
- **Authentication:** Service-to-service credentials managed through approved secrets management
- **Versioning:** Existing portal integration versioning standard; exact mechanism TBD, see ARC-OQ-005

**Request/Input Contract**

Minimum patient identity/account attributes required by the managed IdP for existing patient login eligibility. PHI not required for authentication must not be synchronized.

**Response/Output Contract**

Sync success/failure status, identity mapping reference, and sanitized audit event.

**Error Handling**

Failed records must be retryable and auditable. Sync should support pre-launch validation and operational reconciliation. Idempotency must be based on stable account identity mapping to avoid duplicate IdP accounts.

## 9. Data Architecture

### DATA-001 — Patient Account Identity

- **Purpose:** Identify existing patient portal users eligible to authenticate through the managed identity provider.
- **System of Record:** Existing patient portal identity/account system, with synchronized identity records in EXT-001.
- **Classification:** Restricted
- **Retention:** Existing patient account retention policy, TBD — Product Owner/Security Reviewer, see ARC-OQ-006
- **Key Relationships:** Links existing portal patient account to managed IdP identity and application session.

### DATA-002 — Authentication Credentials

- **Purpose:** Validate patient email/password authentication.
- **System of Record:** Managed identity provider.
- **Classification:** Restricted
- **Retention:** Managed identity provider credential retention/password policy, TBD — Security Reviewer, see ARC-OQ-006
- **Key Relationships:** Associated with Patient Account Identity and IdP session.

### DATA-003 — MFA Challenge and Email One-Time Code

- **Purpose:** Verify the required second factor for every patient login.
- **System of Record:** Managed identity provider.
- **Classification:** Restricted
- **Retention:** Short-lived according to managed identity provider MFA policy, exact duration TBD — Security Reviewer, see ARC-OQ-006
- **Key Relationships:** Associated with an in-progress authentication transaction and patient account email.

### DATA-004 — Password Reset Token/Link

- **Purpose:** Allow existing patients to reset forgotten passwords by email link.
- **System of Record:** Managed identity provider.
- **Classification:** Restricted
- **Retention:** Short-lived according to managed identity provider reset policy, exact duration TBD — Security Reviewer, see ARC-OQ-006
- **Key Relationships:** Associated with Patient Account Identity and credential reset event.

### DATA-005 — Application Session

- **Purpose:** Authorize portal dashboard access after successful email/password and MFA authentication.
- **System of Record:** Existing patient portal application/session store or framework, exact mechanism TBD — Engineering Lead.
- **Classification:** Restricted
- **Retention:** Existing portal session timeout policy, TBD — Engineering Lead/Security Reviewer, see ARC-OQ-006
- **Key Relationships:** Derived from verified IdP identity/session and used by Portal Dashboard Access Gate.

### DATA-006 — Authentication Audit Event

- **Purpose:** Support security review, operational troubleshooting, and auditability for login, MFA, reset, session, and service-error events.
- **System of Record:** Managed identity provider logs and centralized application/security logging.
- **Classification:** Confidential
- **Retention:** Healthcare business’s existing audit-log policy.
- **Key Relationships:** References patient account identity by approved non-secret identifier; must not contain passwords, MFA codes, reset tokens, or unnecessary PHI.

### Data Migration

- **Required:** Yes
- **Approach:** Synchronize existing patient account records between the portal and managed identity provider before launch. The sync must use only minimum identity/account attributes needed for authentication, validate that existing eligible patients can authenticate, emit sanitized audit events, and provide retry/reconciliation handling for failed records. Exact sync mechanism and repository area are TBD and tracked in ARC-OQ-005.

## 10. Security Architecture

### ARD-SEC-001 — Healthcare Authentication Security Baseline

- **Related Requirements:** PRD-NFR-001, PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-005

The implementation must:

- Use HTTPS for all login, MFA, password reset, session, and synchronization traffic.
- Require email one-time-code MFA for every patient login before dashboard access.
- Use generic errors for invalid credentials and MFA failures.
- Display neutral password reset confirmation without revealing account existence.
- Use secure, HTTP-only application session cookies after successful MFA.
- Emit sanitized audit events sufficient for security review.
- Complete a pre-release privacy/security review for PHI access.
- Run on HIPAA-eligible managed cloud services with signed BAA coverage for applicable services.

The implementation must not:

- Log passwords, MFA codes, password reset tokens, or unnecessary PHI.
- Grant portal dashboard access before MFA completion.
- Reveal whether an email address exists in login or password reset flows.
- Store bearer tokens in browser-accessible storage.
- Synchronize PHI to the identity provider unless required and approved by security review.

### Security Controls

- **Authentication:** Managed healthcare-ready identity provider with email/password primary authentication and required email one-time-code MFA for every patient login.
- **Authorization:** Portal dashboard access requires a valid secure, HTTP-only application session established only after successful IdP authentication and MFA.
- **Secrets Management:** Service-to-service credentials and IdP integration secrets must use the existing portal approved secrets-management approach; exact tool TBD — Engineering Lead/Security Reviewer, see ARC-OQ-007.
- **Encryption:** TLS/HTTPS in transit for all user and service traffic; encryption at rest through HIPAA-eligible managed cloud, IdP, logging, and portal data stores.
- **Audit Logging:** IdP logs plus centralized application/security logging; logs must exclude passwords, MFA codes, reset tokens, and unnecessary PHI; retention follows the healthcare business’s existing audit-log policy.
- **Dependency/CVE Scanning:** Dependencies and container/images where applicable must be scanned; high and critical findings block release unless formally risk-accepted through the approved security process.
- **SBOM:** Required for each release and retained with release evidence.

## 11. Reliability, Performance, and Scalability

### ARD-OPS-001 — Monthly Availability for Core Authentication Flows

- **Target:** 99.9% monthly availability for login, MFA verification, and password reset flows.
- **Validation Method:** Production uptime monitoring and synthetic transactions for login-page availability, MFA route availability, and password reset route availability; IdP/email provider outages must be tracked as external dependency incidents.

### ARD-OPS-002 — Login Page Response Performance

- **Target:** Login form response under 2 seconds for 95% of requests, excluding patient email delivery time.
- **Validation Method:** Application performance monitoring and load/performance tests against the login form and backend login submission path before release.

### ARD-OPS-003 — Recoverable Dependency Failure Handling

- **Target:** Authentication, MFA email, and password reset service failures present recoverable user-facing errors without implying credentials are invalid.
- **Validation Method:** Integration and fault-injection tests simulating IdP and email-delivery unavailability.

### ARD-OPS-004 — Dashboard Access Enforcement

- **Target:** 100% of automated access-control tests deny dashboard access before successful email/password and MFA completion.
- **Validation Method:** Integration and end-to-end tests for unauthenticated, partially authenticated, failed MFA, and fully authenticated paths.

### ARD-OPS-005 — Accessibility Validation

- **Target:** Login, MFA, and password reset screens meet WCAG 2.1 AA.
- **Validation Method:** Automated accessibility checks plus manual keyboard and screen-reader validation before release.

## 12. Observability

- **Logging:** Log sanitized authentication attempts/outcomes, MFA challenge/verification outcomes, password reset request/completion outcomes, session creation outcomes, dependency failures, rate-limit events, and account sync outcomes without secrets or unnecessary PHI.
- **Metrics:** Track successful login rate, login-related error rate, failed login attempts, failed MFA attempts, password reset requests, reset completions, service-unavailable errors, latency percentiles, and monthly availability.
- **Tracing:** Trace portal application requests through authentication orchestration, IdP integration calls, session creation, logging, and redirect handling where supported by the existing portal observability stack.
- **Alerting:** Alert on availability below target, elevated authentication or MFA failure rates, IdP/email delivery failures, password reset failures, high service latency, account sync failures, and blocked security-scan findings.
- **Sensitive Data Restrictions:** Do not log passwords, MFA codes, reset tokens, full session cookie values, or unnecessary PHI; use approved identifiers and redaction for security review.

## 13. Deployment Architecture

- **Environments:** Existing portal environments, expected to include development, test, staging, and production; exact environment names TBD — Engineering Lead, see ARC-OQ-008.
- **Deployment Model:** Deploy login pages, backend endpoints, session changes, audit logging, and account sync through the existing portal application release model; configure IdP integration and email templates as controlled release changes.
- **CI/CD:** Existing portal CI/CD standards with mandatory build, lint, unit tests, integration tests, accessibility checks, dependency/container-image security scans, SBOM generation, and high/critical vulnerability blocking.
- **Configuration Management:** Existing portal infrastructure-as-code and configuration standards; IdP settings, redirect URIs, email templates, secrets references, and environment-specific values must be managed through approved configuration controls.
- **Rollback:** Use existing portal rollback mechanisms for application changes; IdP configuration changes require a documented rollback plan before production release.
- **Infrastructure as Code:** Existing portal infrastructure-as-code standards; exact tool TBD — Engineering Lead, see ARC-OQ-008.

## 14. Testing Architecture

Required test levels:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests
- Security tests
- Performance tests, where applicable

Minimum quality expectations:

- **Coverage Threshold:** No numeric threshold; all Must-priority PRD requirements must be covered with automated tests where feasible. Any Must requirement not covered by automation requires documented manual validation evidence.
- **Blocking Security Severity:** High and critical dependency, container/image, and application security findings block release unless formally risk-accepted through the approved security process.
- **Required Build/Lint Checks:** Build, lint, unit tests, integration tests, accessibility checks for WCAG 2.1 AA, security scans, SBOM generation, and release artifact verification.

## 15. Architecture Constraints

- ARC-CON-001 — The product is for a small healthcare business and must account for PHI access after login.
- ARC-CON-002 — Login flows must satisfy applicable healthcare privacy/security obligations and pass pre-release privacy/security review.
- ARC-CON-003 — Hosting must use HIPAA-eligible managed cloud services with a signed BAA.
- ARC-CON-004 — First release supports existing patient accounts only.
- ARC-CON-005 — First release supports email/password as the only primary authentication method.
- ARC-CON-006 — First release requires email one-time-code MFA for every patient login.
- ARC-CON-007 — Alternative MFA methods such as SMS and authenticator apps are out of scope.
- ARC-CON-008 — Staff, administrator, non-patient, and new patient self-registration flows are out of scope.
- ARC-CON-009 — Login, MFA, and password reset user interfaces must meet WCAG 2.1 AA.
- ARC-CON-010 — Authentication error messaging must be generic and must not reveal whether email, password, code, or account state caused failure.
- ARC-CON-011 — Password reset request confirmation must be neutral and must not reveal account existence.
- ARC-CON-012 — Authentication events must be logged for security review without passwords, MFA codes, reset tokens, or unnecessary PHI.
- ARC-CON-013 — First release must align with the broader patient portal release date, which is not yet finalized.
- ARC-CON-014 — Release must use existing portal CI/CD and infrastructure-as-code standards.
- ARC-CON-015 — Dependencies and container/images where applicable must be scanned; high and critical findings block release; SBOM is required for each release.

## 16. Risks and Trade-offs

| ID | Risk/Trade-off | Impact | Mitigation |
|---|---|---|---|
| ARC-RISK-001 | Patients may not receive MFA or password reset emails reliably through the IdP email channel | Patients cannot complete login/reset and may call the office | Monitor IdP email delivery failures, expose recoverable errors, and include synthetic/operational checks. |
| ARC-RISK-002 | Required MFA adds friction to a page intended to be simple | Lower login completion and higher support volume | Keep MFA UI minimal, use clear instructions, and track successful login rate and login error rate. |
| ARC-RISK-003 | Existing portal technology stack is not documented in this ARD | Implementation details, test tooling, and repository paths remain uncertain | Track stack decision in ARC-OQ-002 before feature specifications finalize implementation details. |
| ARC-RISK-004 | Account synchronization may fail for some existing patient records | Eligible patients may be unable to log in at launch | Validate sync before release, audit failed records, retry failures, and reconcile identity mappings. |
| ARC-RISK-005 | IdP outage affects login, MFA, and password reset availability | Core access flows may be unavailable | Use managed provider monitoring, recoverable errors, synthetic checks, and incident response. |
| ARC-RISK-006 | Healthcare privacy/security review may require additional controls | Release scope or schedule may change | Complete security review before release and treat review findings as blocking for PHI access. |
| ARC-RISK-007 | Undefined KPI baselines and targets limit success measurement | Product success may be hard to judge after launch | Keep PRD OQ-001 open and instrument metrics needed for baseline/target definition. |

## 17. Open Architecture Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| ARC-OQ-001 | Who are the named Architecture Owner, Engineering Lead, Security Reviewer, Product Owner, and contributors for this ARD? | Product Owner | Open | TBD |
| ARC-OQ-002 | What concrete frontend and backend technology stack/version is used by the existing patient portal application? | Engineering Lead | Open | TBD |
| ARC-OQ-003 | What repository paths will contain login UI, auth orchestration endpoints, IdP integration, session management, audit logging, dashboard gate, and account sync code? | Engineering Lead | Open | TBD |
| ARC-OQ-004 | What exact route names, API versioning strategy, and ownership boundaries will be used for login, MFA, password reset request, and password reset completion? | Engineering Lead | Open | TBD |
| ARC-OQ-005 | What exact patient account synchronization mechanism, cadence, source fields, identity mapping, and retry/reconciliation process will be used? | Engineering Lead / Security Reviewer | Open | TBD |
| ARC-OQ-006 | What exact retention policies apply to patient account identity, credentials, MFA challenges, reset tokens, and application sessions? | Security Reviewer / Product Owner | Open | TBD |
| ARC-OQ-007 | What approved secrets-management tool and process will store IdP integration credentials and service-to-service secrets? | Engineering Lead / Security Reviewer | Open | TBD |
| ARC-OQ-008 | What exact environment names, infrastructure-as-code tool, and rollback procedures apply in the existing portal platform? | Engineering Lead / Operations Team | Open | TBD |
| ARC-OQ-009 | Which managed healthcare-ready identity provider has been selected and is covered by the required BAA? | Product Owner / Security Reviewer | Open | TBD |
| ARC-OQ-010 | What is the broader patient portal release date that this login release must align with? | Product Owner | Open | TBD |
| ARC-OQ-011 | What are the baseline and target values for successful login rate, login-related support calls, and login error rate? | Product Owner | Open | TBD |

## 18. Feature Mapping

| Feature | Relevant Components | Decision IDs | Interface IDs | Security IDs |
|---|---|---|---|---|
| FEAT-001 | COMP-001, COMP-002, COMP-003, COMP-005 | ARD-DEC-001, ARD-DEC-002, ARD-DEC-006 | ARD-API-001 | ARD-SEC-001 |
| FEAT-002 | COMP-001, COMP-002, COMP-003, COMP-004, COMP-005, COMP-006 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-005, ARD-DEC-006 | ARD-API-002 | ARD-SEC-001 |
| FEAT-003 | COMP-001, COMP-002, COMP-003, COMP-005 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-006 | ARD-API-003, ARD-API-004 | ARD-SEC-001 |
| FEAT-004 | COMP-002, COMP-004, COMP-006 | ARD-DEC-002, ARD-DEC-005 | ARD-API-002 | ARD-SEC-001 |

## 19. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Solution Architect | TBD | Pending | TBD |
| Security Reviewer | TBD | Pending | TBD |
| Engineering Lead | TBD | Pending | TBD |