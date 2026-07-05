"use client";

import { useState, useEffect } from "react";
import { Tag, Typography, Space, Alert, Button } from "antd";
import { ProCard, ProList, ModalForm, ProFormText, ProFormSelect, ProFormDigit, ProFormSwitch } from "@ant-design/pro-components";
import { SettingOutlined, PlusOutlined } from "@ant-design/icons";
import { listMonitors, createMonitor } from "@/services/hotkey/hotkey-server/monitors";

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

  if (error) {
    return (
      <ProCard title={<><SettingOutlined style={{ marginRight: 8 }} />设置</>}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchMonitors}>重试</Button>}
        />
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <>
          <SettingOutlined style={{ marginRight: 8 }} />
          监控管理
        </>
      }
      extra={
        <ModalForm
          title="新建监控"
          trigger={
            <Button type="primary" icon={<PlusOutlined />}>
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
      }
    >
      <ProList<HotKeyAPI.MonitorData>
        rowKey="id"
        loading={loading}
        dataSource={monitors}
        locale={{
          emptyText: (
            <span>
              暂无监控配置
              <br />
              <Button type="primary" style={{ marginTop: 8 }}>
                新建监控
              </Button>
            </span>
          ),
        }}
        metas={{
          title: {
            render: (_, item) => (
              <Space>
                <Text strong>{item.name ?? "未命名"}</Text>
                <Tag color={statusColor[item.status ?? ""] ?? "default"}>
                  {item.status}
                </Tag>
              </Space>
            ),
          },
          description: {
            render: (_, item) => (
              <div>
                <Text code style={{ fontSize: 12 }}>
                  {item.query_text}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.region} · {item.language} · 每{" "}
                    {item.poll_interval_minutes} 分钟 · ID: {item.id}
                  </Text>
                </div>
              </div>
            ),
          },
        }}
      />
    </ProCard>
  );
}
