// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List posts for a monitor GET /api/v1/monitors/${param0}/posts */
export async function listPosts(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listPostsParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<HotKeyAPI.PostListResponse>(
    `/api/v1/monitors/${param0}/posts`,
    {
      method: "GET",
      params: {
        // limit has a default value: 20
        limit: "20",
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}
