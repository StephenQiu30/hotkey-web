// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List Keywords GET /api/keywords */
export async function listKeywordsApiKeywordsGet(options?: {
  [key: string]: any;
}) {
  return request<HotKeyAPI.KeywordRead[]>("/api/keywords", {
    method: "GET",
    ...(options || {}),
  });
}

/** Create Keyword POST /api/keywords */
export async function createKeywordApiKeywordsPost(
  body: HotKeyAPI.KeywordCreate,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.KeywordRead>("/api/keywords", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Delete Keyword DELETE /api/keywords/${param0} */
export async function deleteKeywordApiKeywordsKeywordIdDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.deleteKeywordApiKeywordsKeywordIdDeleteParams,
  options?: { [key: string]: any }
) {
  const { keyword_id: param0, ...queryParams } = params;
  return request<any>(`/api/keywords/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update Keyword PATCH /api/keywords/${param0} */
export async function updateKeywordApiKeywordsKeywordIdPatch(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.updateKeywordApiKeywordsKeywordIdPatchParams,
  body: HotKeyAPI.KeywordUpdate,
  options?: { [key: string]: any }
) {
  const { keyword_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.KeywordRead>(`/api/keywords/${param0}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Toggle Keyword POST /api/keywords/${param0}/toggle */
export async function toggleKeywordApiKeywordsKeywordIdTogglePost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.toggleKeywordApiKeywordsKeywordIdTogglePostParams,
  options?: { [key: string]: any }
) {
  const { keyword_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.KeywordRead>(`/api/keywords/${param0}/toggle`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}
