// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List Notifications GET /api/notifications */
export async function listNotificationsApiNotificationsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listNotificationsApiNotificationsGetParams,
  options?: { [key: string]: any }
) {
  return request<Record<string, any>>("/api/notifications", {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",
      ...params,
    },
    ...(options || {}),
  });
}
