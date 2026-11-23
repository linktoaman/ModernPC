import { createHash } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import {
  pharmacyRoleSet,
  type IdentityPrincipal,
  type PharmacyRole,
  type RoleClaim
} from '../modules/identity';
import { getHeaderValue } from './requestContext';

export interface AuthenticationSuccess {
  readonly ok: true;
  readonly identity: IdentityPrincipal;
}

export interface AuthenticationFailure {
  readonly ok: false;
  readonly code: 'missing_credentials' | 'invalid_credentials';
  readonly message: string;
  readonly statusCode: 401;
}

export type AuthenticationResult = AuthenticationSuccess | AuthenticationFailure;

export const authenticateRequest = (request: IncomingMessage): AuthenticationResult => {
  const authorization = getHeaderValue(request, 'authorization');

  if (authorization === undefined || authorization.trim() === '') {
    return {
      ok: false,
      code: 'missing_credentials',
      message: 'Authentication credentials are required.',
      statusCode: 401
    };
  }

  const credential = readBearerCredential(authorization);

  if (credential === undefined) {
    return {
      ok: false,
      code: 'invalid_credentials',
      message: 'Authentication credentials are malformed.',
      statusCode: 401
    };
  }

  const subject = getHeaderValue(request, 'x-authenticated-subject')
    ?? `oidc:${hashCredential(credential)}`;
  const email = getHeaderValue(request, 'x-authenticated-email');
  const roleClaims = readRoleClaims(request);

  return {
    ok: true,
    identity: {
      subject,
      roles: roleClaims.map((claim) => claim.role),
      roleClaims,
      ...(email === undefined ? {} : { email })
    }
  };
};

const readBearerCredential = (authorization: string): string | undefined => {
  const [scheme, credential] = authorization.trim().split(/\s+/, 2);

  if (scheme !== 'Bearer' || credential === undefined || credential === '') {
    return undefined;
  }

  return credential;
};

const readRoleClaims = (request: IncomingMessage): readonly RoleClaim[] => {
  const roleHeader = getHeaderValue(request, 'x-authenticated-roles') ?? 'patient';

  return roleHeader
    .split(',')
    .map((role) => role.trim())
    .filter((role): role is PharmacyRole => pharmacyRoleSet.has(role as PharmacyRole))
    .map((role) => ({
      role,
      source: 'managed-oidc'
    }));
};

const hashCredential = (credential: string): string => (
  createHash('sha256').update(credential).digest('hex').slice(0, 24)
);
