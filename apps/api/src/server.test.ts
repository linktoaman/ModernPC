import { type Server } from 'node:http';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

let server: Server;
let baseUrl: string;

const listen = async (nodeServer: Server): Promise<void> => {
  await new Promise<void>((resolve) => {
    nodeServer.listen(0, '127.0.0.1', resolve);
  });
};

const close = async (nodeServer: Server): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    nodeServer.close((error) => {
      if (error === undefined) {
        resolve();
        return;
      }

      reject(error);
    });
  });
};

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgres://localhost/pharmacy_two_test';

  const importedServer = await import('./server');
  server = importedServer.server;
  await listen(server);

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Expected API test server to listen on a TCP port.');
  }

  baseUrl = `http://127.0.0.1:${address.port.toString()}`;
});

afterAll(async () => {
  await close(server);
});

describe('API server foundation routes', () => {
  test('reports health without production secrets', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json() as {
      readonly databaseSslRequired: boolean;
      readonly environment: string;
      readonly service: string;
      readonly status: string;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toEqual({
      databaseSslRequired: false,
      environment: 'test',
      service: 'pharmacy-two-api',
      status: 'ok',
    });
  });

  test('rejects protected routes when credentials are missing', async () => {
    const response = await fetch(`${baseUrl}/api/patients`);
    const body = await response.json() as {
      readonly error: string;
      readonly message: string;
    };

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: 'missing_credentials',
      message: 'Authentication credentials are required.',
    });
  });

  test('rejects protected routes when claims lack the required staff role', async () => {
    const response = await fetch(`${baseUrl}/api/patients`, {
      headers: {
        authorization: 'Bearer test-token',
        'x-authenticated-roles': 'patient',
        'x-correlation-id': 'corr-foundation-test',
      },
    });
    const body = await response.json() as {
      readonly correlationId: string;
      readonly error: string;
      readonly message: string;
    };

    expect(response.status).toBe(403);
    expect(body).toEqual({
      correlationId: 'corr-foundation-test',
      error: 'authorization_denied',
      message: 'The authenticated identity is not authorized for this API route.',
    });
  });
});
