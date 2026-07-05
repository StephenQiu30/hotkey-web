"use client";

import { useState, useEffect } from "react";
import { Tag, Typography, Button, Space, Alert } from "antd";
import { ProCard, ProList } from "@ant-design/pro-components";
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { listNotifications, markNotificationRead } from "@/services/hotkey/hotkey-server/notifications";

const { Text } = Typography;

const statusColor: Record<string, string> = {
  delivered: "success",
  pending: "processing",
  skipped: "warning",
  failed: "error",
};

const statusLabel: Record<string, string> = {
  delivered: "已送达",
  pending: "待发送",
  skipped: "已跳过",
  failed: "发送失败",
};

const channelLabel = (ch?: string) => {
  if (ch === "in_app") return "站内";
  if (ch === "email") return "邮件";
  return ch ?? "未知";
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<HotKeyAPI.NotificationData[]>([]);

  const fetchNotifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listNotifications();
      setNotifications(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead({ id });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <ProCard title={<><BellOutlined style={{ marginRight: 8 }} />通知记录</>}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchNotifs}>重试</Button>}
        />
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <>
          <BellOutlined style={{ marginRight: 8 }} />
          通知记录
        </>
      }
      extra={
        notifications.length > 0 && (
          <Text type="secondary">{notifications.length} 条未读</Text>
        )
      }
    >
      <ProList<HotKeyAPI.NotificationData>
        rowKey="id"
        loading={loading}
        dataSource={notifications}
        locale={{ emptyText: "暂无未读通知" }}
        metas={{
          avatar: {
            render: (_, item) =>
              item.delivery_status === "pending" ? (
                <ClockCircleOutlined style={{ fontSize: 20, color: "#1677FF" }} />
              ) : (
                <CheckCircleOutlined style={{ fontSize: 20, color: "#52c41a" }} />
              ),
          },
          title: {
            render: (_, item) => (
              <Space size={8}>
                <Tag
                  color={statusColor[item.delivery_status ?? ""] ?? "default"}
                  style={{ fontSize: 11 }}
                >
                  {channelLabel(item.channel)}
                </Tag>
                <Text>{statusLabel[item.delivery_status ?? ""] ?? item.delivery_status}</Text>
              </Space>
            ),
          },
          description: {
            render: (_, item) =>
              item.created_at
                ? new Date(item.created_at).toLocaleString("zh-CN")
                : "",
          },
          actions: {
            render: (_, item) =>
              item.delivery_status === "pending" && item.id != null
                ? [
                    <Button
                      key="read"
                      size="small"
                      type="link"
                      onClick={() => handleMarkRead(item.id!)}
                    >
                      标记已读
                    </Button>,
                  ]
                : [],
          },
        }}
      />
    </ProCard>
  );
}
