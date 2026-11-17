-- EnableExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('Booked', 'Rescheduled', 'Cancelled', 'Completed', 'No-show');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('Email', 'Sms');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('Pending', 'Sent', 'Failed', 'Cancelled');

-- CreateTable
CREATE TABLE "patient_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "dateOfBirth" DATE,
    "timezone" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patient_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "displayName" TEXT NOT NULL,
    "specialty" TEXT,
    "timezone" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" UUID,
    "name" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "bufferBeforeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bufferAfterMinutes" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" UUID NOT NULL,
    "patientContactId" UUID NOT NULL,
    "appointmentTypeId" UUID NOT NULL,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "endAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'Booked',
    "statusChangedAt" TIMESTAMPTZ(6),
    "rescheduledFromId" UUID,
    "cancellationReason" TEXT,
    "completedAt" TIMESTAMPTZ(6),
    "noShowAt" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "timezone" TEXT NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "availability_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_times" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" UUID NOT NULL,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "endAt" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blocked_times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" UUID,
    "appointmentTypeId" UUID,
    "minNoticeMinutes" INTEGER NOT NULL DEFAULT 0,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 90,
    "cancellationCutoffMinutes" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "scheduling_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointmentId" UUID,
    "patientContactId" UUID,
    "channel" "notification_channel" NOT NULL,
    "status" "notification_status" NOT NULL DEFAULT 'Pending',
    "recipient" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "scheduledAt" TIMESTAMPTZ(6),
    "sentAt" TIMESTAMPTZ(6),
    "failureReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_access_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patientContactId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_user_references" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "externalUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "roles" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "doctorId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "staff_user_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "staffUserId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_contacts_email_idx" ON "patient_contacts"("email");

-- CreateIndex
CREATE INDEX "patient_contacts_phone_idx" ON "patient_contacts"("phone");

-- CreateIndex
CREATE INDEX "doctors_active_idx" ON "doctors"("active");

-- CreateIndex
CREATE INDEX "appointment_types_doctorId_active_idx" ON "appointment_types"("doctorId", "active");

-- CreateIndex
CREATE INDEX "appointments_doctorId_startAt_idx" ON "appointments"("doctorId", "startAt");

-- CreateIndex
CREATE INDEX "appointments_patientContactId_idx" ON "appointments"("patientContactId");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_active_doctor_time_slot_key" ON "appointments"("doctorId", "startAt") WHERE "status" IN ('Booked', 'Rescheduled');

-- CreateIndex
CREATE INDEX "availability_schedules_doctorId_dayOfWeek_active_idx" ON "availability_schedules"("doctorId", "dayOfWeek", "active");

-- CreateIndex
CREATE INDEX "blocked_times_doctorId_startAt_endAt_idx" ON "blocked_times"("doctorId", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "blocked_times_active_idx" ON "blocked_times"("active");

-- CreateIndex
CREATE INDEX "scheduling_rules_doctorId_appointmentTypeId_active_idx" ON "scheduling_rules"("doctorId", "appointmentTypeId", "active");

-- CreateIndex
CREATE INDEX "notifications_appointmentId_idx" ON "notifications"("appointmentId");

-- CreateIndex
CREATE INDEX "notifications_patientContactId_idx" ON "notifications"("patientContactId");

-- CreateIndex
CREATE INDEX "notifications_status_scheduledAt_idx" ON "notifications"("status", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "patient_access_tokens_tokenHash_key" ON "patient_access_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "patient_access_tokens_patientContactId_idx" ON "patient_access_tokens"("patientContactId");

-- CreateIndex
CREATE INDEX "patient_access_tokens_expiresAt_idx" ON "patient_access_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_references_externalUserId_key" ON "staff_user_references"("externalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_references_email_key" ON "staff_user_references"("email");

-- CreateIndex
CREATE INDEX "staff_user_references_active_idx" ON "staff_user_references"("active");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_staffUserId_idx" ON "audit_logs"("staffUserId");

-- CreateIndex
CREATE INDEX "audit_logs_occurredAt_idx" ON "audit_logs"("occurredAt");

-- AddForeignKey
ALTER TABLE "appointment_types" ADD CONSTRAINT "appointment_types_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "appointment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientContactId_fkey" FOREIGN KEY ("patientContactId") REFERENCES "patient_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_schedules" ADD CONSTRAINT "availability_schedules_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_times" ADD CONSTRAINT "blocked_times_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_rules" ADD CONSTRAINT "scheduling_rules_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "appointment_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_rules" ADD CONSTRAINT "scheduling_rules_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patientContactId_fkey" FOREIGN KEY ("patientContactId") REFERENCES "patient_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_access_tokens" ADD CONSTRAINT "patient_access_tokens_patientContactId_fkey" FOREIGN KEY ("patientContactId") REFERENCES "patient_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_user_references" ADD CONSTRAINT "staff_user_references_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "staff_user_references"("id") ON DELETE SET NULL ON UPDATE CASCADE;
