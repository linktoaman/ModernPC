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
  policyChecks,
  type PolicyCheck,
  type PolicyResource
} from './modules/identity';

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
  const path = getRequestPath(request);

  if (request.method === 'GET' && path === '/api/health') {
    writeJson(response, 200, {
      ...createHealthStatus('pharmacy-two-api', environment),
      databaseSslRequired: databaseConfig.sslRequired
    });
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
};

export const server = createServer(requestListener);

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`PharmacyTwo API listening on port ${port}`);
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
  const authentication = authenticateRequest(request);

  if (!authentication.ok) {
    writeJson(response, authentication.statusCode, {
      error: authentication.code,
      message: authentication.message
    });
    return;
  }

  const context = createRequestContext(request, authentication.identity);
  const resource = resolvePolicyResource(context, route.resource);
  const decision = route.policy.evaluate(context, resource);

  if (!decision.allowed) {
    recordAuthorizationDenial({
      context,
      policyName: route.policy.name,
      reasonCode: decision.reasonCode ?? 'authorization_denied',
      resourceType: resource.type,
      ...(resource.id === undefined ? {} : { resourceIdHash: createResourceIdHash(resource.id) })
    });

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
