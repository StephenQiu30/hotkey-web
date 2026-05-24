// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Metrics Snapshot GET /api/ops/metrics */
export async function metricsSnapshotApiOpsMetricsGet(options?: {
  [key: string]: any;
}) {
  return request<Record<string, any>>("/api/ops/metrics", {
    method: "GET",
    ...(options || {}),
  });
}
