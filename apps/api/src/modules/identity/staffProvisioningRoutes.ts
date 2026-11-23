import {
  recordStaffProvisioningEvent
} from '../audit-reporting';
import type { RequestContext } from '../../middleware/requestContext';
import type { IdentityPrincipal } from './index';
import {
  provisionStaffAccount,
  updateStaffAccount,
  type StaffAccountProfile,
  type StaffProvisioningInput,
  type StaffProvisioningPatchInput
} from './accessPolicies';
import type { IdentityRouteResponse } from './accountRoutes';

export type StaffProvisioningRouteMatch =
  | StaffProvisioningCreateRouteMatch
  | StaffProvisioningUpdateRouteMatch;

export interface StaffProvisioningCreateRouteMatch {
  readonly action: 'create';
}

export interface StaffProvisioningUpdateRouteMatch {
  readonly action: 'update';
  readonly staffUserId: string;
}

export const matchStaffProvisioningRoute = (
  method: string | undefined,
  path: string
): StaffProvisioningRouteMatch | undefined => {
  if (method === 'POST' && path === '/api/admin/staff') {
    return { action: 'create' };
  }

  if (method !== 'PATCH') {
    return undefined;
  }

  const match = /^\/api\/admin\/staff\/([^/]+)$/.exec(path);
  const staffUserId = match?.[1];

  if (staffUserId === undefined || staffUserId.trim() === '') {
    return undefined;
  }

  return {
    action: 'update',
    staffUserId: decodeURIComponent(staffUserId)
  };
};

export const createStaffProvisioningRouteResponse = (
  administrator: IdentityPrincipal,
  body: unknown,
  context: RequestContext
): IdentityRouteResponse => {
  if (!isJsonObject(body)) {
    return createInvalidBodyResponse(context.correlationId);
  }

  const result = provisionStaffAccount(administrator, body as StaffProvisioningInput);

  if (!result.ok) {
    return createInvalidStaffProvisioningResponse(result.errors, context.correlationId);
  }

  recordStaffProvisioningEvent({
    action: 'staff_provisioned',
    context,
    outcome: 'success',
    staffRole: result.value.role,
    staffUserId: result.value.id
  });

  return {
    statusCode: 201,
    body: {
      staff: serializeStaffProfile(result.value),
      correlationId: context.correlationId
    }
  };
};

export const updateStaffProvisioningRouteResponse = (
  staffUserId: string,
  administrator: IdentityPrincipal,
  body: unknown,
  context: RequestContext
): IdentityRouteResponse => {
  if (!isJsonObject(body)) {
    return createInvalidBodyResponse(context.correlationId);
  }

  const result = updateStaffAccount(
    staffUserId,
    administrator,
    body as StaffProvisioningPatchInput
  );

  if (!result.ok) {
    return createInvalidStaffProvisioningResponse(result.errors, context.correlationId);
  }

  recordStaffProvisioningEvent({
    action: 'staff_provisioning_updated',
    context,
    outcome: 'success',
    staffRole: result.value.role,
    staffUserId: result.value.id
  });

  return {
    statusCode: 200,
    body: {
      staff: serializeStaffProfile(result.value),
      correlationId: context.correlationId
    }
  };
};

const serializeStaffProfile = (
  profile: StaffAccountProfile
): Record<string, unknown> => ({
  id: profile.id,
  role: profile.role,
  givenName: profile.givenName,
  familyName: profile.familyName,
  status: profile.status,
  provisionedAt: profile.provisionedAt,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
  ...(profile.email === undefined ? {} : { email: profile.email }),
  ...(profile.licenseIdentifier === undefined
    ? {}
    : { licenseIdentifier: profile.licenseIdentifier })
});

const createInvalidBodyResponse = (correlationId: string): IdentityRouteResponse => ({
  statusCode: 400,
  body: {
    error: 'invalid_request',
    message: 'A JSON request body is required.',
    correlationId
  }
});

const createInvalidStaffProvisioningResponse = (
  details: readonly string[],
  correlationId: string
): IdentityRouteResponse => ({
  statusCode: 400,
  body: {
    error: 'invalid_staff_provisioning',
    message: 'The staff provisioning request is incomplete or invalid.',
    details,
    correlationId
  }
});

const isJsonObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);
