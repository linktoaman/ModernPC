export interface AuditEvent {
  readonly actorId: string;
  readonly action: string;
  readonly occurredAt: string;
}

export const auditReportingModuleName = 'audit-reporting';
