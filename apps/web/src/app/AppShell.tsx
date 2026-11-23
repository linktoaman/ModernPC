import { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  Dialog,
  Field,
  LoadingState,
  MetricCard,
  Table,
  Tag,
  Timeline,
  Toast,
  type ToastMessage,
} from '../components/ui';
import { getRouteAreaById, routeAreas, type RouteRole } from '../routes/router';

const initialToasts: readonly ToastMessage[] = [
  {
    id: 'access-reminder',
    title: 'Access reminder',
    message: 'Navigation previews do not authorize PHI or administrative actions.',
    tone: 'info',
  },
];

const timelineItems = [
  {
    id: 'signed-in',
    title: 'Identity verified',
    detail: 'OIDC session and role claims are validated before protected data loads.',
    time: '08:05',
  },
  {
    id: 'workspace-opened',
    title: 'Workspace opened',
    detail: 'The shell displays route areas while server authorization remains authoritative.',
    time: '08:06',
  },
];

const metricCards = [
  {
    label: 'Pending verifications',
    value: '18',
    detail: 'Across clinical queues',
    tone: 'warning' as const,
  },
  {
    label: 'Access reviews',
    value: '4',
    detail: 'Require administrator approval',
    tone: 'info' as const,
  },
  {
    label: 'Audit status',
    value: 'Live',
    detail: 'PHI events are streamed',
    tone: 'success' as const,
  },
];

export const AppShell = (): JSX.Element => {
  const [activeRole, setActiveRole] = useState<RouteRole>('pharmacist');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const activeArea = getRouteAreaById(activeRole);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handleHashChange = (): void => {
      const hashId = window.location.hash.replace('#', '');
      const routeMatch = routeAreas.find((area) => area.id === hashId);

      if (routeMatch !== undefined) {
        setActiveRole(routeMatch.id);
      }

      mainRef.current?.focus();
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const toggleTheme = (): void => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
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
            <h1>Clinical operations workspace</h1>
          </div>
        </div>
        <div className="topbar-actions" aria-label="Workspace actions">
          <Button
            aria-pressed={theme === 'dark'}
            onClick={toggleTheme}
            size="compact"
            variant="secondary"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} size="compact" variant="primary">
            Confirm
          </Button>
        </div>
      </header>

      <div className="app-layout">
        <nav className="side-nav" aria-label="Role areas">
          <p className="side-nav__heading">Route areas</p>
          <ul className="side-nav__list">
            {routeAreas.map((area) => (
              <li key={area.id}>
                <a
                  aria-current={activeRole === area.id ? 'page' : undefined}
                  href={`#${area.id}`}
                  onClick={() => setActiveRole(area.id)}
                >
                  {area.label}
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
            Shared workspace route areas
          </h2>
          <div className="workspace-grid workspace-grid--two">
            <Card title="Role-aware shell">
              <p>
                Patient, pharmacist, pharmacy technician, and administrator route areas are visible
                from the shell. The selected role changes presentation only; protected data and
                actions still require authenticated server-side authorization.
              </p>
              <div className="role-preview" aria-label="Role preview controls">
                {routeAreas.map((area) => (
                  <Button
                    aria-pressed={activeRole === area.id}
                    key={area.id}
                    onClick={() => setActiveRole(area.id)}
                    size="compact"
                    variant={activeRole === area.id ? 'primary' : 'secondary'}
                  >
                    {area.label}
                  </Button>
                ))}
              </div>
            </Card>

            <Card title={`${activeArea.label} preview`}>
              <Alert title="Authorization boundary" tone="warning">
                UI state cannot grant access. This preview points to {activeArea.path}; backend
                claims, ownership checks, and audit controls decide what loads there.
              </Alert>
              <Field
                description="Example validation state for accessible form primitives."
                error="Use a non-PHI work queue name."
                inputProps={{ defaultValue: activeArea.primaryAction }}
                label="Workspace label"
              />
            </Card>
          </div>

          <div className="workspace-grid">
            {metricCards.map((metric) => (
              <MetricCard
                detail={metric.detail}
                key={metric.label}
                label={metric.label}
                tone={metric.tone}
                value={metric.value}
              />
            ))}
          </div>

          <div className="workspace-grid workspace-grid--two">
            <Card title="Route safeguards">
              <div className="workspace-grid workspace-grid--one">
                {routeAreas.map((area) => (
                  <section className="route-card" id={area.id} key={area.id}>
                    <div className="route-card__header">
                      <div>
                        <h3>{area.label}</h3>
                        <p>{area.summary}</p>
                      </div>
                      <Tag tone={activeRole === area.id ? 'success' : 'neutral'}>
                        {activeRole === area.id ? 'Previewing' : area.path}
                      </Tag>
                    </div>
                    <ul>
                      {area.safeguards.map((safeguard) => (
                        <li key={safeguard}>{safeguard}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </Card>

            <Card title="Audit timeline">
              <Timeline items={timelineItems} />
              <LoadingState label="Loading medication safety indicators" />
            </Card>
          </div>

          <Table
            caption="Route authorization summary"
            headers={['Area', 'Path', 'Primary control']}
            rows={routeAreas.map((area) => [
              area.label,
              area.path,
              area.safeguards[0] ?? 'Server authorization',
            ])}
          />
        </main>
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Confirm workspace action"
      >
        <p>
          This confirmation pattern keeps keyboard focus inside the dialog until the action is
          completed or cancelled.
        </p>
        <div className="topbar-actions">
          <Button onClick={() => setIsDialogOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={() => setIsDialogOpen(false)} variant="primary">
            Confirm action
          </Button>
        </div>
      </Dialog>

      <Toast messages={initialToasts} />
    </div>
  );
};
