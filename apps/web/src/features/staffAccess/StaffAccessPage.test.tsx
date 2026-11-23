// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { AppShell } from '../../app/AppShell';
import { StaffAccessPage } from './StaffAccessPage';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  window.history.pushState({}, '', '/');
});

describe('StaffAccessPage', () => {
  test('renders staff access controls and role-policy guidance accessibly', () => {
    render(<StaffAccessPage onAccessDenied={vi.fn()} onStaffSignIn={vi.fn()} />);

    expect(screen.getByRole('heading', {
      name: 'Sign in with a provisioned account',
    })).toBeInTheDocument();
    expect(screen.getByText('No staff self-registration')).toBeInTheDocument();
    expect(screen.getByLabelText('Staff email')).toHaveAccessibleDescription(
      'Prototype provisioned accounts end with @pharmacytwo.test.',
    );
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Password is verified by the managed identity provider.',
    );
    expect(screen.getByLabelText('Staff role')).toHaveDisplayValue('Pharmacist');
    expect(screen.getByLabelText('Staff access state')).toHaveTextContent(
      'Session timeout: 15 minutes',
    );
    expect(screen.getByRole('heading', { name: 'Access rules' })).toBeInTheDocument();
    expect(screen.getByText(
      'Denied access attempts are audited by the backend authorization layer.',
    )).toBeInTheDocument();
  });

  test('shows required staff sign-in errors without calling access callbacks', () => {
    const onAccessDenied = vi.fn();
    const onStaffSignIn = vi.fn();

    render(<StaffAccessPage onAccessDenied={onAccessDenied} onStaffSignIn={onStaffSignIn} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onAccessDenied).not.toHaveBeenCalled();
    expect(onStaffSignIn).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Staff email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter your provisioned staff email.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
  });

  test('rejects non-provisioned staff self-registration attempts', () => {
    const onAccessDenied = vi.fn();
    const onStaffSignIn = vi.fn();

    render(<StaffAccessPage onAccessDenied={onAccessDenied} onStaffSignIn={onStaffSignIn} />);
    fireEvent.change(screen.getByLabelText('Staff email'), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'staff-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onAccessDenied).toHaveBeenCalledTimes(1);
    expect(onStaffSignIn).not.toHaveBeenCalled();
  });

  test('submits provisioned technician sign-in with role routing data', () => {
    const onStaffSignIn = vi.fn();

    render(<StaffAccessPage onAccessDenied={vi.fn()} onStaffSignIn={onStaffSignIn} />);
    fireEvent.change(screen.getByLabelText('Staff email'), {
      target: { value: ' tech@pharmacytwo.test ' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'staff-pass' } });
    fireEvent.change(screen.getByLabelText('Staff role'), { target: { value: 'technician' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onStaffSignIn).toHaveBeenCalledWith('technician', 'tech@pharmacytwo.test');
  });

  test('shows staff navigation and denial toast states in the application shell', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('link', { name: /Staff access/iu }));
    fireEvent.change(screen.getByLabelText('Staff email'), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'staff-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.getByText('Staff sign-in requires an administrator-provisioned account.'))
      .toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Staff email'), {
      target: { value: 'sam@pharmacytwo.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    const navigation = screen.getByRole('navigation', { name: 'Staff navigation' });

    expect(within(navigation).getByRole('link', { name: /Verification worklist/iu }))
      .toBeInTheDocument();
    expect(screen.getByText('Staff signed in')).toBeInTheDocument();
  });
});
