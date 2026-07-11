// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List reports GET /api/v1/reports */
export async function listReports(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listReportsParams,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.ReportListResponse>("/api/v1/reports", {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",

      ...params,
    },
    ...(options || {}),
  });
}

/** Create a report POST /api/v1/reports */
export async function createReport(
  body: HotKeyAPI.CreateReportRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.ReportResponse>("/api/v1/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get a report by ID GET /api/v1/reports/${param0} */
export async function getReport(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getReportParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.ReportResponse>(`/api/v1/reports/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Get report as HTML GET /api/v1/reports/${param0}/html */
export async function getReportHtml(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getReportHtmlParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<string>(`/api/v1/reports/${param0}/html`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Mark and send a report POST /api/v1/reports/${param0}/send */
export async function sendReport(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.sendReportParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.ReportResponse>(`/api/v1/reports/${param0}/send`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}
