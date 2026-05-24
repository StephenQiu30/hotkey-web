// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Sentiment GET /api/analytics/sentiment */
export async function sentimentApiAnalyticsSentimentGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.sentimentApiAnalyticsSentimentGetParams,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.AnalyticsSentimentResponse>(
    "/api/analytics/sentiment",
    {
      method: "GET",
      params: {
        // days has a default value: 14
        days: "14",
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** Sources GET /api/analytics/sources */
export async function sourcesApiAnalyticsSourcesGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.sourcesApiAnalyticsSourcesGetParams,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.AnalyticsSourceResponse>("/api/analytics/sources", {
    method: "GET",
    params: {
      // days has a default value: 14
      days: "14",
      // limit has a default value: 8
      limit: "8",
      ...params,
    },
    ...(options || {}),
  });
}

/** Trend GET /api/analytics/trend */
export async function trendApiAnalyticsTrendGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.trendApiAnalyticsTrendGetParams,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.AnalyticsTrendResponse>("/api/analytics/trend", {
    method: "GET",
    params: {
      // days has a default value: 14
      days: "14",
      ...params,
    },
    ...(options || {}),
  });
}
