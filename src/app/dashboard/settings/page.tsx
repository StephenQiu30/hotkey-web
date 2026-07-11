"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Typography,
  Flex,
  Button,
  Spin,
  Empty,
  Alert,
} from "antd";
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
  active: "success",
  paused: "warning",
  error: "error",
  created: "default",
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

  const formContent = (
    <>
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
    </>
  );

  const monitorCreateForm = (trigger: React.ReactNode) => (
    <ModalForm
      title="新建监控"
      trigger={trigger}
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
      {formContent}
    </ModalForm>
  );

  if (error) {
    return (
      <Card bordered>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchMonitors}>重试</Button>}
        />
      </Card>
    );
  }

  return (
    <Flex vertical gap={16}>
      <Card bordered>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={8}>
            <SettingOutlined style={{ fontSize: 16, color: "#888" }} />
            <Text strong>监控管理</Text>
          </Flex>
          {monitorCreateForm(
            <Button type="primary" icon={<PlusOutlined />}>
              新建监控
            </Button>,
          )}
        </Flex>
      </Card>

      {loading && (
        <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
          <Spin size="large" />
        </Card>
      )}

      {!loading && monitors.length === 0 && (
        <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
          <Empty description="暂无监控配置">
            {monitorCreateForm(
              <Button type="primary">新建监控</Button>,
            )}
          </Empty>
        </Card>
      )}

      {!loading && monitors.length > 0 && (
        <Card bordered styles={{ body: { padding: 0 } }}>
          {monitors.map((item, idx) => (
            <Flex
              key={item.id}
              vertical
              style={{
                padding: "20px 24px",
                borderBottom: idx < monitors.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                <Text strong>
                  {item.name ?? "未命名"}
                </Text>
                <Tag color={statusColor[item.status ?? ""] ?? "default"}>
                  {item.status}
                </Tag>
              </Flex>
              <Tag style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 6, width: "fit-content" }}>
                {item.query_text}
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.region} · {item.language} · 每 {item.poll_interval_minutes} 分钟 · ID: {item.id}
              </Text>
            </Flex>
          ))}
        </Card>
      )}
    </Flex>
  );
}
