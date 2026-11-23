export type AccessRole =
  | 'patient'
  | 'pharmacist'
  | 'technician'
  | 'administrator';

export type StaffAccessRole = Exclude<AccessRole, 'patient'>;

export type AccountStatus = 'active' | 'invited' | 'suspended' | 'deactivated';

export type ProfileAccessKind = 'patient' | 'staff';

export type AccessGrantSource =
  | 'patient_registration'
  | 'administrator_provisioning';

export type AccessUuidString = string;

export type AccessIsoDateString = string;

export type AccessIsoDateTimeString = string;

export interface AccessAuditReferences {
  readonly createdAuditEventId?: AccessUuidString;
  readonly updatedAuditEventId?: AccessUuidString;
}

export interface IdentityProviderSubjectLink extends AccessAuditReferences {
  readonly id: AccessUuidString;
  readonly identityProvider: string;
  readonly providerSubject: string;
  readonly profileKind: ProfileAccessKind;
  readonly status: AccountStatus;
  readonly createdAt: AccessIsoDateTimeString;
  readonly updatedAt: AccessIsoDateTimeString;
  readonly lastAuthenticatedAt?: AccessIsoDateTimeString;
}

export interface PatientAccountProfile extends AccessAuditReferences {
  readonly id: AccessUuidString;
  readonly identityLinkId: AccessUuidString;
  readonly role: 'patient';
  readonly givenName: string;
  readonly familyName: string;
  readonly dateOfBirth: AccessIsoDateString;
  readonly contactEmail?: string;
  readonly contactPhone?: string;
  readonly registrationAuditEventId?: AccessUuidString;
  readonly status: AccountStatus;
  readonly createdAt: AccessIsoDateTimeString;
  readonly updatedAt: AccessIsoDateTimeString;
}

export interface AdministratorProvisioningMetadata {
  readonly provisionedByIdentityLinkId: AccessUuidString;
  readonly provisionedAt: AccessIsoDateTimeString;
  readonly provisioningAuditEventId?: AccessUuidString;
  readonly provisioningSource: 'administrator_provisioning';
}

export interface StaffAccountProfile
  extends AccessAuditReferences,
    AdministratorProvisioningMetadata {
  readonly id: AccessUuidString;
  readonly identityLinkId: AccessUuidString;
  readonly role: StaffAccessRole;
  readonly givenName: string;
  readonly familyName: string;
  readonly licenseIdentifier?: string;
  readonly status: AccountStatus;
  readonly createdAt: AccessIsoDateTimeString;
  readonly updatedAt: AccessIsoDateTimeString;
}

export interface AccessRoleAssignment extends AccessAuditReferences {
  readonly id: AccessUuidString;
  readonly identityLinkId: AccessUuidString;
  readonly role: AccessRole;
  readonly status: AccountStatus;
  readonly grantSource: AccessGrantSource;
  readonly grantedByIdentityLinkId?: AccessUuidString;
  readonly grantReason?: string;
  readonly createdAt: AccessIsoDateTimeString;
  readonly updatedAt: AccessIsoDateTimeString;
}

export const accessRoles: readonly AccessRole[] = [
  'patient',
  'pharmacist',
  'technician',
  'administrator',
];

export const staffAccessRoles: readonly StaffAccessRole[] = [
  'pharmacist',
  'technician',
  'administrator',
];

export const accessRoleLabels: Readonly<Record<AccessRole, string>> = {
  patient: 'Patient',
  pharmacist: 'Pharmacist',
  technician: 'Pharmacy Technician',
  administrator: 'Administrator',
};
