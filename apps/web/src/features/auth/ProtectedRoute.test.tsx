// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getRouteById } from '../../routes/router';
import {
  getRouteAuthorization,
  ProtectedRoute,
} from './ProtectedRoute';
import type { Session } from './useSession';

const signedOutSession: Session = {
  status: 'signed-out',
};

const patientSession: Session = {
  email: 'riley@example.com',
  lastActivityAt: 1_796_256_000_000,
  role: 'patient',
  status: 'signed-in',
};

const pharmacistSession: Session = {
  email: 'sam@pharmacytwo.test',
  lastActivityAt: 1_796_256_000_000,
  role: 'pharmacist',
  status: 'signed-in',
};

const timedOutSession: Session = {
  email: 'riley@example.com',
  role: 'patient',
  status: 'timed-out',
  timedOutAt: 1_796_256_900_000,
};

afterEach(() => {
  cleanup();
});

describe('ProtectedRoute', () => {
  test('authorizes public, patient, staff, and administrator routes by session role', () => {
    expect(getRouteAuthorization(getRouteById('account'), signedOutSession)).toEqual({
      allowed: true,
    });
    expect(getRouteAuthorization(getRouteById('patient-status'), patientSession)).toEqual({
      allowed: true,
    });
    expect(getRouteAuthorization(getRouteById('pharmacist-worklist'), pharmacistSession))
      .toEqual({
        allowed: true,
      });
    expect(getRouteAuthorization(getRouteById('admin-staff'), pharmacistSession))
      .toMatchObject({
        allowed: false,
        reason: 'forbidden',
        requiredRoleLabel: 'Administrator',
        signInPath: '/staff/access',
        title: 'Access denied',
      });
  });

  test('renders signed-out protected guidance with route guard actions', () => {
    const onNavigateToPath = vi.fn();

    render(
      <ProtectedRoute
        onNavigateToPath={onNavigateToPath}
        route={getRouteById('patient-status')}
        session={signedOutSession}
      >
        <p>Protected patient data</p>
      </ProtectedRoute>,
    );

    expect(screen.getByRole('heading', { name: 'Sign in required' })).toBeInTheDocument();
    expect(screen.queryByText('Protected patient data')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Protected route authorization status')).toHaveTextContent(
      'Signed out',
    );
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Server authorization required')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Patient sign in' }));

    expect(onNavigateToPath).toHaveBeenCalledWith('/account');
  });

  test('renders wrong-role denial for protected staff and administrator routes', () => {
    render(
      <ProtectedRoute
        onNavigateToPath={vi.fn()}
        route={getRouteById('admin-staff')}
        session={pharmacistSession}
      >
        <p>Administrator provisioning form</p>
      </ProtectedRoute>,
    );

    const status = screen.getByLabelText('Protected route authorization status');

    expect(screen.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(within(status).getByText('Wrong role')).toBeInTheDocument();
    expect(within(status).getByText('Administrator')).toBeInTheDocument();
    expect(screen.queryByText('Administrator provisioning form')).not.toBeInTheDocument();
  });

  test('renders session timeout state and staff sign-in routing', () => {
    const onNavigateToPath = vi.fn();

    render(
      <ProtectedRoute
        onNavigateToPath={onNavigateToPath}
        route={getRouteById('pharmacist-worklist')}
        session={timedOutSession}
      >
        <p>Staff worklist</p>
      </ProtectedRoute>,
    );

    expect(screen.getByRole('heading', { name: 'Session timed out' })).toBeInTheDocument();
    expect(screen.getByLabelText('Protected route authorization status')).toHaveTextContent(
      'Session timeout',
    );
    expect(screen.getByText('Provisioned pharmacist or pharmacy technician')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Staff sign in' }));

    expect(onNavigateToPath).toHaveBeenCalledWith('/staff/access');
  });

  test('renders children when authorization succeeds', () => {
    render(
      <ProtectedRoute
        onNavigateToPath={vi.fn()}
        route={getRouteById('patient-refills')}
        session={patientSession}
      >
        <p>Patient refill workspace</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Patient refill workspace')).toBeInTheDocument();
    expect(screen.queryByText('Sign in required')).not.toBeInTheDocument();
  });
});
