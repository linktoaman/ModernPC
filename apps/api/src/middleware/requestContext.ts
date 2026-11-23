import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import type { IdentityPrincipal, RoleClaim } from '../modules/identity';

export interface AuditMetadata {
  readonly actorId: string;
  readonly actorRoles: readonly string[];
  readonly correlationId: string;
  readonly requestId: string;
  readonly requestMethod: string;
  readonly requestPath: string;
  readonly receivedAt: string;
}

export interface RequestContext {
  readonly audit: AuditMetadata;
  readonly correlationId: string;
  readonly identity?: IdentityPrincipal;
  readonly requestId: string;
  readonly roleClaims: readonly RoleClaim[];
  readonly receivedAt: string;
}

export const createRequestContext = (
  request: IncomingMessage,
  identity?: IdentityPrincipal
): RequestContext => {
  const requestId = getHeaderValue(request, 'x-request-id') ?? randomUUID();
  const correlationId = getHeaderValue(request, 'x-correlation-id') ?? requestId;
  const receivedAt = new Date().toISOString();
  const requestPath = request.url ?? '/';
  const roleClaims = identity?.roleClaims ?? [];
  const actorRoles = roleClaims.map((claim) => claim.role);

  return {
    audit: {
      actorId: identity?.subject ?? 'anonymous',
      actorRoles,
      correlationId,
      requestId,
      requestMethod: request.method ?? 'GET',
      requestPath,
      receivedAt
    },
    correlationId,
    requestId,
    roleClaims,
    receivedAt,
    ...(identity === undefined ? {} : { identity })
  };
};

export const getHeaderValue = (
  request: IncomingMessage,
  name: string
): string | undefined => {
  const value = request.headers[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};
