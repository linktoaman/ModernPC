import type { RequestContext } from '../../middleware/requestContext';
import {
  patientAccountOwnershipPolicy,
  provisionedStaffPolicy,
  staffProvisioningPolicy
} from './accessPolicies';

export type PharmacyRole =
  | 'administrator'
  | 'operations'
  | 'patient'
  | 'pharmacist'
  | 'technician';

export interface RoleClaim {
  readonly role: PharmacyRole;
  readonly source: 'managed-oidc';
}

export interface IdentityPrincipal {
  readonly subject: string;
  readonly email?: string;
  readonly roles: readonly PharmacyRole[];
  readonly roleClaims: readonly RoleClaim[];
}

export interface PolicyResource {
  readonly id?: string;
  readonly ownerSubject?: string;
  readonly type: string;
}

export interface PolicyDecision {
  readonly allowed: boolean;
  readonly reasonCode?: string;
}

export interface PolicyCheck {
  readonly name: string;
  readonly evaluate: (
    context: RequestContext,
    resource: PolicyResource
  ) => PolicyDecision;
}

export interface AuthorizationDenialAuditInput {
  readonly context: RequestContext;
  readonly policyName: string;
  readonly reasonCode: string;
  readonly resourceIdHash?: string;
  readonly resourceType: string;
}

export interface AuthorizationDenialAuditor {
  readonly recordAuthorizationDenial: (
    input: AuthorizationDenialAuditInput
  ) => void | Promise<void>;
}

export const identityModuleName = 'identity';

export const pharmacyRoles = [
  'administrator',
  'operations',
  'patient',
  'pharmacist',
  'technician'
] as const satisfies readonly PharmacyRole[];

export const pharmacyRoleSet: ReadonlySet<PharmacyRole> = new Set(pharmacyRoles);

export const staffRoles = [
  'administrator',
  'operations',
  'pharmacist',
  'technician'
] as const satisfies readonly PharmacyRole[];

export const hasRole = (
  context: RequestContext,
  acceptedRoles: readonly PharmacyRole[]
): boolean => acceptedRoles.some((role) => context.identity?.roles.includes(role) ?? false);

export const patientOwnershipPolicy: PolicyCheck = {
  name: 'patient-ownership',
  evaluate: (context, resource) => {
    if (hasRole(context, staffRoles)) {
      return provisionedStaffPolicy.evaluate(context, resource);
    }

    if (
      resource.ownerSubject !== undefined
      && resource.ownerSubject === context.identity?.subject
    ) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reasonCode: 'patient_ownership_required'
    };
  }
};

export const staffRolePolicy: PolicyCheck = {
  name: 'staff-role',
  evaluate: (context, resource) => provisionedStaffPolicy.evaluate(context, resource)
};

export const administratorRolePolicy: PolicyCheck = {
  name: 'administrator-role',
  evaluate: (context) => {
    if (hasRole(context, ['administrator'])) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reasonCode: 'administrator_role_required'
    };
  }
};

export const policyChecks = {
  administratorRole: administratorRolePolicy,
  patientAccountOwnership: patientAccountOwnershipPolicy,
  patientOwnership: patientOwnershipPolicy,
  staffProvisioning: staffProvisioningPolicy,
  staffRole: provisionedStaffPolicy
} as const;

export * from './accessPolicies';
