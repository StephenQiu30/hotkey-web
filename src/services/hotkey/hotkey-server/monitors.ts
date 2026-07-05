// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List monitors GET /api/v1/monitors */
export async function listMonitors(options?: { [key: string]: any }) {
  return request<HotKeyAPI.MonitorListResponse>("/api/v1/monitors", {
    method: "GET",
    ...(options || {}),
  });
}

/** Create monitor POST /api/v1/monitors */
export async function createMonitor(
  body: HotKeyAPI.CreateMonitorRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.MonitorResponse>("/api/v1/monitors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get monitor GET /api/v1/monitors/${param0} */
export async function getMonitor(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getMonitorParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.MonitorResponse>(`/api/v1/monitors/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update monitor PATCH /api/v1/monitors/${param0} */
export async function updateMonitor(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.updateMonitorParams,
  body: HotKeyAPI.UpdateMonitorRequest,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.MonitorResponse>(`/api/v1/monitors/${param0}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
