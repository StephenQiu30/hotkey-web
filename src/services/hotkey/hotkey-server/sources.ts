// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List Sources GET /api/sources */
export async function listSourcesApiSourcesGet(options?: {
  [key: string]: any;
}) {
  return request<HotKeyAPI.SourceRead[]>("/api/sources", {
    method: "GET",
    ...(options || {}),
  });
}

/** Create Source POST /api/sources */
export async function createSourceApiSourcesPost(
  body: HotKeyAPI.SourceCreate,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.SourceRead>("/api/sources", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Delete Source DELETE /api/sources/${param0} */
export async function deleteSourceApiSourcesSourceIdDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.deleteSourceApiSourcesSourceIdDeleteParams,
  options?: { [key: string]: any }
) {
  const { source_id: param0, ...queryParams } = params;
  return request<any>(`/api/sources/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update Source PATCH /api/sources/${param0} */
export async function updateSourceApiSourcesSourceIdPatch(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.updateSourceApiSourcesSourceIdPatchParams,
  body: HotKeyAPI.SourceUpdate,
  options?: { [key: string]: any }
) {
  const { source_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.SourceRead>(`/api/sources/${param0}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Toggle Source POST /api/sources/${param0}/toggle */
export async function toggleSourceApiSourcesSourceIdTogglePost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.toggleSourceApiSourcesSourceIdTogglePostParams,
  options?: { [key: string]: any }
) {
  const { source_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.SourceRead>(`/api/sources/${param0}/toggle`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}
