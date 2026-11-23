export interface RequestContext {
  readonly requestId: string;
  readonly receivedAt: string;
}

export const createRequestContext = (requestId: string): RequestContext => ({
  requestId,
  receivedAt: new Date().toISOString()
});
