// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List topics for a monitor GET /api/v1/monitors/${param0}/topics */
export async function listTopics(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listTopicsParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.TopicListResponse>(
    `/api/v1/monitors/${param0}/topics`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
