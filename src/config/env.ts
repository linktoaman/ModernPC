import "server-only";

export const staffAuthProviders = ["managed-idp", "development-header"] as const;
export type StaffAuthProvider = (typeof staffAuthProviders)[number];

export interface StaffSecurityConfig {
  staffAuthProvider: StaffAuthProvider;
  staffSessionCookieName: string;
  staffSignInPath: string;
  staffAuthTrustedEmailHeader: string;
  staffAuthTrustedRoleHeader: string;
  staffAuthHeaderTrustEnabled: boolean;
}

const DEFAULT_STAFF_SESSION_COOKIE_NAME = "clinic_staff_session";
const DEFAULT_STAFF_SIGN_IN_PATH = "/staff/sign-in";
const DEFAULT_STAFF_EMAIL_HEADER = "x-staff-email";
const DEFAULT_STAFF_ROLE_HEADER = "x-staff-roles";

export function getServerEnv(
  source: NodeJS.ProcessEnv = process.env
): StaffSecurityConfig {
  const staffAuthProvider = readProvider(source.STAFF_AUTH_PROVIDER);
  const staffSessionCookieName =
    source.STAFF_SESSION_COOKIE_NAME?.trim() || DEFAULT_STAFF_SESSION_COOKIE_NAME;
  const staffSignInPath =
    source.STAFF_SIGN_IN_PATH?.trim() || DEFAULT_STAFF_SIGN_IN_PATH;
  const staffAuthTrustedEmailHeader =
    source.STAFF_AUTH_TRUSTED_EMAIL_HEADER?.trim().toLowerCase() ||
    DEFAULT_STAFF_EMAIL_HEADER;
  const staffAuthTrustedRoleHeader =
    source.STAFF_AUTH_TRUSTED_ROLE_HEADER?.trim().toLowerCase() ||
    DEFAULT_STAFF_ROLE_HEADER;
  const staffAuthHeaderTrustEnabled = readBoolean(
    source.STAFF_AUTH_TRUSTED_HEADERS_ENABLED,
    false
  );

  assertCookieName(staffSessionCookieName, "STAFF_SESSION_COOKIE_NAME");
  assertRelativePath(staffSignInPath, "STAFF_SIGN_IN_PATH");
  assertHeaderName(staffAuthTrustedEmailHeader, "STAFF_AUTH_TRUSTED_EMAIL_HEADER");
  assertHeaderName(staffAuthTrustedRoleHeader, "STAFF_AUTH_TRUSTED_ROLE_HEADER");

  return {
    staffAuthProvider,
    staffSessionCookieName,
    staffSignInPath,
    staffAuthTrustedEmailHeader,
    staffAuthTrustedRoleHeader,
    staffAuthHeaderTrustEnabled
  };
}

function readProvider(value: string | undefined): StaffAuthProvider {
  if (!value || value.trim() === "") {
    return "managed-idp";
  }

  const normalized = value.trim();
  if (staffAuthProviders.includes(normalized as StaffAuthProvider)) {
    return normalized as StaffAuthProvider;
  }

  throw new Error(
    `STAFF_AUTH_PROVIDER must be one of: ${staffAuthProviders.join(", ")}`
  );
}

function readBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(
    "STAFF_AUTH_TRUSTED_HEADERS_ENABLED must be a boolean-like value"
  );
}

function assertCookieName(value: string, envName: string): void {
  if (!/^[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error(`${envName} must be a valid cookie name`);
  }
}

function assertRelativePath(value: string, envName: string): void {
  if (!value.startsWith("/") || value.startsWith("//")) {
    throw new Error(`${envName} must be an application-relative path`);
  }
}

function assertHeaderName(value: string, envName: string): void {
  if (!/^[a-z0-9!#$%&'*+.^_`|~-]+$/.test(value)) {
    throw new Error(`${envName} must be a valid HTTP header name`);
  }
}
