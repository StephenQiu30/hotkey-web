"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  List,
  Tag,
  Typography,
  Button,
  Flex,
  Spin,
  Empty,
  Alert,
} from "antd";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
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

const deliveryStatusColor: Record<string, string> = {
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
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (notifications.length === 0) return;
    gsap.from(".nt-item", {
      y: 16,
      autoAlpha: 0,
      duration: 0.45,
      stagger: 0.07,
      ease: "power3.out",
    });
  }, { dependencies: [notifications.length], scope: containerRef, revertOnUpdate: true });

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
      <Card bordered>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchNotifs}>重试</Button>}
        />
      </Card>
    );
  }

  return (
    <div ref={containerRef}>
      <Flex vertical gap={16}>
        <Card bordered>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <BellOutlined style={{ fontSize: 16, color: "#888" }} />
              <Text strong>通知记录</Text>
            </Flex>
            {notifications.length > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {notifications.length} 条未读
              </Text>
            )}
          </Flex>
        </Card>

        {loading && (
          <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
            <Spin size="large" />
          </Card>
        )}

        {!loading && notifications.length === 0 && (
          <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
            <Empty description="暂无未读通知" />
          </Card>
        )}

        {!loading && notifications.length > 0 && (
          <Card bordered styles={{ body: { padding: 0 } }}>
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className="nt-item"
                  actions={
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
                      : []
                  }
                >
                  <List.Item.Meta
                    avatar={
                      item.delivery_status === "pending" ? (
                        <ClockCircleOutlined style={{ fontSize: 20, color: "var(--ant-color-primary)" }} />
                      ) : (
                        <CheckCircleOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                      )
                    }
                    title={
                      <Flex align="center" gap={8}>
                        <Tag
                          color={deliveryStatusColor[item.delivery_status ?? ""] ?? "default"}
                          style={{ fontSize: 11, lineHeight: "18px" }}
                        >
                          {channelLabel(item.channel)}
                        </Tag>
                        <Text style={{ fontSize: 13 }}>
                          {statusLabel[item.delivery_status ?? ""] ?? item.delivery_status}
                        </Text>
                      </Flex>
                    }
                    description={
                      item.created_at ? (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(item.created_at).toLocaleString("zh-CN")}
                        </Text>
                      ) : undefined
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      </Flex>
    </div>
  );
}
