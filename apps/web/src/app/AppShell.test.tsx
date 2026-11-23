// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { AppShell } from './AppShell';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  window.location.hash = '';
});

describe('AppShell', () => {
  test('renders the workspace shell with accessible landmark navigation', () => {
    render(<AppShell />);

    expect(screen.getByRole('link', { name: 'Skip to workspace' })).toHaveAttribute(
      'href',
      '#main-workspace',
    );
    expect(screen.getByRole('banner')).toHaveTextContent('PharmacyTwo');
    expect(screen.getByRole('navigation', { name: 'Role areas' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Shared workspace route areas' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(screen.getByRole('table', { name: 'Route authorization summary' })).toBeInTheDocument();
  });

  test('updates active navigation and role preview controls', () => {
    render(<AppShell />);

    const navigation = screen.getByRole('navigation', { name: 'Role areas' });
    const administratorLink = within(navigation).getByRole('link', { name: 'Administrator' });

    fireEvent.click(administratorLink);

    expect(administratorLink).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText(/This preview points to \/administrator/iu)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Administrator',
        pressed: true,
      }),
    ).toBeInTheDocument();
  });

  test('toggles the persisted document theme state', () => {
    render(<AppShell />);

    const themeButton = screen.getByRole('button', { name: 'Dark' });

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    fireEvent.click(themeButton);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Light', pressed: true })).toBeInTheDocument();
  });

  test('announces the baseline toast', () => {
    render(<AppShell />);

    expect(screen.getByText('Access reminder')).toBeInTheDocument();
    expect(
      screen.getByText('Navigation previews do not authorize PHI or administrative actions.'),
    ).toBeInTheDocument();
  });

  test('opens and closes the confirmation dialog with focusable controls', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    const dialog = screen.getByRole('dialog', { name: 'Confirm workspace action' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('button', { name: 'Close dialog' })).toHaveFocus();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByRole('dialog', { name: 'Confirm workspace action' }),
    ).not.toBeInTheDocument();
  });
});
