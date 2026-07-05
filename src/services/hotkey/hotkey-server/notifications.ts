// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List unread notifications GET /api/v1/notifications */
export async function listNotifications(options?: { [key: string]: any }) {
  return request<HotKeyAPI.NotificationListResponse>("/api/v1/notifications", {
    method: "GET",
    ...(options || {}),
  });
}

/** Mark notification as read POST /api/v1/notifications/${param0}/read */
export async function markNotificationRead(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.markNotificationReadParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.MarkNotificationReadResponse>(
    `/api/v1/notifications/${param0}/read`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
