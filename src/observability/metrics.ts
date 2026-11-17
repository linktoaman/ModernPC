import {
  createCorrelationId,
  sanitizeForObservability,
  type SanitizedLogValue
} from "./logger";

export type MetricKind = "counter" | "gauge" | "histogram";

export interface MetricRecord {
  timestamp: string;
  component: string;
  correlationId: string;
  kind: MetricKind;
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export interface MetricSink {
  write(record: MetricRecord): void;
}

export interface MetricsClientOptions {
  component: string;
  correlationId?: string;
  sink?: MetricSink;
  now?: () => Date;
}

export interface MetricsClient {
  correlationId: string;
  increment(name: string, labels?: Record<string, unknown>, value?: number): void;
  gauge(name: string, value: number, labels?: Record<string, unknown>): void;
  histogram(name: string, value: number, labels?: Record<string, unknown>): void;
}

export function createMetricsClient(options: MetricsClientOptions): MetricsClient {
  const sink = options.sink ?? consoleMetricSink;
  const now = options.now ?? (() => new Date());
  const correlationId = options.correlationId ?? createCorrelationId();

  function emit(
    kind: MetricKind,
    name: string,
    value: number,
    labels?: Record<string, unknown>
  ): void {
    const record: MetricRecord = {
      timestamp: now().toISOString(),
      component: options.component,
      correlationId,
      kind,
      name,
      value
    };
    const safeLabels = sanitizeLabels(labels);

    if (Object.keys(safeLabels).length > 0) {
      record.labels = safeLabels;
    }

    sink.write(record);
  }

  return {
    correlationId,
    increment(name, labels, value = 1) {
      emit("counter", name, value, labels);
    },
    gauge(name, value, labels) {
      emit("gauge", name, value, labels);
    },
    histogram(name, value, labels) {
      emit("histogram", name, value, labels);
    }
  };
}

function sanitizeLabels(labels: Record<string, unknown> | undefined): Record<string, string> {
  if (!labels) {
    return {};
  }

  const sanitized = sanitizeForObservability(labels);

  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return {};
  }

  return Object.entries(sanitized).reduce<Record<string, string>>((safe, [key, value]) => {
    safe[key] = stringifyLabelValue(value);
    return safe;
  }, {});
}

function stringifyLabelValue(value: SanitizedLogValue): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

const consoleMetricSink: MetricSink = {
  write(record) {
    console.log(JSON.stringify(record));
  }
};
