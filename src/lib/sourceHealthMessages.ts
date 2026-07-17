const SOURCE_HEALTH_MESSAGES: Readonly<Record<string, string>> = {
  invalid_source_connection: "来源配置无效，请检查地址与类型",
  request_failed: "无法连接来源，请检查网络后重试",
  upstream_status: "来源服务返回异常状态，请稍后重试",
  connector_unavailable: "当前来源类型暂不可用",
  destination_not_permitted: "来源地址被安全策略拒绝，请检查 DNS 或代理的 Fake-IP 设置",
};

export function getSourceHealthMessage(code: string | undefined): string {
  if (!code) return "来源暂不可用";
  return SOURCE_HEALTH_MESSAGES[code] ?? "来源暂不可用";
}
