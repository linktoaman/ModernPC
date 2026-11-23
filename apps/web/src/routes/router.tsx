export type RouteRole = 'patient' | 'pharmacist' | 'technician' | 'administrator';

export type StaffRouteRole = Extract<RouteRole, 'pharmacist' | 'technician'>;

export type AppRouteId =
  | 'account'
  | 'staff-access'
  | 'admin-staff'
  | 'patient-status'
  | 'patient-refills'
  | 'patient-messages'
  | 'pharmacist-worklist'
  | 'technician-intake';

export type RouteProtection = 'public' | 'patient' | 'staff' | 'administrator';

export interface RouteArea {
  readonly id: RouteRole;
  readonly label: string;
  readonly path: string;
  readonly summary: string;
  readonly primaryAction: string;
  readonly safeguards: readonly string[];
}

export interface AppRoute {
  readonly id: AppRouteId;
  readonly label: string;
  readonly path: string;
  readonly protection: RouteProtection;
  readonly navigationRole: RouteRole | 'public';
  readonly summary: string;
}

const patientRouteArea: RouteArea = {
  id: 'patient',
  label: 'Patient',
  path: '/patient',
  summary: 'Refill requests, secure messages, prescription status, and profile preferences.',
  primaryAction: 'Review refill queue',
  safeguards: ['OIDC identity check', 'Patient record ownership', 'Audit event on PHI view'],
};

export const routeAreas: readonly RouteArea[] = [
  patientRouteArea,
  {
    id: 'pharmacist',
    label: 'Pharmacist',
    path: '/pharmacist',
    summary: 'Clinical verification, counseling flags, transfer review, and dispensing oversight.',
    primaryAction: 'Open verification worklist',
    safeguards: ['Licensed staff role claim', 'Step-up verification for PHI', 'Decision audit trail'],
  },
  {
    id: 'technician',
    label: 'Pharmacy technician',
    path: '/technician',
    summary: 'Intake triage, inventory checks, claim readiness, and task coordination.',
    primaryAction: 'Continue intake tasks',
    safeguards: ['Assigned staff role claim', 'Minimum necessary PHI', 'Supervisor escalation path'],
  },
  {
    id: 'administrator',
    label: 'Administrator',
    path: '/administrator',
    summary: 'Staff access, operational reporting, site settings, and compliance exports.',
    primaryAction: 'Review access changes',
    safeguards: ['Privileged admin claim', 'Separation from clinical actions', 'Immutable admin audit log'],
  },
];

export const getRouteAreaById = (id: RouteRole): RouteArea =>
  routeAreas.find((area) => area.id === id) ?? patientRouteArea;

export const appRoutes: readonly AppRoute[] = [
  {
    id: 'account',
    label: 'Account access',
    navigationRole: 'public',
    path: '/account',
    protection: 'public',
    summary: 'Patient account creation and sign-in.',
  },
  {
    id: 'staff-access',
    label: 'Staff access',
    navigationRole: 'public',
    path: '/staff/access',
    protection: 'public',
    summary: 'Provisioned staff sign-in and access rules.',
  },
  {
    id: 'admin-staff',
    label: 'Staff provisioning',
    navigationRole: 'administrator',
    path: '/admin/staff',
    protection: 'administrator',
    summary: 'Administrator staff account provisioning.',
  },
  {
    id: 'patient-status',
    label: 'Prescription status',
    navigationRole: 'patient',
    path: '/patient/prescriptions',
    protection: 'patient',
    summary: 'Patient prescription status for signed-in users.',
  },
  {
    id: 'patient-refills',
    label: 'Refills',
    navigationRole: 'patient',
    path: '/patient/refills',
    protection: 'patient',
    summary: 'Patient refill request workspace.',
  },
  {
    id: 'patient-messages',
    label: 'Messages',
    navigationRole: 'patient',
    path: '/patient/messages',
    protection: 'patient',
    summary: 'Secure patient messaging.',
  },
  {
    id: 'pharmacist-worklist',
    label: 'Verification worklist',
    navigationRole: 'pharmacist',
    path: '/pharmacist/worklist',
    protection: 'staff',
    summary: 'Pharmacist verification queue.',
  },
  {
    id: 'technician-intake',
    label: 'Intake tasks',
    navigationRole: 'technician',
    path: '/technician/intake',
    protection: 'staff',
    summary: 'Technician intake and readiness tasks.',
  },
];

const accountRoute = appRoutes[0] as AppRoute;

export const publicRoutes = appRoutes.filter((route) => route.protection === 'public');

export const getRouteById = (id: AppRouteId): AppRoute =>
  appRoutes.find((route) => route.id === id) ?? accountRoute;

export const getRouteByPath = (path: string): AppRoute =>
  appRoutes.find((route) => route.path === path) ?? accountRoute;
