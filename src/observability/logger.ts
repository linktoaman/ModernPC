import { randomUUID } from "node:crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type SanitizedLogValue =
  | string
  | number
  | boolean
  | null
  | SanitizedLogValue[]
  | { [key: string]: SanitizedLogValue };

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  component: string;
  correlationId: string;
  message: string;
  context?: SanitizedLogValue;
}

export interface LoggerSink {
  write(record: LogRecord): void;
}

export interface LoggerOptions {
  component: string;
  correlationId?: string;
  sink?: LoggerSink;
  now?: () => Date;
}

export interface Logger {
  correlationId: string;
  child(options: Partial<Pick<LoggerOptions, "component" | "correlationId">>): Logger;
  debug(message: string, context?: unknown): void;
  info(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
  error(message: string, context?: unknown): void;
}

export const REDACTED_VALUE = "[REDACTED]";

const RESTRICTED_FIELD_PATTERN =
  /(^|[_-])(authorization|body|code|confirmation|content|cookie|dateofbirth|dob|email|full(name)?|message|mrn|name|notes?|password|patient|phone|phi|recipient|secret|ssn|token)(s|hash|id)?($|[_-])/i;

const SENSITIVE_VALUE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:bearer|basic)\s+[A-Za-z0-9._~+/=-]+\b/gi,
  /\b(?:token|secret|password|confirmation\s*code)\s*[:=]\s*["']?[^"',\s}]+/gi,
  /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
];

export function createCorrelationId(): string {
  return randomUUID();
}

export function getCorrelationId(headers: Headers): string {
  return (
    headers.get("x-correlation-id")?.trim() ||
    headers.get("x-request-id")?.trim() ||
    createCorrelationId()
  );
}

export function createLogger(options: LoggerOptions): Logger {
  const sink = options.sink ?? consoleSink;
  const correlationId = options.correlationId ?? createCorrelationId();
  const now = options.now ?? (() => new Date());

  function write(level: LogLevel, message: string, context?: unknown): void {
    const sanitizedContext = sanitizeForObservability(context);
    const record: LogRecord = {
      timestamp: now().toISOString(),
      level,
      component: options.component,
      correlationId,
      message: sanitizeText(message)
    };

    if (sanitizedContext !== undefined) {
      record.context = sanitizedContext;
    }

    sink.write(record);
  }

  return {
    correlationId,
    child(childOptions) {
      return createLogger({
        component: childOptions.component ?? options.component,
        correlationId: childOptions.correlationId ?? correlationId,
        sink,
        now
      });
    },
    debug(message, context) {
      write("debug", message, context);
    },
    info(message, context) {
      write("info", message, context);
    },
    warn(message, context) {
      write("warn", message, context);
    },
    error(message, context) {
      write("error", message, context);
    }
  };
}

export function sanitizeForObservability(input: unknown): SanitizedLogValue | undefined {
  return sanitizeValue(input, new WeakSet<object>());
}

export function sanitizeText(value: string): string {
  return SENSITIVE_VALUE_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, REDACTED_VALUE),
    value
  );
}

export function isRestrictedField(fieldName: string): boolean {
  const normalized = fieldName.replace(/([a-z0-9])([A-Z])/g, "$1_$2");
  return RESTRICTED_FIELD_PATTERN.test(normalized);
}

function sanitizeValue(
  input: unknown,
  seen: WeakSet<object>
): SanitizedLogValue | undefined {
  if (input === undefined || typeof input === "function" || typeof input === "symbol") {
    return undefined;
  }

  if (input === null) {
    return null;
  }

  if (typeof input === "boolean" || typeof input === "number") {
    return input;
  }

  if (typeof input === "bigint") {
    return input.toString();
  }

  if (typeof input === "string") {
    return sanitizeText(input);
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  if (input instanceof Error) {
    return {
      name: input.name,
      message: sanitizeText(input.message)
    };
  }

  if (Array.isArray(input)) {
    return input
      .map((value) => sanitizeValue(value, seen))
      .filter((value): value is SanitizedLogValue => value !== undefined);
  }

  if (typeof input === "object") {
    if (seen.has(input)) {
      return "[Circular]";
    }

    seen.add(input);

    return Object.entries(input as Record<string, unknown>).reduce<
      Record<string, SanitizedLogValue>
    >((safe, [key, value]) => {
      safe[key] = isRestrictedField(key)
        ? REDACTED_VALUE
        : sanitizeValue(value, seen) ?? null;
      return safe;
    }, {});
  }

  return undefined;
}

const consoleSink: LoggerSink = {
  write(record) {
    const writer = record.level === "error" ? console.error : console.log;
    writer(JSON.stringify(record));
  }
};
