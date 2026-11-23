import { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  Dialog,
  Tag,
  Toast,
  type ToastMessage,
} from '../components/ui';
import { StaffProvisioningPage } from '../features/admin/StaffProvisioningPage';
import { PatientAccountPage } from '../features/account/PatientAccountPage';
import type { PatientRegistrationPayload } from '../features/account/PatientRegistrationForm';
import { StaffAccessPage } from '../features/staffAccess/StaffAccessPage';
import {
  appRoutes,
  getRouteAreaById,
  getRouteByPath,
  publicRoutes,
  type AppRoute,
  type AppRouteId,
  type RouteRole,
  type StaffRouteRole,
} from '../routes/router';

type Session =
  | { readonly status: 'signed-out' }
  | { readonly status: 'signed-in'; readonly email: string; readonly role: RouteRole };

const initialToasts: readonly ToastMessage[] = [
  {
    id: 'access-reminder',
    message: 'Protected data loads only after identity and server authorization checks pass.',
    title: 'Access reminder',
    tone: 'info',
  },
];

const protectedPatientRouteIds: readonly AppRouteId[] = [
  'patient-status',
  'patient-refills',
  'patient-messages',
];

const getInitialRoute = (): AppRoute => {
  const currentPath = window.location.pathname;

  if (currentPath === '/') {
    return getRouteByPath('/account');
  }

  return getRouteByPath(currentPath);
};

const canViewRoute = (route: AppRoute, session: Session): boolean => {
  if (route.protection === 'public') {
    return true;
  }

  if (session.status === 'signed-out') {
    return false;
  }

  if (route.protection === 'patient') {
    return session.role === 'patient';
  }

  if (route.protection === 'administrator') {
    return session.role === 'administrator';
  }

  return session.role === 'pharmacist' || session.role === 'technician';
};

const getNavigationRoutes = (session: Session): readonly AppRoute[] => {
  if (session.status === 'signed-out') {
    return publicRoutes;
  }

  if (session.role === 'patient') {
    return appRoutes.filter(
      (route) => route.navigationRole === 'patient' || route.id === 'account',
    );
  }

  if (session.role === 'administrator') {
    return appRoutes.filter(
      (route) => route.navigationRole === 'administrator' || route.id === 'staff-access',
    );
  }

  return appRoutes.filter(
    (route) => route.navigationRole === session.role || route.id === 'staff-access',
  );
};

const getNavigationLabel = (session: Session): string => {
  if (session.status === 'signed-out') {
    return 'Account access';
  }

  if (session.role === 'patient') {
    return 'Patient navigation';
  }

  if (session.role === 'administrator') {
    return 'Administrator navigation';
  }

  return 'Staff navigation';
};

const getWorkspaceTitle = (session: Session): string => {
  if (session.status === 'signed-out') {
    return 'Account access workspace';
  }

  const area = getRouteAreaById(session.role);

  return `${area.label} workspace`;
};

export const AppShell = (): JSX.Element => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [session, setSession] = useState<Session>({ status: 'signed-out' });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<readonly ToastMessage[]>(initialToasts);
  const mainRef = useRef<HTMLElement | null>(null);
  const navigationRoutes = getNavigationRoutes(session);
  const workspaceTitle = getWorkspaceTitle(session);
  const isActiveRouteAllowed = canViewRoute(activeRoute, session);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handlePopState = (): void => {
      setActiveRoute(getInitialRoute());
      mainRef.current?.focus();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const pushToast = (message: Omit<ToastMessage, 'id'>): void => {
    const id = `${message.title}-${Date.now().toString()}`;
    setToasts((currentToasts) => [
      ...currentToasts.slice(-2),
      {
        ...message,
        id,
      },
    ]);
  };

  const navigateTo = (route: AppRoute): void => {
    setActiveRoute(route);
    window.history.pushState({}, '', route.path);

    if (!canViewRoute(route, session)) {
      pushToast({
        message: 'Sign in with the required role before opening this workspace.',
        title: 'Access denied',
        tone: 'danger',
      });
    }

    mainRef.current?.focus();
  };

  const toggleTheme = (): void => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  const handlePatientAccountCreated = (payload: PatientRegistrationPayload): void => {
    setSession({
      email: payload.email,
      role: 'patient',
      status: 'signed-in',
    });
    pushToast({
      message: 'Patient account created. Patient navigation is now available.',
      title: 'Account created',
      tone: 'success',
    });
  };

  const handlePatientSignIn = (email: string): void => {
    setSession({
      email,
      role: 'patient',
      status: 'signed-in',
    });
    pushToast({
      message: 'Patient sign-in complete. Prescription tools are available.',
      title: 'Signed in',
      tone: 'success',
    });
  };

  const handleStaffSignIn = (role: StaffRouteRole, email: string): void => {
    setSession({
      email,
      role,
      status: 'signed-in',
    });
    pushToast({
      message: `${getRouteAreaById(role).label} access confirmed for this prototype session.`,
      title: 'Staff signed in',
      tone: 'success',
    });
  };

  const handleAccessDenied = (): void => {
    pushToast({
      message: 'Staff sign-in requires an administrator-provisioned account.',
      title: 'Access denied',
      tone: 'danger',
    });
  };

  const handleProvisionStaff = (email: string): void => {
    pushToast({
      message: `${email} is queued for administrator provisioning.`,
      title: 'Provisioning requested',
      tone: 'success',
    });
  };

  const renderProtectedPatientWorkspace = (route: AppRoute): JSX.Element => (
    <Card className="access-card" title={route.label}>
      <div className="access-card__tags" aria-label="Protected patient route status">
        <Tag tone="success">Patient signed in</Tag>
        <Tag tone="info">Server authorization required</Tag>
      </div>
      <p>{route.summary}</p>
      <Alert title="Prototype data boundary" tone="info">
        This workspace intentionally avoids PHI. Production data is loaded only after the patient
        record ownership check succeeds.
      </Alert>
    </Card>
  );

  const renderProtectedStaffWorkspace = (route: AppRoute): JSX.Element => (
    <Card className="access-card" title={route.label}>
      <div className="access-card__tags" aria-label="Protected staff route status">
        <Tag tone="success">Provisioned staff signed in</Tag>
        <Tag tone="info">
          {session.status === 'signed-in' ? getRouteAreaById(session.role).label : 'Staff'}
        </Tag>
      </div>
      <p>{route.summary}</p>
      <Alert title="Minimum necessary access" tone="warning">
        Staff tools remain role-scoped and every denied server authorization decision is audited.
      </Alert>
    </Card>
  );

  const renderProtectedGuidance = (route: AppRoute): JSX.Element => (
    <Card className="access-card protected-guidance" title="Sign in required">
      <div className="access-card__tags" aria-label="Signed out protected guidance">
        <Tag tone="danger">Signed out</Tag>
        <Tag tone="warning">Protected route</Tag>
      </div>
      <Alert title="Access denied" tone="danger">
        Non-signed-in users cannot view {route.label.toLowerCase()}. Sign in with the required
        account before prescription status, refill, messaging, staff, or administrator routes load.
      </Alert>
      <div className="role-preview" aria-label="Protected route actions">
        <Button onClick={() => navigateTo(getRouteByPath('/account'))} variant="primary">
          Patient sign in
        </Button>
        <Button onClick={() => navigateTo(getRouteByPath('/staff/access'))} variant="secondary">
          Staff sign in
        </Button>
      </div>
    </Card>
  );

  const renderRoute = (): JSX.Element => {
    if (!isActiveRouteAllowed) {
      return renderProtectedGuidance(activeRoute);
    }

    if (activeRoute.id === 'account') {
      return (
        <PatientAccountPage
          onCreateAccount={handlePatientAccountCreated}
          onPatientSignIn={handlePatientSignIn}
        />
      );
    }

    if (activeRoute.id === 'staff-access') {
      return (
        <StaffAccessPage
          onAccessDenied={handleAccessDenied}
          onStaffSignIn={handleStaffSignIn}
        />
      );
    }

    if (activeRoute.id === 'admin-staff') {
      return (
        <StaffProvisioningPage
          isAdministrator={session.status === 'signed-in' && session.role === 'administrator'}
          onProvisionStaff={handleProvisionStaff}
        />
      );
    }

    if (protectedPatientRouteIds.includes(activeRoute.id)) {
      return renderProtectedPatientWorkspace(activeRoute);
    }

    return renderProtectedStaffWorkspace(activeRoute);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-workspace">
        Skip to workspace
      </a>
      <header className="app-topbar">
        <div className="brand" aria-label="PharmacyTwo">
          <span className="brand__mark" aria-hidden="true">
            P2
          </span>
          <div>
            <p>PharmacyTwo</p>
            <h1>{workspaceTitle}</h1>
          </div>
        </div>
        <div className="topbar-actions" aria-label="Workspace actions">
          {session.status === 'signed-in' ? (
            <Tag tone="success">{session.email}</Tag>
          ) : (
            <Tag tone="neutral">Signed out</Tag>
          )}
          <Button
            aria-pressed={theme === 'dark'}
            onClick={toggleTheme}
            size="compact"
            variant="secondary"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} size="compact" variant="secondary">
            Session rules
          </Button>
          {session.status === 'signed-in' ? (
            <Button
              onClick={() => {
                setSession({ status: 'signed-out' });
                pushToast({
                  message: 'Session ended. Protected navigation is hidden.',
                  title: 'Signed out',
                  tone: 'info',
                });
              }}
              size="compact"
              variant="ghost"
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </header>

      <div className="app-layout">
        <nav className="side-nav" aria-label={getNavigationLabel(session)}>
          <p className="side-nav__heading">{getNavigationLabel(session)}</p>
          <ul className="side-nav__list">
            {navigationRoutes.map((route) => (
              <li key={route.id}>
                <a
                  aria-current={activeRoute.id === route.id ? 'page' : undefined}
                  href={route.path}
                  onClick={(event) => {
                    event.preventDefault();
                    navigateTo(route);
                  }}
                >
                  <span>{route.label}</span>
                  <small>{route.summary}</small>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main
          aria-labelledby="workspace-title"
          className="workspace"
          id="main-workspace"
          ref={mainRef}
          tabIndex={-1}
        >
          <h2 className="visually-hidden" id="workspace-title">
            {workspaceTitle}
          </h2>
          {renderRoute()}
        </main>
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Session and access rules"
      >
        <p>
          Patient and staff screens model account access only. Backend authorization, identity
          provider claims, and audit logging remain authoritative for all protected data.
        </p>
        <div className="topbar-actions">
          <Button onClick={() => setIsDialogOpen(false)} variant="primary">
            Got it
          </Button>
        </div>
      </Dialog>

      <Toast messages={toasts} />
    </div>
  );
};
