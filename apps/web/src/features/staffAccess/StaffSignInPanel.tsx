import { useState, type FormEvent } from 'react';

import { Alert, Button, Card, Field, Tag } from '../../components/ui';
import type { StaffRouteRole } from '../../routes/router';

interface StaffSignInPanelProps {
  readonly onAccessDenied: () => void;
  readonly onStaffSignIn: (role: StaffRouteRole, email: string) => void;
}

const provisionedDomain = '@pharmacytwo.test';

export const StaffSignInPanel = ({
  onAccessDenied,
  onStaffSignIn,
}: StaffSignInPanelProps): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRouteRole>('pharmacist');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const nextEmailError = trimmedEmail === '' ? 'Enter your provisioned staff email.' : undefined;
    const nextPasswordError = password === '' ? 'Enter your password.' : undefined;
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError !== undefined || nextPasswordError !== undefined) {
      return;
    }

    if (!trimmedEmail.endsWith(provisionedDomain)) {
      onAccessDenied();
      return;
    }

    onStaffSignIn(role, trimmedEmail);
  };

  return (
    <Card className="access-card" title="Staff sign in">
      <div className="access-card__tags" aria-label="Staff access state">
        <Tag tone="info">Session timeout: 15 minutes</Tag>
      </div>
      <Alert title="Provisioned accounts only" tone="warning">
        Staff cannot self-register. Administrator provisioning and role claims are required before
        staff workspaces are available.
      </Alert>
      <form className="access-form" noValidate onSubmit={handleSubmit}>
        <Field
          description="Prototype provisioned accounts end with @pharmacytwo.test."
          error={emailError}
          inputProps={{
            autoComplete: 'email',
            inputMode: 'email',
            name: 'staffEmail',
            onChange: (event) => {
              setEmail(event.currentTarget.value);
              setEmailError(undefined);
            },
            required: true,
            type: 'email',
            value: email,
          }}
          label="Staff email"
        />
        <Field
          description="Password is verified by the managed identity provider."
          error={passwordError}
          inputProps={{
            autoComplete: 'current-password',
            name: 'staffPassword',
            onChange: (event) => {
              setPassword(event.currentTarget.value);
              setPasswordError(undefined);
            },
            required: true,
            type: 'password',
            value: password,
          }}
          label="Password"
        />
        <label className="select-field">
          <span>Staff role</span>
          <select
            name="staffRole"
            onChange={(event) => setRole(event.currentTarget.value as StaffRouteRole)}
            value={role}
          >
            <option value="pharmacist">Pharmacist</option>
            <option value="technician">Pharmacy technician</option>
          </select>
        </label>
        <Button type="submit" variant="primary">
          Sign in
        </Button>
      </form>
    </Card>
  );
};
