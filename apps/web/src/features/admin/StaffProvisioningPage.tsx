import { useState, type FormEvent } from 'react';

import { Alert, Button, Card, Field, Tag } from '../../components/ui';

interface StaffProvisioningPageProps {
  readonly isAdministrator: boolean;
  readonly onProvisionStaff: (email: string) => void;
}

export const StaffProvisioningPage = ({
  isAdministrator,
  onProvisionStaff,
}: StaffProvisioningPageProps): JSX.Element => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!isAdministrator) {
      setEmailError('Sign in as an administrator before provisioning staff.');
      return;
    }

    if (email.trim() === '') {
      setEmailError('Enter a staff email address.');
      return;
    }

    onProvisionStaff(email.trim());
  };

  return (
    <div className="access-page">
      <section className="page-heading" aria-labelledby="staff-provisioning-title">
        <div>
          <p className="page-heading__eyebrow">Administrator staff access</p>
          <h2 id="staff-provisioning-title">Provision staff accounts</h2>
          <p>
            Administrators create and update pharmacist or pharmacy technician access before staff
            members can sign in.
          </p>
        </div>
        <Tag tone={isAdministrator ? 'success' : 'danger'}>
          {isAdministrator ? 'Administrator signed in' : 'Administrator required'}
        </Tag>
      </section>

      <Card className="access-card" title="Staff provisioning">
        <Alert title="Privileged action" tone="warning">
          Staff provisioning maps to the administrator staff API and requires server-side
          authorization plus an immutable audit event.
        </Alert>
        <form className="access-form" noValidate onSubmit={handleSubmit}>
          <Field
            description="Enter the email used by the managed identity provider."
            error={emailError}
            inputProps={{
              autoComplete: 'email',
              inputMode: 'email',
              name: 'provisionedStaffEmail',
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
          <Button type="submit" variant="primary">
            Provision staff
          </Button>
        </form>
      </Card>
    </div>
  );
};
