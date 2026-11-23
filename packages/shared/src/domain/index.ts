export type DataClassification = 'confidential' | 'restricted';

export type UserRole = 'patient' | 'pharmacist' | 'technician' | 'administrator';

export type ProfileKind = 'patient' | 'staff';

export type IdentityLinkStatus = 'active' | 'invited' | 'suspended' | 'deactivated';

export type PatientProfileStatus = 'active' | 'inactive' | 'deceased' | 'merged';

export type StaffProfileStatus = IdentityLinkStatus;

export type PrescriptionStatus =
  | 'active'
  | 'on_hold'
  | 'expired'
  | 'cancelled'
  | 'completed';

export type RefillRequestStatus =
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'ready'
  | 'completed'
  | 'denied'
  | 'cancelled';

export type SecureMessageSenderKind = 'patient' | 'staff' | 'system';

export type AuditEventOutcome = 'success' | 'failure' | 'denied';

export type SuccessMetricEventType =
  | 'patient_registered'
  | 'refill_submitted'
  | 'refill_reviewed'
  | 'prescription_status_updated';

export type UuidString = string;

export type IsoDateString = string;

export type IsoDateTimeString = string;

export type DomainMetadata = Readonly<Record<string, unknown>>;

export interface DomainRecord {
  readonly id: UuidString;
  readonly createdAt: IsoDateTimeString;
  readonly updatedAt?: IsoDateTimeString;
}

export interface IdentityLink extends DomainRecord {
  readonly identityProvider: string;
  readonly providerSubject: string;
  readonly role: UserRole;
  readonly profileKind: ProfileKind;
  readonly status: IdentityLinkStatus;
  readonly classification: 'confidential';
  readonly lastAuthenticatedAt?: IsoDateTimeString;
}

export interface PatientProfile extends DomainRecord {
  readonly identityLinkId: UuidString;
  readonly medicalRecordNumber?: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly dateOfBirth: IsoDateString;
  readonly contactEmail?: string;
  readonly contactPhone?: string;
  readonly status: PatientProfileStatus;
  readonly classification: 'restricted';
}

export interface StaffProfile extends DomainRecord {
  readonly identityLinkId: UuidString;
  readonly givenName: string;
  readonly familyName: string;
  readonly staffRole: Exclude<UserRole, 'patient'>;
  readonly licenseIdentifier?: string;
  readonly status: StaffProfileStatus;
  readonly classification: 'confidential';
  readonly provisionedByIdentityLinkId?: UuidString;
  readonly provisionedAt: IsoDateTimeString;
}

export interface Prescription extends DomainRecord {
  readonly patientProfileId: UuidString;
  readonly enteredByStaffProfileId?: UuidString;
  readonly prescriptionNumber: string;
  readonly medicationName: string;
  readonly dosageInstruction: string;
  readonly prescriberName: string;
  readonly status: PrescriptionStatus;
  readonly refillsAuthorized: number;
  readonly refillsRemaining: number;
  readonly writtenDate?: IsoDateString;
  readonly expiresDate?: IsoDateString;
  readonly lastFilledAt?: IsoDateTimeString;
  readonly classification: 'restricted';
}

export interface RefillRequest extends DomainRecord {
  readonly patientProfileId: UuidString;
  readonly prescriptionId: UuidString;
  readonly reviewedByStaffProfileId?: UuidString;
  readonly status: RefillRequestStatus;
  readonly patientNote?: string;
  readonly staffNote?: string;
  readonly submittedAt: IsoDateTimeString;
  readonly reviewedAt?: IsoDateTimeString;
  readonly readyAt?: IsoDateTimeString;
  readonly closedAt?: IsoDateTimeString;
  readonly classification: 'restricted';
}

export interface SecureMessage {
  readonly id: UuidString;
  readonly patientProfileId: UuidString;
  readonly staffProfileId?: UuidString;
  readonly threadId?: UuidString;
  readonly senderKind: SecureMessageSenderKind;
  readonly subject: string;
  readonly body: string;
  readonly readAt?: IsoDateTimeString;
  readonly sentAt: IsoDateTimeString;
  readonly createdAt: IsoDateTimeString;
  readonly classification: 'restricted';
}

export interface AuditEvent {
  readonly id: UuidString;
  readonly occurredAt: IsoDateTimeString;
  readonly actorIdentityLinkId?: UuidString;
  readonly patientProfileId?: UuidString;
  readonly staffProfileId?: UuidString;
  readonly prescriptionId?: UuidString;
  readonly refillRequestId?: UuidString;
  readonly secureMessageId?: UuidString;
  readonly eventType: string;
  readonly outcome: AuditEventOutcome;
  readonly requestId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata: DomainMetadata;
  readonly createdAt: IsoDateTimeString;
  readonly classification: 'restricted';
}

export interface SuccessMetricEvent {
  readonly id: UuidString;
  readonly occurredAt: IsoDateTimeString;
  readonly eventType: SuccessMetricEventType;
  readonly actorIdentityLinkId?: UuidString;
  readonly patientProfileId?: UuidString;
  readonly prescriptionId?: UuidString;
  readonly refillRequestId?: UuidString;
  readonly metricValue?: number;
  readonly metadata: DomainMetadata;
  readonly classification: DataClassification;
  readonly createdAt: IsoDateTimeString;
}

export const userRoles: readonly UserRole[] = [
  'patient',
  'pharmacist',
  'technician',
  'administrator'
];

export const successMetricEventTypes: readonly SuccessMetricEventType[] = [
  'patient_registered',
  'refill_submitted',
  'refill_reviewed',
  'prescription_status_updated'
];
