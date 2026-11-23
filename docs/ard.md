# Architecture Requirements Document (ARD)

> Every material architecture decision or constraint has a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** Pharmacy Application
- **Document ID:** ARD-PHARMACY-APP
- **Version:** 0.1
- **Status:** Draft
- **Architecture Owner:** TBD; see ARC-OQ-001
- **Contributors:** Product Owner TBD, Business Sponsor TBD, Engineering Lead TBD, Security Reviewer TBD
- **Last Updated:** 2026-11-23
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

The Pharmacy Application will be a HIPAA-aligned responsive web platform built with a TypeScript stack: React for the frontend, Node.js for a modular monolith backend API, and PostgreSQL for application data. It will serve patients, pharmacists, pharmacy technicians, and administrators through separate role-based experiences.

The architecture prioritizes secure PHI handling, simple operations for a small healthcare business, and focused first-release workflows: patient account registration, staff account provisioning, refill requests, manual prescription status updates, secure messaging, refill exception routing, and success metric event capture. The system will not integrate with a pharmacy management system in the first release; prescription, refill, and status data will be manually entered and updated by staff.

Production hosting is intentionally provider-neutral until vendor selection, but it must use HIPAA-eligible managed services under a Business Associate Agreement. Authentication will use a managed HIPAA-eligible identity provider. Authorization will be enforced by centralized server-side policy checks using identity-provider roles plus patient-record ownership checks.

## 2. Architecture Drivers

- PRD-FR-001 — Patients must be able to create accounts and access patient-facing pharmacy features.
- PRD-FR-002 — Staff accounts must be provisioned by an administrator rather than self-registered.
- PRD-FR-003 — Patient and staff users require separate role-based experiences.
- PRD-FR-004 — Patients must be able to submit refill requests through the responsive web application.
- PRD-FR-005 — Pharmacists and pharmacy technicians must be able to review refill requests and support 1-business-day review measurement.
- PRD-FR-006 — Patients must be able to view patient-friendly prescription and refill statuses.
- PRD-FR-007 — Staff must be able to manually update prescription and refill statuses.
- PRD-FR-008 — Patients and pharmacy staff must exchange secure messages inside the application.
- PRD-FR-009 — Refill exceptions must be routed to staff and displayed to patients with patient-friendly statuses.
- PRD-FR-010 — The system must record events needed to measure registration, refill submission, refill review, and status update activity.
- PRD-NFR-001 — The system must enforce HIPAA-aligned role-based access controls for PHI.
- PRD-NFR-002 — PHI must be encrypted in transit and at rest.
- PRD-NFR-003 — The system must maintain audit logs for PHI access.
- PRD-NFR-004 — Protected areas must require secure authentication and automatic session timeout.
- PRD-NFR-005 — The responsive web application must meet WCAG 2.1 AA accessibility requirements.
- PRD-NFR-006 — The system must achieve 99.5% monthly availability after launch.
- PRD-NFR-007 — Common pages must load within 3 seconds under normal operating conditions.
- CON-001 — The application must support HIPAA compliance because it is for a healthcare business and handles PHI.
- CON-002 — Small-business constraints require focused scope and operational simplicity.
- CON-003 — The first release must be a responsive web application rather than native mobile applications.
- CON-004 — The first release must use manual staff entry and status updates for prescription data.
- CON-005 — Payments, insurance adjudication, delivery logistics, and inventory management are excluded from the first release.
- CON-006 — Target release date is TBD.

## 3. Architecture Principles

1. Protect PHI by default through least privilege, encryption, auditability, and secure managed services.
2. Prefer managed HIPAA-eligible platform services to reduce operational burden for a small business.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Design first-release workflows around manual pharmacy operations while preserving future integration boundaries.
6. Make compliance-sensitive policies, retention, timeout, and notification behavior configurable where final business policy is TBD.

## 4. System Context

### 4.1 Actors

- Patient — Registers, signs in, submits refill requests, views prescription/refill status, and sends or receives secure messages.
- Pharmacist — Signs in with provisioned staff access, reviews refill requests, updates statuses, resolves exceptions, and responds to messages.
- Pharmacy Technician — Signs in with provisioned staff access, triages refill requests, updates allowed statuses, resolves assigned exceptions, and responds to messages.
- Administrator — Provisions staff accounts and reviews authorized operational or audit information.
- Managed Identity Provider — Authenticates users and supplies role claims to the application.
- Email/SMS Notification Provider — Sends non-PHI notifications that prompt users to sign in to view application content.
- Monitoring and Security Tooling — Receives logs, metrics, traces, security findings, and alerts for operations and compliance review.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Managed Identity Provider | Authenticate patients, staff, and administrators; issue tokens and role claims | OIDC/OAuth2 | Vendor TBD; see ARC-OQ-002 |
| EXT-002 | Email/SMS Notification Provider | Send non-PHI user notifications that direct users to sign in | REST/Event | Vendor TBD; see ARC-OQ-003 |
| EXT-003 | HIPAA-Eligible Hosting Platform | Run application, database, secrets, logs, monitoring, and backups under BAA | Managed Cloud Services | Vendor TBD; see ARC-OQ-004 |
| EXT-004 | CI/CD and Security Scanning Platform | Build, test, scan, generate SBOM, and deploy application artifacts | Pipeline/API | Engineering Lead TBD; see ARC-OQ-001 |
| EXT-005 | Observability Platform | Centralize structured logs, metrics, traces, uptime checks, and alerts | Agent/API | Operations Owner TBD; see ARC-OQ-001 |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | React with TypeScript | Exact versions TBD; current supported versions at implementation start | Supports responsive web UI, accessible component patterns, and shared TypeScript models |
| Backend | Node.js with TypeScript | Exact runtime/framework TBD; current LTS runtime required | Aligns with TypeScript stack and supports modular API development |
| Data | PostgreSQL | Managed encrypted PostgreSQL service; exact version TBD | Relational data model fits users, prescriptions, refills, messages, audit, and reporting |
| Hosting | HIPAA-eligible managed cloud services under BAA | Provider TBD; must support encryption, private networking, logging, backup, secrets, and monitoring | Meets HIPAA-aligned hosting needs while avoiding unnecessary infrastructure burden |
| Authentication | Managed HIPAA-eligible identity provider | OIDC/OAuth2; MFA-ready; role claims for patient, staff, and admin access | Reduces custom authentication risk and supports role-based access |
| Notifications | Email/SMS notification provider | No PHI permitted in notification payloads | Supports user engagement without exposing sensitive content outside the app |
| Observability | Centralized logs, metrics, traces, uptime checks, and alerting | Platform TBD | Required for 99.5% availability validation and security event monitoring |
| CI/CD | Automated build, test, security scan, SBOM, and deployment pipeline | Platform TBD | Enforces quality and security gates before release |
| Infrastructure | Infrastructure as code | Tool TBD | Reproducible HIPAA-aligned environments and controlled changes |
| Secrets | Managed secrets service | Provider TBD; rotation support required | Prevents secrets in source control, application images, and CI logs |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — Responsive Web Frontend

- **Responsibility:** Provide patient, staff, and administrator web experiences with responsive WCAG 2.1 AA compliant UI.
- **Inputs:** User interactions, authenticated session state, API responses, validation errors.
- **Outputs:** API requests, user-visible confirmations, patient-friendly statuses, secure messaging views.
- **Dependencies:** COMP-002, EXT-001.
- **Repository Area:** `apps/web` (assumption; final repository layout TBD in ARC-OQ-005)

#### COMP-002 — Modular Monolith Backend API

- **Responsibility:** Provide REST APIs and server-side orchestration for identity integration, patient workflows, staff workflows, prescription data, refill requests, messaging, audit logging, and reporting events.
- **Inputs:** Authenticated API requests, identity-provider token claims, notification requests from domain workflows.
- **Outputs:** API responses, persisted domain records, audit events, metric events, notification dispatch requests.
- **Dependencies:** COMP-003, COMP-004, COMP-005, COMP-006, EXT-001, EXT-002.
- **Repository Area:** `apps/api` (assumption; final repository layout TBD in ARC-OQ-005)

#### COMP-003 — Application Database

- **Responsibility:** Store application-owned users/profile links, prescriptions, refill requests, statuses, messages, audit events, and success metric events.
- **Inputs:** Validated persistence commands from COMP-002.
- **Outputs:** Transactional query results, reporting data, backup data.
- **Dependencies:** HIPAA-eligible managed PostgreSQL service from EXT-003.
- **Repository Area:** `packages/db` (assumption; final repository layout TBD in ARC-OQ-005)

#### COMP-004 — Identity and Access Module

- **Responsibility:** Validate tokens, map identity-provider users to application roles, enforce centralized authorization policies, and support staff provisioning workflows.
- **Inputs:** OIDC/OAuth2 tokens, role claims, staff provisioning requests, patient-record ownership checks.
- **Outputs:** Authorization decisions, user/session context, audit events for access decisions.
- **Dependencies:** EXT-001, COMP-003, COMP-006.
- **Repository Area:** `apps/api/src/modules/identity` (assumption; final repository layout TBD in ARC-OQ-005)

#### COMP-005 — Notification Adapter

- **Responsibility:** Send non-PHI email/SMS notifications and enforce payload restrictions before dispatch.
- **Inputs:** Notification intent events from backend workflows.
- **Outputs:** Non-PHI notification requests to EXT-002, delivery status records where available.
- **Dependencies:** EXT-002, COMP-006.
- **Repository Area:** `apps/api/src/modules/notifications` (assumption; final repository layout TBD in ARC-OQ-005)

#### COMP-006 — Audit and Reporting Module

- **Responsibility:** Capture HIPAA-sensitive audit events and success metric events for KPI measurement and authorized review.
- **Inputs:** Authentication events, PHI read/write events, refill events, message access events, status updates, admin provisioning events, authorization denials.
- **Outputs:** Immutable or tamper-evident audit records, metric records, operational reports.
- **Dependencies:** COMP-003, observability tooling in EXT-005.
- **Repository Area:** `apps/api/src/modules/audit-reporting` (assumption; final repository layout TBD in ARC-OQ-005)

### 6.2 Data Flow

1. Patient signs in through EXT-001 and receives an authenticated application session through COMP-001 and COMP-002.
2. COMP-001 sends patient workflow requests to COMP-002 over encrypted HTTPS.
3. COMP-004 validates token claims, role permissions, and patient-record ownership for every protected API request.
4. COMP-002 validates request data, executes domain logic, and persists prescriptions, refill requests, statuses, messages, and event data in COMP-003.
5. COMP-006 records authentication, PHI access, PHI writes, refill actions, message access, admin provisioning, and authorization denial audit events.
6. COMP-005 sends only non-PHI notification prompts through EXT-002 when workflows require user notification.
7. Pharmacists and pharmacy technicians sign in through EXT-001, review refill queues, update statuses, resolve exceptions, and respond to secure messages through COMP-001 and COMP-002.
8. Observability data from COMP-001, COMP-002, COMP-003, and platform services flows to EXT-005 for monitoring, alerting, and availability/performance validation.

## 7. Architecture Decisions

### ARD-DEC-001 — Use TypeScript React, Node.js, and PostgreSQL

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-003, PRD-FR-004, PRD-FR-008, PRD-NFR-005, PRD-NFR-007

**Decision**

The first release will use React with TypeScript for the responsive frontend, Node.js with TypeScript for the backend API, and PostgreSQL for application data.

**Rationale**

A TypeScript stack supports shared typing across frontend and backend while PostgreSQL provides strong relational integrity for users, prescriptions, refills, messages, audit events, and reporting events.

**Consequences**

- Enables shared schema and contract tooling across application layers.
- Requires Node.js operational expertise and PostgreSQL migration discipline.
- Exact framework and runtime versions remain TBD and must be finalized before implementation.

**Alternatives Considered**

- ASP.NET Core, React, and SQL Server — Not selected because the approved decision is TypeScript stack.
- Django and PostgreSQL — Not selected because the approved decision is TypeScript stack.
- Technology-neutral architecture — Not selected because a concrete stack was selected during architecture interview.

### ARD-DEC-002 — Use HIPAA-Eligible Managed Hosting Under BAA

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-002, PRD-NFR-003, PRD-NFR-006, CON-001

**Decision**

Production must run on HIPAA-eligible managed hosting services under a Business Associate Agreement. The specific provider is TBD.

**Rationale**

Managed HIPAA-eligible services reduce infrastructure burden for a small healthcare business while supporting encryption, monitoring, backup, and audit requirements.

**Consequences**

- Vendor selection must verify BAA availability and HIPAA-eligible service coverage.
- Architecture remains portable at the requirement level until provider selection.
- Provider-specific IaC modules cannot be finalized until ARC-OQ-004 is resolved.

**Alternatives Considered**

- Self-managed servers — Not selected because they increase operational and compliance burden.
- Non-BAA hosting — Not acceptable for PHI workflows.

### ARD-DEC-003 — Use Managed Identity Provider

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-NFR-001, PRD-NFR-004

**Decision**

Authentication will use a managed HIPAA-eligible identity provider with separate patient, staff, and administrator roles.

**Rationale**

Managed identity reduces custom password and session security risk and supports secure authentication, session controls, and role claims.

**Consequences**

- Application authorization still remains server-side and application-owned.
- Vendor selection must confirm HIPAA suitability, BAA support, OIDC/OAuth2 support, and session timeout controls.
- MFA readiness is required, even if all-user MFA is not explicitly mandated by the PRD.

**Alternatives Considered**

- Custom username/password authentication — Not selected because it increases security implementation risk.
- Existing pharmacy directory/SSO — Not selected because no such dependency is established for the first release.

### ARD-DEC-004 — Build a Modular Monolith Backend API

- **Status:** Accepted
- **Related Requirements:** PRD-FR-004, PRD-FR-005, PRD-FR-006, PRD-FR-007, PRD-FR-008, PRD-FR-009, PRD-FR-010

**Decision**

The backend will be a modular monolith with separated modules for identity, patients, prescriptions, refills, messaging, audit, notifications, and reporting.

**Rationale**

A modular monolith keeps deployment and operations simple for a small business while preserving internal boundaries for future growth or integration.

**Consequences**

- Single deployable backend simplifies CI/CD, rollback, and observability.
- Module boundaries must be enforced through code organization and testing.
- Future service extraction remains possible but is not required for the first release.

**Alternatives Considered**

- Microservices from launch — Not selected because they add operational complexity.
- Serverless functions per workflow — Not selected because cross-cutting HIPAA audit and authorization concerns are simpler in a cohesive backend.
- Minimal full-stack app without module boundaries — Not selected because it risks mixing domain, security, and persistence concerns.

### ARD-DEC-005 — Keep Prescription Data Manual in First Release

- **Status:** Accepted
- **Related Requirements:** PRD-FR-004, PRD-FR-005, PRD-FR-006, PRD-FR-007, PRD-FR-009, CON-004, CON-005

**Decision**

The first release will not integrate with a pharmacy management system. Prescription, refill, and status data will be entered and updated manually by staff inside the application.

**Rationale**

The PRD explicitly excludes automated pharmacy management system integration and prioritizes a focused digital workflow.

**Consequences**

- Application database is the first-release system of record for manually managed prescription and refill workflow data.
- Staff workflow design must minimize manual data-entry burden.
- Future integration boundaries should be preserved around prescription and refill modules.

**Alternatives Considered**

- Pharmacy management system integration before launch — Not selected because it is out of scope.
- CSV imports — Not selected because the approved PRD specifies manual staff entry and updates.

### ARD-DEC-006 — Use Non-PHI Email/SMS Notifications Only

- **Status:** Accepted
- **Related Requirements:** PRD-FR-008, PRD-NFR-001, PRD-NFR-002, PRD-NFR-003, CON-001

**Decision**

The application may integrate with an email/SMS provider for notifications, but notification payloads must not contain PHI and must direct users to sign in to view sensitive content.

**Rationale**

Notifications improve engagement while reducing the risk of exposing PHI through external channels.

**Consequences**

- Notification templates must be reviewed for PHI leakage.
- Secure message content must remain inside the application.
- Notification delivery failure must not prevent core workflow completion.

**Alternatives Considered**

- No external integrations — Not selected because notification prompts are useful for adoption and response workflows.
- PHI-containing notifications — Not acceptable under the selected HIPAA-aligned posture.

### ARD-DEC-007 — Enforce Centralized Server-Side Authorization

- **Status:** Accepted
- **Related Requirements:** PRD-FR-003, PRD-FR-006, PRD-FR-008, PRD-NFR-001, PRD-NFR-003

**Decision**

Authorization will be enforced by centralized server-side policy checks on every protected API request, using identity-provider roles plus patient-record ownership checks.

**Rationale**

Frontend route guards are not sufficient for PHI. Centralized backend enforcement ensures consistent access decisions and auditable authorization outcomes.

**Consequences**

- All protected APIs must pass through authorization middleware or policy services.
- Patient users can access only their own PHI.
- Staff access must be constrained by provisioned roles and logged when PHI is accessed.

**Alternatives Considered**

- Frontend route guards plus partial backend checks — Not selected because frontend-only controls are bypassable.
- Database row-level security only — Not selected because application-level role, workflow, and audit context is still required.

### ARD-DEC-008 — Enforce Security and Quality Gates in CI/CD

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-002, PRD-NFR-003, PRD-NFR-005, PRD-NFR-007

**Decision**

Release pipelines must block on critical or high vulnerabilities, secret-detection findings, failing SAST, missing SBOM, failing dependency/license scan, failing build, failing lint, failing type-check, failing required tests, failing accessibility checks, or failing migration checks.

**Rationale**

Automated gates provide repeatable evidence that security, compliance, and quality expectations are met before deployment.

**Consequences**

- Builds may be blocked until vulnerabilities or quality defects are remediated or formally risk-accepted through a TBD governance process.
- CI/CD pipeline configuration becomes part of compliance evidence.
- Security scanning tools must support SBOM generation and severity-based blocking.

**Alternatives Considered**

- Block only critical vulnerabilities — Not selected because HIPAA-sensitive software needs stronger release controls.
- Manual QA only — Not selected because it does not provide sufficient repeatability.

### ARD-DEC-009 — Use Automated Promotion with Manual Production Approval

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-006, PRD-NFR-007

**Decision**

The deployment model will include dev, test, staging, and production environments with automated CI/CD promotion and manual approval before production deployment.

**Rationale**

Environment separation and manual production approval balance release control with automation for a HIPAA-sensitive small-business application.

**Consequences**

- Staging must be production-like enough to validate deployment, migration, security, accessibility, and performance gates.
- Production changes must be traceable to approved pipeline runs.
- Test data handling must avoid unauthorized PHI exposure outside production.

**Alternatives Considered**

- Dev and production only — Not selected because it is insufficient for HIPAA-sensitive validation.
- Fully automated production deployment — Not selected because manual approval was selected for production control.

### ARD-DEC-010 — Use Backward-Compatible Migrations and Tested Restore

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-006, PRD-NFR-003

**Decision**

Production deployments will use blue/green or rolling application rollback with backward-compatible database migrations and tested point-in-time database restore.

**Rationale**

Rollback and restore capabilities are necessary to support availability and protect persisted PHI, audit, and workflow data.

**Consequences**

- Database changes must be designed for expand/migrate/contract patterns where needed.
- Point-in-time restore must be tested before production launch and on a recurring schedule TBD.
- RPO and RTO targets remain open and must be finalized.

**Alternatives Considered**

- Manual redeploy only — Not selected because it does not address database-change risk.
- Fix-forward only — Not selected because it is insufficient for production resilience.

## 8. API and Integration Architecture

### ARD-API-001 — Identity Provider Authentication

- **Type:** REST
- **Operation/Topic:** `OIDC/OAuth2 authorization code flow with application callback endpoints`
- **Provider:** EXT-001
- **Consumers:** COMP-001, COMP-002, COMP-004
- **Authentication:** Managed identity-provider authentication with secure token issuance
- **Versioning:** Use provider-supported OIDC/OAuth2 standards; pin SDK/API versions where applicable

**Request/Input Contract**

OIDC/OAuth2 authorization, callback, token validation, logout, and session metadata contracts from the selected managed identity provider.

**Response/Output Contract**

ID/access token claims must include stable subject identifier and role or group claims sufficient to map users to patient, staff, or administrator roles.

**Error Handling**

Authentication failures return user-safe errors. Token validation failures deny access, record audit events where applicable, and do not expose token internals.

### ARD-API-002 — Patient Account and Profile API

- **Type:** REST
- **Operation/Topic:** `POST /api/patient/accounts`, `GET /api/patient/me`
- **Provider:** COMP-002
- **Consumers:** COMP-001
- **Authentication:** OIDC/OAuth2 authenticated session; patient role required where applicable
- **Versioning:** Versioned path or header strategy; initial version `v1` if implemented

**Request/Input Contract**

Patient registration and profile requests include identity-provider subject reference, required patient profile fields TBD in feature specification, and consent/acknowledgement fields where required by policy.

**Response/Output Contract**

Returns patient account/profile metadata required by the UI. PHI is returned only to the authenticated patient owner or authorized staff routes.

**Error Handling**

Validation errors return patient-friendly messages. Duplicate account or unauthorized access returns non-enumerating errors. All PHI access and authorization denials are audited.

### ARD-API-003 — Staff Provisioning API

- **Type:** REST
- **Operation/Topic:** `POST /api/admin/staff`, `PATCH /api/admin/staff/{staffUserId}`
- **Provider:** COMP-002
- **Consumers:** COMP-001 administrator experience
- **Authentication:** OIDC/OAuth2 authenticated session; administrator role required
- **Versioning:** Versioned path or header strategy; initial version `v1` if implemented

**Request/Input Contract**

Staff provisioning request includes staff identity reference, role assignment, status, and administrative metadata required for audit.

**Response/Output Contract**

Returns staff account provisioning status and assigned application role metadata.

**Error Handling**

Unauthorized provisioning attempts are denied and audited. Role assignment validation failures return administrator-safe error messages.

### ARD-API-004 — Prescription and Status API

- **Type:** REST
- **Operation/Topic:** `GET /api/patient/prescriptions`, `POST /api/staff/prescriptions`, `PATCH /api/staff/prescriptions/{prescriptionId}/status`
- **Provider:** COMP-002
- **Consumers:** COMP-001
- **Authentication:** Patient role with ownership checks for patient reads; staff role for manual entry and updates
- **Versioning:** Versioned path or header strategy; initial version `v1` if implemented

**Request/Input Contract**

Staff write requests include prescription metadata, patient association, status value, and status reason or note where allowed by policy. Patient reads include authenticated user context only; patient identifiers must not be trusted from the client alone.

**Response/Output Contract**

Patient responses include patient-friendly prescription and refill status data. Staff responses include workflow data needed for manual status management.

**Error Handling**

Invalid status transitions are rejected with workflow-safe errors. Unauthorized access is denied and audited. Patient responses do not expose internal-only exception details.

### ARD-API-005 — Refill Request API

- **Type:** REST
- **Operation/Topic:** `POST /api/patient/refill-requests`, `GET /api/staff/refill-requests`, `PATCH /api/staff/refill-requests/{refillRequestId}`
- **Provider:** COMP-002
- **Consumers:** COMP-001
- **Authentication:** Patient role with ownership checks for submissions; staff role for review and updates
- **Versioning:** Versioned path or header strategy; initial version `v1` if implemented

**Request/Input Contract**

Patient submission includes selected prescription reference and required refill request fields TBD in feature specification. Staff update includes review status, exception status, and resolution metadata where applicable.

**Response/Output Contract**

Submission returns confirmation and current patient-friendly status. Staff queue returns refill request details required for review and 1-business-day measurement.

**Error Handling**

Invalid or incomplete submissions are rejected with patient-friendly guidance. Requests requiring manual resolution are routed to staff rather than automatically rejected solely due to exception conditions. Duplicate-submission handling and idempotency keys are TBD in ARC-OQ-006.

### ARD-API-006 — Secure Messaging API

- **Type:** REST
- **Operation/Topic:** `POST /api/messages`, `GET /api/messages`, `POST /api/messages/{threadId}/replies`
- **Provider:** COMP-002
- **Consumers:** COMP-001
- **Authentication:** Authenticated patient owner or authorized staff role
- **Versioning:** Versioned path or header strategy; initial version `v1` if implemented

**Request/Input Contract**

Message requests include thread reference where applicable, message body, sender context from authenticated identity, and related patient context resolved server-side.

**Response/Output Contract**

Returns secure message thread metadata and message content only to authorized participants or authorized staff users.

**Error Handling**

Unauthorized message access is denied and audited. Message validation errors return safe guidance. Notification dispatch failures do not fail persisted message creation unless final product policy says otherwise.

### ARD-API-007 — Notification Provider API

- **Type:** REST/Event
- **Operation/Topic:** `provider-specific send notification operation TBD`
- **Provider:** EXT-002
- **Consumers:** COMP-005
- **Authentication:** Managed API credentials stored in secrets service
- **Versioning:** Pin provider API version where supported

**Request/Input Contract**

Notification payloads may include recipient contact channel, template ID, and non-PHI generic text only. PHI, prescription names, medication names, diagnosis, message contents, and refill details are prohibited.

**Response/Output Contract**

Provider delivery acknowledgement, message ID, and failure reason where available.

**Error Handling**

Transient provider failures use bounded retries with no duplicate PHI risk because no PHI is sent. Persistent failures are logged and alerted according to operational severity.

### ARD-API-008 — Audit and Reporting API

- **Type:** REST
- **Operation/Topic:** `GET /api/admin/audit-events`, `GET /api/admin/reports/success-metrics`
- **Provider:** COMP-002
- **Consumers:** COMP-001 administrator or authorized staff reporting experience
- **Authentication:** Administrator or explicitly authorized staff role
- **Versioning:** Versioned path or header strategy; initial version `v1` if implemented

**Request/Input Contract**

Audit/report requests include date range, event type, and filters allowed by policy. Access to audit logs requires elevated authorization.

**Response/Output Contract**

Returns audit event summaries and KPI-related metrics for patient registrations, refill submissions, refill reviews, and status updates.

**Error Handling**

Unauthorized access is denied and audited. Large result sets must be paginated. Export behavior, if any, is TBD and must preserve PHI restrictions.

## 9. Data Architecture

### DATA-001 — User Identity Link

- **Purpose:** Link managed identity-provider subjects to application users and roles.
- **System of Record:** EXT-001 for credentials; COMP-003 for application role mapping and profile association.
- **Classification:** Confidential
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** Related to DATA-002, DATA-003, DATA-007.

### DATA-002 — Patient Profile

- **Purpose:** Represent patient account and patient-specific access context for prescriptions, refills, and messages.
- **System of Record:** COMP-003 for first release.
- **Classification:** Restricted
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** Related to DATA-001, DATA-004, DATA-005, DATA-006, DATA-007.

### DATA-003 — Staff Profile and Role Assignment

- **Purpose:** Represent provisioned pharmacist, pharmacy technician, and administrator access.
- **System of Record:** COMP-003 for application role mapping; EXT-001 for identity credentials.
- **Classification:** Confidential
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** Related to DATA-001, DATA-004, DATA-005, DATA-006, DATA-007.

### DATA-004 — Prescription

- **Purpose:** Store manually entered prescription records and patient-friendly status data for first-release workflows.
- **System of Record:** COMP-003 for first release.
- **Classification:** Restricted
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** Belongs to DATA-002; updated by DATA-003; related to DATA-005 and DATA-007.

### DATA-005 — Refill Request

- **Purpose:** Track patient refill submissions, staff review, timestamps, exception routing, and status.
- **System of Record:** COMP-003 for first release.
- **Classification:** Restricted
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** Belongs to DATA-002 and DATA-004; reviewed by DATA-003; produces DATA-008 events.

### DATA-006 — Secure Message

- **Purpose:** Store secure patient-pharmacy message threads and replies inside the application.
- **System of Record:** COMP-003 for first release.
- **Classification:** Restricted
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** Associated with DATA-002 and DATA-003; message access produces DATA-007 events.

### DATA-007 — Audit Event

- **Purpose:** Record authentication events, PHI reads, PHI writes, refill actions, message access, admin provisioning, and authorization denials.
- **System of Record:** COMP-003 and/or immutable audit log store from EXT-003/EXT-005; final implementation TBD.
- **Classification:** Restricted
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** References DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, and DATA-006 where applicable.

### DATA-008 — Success Metric Event

- **Purpose:** Capture patient account creation, refill submission, refill review, and status update events for KPI measurement.
- **System of Record:** COMP-003 for first release.
- **Classification:** Confidential; Restricted if event payload includes PHI references.
- **Retention:** TBD; configurable retention required; see ARC-OQ-007.
- **Key Relationships:** Derived from DATA-001, DATA-004, DATA-005, and staff workflow actions.

### Data Migration

- **Required:** No automated external-system migration for the first release.
- **Approach:** Staff will manually enter and update prescription data in the application. Database schema migrations are required for application releases and must be backward-compatible for production rollback. Any future pharmacy management system migration or import remains out of scope for first release.

## 10. Security Architecture

### ARD-SEC-001 — HIPAA-Aligned PHI Protection

- **Related Requirements:** PRD-NFR-001, PRD-NFR-002, PRD-NFR-003, PRD-NFR-004, CON-001

The implementation must:

- Enforce least-privilege role-based access for patient, staff, and administrator workflows.
- Restrict patient access to the authenticated patient’s own PHI.
- Require staff users to be provisioned before accessing staff workflows.
- Encrypt PHI in transit and at rest.
- Record audit events for PHI access and other HIPAA-sensitive workflows.
- Use HIPAA-eligible hosting and managed services under BAA for production PHI workloads.
- Require automatic session timeout for protected application areas.

The implementation must not:

- Expose PHI in unauthenticated routes, client-side-only controls, CI logs, application logs, notification payloads, or non-BAA services.
- Allow staff self-registration for staff access.
- Store secrets in source control, application images, frontend code, or plain CI logs.

### ARD-SEC-002 — Centralized Authorization Enforcement

- **Related Requirements:** PRD-FR-003, PRD-FR-006, PRD-FR-008, PRD-NFR-001

The implementation must:

- Apply server-side authorization policy checks on every protected API request.
- Use identity-provider role claims and application-owned patient-record ownership checks.
- Audit authorization denials for protected resources.
- Treat frontend route guards as usability controls only, not as security boundaries.

The implementation must not:

- Trust client-provided patient identifiers without server-side ownership validation.
- Rely solely on frontend routing or UI hiding to protect staff or PHI workflows.

### ARD-SEC-003 — Secure Notification Boundary

- **Related Requirements:** PRD-FR-008, PRD-NFR-002, PRD-NFR-003

The implementation must:

- Keep secure message content and prescription/refill details inside the authenticated application.
- Send only non-PHI notification prompts through email/SMS.
- Review and test notification templates for PHI leakage.

The implementation must not:

- Include prescription names, medication names, diagnosis, refill details, secure message contents, or patient-specific clinical details in email/SMS payloads.

### Security Controls

- **Authentication:** Managed HIPAA-eligible identity provider using OIDC/OAuth2, secure sessions, automatic timeout, and patient/staff/admin role support.
- **Authorization:** Centralized backend policy enforcement with role checks, patient-record ownership checks, and audit logging for denials.
- **Secrets Management:** Managed secrets service with rotation support; no secrets in source control, frontend bundles, application images, or CI logs.
- **Encryption:** TLS for data in transit; managed encryption at rest for PostgreSQL, backups, logs containing sensitive data, object storage if used, and audit stores.
- **Audit Logging:** Authentication events, PHI reads, PHI writes, refill actions, message access, admin provisioning, and authorization denials must be logged with user identity, timestamp, action, and relevant resource references.
- **Dependency/CVE Scanning:** CI/CD must block release on critical or high vulnerabilities, secret-detection findings, failing SAST, missing SBOM, or failing dependency/license scan unless a formal risk acceptance process is defined.
- **SBOM:** Required for release builds.

## 11. Reliability, Performance, and Scalability

### ARD-OPS-001 — Monthly Availability

- **Target:** 99.5% monthly availability after launch for patient and staff application access.
- **Validation Method:** Uptime monitoring and monthly availability report covering frontend, backend API, and database-dependent core workflows.

### ARD-OPS-002 — Page Load Performance

- **Target:** Patient account, refill request, prescription status, secure messaging, staff refill review, status update, and staff messaging pages load within 3 seconds under normal operating conditions.
- **Validation Method:** Synthetic monitoring and pre-release performance tests against staging using representative first-release workflows.

### ARD-OPS-003 — Refill Review Measurement

- **Target:** 90% of refill requests reviewed by staff within 1 business day.
- **Validation Method:** Application reporting comparing refill request submission timestamp to first staff review timestamp.

### ARD-OPS-004 — Backup and Restore

- **Target:** RPO and RTO are TBD; encrypted backups and tested point-in-time restore are required before production launch.
- **Validation Method:** Restore test in non-production and documented backup/restore evidence; final RPO/RTO tracked in ARC-OQ-008.

### ARD-OPS-005 — Scalability for First Release

- **Target:** Capacity target is TBD; architecture must support the pilot rollout and phased expansion described in the PRD without redesign.
- **Validation Method:** Staging load test using expected pilot workload once active patient population and rollout size are defined in PRD OQ-004 and architecture ARC-OQ-009.

## 12. Observability

- **Logging:** Centralized structured logs for backend, frontend operational events, database/platform events where available, deployment events, and security-relevant application events; logs must avoid PHI unless explicitly required and protected as Restricted data.
- **Metrics:** Availability, request latency, error rates, page-load performance, authentication failures, authorization denials, refill queue size, refill review times, message activity, notification failures, and CI/CD deployment health.
- **Tracing:** Distributed or request tracing across frontend-to-backend and backend-to-database workflows where supported, with trace identifiers included in logs and errors.
- **Alerting:** Alerts for availability breach risk, elevated latency, elevated error rates, failed deployments, backup failures, security scan failures, repeated authorization denials, suspicious authentication patterns, and notification provider failures.
- **Sensitive Data Restrictions:** PHI must not be logged in plaintext. Logs, traces, metrics, and alerts containing sensitive identifiers must be minimized, access-controlled, encrypted, retained according to policy, and excluded from non-BAA tools.

## 13. Deployment Architecture

- **Environments:** Dev, test, staging, and production.
- **Deployment Model:** Automated CI/CD promotion with manual production approval; blue/green or rolling application rollback depending on selected hosting provider.
- **CI/CD:** Build, lint, type-check, unit test, integration test, contract test, E2E test, accessibility check, migration check, SAST, dependency/CVE scan, license scan, secret detection, SBOM generation, staging deployment, smoke test, manual production approval, production deployment.
- **Configuration Management:** Environment-specific configuration managed through infrastructure as code and secure parameter/secrets services; no PHI or secrets in source control.
- **Rollback:** Application rollback through blue/green or rolling deployment strategy; database rollback through backward-compatible migrations and tested point-in-time restore.
- **Infrastructure as Code:** Required; specific tool TBD after hosting provider selection in ARC-OQ-004.

## 14. Testing Architecture

Required test levels:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests
- Security tests
- Performance tests, where applicable

Minimum quality expectations:

- **Coverage Threshold:** 80% unit coverage for backend domain modules.
- **Blocking Security Severity:** Critical or high vulnerabilities; secret-detection findings; failing SAST; missing SBOM; failing dependency/license scan.
- **Required Build/Lint Checks:** Passing build, lint, type-check, unit tests, integration tests, contract tests, E2E tests for core workflows, accessibility checks for WCAG 2.1 AA, security tests, performance tests for 3-second page-load target, and database migration checks.

## 15. Architecture Constraints

- ARC-CON-001 — Production hosting must use HIPAA-eligible services under a Business Associate Agreement because the application handles PHI.
- ARC-CON-002 — The first release must remain focused on patient accounts, staff provisioning, refill requests, prescription status, secure messaging, exception routing, and success metric events.
- ARC-CON-003 — The first release must be a responsive web application and must not include native iOS or Android applications.
- ARC-CON-004 — Prescription data must be manually entered and updated by staff in the first release.
- ARC-CON-005 — Automated pharmacy management system integration is out of scope for the first release.
- ARC-CON-006 — Payments, insurance adjudication, delivery logistics, and inventory management are out of scope for the first release.
- ARC-CON-007 — The architecture must support WCAG 2.1 AA validation for patient-facing and staff-facing core workflows.
- ARC-CON-008 — The system must meet 99.5% monthly availability and 3-second common page-load targets after launch.
- ARC-CON-009 — The target release date is TBD and must not be assumed by architecture planning.
- ARC-CON-010 — Retention policy is TBD; data retention must be configurable and finalized before production launch.
- ARC-CON-011 — Notification payloads must not contain PHI.
- ARC-CON-012 — Infrastructure must be managed as code, and secrets must be stored only in a managed secrets service.

## 16. Risks and Trade-offs

| ID | Risk/Trade-off | Impact | Mitigation |
|---|---|---|---|
| ARC-RISK-001 | Hosting provider is TBD, delaying concrete IaC and managed-service design. | Medium | Require HIPAA-eligible services and BAA now; resolve ARC-OQ-004 before implementation planning. |
| ARC-RISK-002 | Manual prescription data entry creates staff workload and data-quality risk. | Medium | Keep first-release workflows focused, validate inputs, audit updates, and preserve future integration boundaries. |
| ARC-RISK-003 | HIPAA control implementation is incomplete before launch. | High | Enforce security gates, audit coverage, encryption validation, server-side authorization, and production readiness review. |
| ARC-RISK-004 | Notification provider accidentally receives PHI. | High | Use non-PHI templates, adapter-level payload restrictions, code review, and tests for notification payloads. |
| ARC-RISK-005 | Retention, RPO, and RTO are TBD. | Medium | Make retention configurable, require encrypted backups and restore testing, and track final targets as open questions. |
| ARC-RISK-006 | Modular monolith may grow too large over time. | Low | Maintain module boundaries and contracts; revisit service extraction only when operational need appears. |
| ARC-RISK-007 | Patient adoption target may be missed if registration friction is high. | Medium | Monitor registration events, keep responsive UX accessible, and use non-PHI notifications where appropriate. |
| ARC-RISK-008 | 3-second page-load target may be missed under real operating conditions. | Medium | Use synthetic monitoring, performance tests, query optimization, and production metrics. |

## 17. Open Architecture Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| ARC-OQ-001 | Who are the named Architecture Owner, Engineering Lead, Security Reviewer, Operations Owner, and Product Owner contributors? | Business Sponsor | Open | TBD |
| ARC-OQ-002 | Which managed HIPAA-eligible identity provider will be used, and what exact session timeout and MFA policies will be configured? | Architecture Owner | Open | TBD |
| ARC-OQ-003 | Which email/SMS notification provider will be used, and is it covered by BAA or restricted to non-PHI generic notifications only? | Architecture Owner | Open | TBD |
| ARC-OQ-004 | Which HIPAA-eligible hosting provider and services will be selected under BAA? | Architecture Owner | Open | TBD |
| ARC-OQ-005 | What is the final repository layout for frontend, backend, database, shared packages, and infrastructure code? | Engineering Lead | Open | TBD |
| ARC-OQ-006 | What idempotency and duplicate-submission policy should apply to refill request submission? | Engineering Lead | Open | TBD |
| ARC-OQ-007 | What final retention policy applies to PHI, refill data, secure messages, audit logs, success metric events, and deactivated accounts? | Security Reviewer | Open | TBD |
| ARC-OQ-008 | What RPO and RTO targets apply to production database restore, audit log restore, and full service recovery? | Business Sponsor | Open | TBD |
| ARC-OQ-009 | What pilot workload, active patient population, and phased expansion volume should be used for load testing? | Product Owner | Open | TBD |
| ARC-OQ-010 | What exact Node.js, React, PostgreSQL, framework, and dependency versions will be standardized for implementation? | Engineering Lead | Open | TBD |
| ARC-OQ-011 | What formal risk-acceptance process, if any, can override blocking security gates? | Security Reviewer | Open | TBD |
| ARC-OQ-012 | What audit log storage implementation will be used to provide tamper-evidence or immutability? | Security Reviewer | Open | TBD |

## 18. Feature Mapping

| Feature | Relevant Components | Decision IDs | Interface IDs | Security IDs |
|---|---|---|---|---|
| FEAT-001 | COMP-001, COMP-002, COMP-004, COMP-006 | ARD-DEC-001, ARD-DEC-003, ARD-DEC-004, ARD-DEC-007, ARD-DEC-009 | ARD-API-001, ARD-API-002, ARD-API-003 | ARD-SEC-001, ARD-SEC-002 |
| FEAT-002 | COMP-001, COMP-002, COMP-003, COMP-006 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-005, ARD-DEC-007 | ARD-API-005, ARD-API-008 | ARD-SEC-001, ARD-SEC-002 |
| FEAT-003 | COMP-001, COMP-002, COMP-003, COMP-006 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-005, ARD-DEC-007 | ARD-API-004 | ARD-SEC-001, ARD-SEC-002 |
| FEAT-004 | COMP-001, COMP-002, COMP-003, COMP-005, COMP-006 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-006, ARD-DEC-007 | ARD-API-006, ARD-API-007 | ARD-SEC-001, ARD-SEC-002, ARD-SEC-003 |
| FEAT-005 | COMP-001, COMP-002, COMP-003, COMP-006 | ARD-DEC-004, ARD-DEC-005, ARD-DEC-007 | ARD-API-004, ARD-API-005 | ARD-SEC-001, ARD-SEC-002 |
| FEAT-006 | COMP-002, COMP-003, COMP-006 | ARD-DEC-004, ARD-DEC-008, ARD-DEC-009 | ARD-API-008 | ARD-SEC-001 |

## 19. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Solution Architect | TBD | Pending | TBD |
| Security Reviewer | TBD | Pending | TBD |
| Engineering Lead | TBD | Pending | TBD |