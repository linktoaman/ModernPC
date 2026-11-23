export type RouteRole = 'patient' | 'pharmacist' | 'technician' | 'administrator';

export interface RouteArea {
  readonly id: RouteRole;
  readonly label: string;
  readonly path: string;
  readonly summary: string;
  readonly primaryAction: string;
  readonly safeguards: readonly string[];
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
