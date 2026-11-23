// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { AppShell } from '../../app/AppShell';
import { PatientAccountPage } from './PatientAccountPage';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  window.history.pushState({}, '', '/');
});

describe('PatientAccountPage', () => {
  test('renders the patient account screen with accessible labels and status tags', () => {
    render(<PatientAccountPage onCreateAccount={vi.fn()} onPatientSignIn={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Create account or sign in' })).toBeInTheDocument();
    expect(screen.getByText('Registration event logged')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveAccessibleDescription(
      'Use the name that appears on your prescription profile.',
    );
    expect(screen.getByLabelText('Last name')).toHaveAccessibleDescription(
      'Use the name that appears on your prescription profile.',
    );
    expect(screen.getByLabelText('Date of birth')).toHaveAccessibleDescription(
      'Required to match your pharmacy profile.',
    );
    expect(screen.getByLabelText('Email', { selector: 'input[name="email"]' }))
      .toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Patient sign-in state')).toHaveTextContent(
      'Session timeout: 15 minutes',
    );
  });

  test('shows required patient registration validation errors without submitting', () => {
    const onCreateAccount = vi.fn();

    render(<PatientAccountPage onCreateAccount={onCreateAccount} onPatientSignIn={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(onCreateAccount).not.toHaveBeenCalled();
    expect(screen.getByLabelText('First name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Last name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email', { selector: 'input[name="email"]' }))
      .toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Date of birth')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter your legal first name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your legal last name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your date of birth.')).toBeInTheDocument();
  });

  test('submits a trimmed patient registration payload after valid input', () => {
    const onCreateAccount = vi.fn();

    render(<PatientAccountPage onCreateAccount={onCreateAccount} onPatientSignIn={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: ' Riley ' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: ' Nguyen ' } });
    fireEvent.change(screen.getByLabelText('Email', { selector: 'input[name="email"]' }), {
      target: { value: ' riley@example.com ' },
    });
    fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '1988-04-12' } });
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input[name="password"]' }), {
      target: { value: 'secure-pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(onCreateAccount).toHaveBeenCalledWith({
      dateOfBirth: '1988-04-12',
      email: 'riley@example.com',
      firstName: 'Riley',
      lastName: 'Nguyen',
      password: 'secure-pass',
    });
  });

  test('shows patient navigation and a success toast after account creation', () => {
    render(<AppShell />);

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Riley' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Nguyen' } });
    fireEvent.change(screen.getByLabelText('Email', { selector: 'input[name="email"]' }), {
      target: { value: 'riley@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '1988-04-12' } });
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input[name="password"]' }), {
      target: { value: 'secure-pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    const navigation = screen.getByRole('navigation', { name: 'Patient navigation' });

    expect(within(navigation).getByRole('link', { name: /Prescription status/iu }))
      .toBeInTheDocument();
    expect(screen.getByText('Account created')).toBeInTheDocument();
    expect(screen.getByText('Patient account created. Patient navigation is now available.'))
      .toBeInTheDocument();
  });
});
