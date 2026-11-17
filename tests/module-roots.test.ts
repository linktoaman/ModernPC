import { apiV1ModuleRoot } from "../app/api/v1/module";
import { patientModuleRoot } from "../app/patient/module";
import { staffModuleRoot } from "../app/staff/module";
import { auditModuleRoot } from "../src/audit";
import { domainModuleRoot } from "../src/domain";
import { jobsModuleRoot } from "../src/jobs";
import { observabilityModuleRoot } from "../src/observability";
import { persistenceModuleRoot } from "../src/persistence";
import { securityModuleRoot } from "../src/security";

export const moduleRoots = [
  apiV1ModuleRoot,
  patientModuleRoot,
  staffModuleRoot,
  auditModuleRoot,
  domainModuleRoot,
  jobsModuleRoot,
  observabilityModuleRoot,
  persistenceModuleRoot,
  securityModuleRoot
];
