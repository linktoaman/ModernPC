import { Alert, Card, Tag } from '../../components/ui';
import type { StaffRouteRole } from '../../routes/router';
import { StaffSignInPanel } from './StaffSignInPanel';

interface StaffAccessPageProps {
  readonly onAccessDenied: () => void;
  readonly onStaffSignIn: (role: StaffRouteRole, email: string) => void;
}

export const StaffAccessPage = ({
  onAccessDenied,
  onStaffSignIn,
}: StaffAccessPageProps): JSX.Element => (
  <div className="access-page">
    <section className="page-heading" aria-labelledby="staff-access-title">
      <div>
        <p className="page-heading__eyebrow">Staff account access</p>
        <h2 id="staff-access-title">Sign in with a provisioned account</h2>
        <p>
          Pharmacists and pharmacy technicians use administrator-provisioned accounts. Self-service
          registration is disabled for staff users.
        </p>
      </div>
      <Tag tone="warning">No staff self-registration</Tag>
    </section>

    <div className="workspace-grid workspace-grid--two">
      <StaffSignInPanel onAccessDenied={onAccessDenied} onStaffSignIn={onStaffSignIn} />

      <Card className="access-card" title="Access rules">
        <Alert title="Administrator provisioning required" tone="warning">
          A staff member must be provisioned by an administrator before any pharmacist or technician
          workspace can load.
        </Alert>
        <ul className="rule-list">
          <li>Role claims separate pharmacist and pharmacy technician access.</li>
          <li>Denied access attempts are audited by the backend authorization layer.</li>
          <li>Clinical and administrative permissions stay separated by route and server policy.</li>
        </ul>
      </Card>
    </div>
  </div>
);
