import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { createDatabaseConfig } from '@pharmacy-two/db';
import { createHealthStatus, type RuntimeEnvironment } from '@pharmacy-two/shared';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const environment = readRuntimeEnvironment(process.env.NODE_ENV);

const databaseConfig = createDatabaseConfig(
  process.env.DATABASE_URL ?? 'postgres://localhost/pharmacy_two',
  environment
);

const requestListener = (request: IncomingMessage, response: ServerResponse): void => {
  if (request.method === 'GET' && request.url === '/api/health') {
    writeJson(response, 200, {
      ...createHealthStatus('pharmacy-two-api', environment),
      databaseSslRequired: databaseConfig.sslRequired
    });
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
