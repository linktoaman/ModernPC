-- PharmacyTwo foundation migration.
-- ARD-DEC-010: keep release migrations backward-compatible and additive.

BEGIN;

CREATE TABLE IF NOT EXISTS public.identity_link (
  id uuid PRIMARY KEY,
  identity_provider text NOT NULL,
  provider_subject text NOT NULL,
  role text NOT NULL,
  profile_kind text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  last_authenticated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT identity_link_provider_subject_unique
    UNIQUE (identity_provider, provider_subject),
  CONSTRAINT identity_link_role_check
    CHECK (role IN ('patient', 'pharmacist', 'technician', 'administrator')),
  CONSTRAINT identity_link_profile_kind_check
    CHECK (profile_kind IN ('patient', 'staff')),
  CONSTRAINT identity_link_status_check
    CHECK (status IN ('active', 'invited', 'suspended', 'deactivated'))
);

COMMENT ON TABLE public.identity_link IS
  'DATA-001 identity link. Classification: Confidential.';
COMMENT ON COLUMN public.identity_link.provider_subject IS
  'Managed identity provider subject identifier. Classification: Confidential.';

CREATE TABLE IF NOT EXISTS public.patient_profile (
  id uuid PRIMARY KEY,
  identity_link_id uuid NOT NULL UNIQUE
    REFERENCES public.identity_link (id) ON DELETE RESTRICT,
  medical_record_number text,
  given_name text NOT NULL,
  family_name text NOT NULL,
  date_of_birth date NOT NULL,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_profile_status_check
    CHECK (status IN ('active', 'inactive', 'deceased', 'merged'))
);

COMMENT ON TABLE public.patient_profile IS
  'DATA-002 patient profile. Classification: Restricted.';
COMMENT ON COLUMN public.patient_profile.medical_record_number IS
  'Application-owned patient reference. Classification: Restricted.';
COMMENT ON COLUMN public.patient_profile.date_of_birth IS
  'Patient date of birth. Classification: Restricted.';

CREATE TABLE IF NOT EXISTS public.staff_profile (
  id uuid PRIMARY KEY,
  identity_link_id uuid NOT NULL UNIQUE
    REFERENCES public.identity_link (id) ON DELETE RESTRICT,
  given_name text NOT NULL,
  family_name text NOT NULL,
  staff_role text NOT NULL,
  license_identifier text,
  status text NOT NULL DEFAULT 'active',
  provisioned_by_identity_link_id uuid
    REFERENCES public.identity_link (id) ON DELETE SET NULL,
  provisioned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_profile_role_check
    CHECK (staff_role IN ('pharmacist', 'technician', 'administrator')),
  CONSTRAINT staff_profile_status_check
    CHECK (status IN ('active', 'invited', 'suspended', 'deactivated'))
);

COMMENT ON TABLE public.staff_profile IS
  'DATA-003 staff profile and role assignment. Classification: Confidential.';
COMMENT ON COLUMN public.staff_profile.license_identifier IS
  'Professional license or staff credential reference. Classification: Confidential.';

CREATE TABLE IF NOT EXISTS public.prescription (
  id uuid PRIMARY KEY,
  patient_profile_id uuid NOT NULL
    REFERENCES public.patient_profile (id) ON DELETE RESTRICT,
  entered_by_staff_profile_id uuid
    REFERENCES public.staff_profile (id) ON DELETE SET NULL,
  prescription_number text NOT NULL,
  medication_name text NOT NULL,
  dosage_instruction text NOT NULL,
  prescriber_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  refills_authorized integer NOT NULL DEFAULT 0,
  refills_remaining integer NOT NULL DEFAULT 0,
  written_date date,
  expires_date date,
  last_filled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prescription_number_unique UNIQUE (prescription_number),
  CONSTRAINT prescription_status_check
    CHECK (status IN ('active', 'on_hold', 'expired', 'cancelled', 'completed')),
  CONSTRAINT prescription_refills_authorized_check
    CHECK (refills_authorized >= 0),
  CONSTRAINT prescription_refills_remaining_check
    CHECK (refills_remaining >= 0)
);

COMMENT ON TABLE public.prescription IS
  'DATA-004 prescription. Classification: Restricted.';
COMMENT ON COLUMN public.prescription.medication_name IS
  'Medication name. Classification: Restricted.';
COMMENT ON COLUMN public.prescription.dosage_instruction IS
  'Patient dosage instructions. Classification: Restricted.';

CREATE TABLE IF NOT EXISTS public.refill_request (
  id uuid PRIMARY KEY,
  patient_profile_id uuid NOT NULL
    REFERENCES public.patient_profile (id) ON DELETE RESTRICT,
  prescription_id uuid NOT NULL
    REFERENCES public.prescription (id) ON DELETE RESTRICT,
  reviewed_by_staff_profile_id uuid
    REFERENCES public.staff_profile (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted',
  patient_note text,
  staff_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  ready_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT refill_request_status_check
    CHECK (
      status IN (
        'submitted',
        'in_review',
        'approved',
        'ready',
        'completed',
        'denied',
        'cancelled'
      )
    )
);

COMMENT ON TABLE public.refill_request IS
  'DATA-005 refill request. Classification: Restricted.';
COMMENT ON COLUMN public.refill_request.patient_note IS
  'Patient-entered refill note. Classification: Restricted.';
COMMENT ON COLUMN public.refill_request.staff_note IS
  'Internal refill review note. Classification: Restricted.';

CREATE TABLE IF NOT EXISTS public.secure_message (
  id uuid PRIMARY KEY,
  patient_profile_id uuid NOT NULL
    REFERENCES public.patient_profile (id) ON DELETE RESTRICT,
  staff_profile_id uuid
    REFERENCES public.staff_profile (id) ON DELETE SET NULL,
  thread_id uuid,
  sender_kind text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT secure_message_sender_kind_check
    CHECK (sender_kind IN ('patient', 'staff', 'system'))
);

COMMENT ON TABLE public.secure_message IS
  'DATA-006 secure message. Classification: Restricted.';
COMMENT ON COLUMN public.secure_message.subject IS
  'Secure message subject. Classification: Restricted.';
COMMENT ON COLUMN public.secure_message.body IS
  'Secure message body. Classification: Restricted.';

CREATE TABLE IF NOT EXISTS public.audit_event (
  id uuid PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_identity_link_id uuid
    REFERENCES public.identity_link (id) ON DELETE SET NULL,
  patient_profile_id uuid
    REFERENCES public.patient_profile (id) ON DELETE SET NULL,
  staff_profile_id uuid
    REFERENCES public.staff_profile (id) ON DELETE SET NULL,
  prescription_id uuid
    REFERENCES public.prescription (id) ON DELETE SET NULL,
  refill_request_id uuid
    REFERENCES public.refill_request (id) ON DELETE SET NULL,
  secure_message_id uuid
    REFERENCES public.secure_message (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  outcome text NOT NULL,
  request_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_event_outcome_check
    CHECK (outcome IN ('success', 'failure', 'denied'))
);

COMMENT ON TABLE public.audit_event IS
  'DATA-007 audit event. Classification: Restricted.';
COMMENT ON COLUMN public.audit_event.metadata IS
  'Audit metadata; must avoid unnecessary PHI. Classification: Restricted.';

CREATE TABLE IF NOT EXISTS public.success_metric_event (
  id uuid PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  actor_identity_link_id uuid
    REFERENCES public.identity_link (id) ON DELETE SET NULL,
  patient_profile_id uuid
    REFERENCES public.patient_profile (id) ON DELETE SET NULL,
  prescription_id uuid
    REFERENCES public.prescription (id) ON DELETE SET NULL,
  refill_request_id uuid
    REFERENCES public.refill_request (id) ON DELETE SET NULL,
  metric_value numeric(12, 4),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  classification text NOT NULL DEFAULT 'confidential',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT success_metric_event_type_check
    CHECK (
      event_type IN (
        'patient_registered',
        'refill_submitted',
        'refill_reviewed',
        'prescription_status_updated'
      )
    ),
  CONSTRAINT success_metric_event_classification_check
    CHECK (classification IN ('confidential', 'restricted'))
);

COMMENT ON TABLE public.success_metric_event IS
  'DATA-008 success metric event. Classification: Confidential; Restricted if payload includes PHI references.';
COMMENT ON COLUMN public.success_metric_event.metadata IS
  'Metric metadata; avoid PHI unless classified Restricted. Classification: Confidential or Restricted.';

CREATE INDEX IF NOT EXISTS identity_link_role_idx
  ON public.identity_link (role);
CREATE INDEX IF NOT EXISTS patient_profile_identity_link_idx
  ON public.patient_profile (identity_link_id);
CREATE INDEX IF NOT EXISTS staff_profile_identity_link_idx
  ON public.staff_profile (identity_link_id);
CREATE INDEX IF NOT EXISTS prescription_patient_profile_idx
  ON public.prescription (patient_profile_id);
CREATE INDEX IF NOT EXISTS refill_request_patient_profile_idx
  ON public.refill_request (patient_profile_id);
CREATE INDEX IF NOT EXISTS refill_request_prescription_idx
  ON public.refill_request (prescription_id);
CREATE INDEX IF NOT EXISTS secure_message_patient_profile_idx
  ON public.secure_message (patient_profile_id);
CREATE INDEX IF NOT EXISTS audit_event_occurred_at_idx
  ON public.audit_event (occurred_at);
CREATE INDEX IF NOT EXISTS audit_event_event_type_idx
  ON public.audit_event (event_type);
CREATE INDEX IF NOT EXISTS success_metric_event_occurred_at_idx
  ON public.success_metric_event (occurred_at);
CREATE INDEX IF NOT EXISTS success_metric_event_event_type_idx
  ON public.success_metric_event (event_type);

COMMIT;
