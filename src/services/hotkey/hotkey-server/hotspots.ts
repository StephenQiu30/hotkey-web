// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** List Hotspots GET /api/hotspots */
export async function listHotspotsApiHotspotsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.listHotspotsApiHotspotsGetParams,
  options?: { [key: string]: any }
) {
  return request<Record<string, any>>("/api/hotspots", {
    method: "GET",
    params: {
      // sort has a default value: fetched_at_desc
      sort: "fetched_at_desc",
      // limit has a default value: 50
      limit: "50",
      ...params,
    },
    ...(options || {}),
  });
}

/** Get Hotspot GET /api/hotspots/${param0} */
export async function getHotspotApiHotspotsHotspotIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.getHotspotApiHotspotsHotspotIdGetParams,
  options?: { [key: string]: any }
) {
  const { hotspot_id: param0, ...queryParams } = params;
  return request<HotKeyAPI.HotspotRead>(`/api/hotspots/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}
