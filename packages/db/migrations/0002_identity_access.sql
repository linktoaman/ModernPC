-- PharmacyTwo identity access migration.
-- Credentials remain with the managed OIDC/OAuth2 identity provider.

BEGIN;

ALTER TABLE public.identity_link
  ADD COLUMN IF NOT EXISTS created_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL;

ALTER TABLE public.patient_profile
  ADD COLUMN IF NOT EXISTS registration_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL;

ALTER TABLE public.staff_profile
  ADD COLUMN IF NOT EXISTS provisioning_source text NOT NULL
    DEFAULT 'administrator_provisioning',
  ADD COLUMN IF NOT EXISTS provisioning_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'staff_profile_admin_provisioning_required_check'
      AND conrelid = 'public.staff_profile'::regclass
  ) THEN
    ALTER TABLE public.staff_profile
      ADD CONSTRAINT staff_profile_admin_provisioning_required_check
      CHECK (
        provisioned_by_identity_link_id IS NOT NULL
        AND provisioned_at IS NOT NULL
        AND provisioning_source = 'administrator_provisioning'
      );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.access_role_assignment (
  id uuid PRIMARY KEY,
  identity_link_id uuid NOT NULL
    REFERENCES public.identity_link (id) ON DELETE RESTRICT,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  granted_by_identity_link_id uuid
    REFERENCES public.identity_link (id) ON DELETE SET NULL,
  grant_source text NOT NULL DEFAULT 'patient_registration',
  grant_reason text,
  created_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL,
  updated_audit_event_id uuid
    REFERENCES public.audit_event (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_role_assignment_role_check
    CHECK (role IN ('patient', 'pharmacist', 'technician', 'administrator')),
  CONSTRAINT access_role_assignment_status_check
    CHECK (status IN ('active', 'invited', 'suspended', 'deactivated')),
  CONSTRAINT access_role_assignment_staff_grant_source_check
    CHECK (
      (
        role = 'patient'
        AND grant_source = 'patient_registration'
      )
      OR (
        role IN ('pharmacist', 'technician', 'administrator')
        AND grant_source = 'administrator_provisioning'
        AND granted_by_identity_link_id IS NOT NULL
      )
    )
);

COMMENT ON TABLE public.access_role_assignment IS
  'Application-owned role assignment. Classification: Confidential.';
COMMENT ON COLUMN public.access_role_assignment.identity_link_id IS
  'Managed identity subject link receiving application access. Classification: Confidential.';
COMMENT ON COLUMN public.access_role_assignment.granted_by_identity_link_id IS
  'Administrator identity link that provisioned staff access. Classification: Confidential.';
COMMENT ON COLUMN public.access_role_assignment.grant_reason IS
  'Non-PHI administrative reason for access changes. Classification: Confidential.';

CREATE UNIQUE INDEX IF NOT EXISTS identity_link_active_patient_subject_uidx
  ON public.identity_link (identity_provider, provider_subject)
  WHERE role = 'patient'
    AND profile_kind = 'patient'
    AND status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS access_role_assignment_active_patient_uidx
  ON public.access_role_assignment (identity_link_id)
  WHERE role = 'patient'
    AND status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS access_role_assignment_active_staff_role_uidx
  ON public.access_role_assignment (identity_link_id, role)
  WHERE role IN ('pharmacist', 'technician', 'administrator')
    AND status = 'active';

CREATE INDEX IF NOT EXISTS access_role_assignment_identity_link_idx
  ON public.access_role_assignment (identity_link_id);

CREATE INDEX IF NOT EXISTS access_role_assignment_role_status_idx
  ON public.access_role_assignment (role, status);

CREATE OR REPLACE FUNCTION public.enforce_patient_profile_identity_link()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  linked_role text;
  linked_profile_kind text;
BEGIN
  SELECT role, profile_kind
  INTO linked_role, linked_profile_kind
  FROM public.identity_link
  WHERE id = NEW.identity_link_id;

  IF linked_role <> 'patient' OR linked_profile_kind <> 'patient' THEN
    RAISE EXCEPTION
      'patient_profile.identity_link_id must reference a patient identity link';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_staff_profile_identity_link()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  linked_role text;
  linked_profile_kind text;
BEGIN
  SELECT role, profile_kind
  INTO linked_role, linked_profile_kind
  FROM public.identity_link
  WHERE id = NEW.identity_link_id;

  IF linked_profile_kind <> 'staff'
    OR linked_role NOT IN ('pharmacist', 'technician', 'administrator') THEN
    RAISE EXCEPTION
      'staff_profile.identity_link_id must reference a staff identity link';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_access_role_assignment_grant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  subject_role text;
  subject_profile_kind text;
  granter_role text;
  granter_profile_kind text;
BEGIN
  SELECT role, profile_kind
  INTO subject_role, subject_profile_kind
  FROM public.identity_link
  WHERE id = NEW.identity_link_id;

  IF NEW.role = 'patient' THEN
    IF subject_role <> 'patient' OR subject_profile_kind <> 'patient' THEN
      RAISE EXCEPTION
        'patient role assignments require a patient identity link';
    END IF;

    RETURN NEW;
  END IF;

  IF subject_profile_kind <> 'staff'
    OR subject_role NOT IN ('pharmacist', 'technician', 'administrator') THEN
    RAISE EXCEPTION
      'staff role assignments require a staff identity link';
  END IF;

  SELECT role, profile_kind
  INTO granter_role, granter_profile_kind
  FROM public.identity_link
  WHERE id = NEW.granted_by_identity_link_id;

  IF granter_role <> 'administrator' OR granter_profile_kind <> 'staff' THEN
    RAISE EXCEPTION
      'staff role assignments require administrator provisioning metadata';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS patient_profile_identity_link_guard
  ON public.patient_profile;
CREATE TRIGGER patient_profile_identity_link_guard
  BEFORE INSERT OR UPDATE OF identity_link_id
  ON public.patient_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_patient_profile_identity_link();

DROP TRIGGER IF EXISTS staff_profile_identity_link_guard
  ON public.staff_profile;
CREATE TRIGGER staff_profile_identity_link_guard
  BEFORE INSERT OR UPDATE OF identity_link_id
  ON public.staff_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_staff_profile_identity_link();

DROP TRIGGER IF EXISTS access_role_assignment_grant_guard
  ON public.access_role_assignment;
CREATE TRIGGER access_role_assignment_grant_guard
  BEFORE INSERT OR UPDATE OF identity_link_id, role, granted_by_identity_link_id
  ON public.access_role_assignment
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_access_role_assignment_grant();

COMMIT;
