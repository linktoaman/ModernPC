import { Alert, Button, Card, Tag } from '../../components/ui';
import {
  getRouteProtectionLabel,
  getRouteSignInPath,
  staffRouteRoles,
  type AppRoute,
} from '../../routes/router';
import type { Session } from './useSession';

export type RouteGuardReason = 'forbidden' | 'timed-out' | 'unauthenticated';

export interface RouteGuardDenial {
  readonly allowed: false;
  readonly message: string;
  readonly reason: RouteGuardReason;
  readonly requiredRoleLabel: string;
  readonly signInPath: '/account' | '/staff/access';
  readonly title: string;
}

export interface RouteGuardApproval {
  readonly allowed: true;
}

export type RouteGuardResult = RouteGuardApproval | RouteGuardDenial;

interface ProtectedRouteProps {
  readonly children: JSX.Element;
  readonly onNavigateToPath: (path: string) => void;
  readonly route: AppRoute;
  readonly session: Session;
}

export const getRouteAuthorization = (route: AppRoute, session: Session): RouteGuardResult => {
  if (route.protection === 'public') {
    return { allowed: true };
  }

  const requiredRoleLabel = getRouteProtectionLabel(route.protection);
  const signInPath = getRouteSignInPath(route.protection);

  if (session.status === 'signed-out') {
    return {
      allowed: false,
      message: (
        `Sign in before opening ${route.label.toLowerCase()}. Backend authorization remains `
        + 'required before protected data loads.'
      ),
      reason: 'unauthenticated',
      requiredRoleLabel,
      signInPath,
      title: 'Sign in required',
    };
  }

  if (session.status === 'timed-out') {
    return {
      allowed: false,
      message: (
        'For your privacy, your session timed out. Sign in again before protected '
        + 'pharmacy tools load.'
      ),
      reason: 'timed-out',
      requiredRoleLabel,
      signInPath,
      title: 'Session timed out',
    };
  }

  if (route.protection === 'patient' && session.role === 'patient') {
    return { allowed: true };
  }

  if (route.protection === 'administrator' && session.role === 'administrator') {
    return { allowed: true };
  }

  if (route.protection === 'staff' && staffRouteRoles.some((role) => role === session.role)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: (
      `This account cannot open ${route.label.toLowerCase()}. Use the account assigned `
      + 'for this workspace; denied server authorization decisions are audited.'
    ),
    reason: 'forbidden',
    requiredRoleLabel,
    signInPath,
    title: 'Access denied',
  };
};

const getReasonTone = (reason: RouteGuardReason): 'danger' | 'warning' => (
  reason === 'timed-out' ? 'warning' : 'danger'
);

const getReasonLabel = (reason: RouteGuardReason): string => {
  if (reason === 'timed-out') {
    return 'Session timeout';
  }

  if (reason === 'forbidden') {
    return 'Wrong role';
  }

  return 'Signed out';
};

export const ProtectedRoute = ({
  children,
  onNavigateToPath,
  route,
  session,
}: ProtectedRouteProps): JSX.Element => {
  const authorization = getRouteAuthorization(route, session);

  if (authorization.allowed) {
    return children;
  }

  return (
    <Card className="access-card protected-guidance" title={authorization.title}>
      <div className="access-card__tags" aria-label="Protected route authorization status">
        <Tag tone={getReasonTone(authorization.reason)}>
          {getReasonLabel(authorization.reason)}
        </Tag>
        <Tag tone="info">{authorization.requiredRoleLabel}</Tag>
        <Tag tone="warning">Server authorization required</Tag>
      </div>
      <Alert title={authorization.title} tone={getReasonTone(authorization.reason)}>
        {authorization.message}
      </Alert>
      <div className="role-preview" aria-label="Protected route actions">
        <Button onClick={() => onNavigateToPath(authorization.signInPath)} variant="primary">
          {authorization.signInPath === '/account' ? 'Patient sign in' : 'Staff sign in'}
        </Button>
        <Button onClick={() => onNavigateToPath('/account')} variant="secondary">
          Account access
        </Button>
      </div>
    </Card>
  );
};
