import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { createDatabaseConfig } from '@pharmacy-two/db';
import { createHealthStatus, type RuntimeEnvironment } from '@pharmacy-two/shared';

import { authenticateRequest } from './middleware/authenticate';
import { createRequestContext, type RequestContext } from './middleware/requestContext';
import {
  createResourceIdHash,
  recordAuthorizationDenial
} from './modules/audit-reporting';
import {
  createPatientAccountRouteResponse,
  getPatientMeRouteResponse,
  type IdentityRouteResponse
} from './modules/identity/accountRoutes';
import {
  createStaffProvisioningRouteResponse,
  matchStaffProvisioningRoute,
  type StaffProvisioningRouteMatch,
  updateStaffProvisioningRouteResponse
} from './modules/identity/staffProvisioningRoutes';
import {
  policyChecks,
  type PolicyCheck,
  type PolicyResource
} from './modules/identity';
import {
  validateSessionPolicy
} from './modules/identity/accessPolicies';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const environment = readRuntimeEnvironment(process.env.NODE_ENV);

const databaseConfig = createDatabaseConfig(
  process.env.DATABASE_URL ?? 'postgres://localhost/pharmacy_two',
  environment
);

interface ProtectedRouteScaffold {
  readonly method: 'GET' | 'POST';
  readonly path: string;
  readonly moduleName: string;
  readonly policy: PolicyCheck;
  readonly resource: PolicyResource;
}

const protectedRouteScaffolds: readonly ProtectedRouteScaffold[] = [
  {
    method: 'GET',
    path: '/api/patients/self',
    moduleName: 'patients',
    policy: policyChecks.patientOwnership,
    resource: {
      type: 'patient-record',
      ownerSubject: 'requesting-subject'
    }
  },
  {
    method: 'GET',
    path: '/api/patients',
    moduleName: 'patients',
    policy: policyChecks.staffRole,
    resource: {
      type: 'patient-worklist'
    }
  },
  {
    method: 'GET',
    path: '/api/prescriptions',
    moduleName: 'prescriptions',
    policy: policyChecks.staffRole,
    resource: {
      type: 'prescription-worklist'
    }
  },
  {
    method: 'GET',
    path: '/api/refills',
    moduleName: 'refills',
    policy: policyChecks.staffRole,
    resource: {
      type: 'refill-worklist'
    }
  },
  {
    method: 'GET',
    path: '/api/messaging',
    moduleName: 'messaging',
    policy: policyChecks.staffRole,
    resource: {
      type: 'message-worklist'
    }
  },
  {
    method: 'GET',
    path: '/api/notifications',
    moduleName: 'notifications',
    policy: policyChecks.staffRole,
    resource: {
      type: 'notification-worklist'
    }
  },
  {
    method: 'GET',
    path: '/api/audit-reporting/authorization-denials',
    moduleName: 'audit-reporting',
    policy: policyChecks.administratorRole,
    resource: {
      type: 'authorization-denial-audit'
    }
  }
];

const requestListener = (request: IncomingMessage, response: ServerResponse): void => {
  void handleRequest(request, response);
};

export const server = createServer(requestListener);

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`PharmacyTwo API listening on port ${port}`);
  });
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const path = getRequestPath(request);

  if (request.method === 'GET' && path === '/api/health') {
    writeJson(response, 200, {
      ...createHealthStatus('pharmacy-two-api', environment),
      databaseSslRequired: databaseConfig.sslRequired
    });
    return;
  }

  if (request.method === 'POST' && path === '/api/patient/accounts') {
    await handleCreatePatientAccountRoute(request, response);
    return;
  }

  if (request.method === 'GET' && path === '/api/patient/me') {
    handleGetPatientMeRoute(request, response);
    return;
  }

  const staffProvisioningRoute = matchStaffProvisioningRoute(request.method, path);

  if (staffProvisioningRoute !== undefined) {
    await handleStaffProvisioningRoute(request, response, staffProvisioningRoute);
    return;
  }

  const protectedRoute = protectedRouteScaffolds.find(
    (route) => route.method === request.method && route.path === path
  );

  if (protectedRoute !== undefined) {
    handleProtectedRouteScaffold(request, response, protectedRoute);
    return;
  }

  writeJson(response, 404, {
    error: 'not_found',
    message: 'The requested API route does not exist.'
  });
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>
): void {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(body));
}

function handleProtectedRouteScaffold(
  request: IncomingMessage,
  response: ServerResponse,
  route: ProtectedRouteScaffold
): void {
  const authenticatedRequest = authenticateAndCreateContext(request, response);

  if (authenticatedRequest === undefined) {
    return;
  }

  const { context } = authenticatedRequest;
  const resource = resolvePolicyResource(context, route.resource);
  const decision = route.policy.evaluate(context, resource);

  if (!decision.allowed) {
    recordPolicyDenial(context, route.policy, resource, decision.reasonCode);

    writeJson(response, 403, {
      error: 'authorization_denied',
      message: 'The authenticated identity is not authorized for this API route.',
      correlationId: context.correlationId
    });
    return;
  }

  writeJson(response, 200, {
    module: route.moduleName,
    status: 'protected_route_scaffold',
    correlationId: context.correlationId
  });
}

async function handleCreatePatientAccountRoute(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const authenticatedRequest = authenticateAndCreateContext(request, response);

  if (authenticatedRequest === undefined) {
    return;
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    writeJson(response, 400, {
      error: 'invalid_json',
      message: body.message,
      correlationId: authenticatedRequest.context.correlationId
    });
    return;
  }

  const routeResponse = createPatientAccountRouteResponse(
    authenticatedRequest.identity,
    body.value,
    authenticatedRequest.context.correlationId
  );

  writeRouteResponse(response, routeResponse);
}

function handleGetPatientMeRoute(
  request: IncomingMessage,
  response: ServerResponse
): void {
  const authenticatedRequest = authenticateAndCreateContext(request, response);

  if (authenticatedRequest === undefined) {
    return;
  }

  const patientProfile = policyChecks.patientAccountOwnership.evaluate(
    authenticatedRequest.context,
    {
      type: 'patient-account',
      ownerSubject: authenticatedRequest.identity.subject
    }
  );

  if (!patientProfile.allowed) {
    recordPolicyDenial(
      authenticatedRequest.context,
      policyChecks.patientAccountOwnership,
      {
        type: 'patient-account',
        ownerSubject: authenticatedRequest.identity.subject
      },
      patientProfile.reasonCode
    );
  }

  writeRouteResponse(
    response,
    getPatientMeRouteResponse(
      authenticatedRequest.identity,
      authenticatedRequest.context.correlationId
    )
  );
}

async function handleStaffProvisioningRoute(
  request: IncomingMessage,
  response: ServerResponse,
  route: StaffProvisioningRouteMatch
): Promise<void> {
  const authenticatedRequest = authenticateAndCreateContext(request, response);

  if (authenticatedRequest === undefined) {
    return;
  }

  const resource: PolicyResource = {
    type: 'staff-provisioning',
    ...(route.action === 'update' ? { id: route.staffUserId } : {})
  };
  const decision = policyChecks.staffProvisioning.evaluate(
    authenticatedRequest.context,
    resource
  );

  if (!decision.allowed) {
    recordPolicyDenial(
      authenticatedRequest.context,
      policyChecks.staffProvisioning,
      resource,
      decision.reasonCode
    );

    writeJson(response, 403, {
      error: 'authorization_denied',
      message: 'The authenticated identity is not authorized for this API route.',
      correlationId: authenticatedRequest.context.correlationId
    });
    return;
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    writeJson(response, 400, {
      error: 'invalid_json',
      message: body.message,
      correlationId: authenticatedRequest.context.correlationId
    });
    return;
  }

  if (route.action === 'create') {
    writeRouteResponse(
      response,
      createStaffProvisioningRouteResponse(
        authenticatedRequest.identity,
        body.value,
        authenticatedRequest.context
      )
    );
    return;
  }

  writeRouteResponse(
    response,
    updateStaffProvisioningRouteResponse(
      route.staffUserId,
      authenticatedRequest.identity,
      body.value,
      authenticatedRequest.context
    )
  );
}

interface AuthenticatedRequestContext {
  readonly context: RequestContext;
  readonly identity: NonNullable<RequestContext['identity']>;
}

function authenticateAndCreateContext(
  request: IncomingMessage,
  response: ServerResponse
): AuthenticatedRequestContext | undefined {
  const authentication = authenticateRequest(request);

  if (!authentication.ok) {
    writeJson(response, authentication.statusCode, {
      error: authentication.code,
      message: authentication.message
    });
    return undefined;
  }

  const context = createRequestContext(request, authentication.identity);
  const sessionDecision = validateSessionPolicy(request, context);

  if (!sessionDecision.allowed) {
    recordPolicyDenial(
      context,
      {
        name: 'session-timeout',
        evaluate: () => sessionDecision
      },
      {
        type: 'application-session'
      },
      sessionDecision.reasonCode
    );

    writeJson(response, 401, {
      error: 'session_timeout',
      message: 'The authenticated session has timed out.',
      correlationId: context.correlationId
    });
    return undefined;
  }

  return {
    context,
    identity: authentication.identity
  };
}

function recordPolicyDenial(
  context: RequestContext,
  policy: PolicyCheck,
  resource: PolicyResource,
  reasonCode: string | undefined
): void {
  recordAuthorizationDenial({
    context,
    policyName: policy.name,
    reasonCode: reasonCode ?? 'authorization_denied',
    resourceType: resource.type,
    ...(resource.id === undefined ? {} : { resourceIdHash: createResourceIdHash(resource.id) })
  });
}

interface JsonBodySuccess {
  readonly ok: true;
  readonly value: unknown;
}

interface JsonBodyFailure {
  readonly ok: false;
  readonly message: string;
}

type JsonBodyResult = JsonBodySuccess | JsonBodyFailure;

async function readJsonBody(request: IncomingMessage): Promise<JsonBodyResult> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');

  if (rawBody.trim() === '') {
    return {
      ok: false,
      message: 'A JSON request body is required.'
    };
  }

  try {
    return {
      ok: true,
      value: JSON.parse(rawBody) as unknown
    };
  } catch {
    return {
      ok: false,
      message: 'The request body must be valid JSON.'
    };
  }
}

function writeRouteResponse(
  response: ServerResponse,
  routeResponse: IdentityRouteResponse
): void {
  writeJson(response, routeResponse.statusCode, routeResponse.body);
}

function resolvePolicyResource(
  context: RequestContext,
  resource: PolicyResource
): PolicyResource {
  if (resource.ownerSubject === 'requesting-subject' && context.identity !== undefined) {
    return {
      ...resource,
      ownerSubject: context.identity.subject
    };
  }

  return resource;
}

function getRequestPath(request: IncomingMessage): string {
  return new URL(request.url ?? '/', 'http://localhost').pathname;
}

function readRuntimeEnvironment(value: string | undefined): RuntimeEnvironment {
  if (
    value === 'development'
    || value === 'test'
    || value === 'staging'
    || value === 'production'
  ) {
    return value;
  }

  return 'development';
}
