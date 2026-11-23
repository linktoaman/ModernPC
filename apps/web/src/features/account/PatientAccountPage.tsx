import { Alert, Card, Tag } from '../../components/ui';
import {
  PatientRegistrationForm,
  type PatientRegistrationPayload,
} from './PatientRegistrationForm';
import { PatientSignInPanel } from './PatientSignInPanel';

interface PatientAccountPageProps {
  readonly onCreateAccount: (payload: PatientRegistrationPayload) => void;
  readonly onPatientSignIn: (email: string) => void;
}

export const PatientAccountPage = ({
  onCreateAccount,
  onPatientSignIn,
}: PatientAccountPageProps): JSX.Element => (
  <div className="access-page">
    <section className="page-heading" aria-labelledby="patient-account-title">
      <div>
        <p className="page-heading__eyebrow">Patient account access</p>
        <h2 id="patient-account-title">Create account or sign in</h2>
        <p>
          Patients can create an account, sign in through the managed identity provider, and then
          access prescription status, refill, and secure messaging tools.
        </p>
      </div>
      <Tag tone="warning">Registration event logged</Tag>
    </section>

    <div className="workspace-grid workspace-grid--two">
      <Card className="access-card" title="Create account">
        <Alert title="Profile match required" tone="info">
          Account creation submits to the patient account API and must match the pharmacy profile
          before protected routes load.
        </Alert>
        <PatientRegistrationForm onCreateAccount={onCreateAccount} />
      </Card>

      <PatientSignInPanel onSignIn={onPatientSignIn} />
    </div>
  </div>
);
