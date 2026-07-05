"use client";

import { useState, useEffect } from "react";
import {
  Card,
  List,
  Tag,
  Typography,
  Spin,
  Empty,
  Alert,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  Select,
  message,
} from "antd";
import {
  SettingOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { listMonitors, createMonitor } from "@/services/hotkey/hotkey-server/monitors";

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<HotKeyAPI.MonitorData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

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

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await createMonitor({
        name: values.name,
        query_text: values.query_text,
        region: values.region ?? "US",
        language: values.language ?? "en",
        poll_interval_minutes: values.poll_interval_minutes ?? 15,
        alert_enabled: values.alert_enabled ?? true,
      });
      message.success("监控创建成功");
      setModalOpen(false);
      form.resetFields();
      fetchMonitors();
    } catch (err: any) {
      message.error(err?.message ?? "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<string, string> = {
    active: "success",
    paused: "warning",
    error: "error",
    created: "default",
  };

  if (error) {
    return (
      <Card title={<><SettingOutlined style={{ marginRight: 8 }} />设置</>}>
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
    <>
      <Card
        title={
          <>
            <SettingOutlined style={{ marginRight: 8 }} />
            监控管理
          </>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            新建监控
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : monitors.length === 0 ? (
          <Empty description="暂无监控配置，点击上方按钮创建">
            <Button type="primary" onClick={() => setModalOpen(true)}>
              新建监控
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={monitors}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{item.name ?? "未命名"}</Text>
                      <Tag color={statusColor[item.status ?? ""] ?? "default"}>
                        {item.status}
                      </Tag>
                    </Space>
                  }
                  description={
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
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="新建监控"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            region: "CN",
            language: "zh",
            poll_interval_minutes: 15,
            alert_enabled: true,
          }}
        >
          <Form.Item
            name="name"
            label="监控名称"
            rules={[{ required: true, message: "请输入监控名称" }]}
          >
            <Input placeholder="例如：AI 热点监控" />
          </Form.Item>

          <Form.Item
            name="query_text"
            label="查询关键词"
            rules={[{ required: true, message: "请输入查询关键词" }]}
          >
            <Input placeholder="例如：openai OR gpt" />
          </Form.Item>

          <Form.Item name="region" label="地区">
            <Select
              options={[
                { value: "CN", label: "中国" },
                { value: "US", label: "美国" },
                { value: "JP", label: "日本" },
                { value: "EU", label: "欧洲" },
              ]}
            />
          </Form.Item>

          <Form.Item name="language" label="语言">
            <Select
              options={[
                { value: "zh", label: "中文" },
                { value: "en", label: "English" },
                { value: "ja", label: "日本語" },
              ]}
            />
          </Form.Item>

          <Form.Item name="poll_interval_minutes" label="采集间隔（分钟）">
            <InputNumber min={5} max={1440} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="alert_enabled" label="启用通知" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
