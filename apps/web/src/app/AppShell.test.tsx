// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { AppShell } from './AppShell';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  window.history.pushState({}, '', '/');
});

describe('AppShell', () => {
  test('renders patient account access with accessible landmark navigation', () => {
    render(<AppShell />);

    expect(screen.getByRole('link', { name: 'Skip to workspace' })).toHaveAttribute(
      'href',
      '#main-workspace',
    );
    expect(screen.getByRole('banner')).toHaveTextContent('PharmacyTwo');
    expect(screen.getByRole('navigation', { name: 'Account access' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Account access workspace' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(screen.getByRole('heading', { name: 'Create account or sign in' })).toBeInTheDocument();
  });

  test('shows patient registration field guidance and does not submit invalid input', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Enter your legal first name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your legal last name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your date of birth.')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    expect(screen.queryByText('Account created')).not.toBeInTheDocument();
  });

  test('shows patient navigation after account creation', () => {
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
    expect(within(navigation).getByRole('link', { name: /Refills/iu })).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: /Messages/iu })).toBeInTheDocument();
    expect(screen.getByText('Account created')).toBeInTheDocument();
  });

  test('shows staff navigation after provisioned staff sign-in', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('link', { name: /Staff access/iu }));
    fireEvent.change(screen.getByLabelText('Staff email'), {
      target: { value: 'sam@pharmacytwo.test' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'staff-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    const navigation = screen.getByRole('navigation', { name: 'Staff navigation' });

    expect(within(navigation).getByRole('link', { name: /Verification worklist/iu }))
      .toBeInTheDocument();
    expect(screen.getByText('Staff signed in')).toBeInTheDocument();
  });

  test('blocks protected patient routes for signed-out users', () => {
    window.history.pushState({}, '', '/patient/prescriptions');

    render(<AppShell />);

    expect(screen.getByRole('heading', { name: 'Sign in required' })).toBeInTheDocument();
    expect(screen.getByText(/Non-signed-in users cannot view prescription status/iu))
      .toBeInTheDocument();
    expect(screen.queryByText('Patient signed in')).not.toBeInTheDocument();
  });

  test('toggles the document theme state', () => {
    render(<AppShell />);

    const themeButton = screen.getByRole('button', { name: 'Dark' });

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    fireEvent.click(themeButton);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Light', pressed: true })).toBeInTheDocument();
  });
});
