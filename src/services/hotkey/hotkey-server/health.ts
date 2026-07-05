// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Health check GET /healthz */
export async function healthCheck(options?: { [key: string]: any }) {
  return request<HotKeyAPI.HealthResponse>("/healthz", {
    method: "GET",
    ...(options || {}),
  });
}
