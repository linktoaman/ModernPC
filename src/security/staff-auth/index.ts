import "server-only";

import { getServerEnv } from "@/config/env";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const staffRoles = ["receptionist", "clinic_admin"] as const;
export type StaffRole = (typeof staffRoles)[number];

export interface StaffSession {
  subject: string;
  email?: string;
  roles: StaffRole[];
  provider: "managed-idp" | "development-header";
}

export const RECEPTIONIST_ROLE: StaffRole = "receptionist";
export const CLINIC_ADMIN_ROLE: StaffRole = "clinic_admin";

export async function getCurrentStaffSession(): Promise<StaffSession | null> {
  const config = getServerEnv();
  const requestHeaders = await headers();

  if (config.staffAuthHeaderTrustEnabled) {
    const trustedSession = readTrustedHeaderSession(
      requestHeaders,
      config.staffAuthTrustedEmailHeader,
      config.staffAuthTrustedRoleHeader,
      config.staffAuthProvider
    );

    if (trustedSession) {
      return trustedSession;
    }
  }

  const cookieStore = await cookies();
  const staffSessionCookie = cookieStore.get(config.staffSessionCookieName);

  if (!staffSessionCookie?.value) {
    return null;
  }

  // Managed identity provider integration point:
  // a hosted IdP should own cookie issuance and verification before this app sees the request.
  // Optional trusted role headers can be enabled above when the platform strips external values.
  return {
    subject: "managed-idp-session",
    roles: [],
    provider: "managed-idp"
  };
}

export async function requireStaffSession(): Promise<StaffSession> {
  const session = await getCurrentStaffSession();

  if (!session) {
    redirect(getServerEnv().staffSignInPath);
  }

  return session;
}

export async function requireReceptionist(): Promise<StaffSession> {
  return requireStaffRole(RECEPTIONIST_ROLE);
}

export async function requireClinicAdmin(): Promise<StaffSession> {
  return requireStaffRole(CLINIC_ADMIN_ROLE);
}

export async function requireStaffRole(role: StaffRole): Promise<StaffSession> {
  const session = await requireStaffSession();

  if (!hasStaffRole(session, role)) {
    redirect(getServerEnv().staffSignInPath);
  }

  return session;
}

export function hasStaffRole(session: StaffSession, role: StaffRole): boolean {
  return session.roles.includes(role);
}

export function isReceptionist(session: StaffSession): boolean {
  return hasStaffRole(session, RECEPTIONIST_ROLE);
}

export function isClinicAdmin(session: StaffSession): boolean {
  return hasStaffRole(session, CLINIC_ADMIN_ROLE);
}

export function parseStaffRoles(value: string | null | undefined): StaffRole[] {
  if (!value) {
    return [];
  }

  const roles = value
    .split(/[,\s]+/)
    .map((role) => normalizeStaffRole(role))
    .filter((role): role is StaffRole => role !== null);

  return Array.from(new Set(roles));
}

export function normalizeStaffRole(value: string): StaffRole | null {
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, "_");

  if (normalized === "receptionist") {
    return RECEPTIONIST_ROLE;
  }

  if (normalized === "clinic_admin") {
    return CLINIC_ADMIN_ROLE;
  }

  return null;
}

function readTrustedHeaderSession(
  requestHeaders: Headers,
  emailHeaderName: string,
  roleHeaderName: string,
  provider: StaffSession["provider"]
): StaffSession | null {
  const email = requestHeaders.get(emailHeaderName)?.trim();
  const roles = parseStaffRoles(requestHeaders.get(roleHeaderName));

  if (!email && roles.length === 0) {
    return null;
  }

  return {
    subject: email || "trusted-staff-identity",
    email,
    roles,
    provider
  };
}
