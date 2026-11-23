import { useState, type FormEvent } from 'react';

import { Alert, Button, Card, Field, Tag } from '../../components/ui';

interface PatientSignInPanelProps {
  readonly onSignIn: (email: string) => void;
}

export const PatientSignInPanel = ({
  onSignIn,
}: PatientSignInPanelProps): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextEmailError = email.trim() === '' ? 'Enter your email address.' : undefined;
    const nextPasswordError = password === '' ? 'Enter your password.' : undefined;
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError !== undefined || nextPasswordError !== undefined) {
      return;
    }

    onSignIn(email.trim());
  };

  return (
    <Card className="access-card" title="Sign in">
      <div className="access-card__tags" aria-label="Patient sign-in state">
        <Tag tone="info">Session timeout: 15 minutes</Tag>
      </div>
      <Alert title="Managed sign-in" tone="info">
        The production flow redirects through the HIPAA-eligible identity provider before patient
        data is requested.
      </Alert>
      <form className="access-form" noValidate onSubmit={handleSubmit}>
        <Field
          description="Use the email on your patient account."
          error={emailError}
          inputProps={{
            autoComplete: 'email',
            inputMode: 'email',
            name: 'patientEmail',
            onChange: (event) => {
              setEmail(event.currentTarget.value);
              setEmailError(undefined);
            },
            required: true,
            type: 'email',
            value: email,
          }}
          label="Email"
        />
        <Field
          description="Your pharmacy never asks for this outside the sign-in flow."
          error={passwordError}
          inputProps={{
            autoComplete: 'current-password',
            name: 'patientPassword',
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
        <Button type="submit" variant="primary">
          Sign in
        </Button>
      </form>
    </Card>
  );
};
