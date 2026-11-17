import type { StaffSession } from "@/security/staff-auth";
import { prisma } from "@/persistence";
import { createCorrelationId, sanitizeForObservability } from "@/observability/logger";

type JsonObject = Record<string, unknown>;

export type StaffAuditAction =
  | "staff.appointment.accessed"
  | "staff.appointment.status_changed";

export interface AuditStaffIdentity {
  subject: string;
  staffUserId?: string;
  email?: string;
  provider?: StaffSession["provider"];
}

export interface AuditTarget {
  type: "appointment" | string;
  id: string;
}

export interface WriteAuditLogInput {
  staff: AuditStaffIdentity;
  action: StaffAuditAction | string;
  target: AuditTarget;
  correlationId?: string;
  previousValues?: JsonObject;
  newValues?: JsonObject;
  metadata?: JsonObject;
  occurredAt?: Date;
}

export interface AppointmentAccessAuditInput {
  staff: AuditStaffIdentity;
  appointmentId: string;
  accessType?: "view" | "search_result" | "export";
  correlationId?: string;
  metadata?: JsonObject;
}

export interface AppointmentStatusChangeAuditInput {
  staff: AuditStaffIdentity;
  appointmentId: string;
  previousStatus: string;
  newStatus: string;
  correlationId?: string;
  reasonCode?: string;
  metadata?: JsonObject;
}

export interface PersistedAuditLog {
  id: string;
  actorType: string;
  actorId: string | null;
  staffUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  occurredAt: Date;
}

export interface AuditLogWriter {
  auditLog: {
    create(args: {
      data: {
        actorType: string;
        actorId: string;
        staffUserId?: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata: JsonObject;
        occurredAt?: Date;
      };
    }): Promise<PersistedAuditLog>;
  };
}

export class AuditLogService {
  constructor(private readonly db: AuditLogWriter = prisma as unknown as AuditLogWriter) {}

  async writeAuditLog(input: WriteAuditLogInput): Promise<PersistedAuditLog> {
    const correlationId = input.correlationId ?? createCorrelationId();
    const metadata = sanitizeForObservability({
      correlationId,
      staff: {
        subject: input.staff.subject,
        staffUserId: input.staff.staffUserId,
        provider: input.staff.provider
      },
      previousValues: input.previousValues,
      newValues: input.newValues,
      ...input.metadata
    });

    return this.db.auditLog.create({
      data: {
        actorType: "staff",
        actorId: input.staff.subject,
        staffUserId: input.staff.staffUserId,
        action: input.action,
        entityType: input.target.type,
        entityId: input.target.id,
        metadata: ensureJsonObject(metadata),
        occurredAt: input.occurredAt
      }
    });
  }

  writeStaffAppointmentAccess(
    input: AppointmentAccessAuditInput
  ): Promise<PersistedAuditLog> {
    return this.writeAuditLog({
      staff: input.staff,
      action: "staff.appointment.accessed",
      target: {
        type: "appointment",
        id: input.appointmentId
      },
      correlationId: input.correlationId,
      metadata: {
        accessType: input.accessType ?? "view",
        ...input.metadata
      }
    });
  }

  writeStaffAppointmentStatusChange(
    input: AppointmentStatusChangeAuditInput
  ): Promise<PersistedAuditLog> {
    return this.writeAuditLog({
      staff: input.staff,
      action: "staff.appointment.status_changed",
      target: {
        type: "appointment",
        id: input.appointmentId
      },
      correlationId: input.correlationId,
      previousValues: {
        status: input.previousStatus
      },
      newValues: {
        status: input.newStatus
      },
      metadata: {
        reasonCode: input.reasonCode,
        ...input.metadata
      }
    });
  }
}

export const auditLogService = new AuditLogService();

export function writeStaffAppointmentAccessAudit(
  input: AppointmentAccessAuditInput
): Promise<PersistedAuditLog> {
  return auditLogService.writeStaffAppointmentAccess(input);
}

export function writeStaffAppointmentStatusChangeAudit(
  input: AppointmentStatusChangeAuditInput
): Promise<PersistedAuditLog> {
  return auditLogService.writeStaffAppointmentStatusChange(input);
}

function ensureJsonObject(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as JsonObject;
}
