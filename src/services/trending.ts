// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List trending hot events across platforms GET /api/v1/trending */
export async function listTrending(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listTrendingParams,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.TrendingListResponse>("/api/v1/trending", {
    method: "GET",
    params: {
      // limit has a default value: 20
      limit: "20",
      ...params,
    },
    ...(options || {}),
  });
}
