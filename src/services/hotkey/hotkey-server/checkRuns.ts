// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List Check Runs GET /api/check-runs */
export async function listCheckRunsApiCheckRunsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listCheckRunsApiCheckRunsGetParams,
  options?: { [key: string]: any }
) {
  return request<Record<string, any>>("/api/check-runs", {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",
      ...params,
    },
    ...(options || {}),
  });
}

/** Create Check Run POST /api/check-runs */
export async function createCheckRunApiCheckRunsPost(
  body: HotKeyAPI.CheckRunCreate,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.CheckRunRead>("/api/check-runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get Check Run GET /api/check-runs/${param0} */
export async function getCheckRunApiCheckRunsRunIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getCheckRunApiCheckRunsRunIdGetParams,
  options?: { [key: string]: any }
) {
  const { run_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.CheckRunRead>(`/api/check-runs/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}
