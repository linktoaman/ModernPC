# Product Requirements Document (PRD)

> Replace all `<PLACEHOLDER>` values. Keep requirement IDs stable after approval so downstream ARD and feature specifications retain traceability.

## Document Metadata

- **Product/Application:** Patient Portal Login Page
- **Document ID:** PRD-PPL
- **Version:** 0.1
- **Status:** Draft
- **Owner:** TBD
- **Contributors:** TBD
- **Last Updated:** 2026-11-20

---

## 1. Executive Summary

This PRD defines a simple, easy-to-use login page for a small healthcare business’s existing patient-facing portal. The login page will allow existing patients to authenticate with email and password, complete required multi-factor authentication using an email one-time code, reset forgotten passwords through an email reset link, and reach the portal home dashboard after successful login.

The expected value is to give patients a secure, low-friction way to access health information without calling the office, while supporting healthcare-appropriate privacy and security controls for access to protected health information.

## 2. Problem Statement

Existing patients need a simpler way to access their health information without calling the office. Because patients can access protected health information after login, the business needs an authentication experience that is easy for patients while also supporting healthcare privacy and security expectations.

## 3. Product Vision

The target end state is a patient login experience that is simple enough for existing patients to complete without assistance, secure enough for protected health information access, and ready to support the broader patient portal launch.

## 4. Goals and Success Measures

### 4.1 Goals

- Enable existing patients to log in to the patient portal using email and password.
- Require email-based multi-factor authentication for every patient login.
- Provide a password reset flow through an email reset link.
- Redirect authenticated patients to the portal home dashboard.
- Reduce patient reliance on office calls for portal access.

### 4.2 Success Measures

| ID | Measure | Baseline | Target | Measurement Method |
|---|---|---:|---:|---|
| KPI-001 | Successful login rate | TBD | TBD | Authentication analytics measuring successful completed logins divided by login attempts |
| KPI-002 | Login-related support calls | TBD | TBD | Support call categorization and reporting for login/access issues |
| KPI-003 | Login error rate | TBD | TBD | Authentication analytics measuring failed login, MFA, and reset attempts |

## 5. Scope

### 5.1 In Scope

- Patient-facing login page for existing patient portal accounts.
- Email and password authentication.
- Required email one-time code MFA for every patient login.
- Password reset using an email reset link.
- Generic error handling for incorrect credentials or MFA codes.
- Redirect to the portal home dashboard after successful login.
- Accessibility support to WCAG 2.1 AA.

### 5.2 Out of Scope

- Staff and administrator login.
- New patient self-registration.
- Non-patient user account access.
- Patient portal features after authentication, except the post-login redirect destination.
- Alternative MFA methods such as SMS or authenticator apps.

## 6. Personas and Users

### PERSONA-001 — Existing Patient

- **Description:** A patient who already has an account for the healthcare business’s patient-facing portal.
- **Primary Need:** Securely access the patient portal and health information without calling the office.
- **Key Pain Point:** Accessing health information requires too much assistance or friction when login is not simple.

### PERSONA-002 — Office Support Staff

- **Description:** Staff affected by patient calls about portal access, but not direct users of this login page.
- **Primary Need:** Fewer routine patient calls related to portal access.
- **Key Pain Point:** Patient login issues can create avoidable support workload.

## 7. Assumptions and Dependencies

### Assumptions

- ASM-001 — Patients using this login page already have portal accounts.
- ASM-002 — The broader patient portal exists or will exist as the destination after login.
- ASM-003 — Email is available as the required channel for password reset links and MFA one-time codes.
- ASM-004 — Baseline and target values for success metrics will be defined before approval.

### Dependencies

- DEP-001 — Patient portal identity/account system for validating email and password credentials.
- DEP-002 — Email delivery service for password reset links and one-time MFA codes.
- DEP-003 — Patient portal home dashboard route for successful post-login redirects.
- DEP-004 — Healthcare privacy/security review for protected health information access.

## 8. Functional Requirements

### PRD-FR-001 — Patient Login With Email and Password

- **Priority:** Must
- **Feature:** FEAT-001
- **Persona:** PERSONA-001

**Requirement**

The system shall allow existing patients to submit an email address and password to start authentication for the patient portal.

**Business Rationale**

Existing patients need the easiest viable way to access health information online without calling the office.

**Acceptance Criteria**

1. Given an existing patient enters a valid email and password, when they submit the login form, then the system advances them to the MFA step.
2. Given a patient enters an invalid email/password combination, when they submit the login form, then the system does not authenticate them.
3. Given a patient submits the login form with missing required fields, when validation runs, then the system identifies the required fields without submitting credentials.

---

### PRD-FR-002 — Required Email MFA

- **Priority:** Must
- **Feature:** FEAT-002
- **Persona:** PERSONA-001

**Requirement**

The system shall require every patient login to be verified using an email one-time code before granting access to the portal.

**Business Rationale**

Protected health information may be accessible after login, so a second authentication factor is required for patient access.

**Acceptance Criteria**

1. Given a patient has submitted valid email/password credentials, when the credentials are accepted, then the system sends an email one-time code to the patient’s account email address.
2. Given a patient enters a valid one-time code, when they submit the MFA form, then the system completes authentication.
3. Given a patient has not completed MFA, when they attempt to access the portal dashboard, then the system denies access.

---

### PRD-FR-003 — Generic Authentication Error Messaging

- **Priority:** Must
- **Feature:** FEAT-001
- **Persona:** PERSONA-001

**Requirement**

The system shall show a generic error message when credentials or MFA codes are incorrect, without revealing whether the email, password, or code was wrong.

**Business Rationale**

Generic errors reduce account enumeration risk while keeping the experience understandable for patients.

**Acceptance Criteria**

1. Given a patient enters an incorrect email/password combination, when the login attempt fails, then the error message does not identify which field was incorrect.
2. Given a patient enters an incorrect MFA code, when the MFA attempt fails, then the error message does not reveal whether the code or account state caused the failure.
3. Given an authentication error appears, when viewed by the patient, then the message provides a clear next action such as trying again or using password reset.

---

### PRD-FR-004 — Password Reset by Email Link

- **Priority:** Must
- **Feature:** FEAT-003
- **Persona:** PERSONA-001

**Requirement**

The system shall allow existing patients to request a password reset using an email reset link.

**Business Rationale**

Patients who forget passwords need a self-service recovery path that avoids unnecessary calls to the office.

**Acceptance Criteria**

1. Given a patient requests a password reset for an account email, when the request is submitted, then the system sends a password reset link by email if the account is eligible.
2. Given any email is submitted for password reset, when the request completes, then the system displays a neutral confirmation that does not reveal whether the email belongs to an account.
3. Given a patient uses a valid reset link, when they set a new password successfully, then the old password no longer grants access.

---

### PRD-FR-005 — Redirect to Portal Home Dashboard

- **Priority:** Must
- **Feature:** FEAT-004
- **Persona:** PERSONA-001

**Requirement**

The system shall redirect authenticated patients to the portal home dashboard after successful email/password and MFA authentication.

**Business Rationale**

Patients need a predictable destination after login so they can begin accessing portal information with minimal friction.

**Acceptance Criteria**

1. Given a patient completes email/password authentication and MFA, when authentication succeeds, then the system redirects them to the portal home dashboard.
2. Given authentication is incomplete or failed, when the patient attempts to reach the portal home dashboard, then the system does not grant access.

## 9. Non-Functional Requirements

### PRD-NFR-001 — Healthcare Privacy and Security Controls

- **Category:** Compliance
- **Priority:** Must

**Requirement**

The system shall protect login, MFA, and password reset flows according to applicable healthcare privacy and security obligations for systems that provide access to protected health information.

**Acceptance Criteria**

1. A pre-release privacy/security review confirms that the login, MFA, and reset flows are acceptable for protected health information access.
2. Authentication events are logged sufficiently to support security review without exposing passwords or MFA codes in logs.

### PRD-NFR-002 — Accessibility

- **Category:** Accessibility
- **Priority:** Must

**Requirement**

The system shall meet WCAG 2.1 AA for the login, MFA, and password reset user interfaces.

**Acceptance Criteria**

1. Accessibility testing confirms the login, MFA, and password reset pages meet WCAG 2.1 AA success criteria.
2. The login, MFA, and password reset flows can be completed using keyboard navigation.
3. Form labels, errors, and status messages are available to screen readers.

### PRD-NFR-003 — Error Handling and Availability of Core Flows

- **Category:** Availability
- **Priority:** Should

**Requirement**

The system shall present recoverable errors for unavailable authentication, MFA email, or password reset services.

**Acceptance Criteria**

1. Given the email delivery service is unavailable, when a patient requests an MFA code or reset link, then the system displays a clear error that indicates the action cannot be completed right now.
2. Given the authentication service is unavailable, when a patient submits login credentials, then the system displays a clear error without implying the credentials are invalid.

## 10. User Journeys

### JOURNEY-001 — Existing Patient Logs In

1. Existing patient opens the patient portal login page.
2. Patient enters email and password.
3. System validates credentials and sends an email one-time code.
4. Patient enters the email one-time code.
5. System authenticates the patient and redirects them to the portal home dashboard.

**Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-005, PRD-NFR-001, PRD-NFR-002

### JOURNEY-002 — Existing Patient Resets Password

1. Existing patient selects password reset from the login page.
2. Patient submits their email address.
3. System displays a neutral confirmation and sends a reset link if eligible.
4. Patient opens the email reset link and sets a new password.
5. Patient returns to login and authenticates with the new password.

**Related Requirements:** PRD-FR-004, PRD-NFR-001, PRD-NFR-002

### JOURNEY-003 — Patient Enters Incorrect Credentials or MFA Code

1. Existing patient submits incorrect credentials or an incorrect MFA code.
2. System rejects the attempt.
3. System displays a generic error that does not reveal which value was wrong.
4. Patient can try again or use password reset.

**Related Requirements:** PRD-FR-003, PRD-FR-004, PRD-NFR-001

## 11. Feature Breakdown

### FEAT-001 — Patient Login Form

- **Summary:** Email and password login form for existing patient portal users.
- **Priority:** Must
- **Related Requirements:** PRD-FR-001, PRD-FR-003, PRD-NFR-001, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-001-patient-login-form.spec.md`

### FEAT-002 — Email MFA Verification

- **Summary:** Required email one-time code verification for every patient login.
- **Priority:** Must
- **Related Requirements:** PRD-FR-002, PRD-FR-003, PRD-NFR-001, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-002-email-mfa-verification.spec.md`

### FEAT-003 — Password Reset

- **Summary:** Self-service password reset using an email reset link.
- **Priority:** Must
- **Related Requirements:** PRD-FR-004, PRD-NFR-001, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-003-password-reset.spec.md`

### FEAT-004 — Post-Login Redirect

- **Summary:** Redirect authenticated patients to the portal home dashboard.
- **Priority:** Must
- **Related Requirements:** PRD-FR-005
- **Expected Spec File:** `specs/FEAT-004-post-login-redirect.spec.md`

## 12. Constraints

- CON-001 — The product is for a small healthcare business and must account for protected health information access after login.
- CON-002 — First release supports existing patient accounts only.
- CON-003 — First release supports email/password login only as the primary authentication method.
- CON-004 — First release requires email one-time code MFA for every patient login.
- CON-005 — First release must align with the broader patient portal release date, which is not yet finalized.

## 13. Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-001 | Patients may not receive MFA or password reset emails reliably | High | Medium | Use monitored email delivery and show recoverable errors when delivery cannot complete |
| RISK-002 | Required MFA may add friction to a page intended to be simple | Medium | Medium | Keep the MFA flow minimal and use clear instructions on the one-time code page |
| RISK-003 | Undefined KPI baselines and targets may make launch success hard to judge | Medium | High | Define baseline and target values before PRD approval |
| RISK-004 | Healthcare privacy/security review may identify required controls not captured in this first PRD | High | Medium | Complete privacy/security review before release and update requirements if needed |

## 14. Open Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| OQ-001 | What are the baseline and target values for successful login rate, login-related support calls, and login error rate? | Product Owner | Open | Decision pending |
| OQ-002 | What is the target release date for the broader patient portal launch? | Product Owner | Open | Decision pending |
| OQ-003 | Who is the named owner and contributor group for this PRD? | Product Owner | Open | Decision pending |

## 15. Release and Rollout Considerations

- **Target Release:** Align with broader patient portal release; exact date is open in OQ-002.
- **Rollout Approach:** Full rollout to existing patient portal users when the broader portal release is ready.
- **Migration Considerations:** Existing patient accounts must be available in the portal identity/account system before launch.
- **Training/Support Considerations:** Support staff should be prepared to answer patient questions about email/password login, email one-time codes, and email password reset links.

## 16. Definition of Product Success

The product is successful when:

- Existing patients can securely log in and access the portal home dashboard without authentication errors.
- Patients can reset forgotten passwords through an email reset link.
- Login uses required email one-time code MFA for protected health information access.
- Success metrics in OQ-001 are defined and tracked after launch.
- All Must-priority requirements are accepted.
- Required quality, security, and compliance outcomes are evidenced.

## 17. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Product Owner | TBD | Pending | TBD |
| Business Sponsor | TBD | Pending | TBD |