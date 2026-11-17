import { NextRequest, NextResponse } from "next/server";

interface StaffMiddlewareConfig {
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

export function middleware(request: NextRequest) {
  const config = getStaffMiddlewareConfig();
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/staff") || pathname.startsWith(config.staffSignInPath)) {
    return NextResponse.next();
  }

  if (hasStaffAuthEvidence(request, config)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = config.staffSignInPath;
  redirectUrl.search = "";
  redirectUrl.searchParams.set("returnTo", pathname);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/staff/:path*"]
};

function hasStaffAuthEvidence(
  request: NextRequest,
  config: StaffMiddlewareConfig
): boolean {
  if (request.cookies.has(config.staffSessionCookieName)) {
    return true;
  }

  if (!config.staffAuthHeaderTrustEnabled) {
    return false;
  }

  return (
    request.headers.has(config.staffAuthTrustedEmailHeader) ||
    request.headers.has(config.staffAuthTrustedRoleHeader)
  );
}

function getStaffMiddlewareConfig(): StaffMiddlewareConfig {
  const staffSessionCookieName =
    process.env.STAFF_SESSION_COOKIE_NAME?.trim() ||
    DEFAULT_STAFF_SESSION_COOKIE_NAME;
  const staffSignInPath =
    process.env.STAFF_SIGN_IN_PATH?.trim() || DEFAULT_STAFF_SIGN_IN_PATH;
  const staffAuthTrustedEmailHeader =
    process.env.STAFF_AUTH_TRUSTED_EMAIL_HEADER?.trim().toLowerCase() ||
    DEFAULT_STAFF_EMAIL_HEADER;
  const staffAuthTrustedRoleHeader =
    process.env.STAFF_AUTH_TRUSTED_ROLE_HEADER?.trim().toLowerCase() ||
    DEFAULT_STAFF_ROLE_HEADER;
  const staffAuthHeaderTrustEnabled = readBoolean(
    process.env.STAFF_AUTH_TRUSTED_HEADERS_ENABLED,
    false
  );

  assertCookieName(staffSessionCookieName, "STAFF_SESSION_COOKIE_NAME");
  assertRelativePath(staffSignInPath, "STAFF_SIGN_IN_PATH");
  assertHeaderName(staffAuthTrustedEmailHeader, "STAFF_AUTH_TRUSTED_EMAIL_HEADER");
  assertHeaderName(staffAuthTrustedRoleHeader, "STAFF_AUTH_TRUSTED_ROLE_HEADER");

  return {
    staffSessionCookieName,
    staffSignInPath,
    staffAuthTrustedEmailHeader,
    staffAuthTrustedRoleHeader,
    staffAuthHeaderTrustEnabled
  };
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
