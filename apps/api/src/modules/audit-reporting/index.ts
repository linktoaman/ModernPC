import { createHash } from 'node:crypto';

import type { AuthorizationDenialAuditInput } from '../identity';

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

export const auditReportingModuleName = 'audit-reporting';

const authorizationDenialAuditRecords: AuthorizationDenialAuditEvent[] = [];

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

export const createResourceIdHash = (resourceId: string): string => (
  createAuditReferenceHash(resourceId)
);

export const getAuthorizationDenialAuditRecords = (
): readonly AuthorizationDenialAuditEvent[] => [...authorizationDenialAuditRecords];

const createAuditReferenceHash = (value: string): string => (
  createHash('sha256').update(value).digest('hex')
);
