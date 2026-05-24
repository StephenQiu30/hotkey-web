// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List Reports GET /api/reports */
export async function listReportsApiReportsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listReportsApiReportsGetParams,
  options?: { [key: string]: any }
) {
  return request<Record<string, any>>("/api/reports", {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",
      ...params,
    },
    ...(options || {}),
  });
}

/** Create Report POST /api/reports */
export async function createReportApiReportsPost(
  body: HotKeyAPI.ReportCreate,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.ReportRead>("/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get Report GET /api/reports/${param0} */
export async function getReportApiReportsReportIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getReportApiReportsReportIdGetParams,
  options?: { [key: string]: any }
) {
  const { report_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.ReportRead>(`/api/reports/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Get Report Html GET /api/reports/${param0}/html */
export async function getReportHtmlApiReportsReportIdHtmlGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getReportHtmlApiReportsReportIdHtmlGetParams,
  options?: { [key: string]: any }
) {
  const { report_id: param0, ...queryParams } = params;
  return request<string>(`/api/reports/${param0}/html`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Send Existing Report POST /api/reports/${param0}/send */
export async function sendExistingReportApiReportsReportIdSendPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.sendExistingReportApiReportsReportIdSendPostParams,
  options?: { [key: string]: any }
) {
  const { report_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.ReportRead>(`/api/reports/${param0}/send`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}
