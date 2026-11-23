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
import {
  getRouteAuthorization,
  ProtectedRoute,
  type RouteGuardDenial,
} from '../features/auth/ProtectedRoute';
import { getSessionTimeoutLabel } from '../features/auth/sessionTimeout';
import { useSession, type Session } from '../features/auth/useSession';
import { StaffAccessPage } from '../features/staffAccess/StaffAccessPage';
import {
  appRoutes,
  getRouteAreaById,
  getRouteByPath,
  publicRoutes,
  type AppRoute,
  type AppRouteId,
  type StaffRouteRole,
} from '../routes/router';

type RouteAccessNotice = Pick<RouteGuardDenial, 'message' | 'reason' | 'title'>;

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

const appendToast = (
  currentToasts: readonly ToastMessage[],
  message: Omit<ToastMessage, 'id'>,
): readonly ToastMessage[] => {
  const id = `${message.title}-${Date.now().toString()}`;

  return [
    ...currentToasts.slice(-2),
    {
      ...message,
      id,
    },
  ];
};

const getInitialRoute = (): AppRoute => {
  const currentPath = window.location.pathname;

  if (currentPath === '/') {
    return getRouteByPath('/account');
  }

  return getRouteByPath(currentPath);
};

const getNavigationRoutes = (session: Session): readonly AppRoute[] => {
  if (session.status !== 'signed-in') {
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
  if (session.status !== 'signed-in') {
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

  if (session.status === 'timed-out') {
    return 'Session timed out';
  }

  const area = getRouteAreaById(session.role);

  return `${area.label} workspace`;
};

const getSessionStatusTag = (session: Session): JSX.Element => {
  if (session.status === 'signed-in') {
    return <Tag tone="success">{session.email}</Tag>;
  }

  if (session.status === 'timed-out') {
    return <Tag tone="warning">Session timed out</Tag>;
  }

  return <Tag tone="neutral">Signed out</Tag>;
};

const getNoticeTone = (notice: RouteAccessNotice): 'danger' | 'warning' => (
  notice.reason === 'timed-out' ? 'warning' : 'danger'
);

export const AppShell = (): JSX.Element => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<readonly ToastMessage[]>(initialToasts);
  const [routeAccessNotice, setRouteAccessNotice] = useState<RouteAccessNotice | undefined>();
  const { clearTimedOutSession, session, signIn, signOut } = useSession({
    onTimeout: () => {
      setRouteAccessNotice({
        message: 'For your privacy, your session timed out. Sign in again to continue.',
        reason: 'timed-out',
        title: 'Session timed out',
      });
      setToasts((currentToasts) => appendToast(currentToasts, {
        message: 'Protected workspaces are locked until you sign in again.',
        title: 'Session timed out',
        tone: 'warning',
      }));
    },
  });
  const mainRef = useRef<HTMLElement | null>(null);
  const navigationRoutes = getNavigationRoutes(session);
  const workspaceTitle = getWorkspaceTitle(session);

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

  useEffect(() => {
    const authorization = getRouteAuthorization(activeRoute, session);

    if (authorization.allowed || authorization.reason === 'forbidden') {
      return;
    }

    const redirectRoute = getRouteByPath(authorization.signInPath);
    setRouteAccessNotice(authorization);

    if (activeRoute.path !== redirectRoute.path) {
      setActiveRoute(redirectRoute);
      window.history.replaceState({}, '', redirectRoute.path);
      mainRef.current?.focus();
    }
  }, [activeRoute, session]);

  const pushToast = (message: Omit<ToastMessage, 'id'>): void => {
    setToasts((currentToasts) => appendToast(currentToasts, message));
  };

  const navigateToRoute = (route: AppRoute, historyMode: 'push' | 'replace' = 'push'): void => {
    setActiveRoute(route);
    setRouteAccessNotice(undefined);

    if (historyMode === 'replace') {
      window.history.replaceState({}, '', route.path);
    } else {
      window.history.pushState({}, '', route.path);
    }

    mainRef.current?.focus();
  };

  const navigateToPath = (path: string, historyMode: 'push' | 'replace' = 'push'): void => {
    navigateToRoute(getRouteByPath(path), historyMode);
  };

  const navigateTo = (route: AppRoute): void => {
    const authorization = getRouteAuthorization(route, session);

    if (authorization.allowed) {
      navigateToRoute(route);
      return;
    }

    if (authorization.reason === 'unauthenticated' || authorization.reason === 'timed-out') {
      navigateToPath(authorization.signInPath);
      setRouteAccessNotice(authorization);
      pushToast({
        message: authorization.message,
        title: authorization.title,
        tone: getNoticeTone(authorization),
      });
      return;
    }

    setRouteAccessNotice(authorization);
    setActiveRoute(route);
    window.history.pushState({}, '', route.path);
    pushToast({
      message: authorization.message,
      title: authorization.title,
      tone: 'danger',
    });
    mainRef.current?.focus();
  };

  const toggleTheme = (): void => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  const handlePatientAccountCreated = (payload: PatientRegistrationPayload): void => {
    signIn({
      email: payload.email,
      role: 'patient',
    });
    setRouteAccessNotice(undefined);
    pushToast({
      message: 'Patient account created. Patient navigation is now available.',
      title: 'Account created',
      tone: 'success',
    });
  };

  const handlePatientSignIn = (email: string): void => {
    signIn({
      email,
      role: 'patient',
    });
    setRouteAccessNotice(undefined);
    pushToast({
      message: 'Patient sign-in complete. Prescription tools are available.',
      title: 'Signed in',
      tone: 'success',
    });
  };

  const handleStaffSignIn = (role: StaffRouteRole, email: string): void => {
    signIn({
      email,
      role,
    });
    setRouteAccessNotice(undefined);
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

  const handleSignOut = (): void => {
    signOut();
    setRouteAccessNotice(undefined);
    pushToast({
      message: 'Session ended. Protected navigation is hidden.',
      title: 'Signed out',
      tone: 'info',
    });
  };

  const renderRouteAccessNotice = (): JSX.Element | null => {
    if (routeAccessNotice === undefined || activeRoute.protection !== 'public') {
      return null;
    }

    return (
      <Alert title={routeAccessNotice.title} tone={getNoticeTone(routeAccessNotice)}>
        {routeAccessNotice.message}
      </Alert>
    );
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

  const renderRoute = (): JSX.Element => {
    if (activeRoute.id === 'account') {
      return (
        <div className="access-page">
          {renderRouteAccessNotice()}
          <PatientAccountPage
            onCreateAccount={handlePatientAccountCreated}
            onPatientSignIn={handlePatientSignIn}
          />
        </div>
      );
    }

    if (activeRoute.id === 'staff-access') {
      return (
        <div className="access-page">
          {renderRouteAccessNotice()}
          <StaffAccessPage
            onAccessDenied={handleAccessDenied}
            onStaffSignIn={handleStaffSignIn}
          />
        </div>
      );
    }

    if (activeRoute.id === 'admin-staff') {
      return (
        <ProtectedRoute
          onNavigateToPath={navigateToPath}
          route={activeRoute}
          session={session}
        >
          <StaffProvisioningPage
            isAdministrator={session.status === 'signed-in' && session.role === 'administrator'}
            onProvisionStaff={handleProvisionStaff}
          />
        </ProtectedRoute>
      );
    }

    if (protectedPatientRouteIds.includes(activeRoute.id)) {
      return (
        <ProtectedRoute
          onNavigateToPath={navigateToPath}
          route={activeRoute}
          session={session}
        >
          {renderProtectedPatientWorkspace(activeRoute)}
        </ProtectedRoute>
      );
    }

    return (
      <ProtectedRoute
        onNavigateToPath={navigateToPath}
        route={activeRoute}
        session={session}
      >
        {renderProtectedStaffWorkspace(activeRoute)}
      </ProtectedRoute>
    );
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
          {getSessionStatusTag(session)}
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
            <Button onClick={handleSignOut} size="compact" variant="ghost">
              Sign out
            </Button>
          ) : null}
          {session.status === 'timed-out' ? (
            <Button
              onClick={() => {
                clearTimedOutSession();
                navigateToPath('/account');
              }}
              size="compact"
              variant="ghost"
            >
              Re-authenticate
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
          Authenticated prototype sessions lock after {getSessionTimeoutLabel()} of inactivity.
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
