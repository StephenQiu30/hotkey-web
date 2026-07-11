"use client";

import { useState, useEffect } from "react";
import { Typography, Button, Space, Alert, Spin, Empty } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  listNotifications,
  markNotificationRead,
} from "@/services/notifications";

const { Text } = Typography;

const statusColor: Record<string, string> = {
  delivered: "#389e0d",
  pending: "#1677FF",
  skipped: "#d4b106",
  failed: "#cf1322",
};

const statusBg: Record<string, string> = {
  delivered: "#f6ffed",
  pending: "#f0f5ff",
  skipped: "#fffbe6",
  failed: "#fff1f0",
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
  const [notifications, setNotifications] = useState<
    HotKeyAPI.NotificationData[]
  >([]);

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
      <div style={{ border: "1px solid #eaeaea", borderRadius: 8, padding: 24 }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchNotifs}>重试</Button>}
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
          <BellOutlined style={{ fontSize: 16, color: "#888" }} />
          通知记录
        </div>
        {notifications.length > 0 && (
          <span style={{ fontSize: 12, color: "#999" }}>
            {notifications.length} 条未读
          </span>
        )}
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

      {!loading && notifications.length === 0 && (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            padding: 60,
            textAlign: "center",
          }}
        >
          <Empty description="暂无未读通知" />
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid #eaeaea",
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {item.delivery_status === "pending" ? (
                  <ClockCircleOutlined
                    style={{ fontSize: 18, color: "#1677FF" }}
                  />
                ) : (
                  <CheckCircleOutlined
                    style={{ fontSize: 18, color: "#52c41a" }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "1px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      color:
                        statusColor[item.delivery_status ?? ""] ?? "#666",
                      background:
                        statusBg[item.delivery_status ?? ""] ?? "#f5f5f5",
                    }}
                  >
                    {channelLabel(item.channel)}
                  </span>
                  <span style={{ fontSize: 13, color: "#333" }}>
                    {statusLabel[item.delivery_status ?? ""] ??
                      item.delivery_status}
                  </span>
                </div>
                {item.created_at && (
                  <span style={{ fontSize: 12, color: "#999" }}>
                    {new Date(item.created_at).toLocaleString("zh-CN")}
                  </span>
                )}
              </div>
              {item.delivery_status === "pending" && item.id != null && (
                <Button
                  size="small"
                  type="default"
                  onClick={() => handleMarkRead(item.id!)}
                  style={{ flexShrink: 0, fontSize: 12 }}
                >
                  标记已读
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
