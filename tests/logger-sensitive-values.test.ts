import assert from "node:assert/strict";
import test from "node:test";

import {
  createLogger,
  REDACTED_VALUE,
  type LogRecord,
  type LoggerSink
} from "../src/observability/logger";

class MemorySink implements LoggerSink {
  readonly records: LogRecord[] = [];

  write(record: LogRecord): void {
    this.records.push(record);
  }
}

test("logger redacts PHI, tokens, confirmation codes, secrets, and message bodies", () => {
  const sink = new MemorySink();
  const logger = createLogger({
    component: "appointments-api",
    correlationId: "corr-test-001",
    sink,
    now: () => new Date("2026-11-17T00:00:00.000Z")
  });

  logger.info("lookup for jane.patient@example.com with token=abc123", {
    patientEmail: "jane.patient@example.com",
    patientPhone: "+1 555-123-4567",
    confirmationCode: "349201",
    token: "patient-access-token",
    secret: "super-secret",
    messageBody: "Your appointment is confirmed.",
    nested: {
      authorization: "Bearer abc.def.ghi",
      appointmentStatus: "Booked"
    }
  });

  assert.equal(sink.records.length, 1);
  const [record] = sink.records;
  const serialized = JSON.stringify(record);

  assert.equal(record.component, "appointments-api");
  assert.equal(record.correlationId, "corr-test-001");
  assert.match(serialized, new RegExp(REDACTED_VALUE));
  assert.doesNotMatch(serialized, /jane\.patient@example\.com/);
  assert.doesNotMatch(serialized, /555-123-4567/);
  assert.doesNotMatch(serialized, /349201/);
  assert.doesNotMatch(serialized, /patient-access-token/);
  assert.doesNotMatch(serialized, /super-secret/);
  assert.doesNotMatch(serialized, /Your appointment is confirmed/);
  assert.doesNotMatch(serialized, /abc\.def\.ghi/);
  assert.match(serialized, /Booked/);
});
