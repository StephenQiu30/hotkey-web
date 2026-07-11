// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List hot events with filter and pagination GET /api/v1/hot-events */
export async function listHotEvents(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listHotEventsParams,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.HotEventListResponse>("/api/v1/hot-events", {
    method: "GET",
    params: {
      // status has a default value: active
      status: "active",

      // sort has a default value: heat_score
      sort: "heat_score",
      // limit has a default value: 20
      limit: "20",
      ...params,
    },
    ...(options || {}),
  });
}

/** Get a hot event by ID with platform details GET /api/v1/hot-events/${param0} */
export async function getHotEvent(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getHotEventParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.HotEventResponse>(`/api/v1/hot-events/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Get posts for a hot event GET /api/v1/hot-events/${param0}/posts */
export async function getHotEventPosts(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getHotEventPostsParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.HotEventPostsResponse>(
    `/api/v1/hot-events/${param0}/posts`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
