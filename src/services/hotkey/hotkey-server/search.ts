// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Search POST /api/search */
export async function searchApiSearchPost(
  body: HotKeyAPI.SearchCreate,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.SearchRead>("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
