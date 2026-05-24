// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List Settings GET /api/settings */
export async function listSettingsApiSettingsGet(options?: {
  [key: string]: any;
}) {
  return request<HotKeyAPI.SettingRead[]>("/api/settings", {
    method: "GET",
    ...(options || {}),
  });
}

/** Upsert Setting PUT /api/settings/${param0} */
export async function upsertSettingApiSettingsKeyPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.upsertSettingApiSettingsKeyPutParams,
  body: HotKeyAPI.SettingUpsert,
  options?: { [key: string]: any }
) {
  const { key: param0, ...queryParams } = params;
  return request<HotKeyAPI.SettingRead>(`/api/settings/${param0}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
