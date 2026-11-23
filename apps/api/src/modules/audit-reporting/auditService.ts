import { createHash } from 'node:crypto';

import type { AuthorizationDenialAuditInput } from '../identity';
import type { RequestContext } from '../../middleware/requestContext';

export interface AuditEvent {
  readonly actorIdHash: string;
  readonly action: string;
  readonly correlationId: string;
  readonly occurredAt: string;
  readonly requestId: string;
}

export interface AuthorizationDenialAuditEvent extends AuditEvent {
  readonly action: 'authorization_denied';
  readonly policyName: string;
  readonly reasonCode: string;
  readonly resourceIdHash?: string;
  readonly resourceType: string;
}

export interface StaffProvisioningAuditInput {
  readonly context: RequestContext;
  readonly action: 'staff_provisioned' | 'staff_provisioning_updated';
  readonly staffUserId: string;
  readonly staffRole: string;
  readonly outcome: 'success';
}

export interface StaffProvisioningAuditEvent extends AuditEvent {
  readonly action: 'staff_provisioned' | 'staff_provisioning_updated';
  readonly outcome: 'success';
  readonly staffRole: string;
  readonly staffUserIdHash: string;
}

export const auditReportingModuleName = 'audit-reporting';

const authorizationDenialAuditRecords: AuthorizationDenialAuditEvent[] = [];
const staffProvisioningAuditRecords: StaffProvisioningAuditEvent[] = [];

export const recordAuthorizationDenial = (
  input: AuthorizationDenialAuditInput
): AuthorizationDenialAuditEvent => {
  const event: AuthorizationDenialAuditEvent = {
    action: 'authorization_denied',
    actorIdHash: createAuditReferenceHash(input.context.audit.actorId),
    correlationId: input.context.correlationId,
    occurredAt: new Date().toISOString(),
    policyName: input.policyName,
    reasonCode: input.reasonCode,
    requestId: input.context.requestId,
    resourceType: input.resourceType,
    ...(input.resourceIdHash === undefined ? {} : { resourceIdHash: input.resourceIdHash })
  };

  authorizationDenialAuditRecords.push(event);

  return event;
};

export const recordStaffProvisioningEvent = (
  input: StaffProvisioningAuditInput
): StaffProvisioningAuditEvent => {
  const event: StaffProvisioningAuditEvent = {
    action: input.action,
    actorIdHash: createAuditReferenceHash(input.context.audit.actorId),
    correlationId: input.context.correlationId,
    occurredAt: new Date().toISOString(),
    outcome: input.outcome,
    requestId: input.context.requestId,
    staffRole: input.staffRole,
    staffUserIdHash: createAuditReferenceHash(input.staffUserId)
  };

  staffProvisioningAuditRecords.push(event);

  return event;
};

export const createResourceIdHash = (resourceId: string): string => (
  createAuditReferenceHash(resourceId)
);

export const getAuthorizationDenialAuditRecords = (
): readonly AuthorizationDenialAuditEvent[] => [...authorizationDenialAuditRecords];

export const getStaffProvisioningAuditRecords = (
): readonly StaffProvisioningAuditEvent[] => [...staffProvisioningAuditRecords];

const createAuditReferenceHash = (value: string): string => (
  createHash('sha256').update(value).digest('hex')
);
