// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Get monitor trends GET /api/v1/monitors/${param0}/trends */
export async function getMonitorTrends(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getMonitorTrendsParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.TrendListResponse>(
    `/api/v1/monitors/${param0}/trends`,
    {
      method: "GET",
      params: {
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** Get topic trends GET /api/v1/topics/${param0}/trends */
export async function getTopicTrends(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getTopicTrendsParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.TrendListResponse>(
    `/api/v1/topics/${param0}/trends`,
    {
      method: "GET",
      params: {
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}
