"use client";

import { useState, useEffect } from "react";
import { Typography, Space, Alert, Button, Spin, Empty } from "antd";
import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
} from "@ant-design/pro-components";
import { SettingOutlined, PlusOutlined } from "@ant-design/icons";
import { listMonitors, createMonitor } from "@/services/monitors";

const { Text } = Typography;

const statusColor: Record<string, string> = {
  active: "#389e0d",
  paused: "#d4b106",
  error: "#cf1322",
  created: "#666",
};

const statusBg: Record<string, string> = {
  active: "#f6ffed",
  paused: "#fffbe6",
  error: "#fff1f0",
  created: "#f5f5f5",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<HotKeyAPI.MonitorData[]>([]);

  const fetchMonitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMonitors();
      setMonitors(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  if (error) {
    return (
      <div style={{ border: "1px solid #eaeaea", borderRadius: 8, padding: 24 }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchMonitors}>重试</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#111",
          }}
        >
          <SettingOutlined style={{ fontSize: 16, color: "#888" }} />
          监控管理
        </div>

        <ModalForm
          title="新建监控"
          trigger={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "#111",
                borderColor: "#111",
                boxShadow: "none",
              }}
            >
              新建监控
            </Button>
          }
          submitTimeout={2000}
          onFinish={async (values: any) => {
            try {
              await createMonitor({
                name: values.name,
                query_text: values.query_text,
                region: values.region ?? "CN",
                language: values.language ?? "zh",
                poll_interval_minutes: values.poll_interval_minutes ?? 15,
                alert_enabled: values.alert_enabled ?? true,
              });
              fetchMonitors();
              return true;
            } catch (err: any) {
              throw new Error(err?.message ?? "创建失败");
            }
          }}
          initialValues={{
            region: "CN",
            language: "zh",
            poll_interval_minutes: 15,
            alert_enabled: true,
          }}
        >
          <ProFormText
            name="name"
            label="监控名称"
            placeholder="例如：AI 热点监控"
            rules={[{ required: true, message: "请输入监控名称" }]}
          />
          <ProFormText
            name="query_text"
            label="查询关键词"
            placeholder="例如：openai OR gpt"
            rules={[{ required: true, message: "请输入查询关键词" }]}
          />
          <ProFormSelect
            name="region"
            label="地区"
            options={[
              { value: "CN", label: "中国" },
              { value: "US", label: "美国" },
              { value: "JP", label: "日本" },
              { value: "EU", label: "欧洲" },
            ]}
          />
          <ProFormSelect
            name="language"
            label="语言"
            options={[
              { value: "zh", label: "中文" },
              { value: "en", label: "English" },
              { value: "ja", label: "日本語" },
            ]}
          />
          <ProFormDigit
            name="poll_interval_minutes"
            label="采集间隔（分钟）"
            min={5}
            max={1440}
          />
          <ProFormSwitch name="alert_enabled" label="启用通知" />
        </ModalForm>
      </div>

      {loading && (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            padding: 60,
            textAlign: "center",
          }}
        >
          <Spin size="large" />
        </div>
      )}

      {!loading && monitors.length === 0 && (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            padding: 60,
            textAlign: "center",
          }}
        >
          <Empty description="暂无监控配置">
            <ModalForm
              title="新建监控"
              trigger={
                <Button
                  type="primary"
                  style={{
                    background: "#111",
                    borderColor: "#111",
                    boxShadow: "none",
                  }}
                >
                  新建监控
                </Button>
              }
              submitTimeout={2000}
              onFinish={async (values: any) => {
                try {
                  await createMonitor({
                    name: values.name,
                    query_text: values.query_text,
                    region: values.region ?? "CN",
                    language: values.language ?? "zh",
                    poll_interval_minutes: values.poll_interval_minutes ?? 15,
                    alert_enabled: values.alert_enabled ?? true,
                  });
                  fetchMonitors();
                  return true;
                } catch (err: any) {
                  throw new Error(err?.message ?? "创建失败");
                }
              }}
              initialValues={{
                region: "CN",
                language: "zh",
                poll_interval_minutes: 15,
                alert_enabled: true,
              }}
            >
              <ProFormText
                name="name"
                label="监控名称"
                placeholder="例如：AI 热点监控"
                rules={[{ required: true, message: "请输入监控名称" }]}
              />
              <ProFormText
                name="query_text"
                label="查询关键词"
                placeholder="例如：openai OR gpt"
                rules={[{ required: true, message: "请输入查询关键词" }]}
              />
              <ProFormSelect
                name="region"
                label="地区"
                options={[
                  { value: "CN", label: "中国" },
                  { value: "US", label: "美国" },
                  { value: "JP", label: "日本" },
                  { value: "EU", label: "欧洲" },
                ]}
              />
              <ProFormSelect
                name="language"
                label="语言"
                options={[
                  { value: "zh", label: "中文" },
                  { value: "en", label: "English" },
                  { value: "ja", label: "日本語" },
                ]}
              />
              <ProFormDigit
                name="poll_interval_minutes"
                label="采集间隔（分钟）"
                min={5}
                max={1440}
              />
              <ProFormSwitch name="alert_enabled" label="启用通知" />
            </ModalForm>
          </Empty>
        </div>
      )}

      {!loading && monitors.length > 0 && (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {monitors.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #eaeaea",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    {item.name ?? "未命名"}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "1px 10px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      color: statusColor[item.status ?? ""] ?? "#666",
                      background: statusBg[item.status ?? ""] ?? "#f5f5f5",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "#666",
                    background: "#f5f5f5",
                    fontFamily: "monospace",
                    marginBottom: 6,
                  }}
                >
                  {item.query_text}
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  {item.region} · {item.language} · 每{" "}
                  {item.poll_interval_minutes} 分钟 · ID: {item.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
