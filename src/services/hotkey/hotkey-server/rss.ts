// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Keyword Rss GET /rss/keyword/${param0} */
export async function keywordRssRssKeywordKeywordNameGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.keywordRssRssKeywordKeywordNameGetParams,
  options?: { [key: string]: any }
) {
  const { keyword_name: param0, ...queryParams } = params;
  return request<any>(`/rss/keyword/${param0}`, {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** Trending Rss GET /rss/trending */
export async function trendingRssRssTrendingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.trendingRssRssTrendingGetParams,
  options?: { [key: string]: any }
) {
  return request<any>("/rss/trending", {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",
      ...params,
    },
    ...(options || {}),
  });
}

/** User Rss GET /rss/user/${param0} */
export async function userRssRssUserUserIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.userRssRssUserUserIdGetParams,
  options?: { [key: string]: any }
) {
  const { user_id: param0, ...queryParams } = params;
  return request<any>(`/rss/user/${param0}`, {
    method: "GET",
    params: {
      // limit has a default value: 50
      limit: "50",
      ...queryParams,
    },
    ...(options || {}),
  });
}
