"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  Statistic,
  Typography,
  Space,
  Spin,
  Alert,
  Button,
  Flex,
  Descriptions,
} from "antd";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  UserOutlined,
  FireOutlined,
  BellOutlined,
  StarOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { listMonitors } from "@/services/monitors";
import { listPosts } from "@/services/content";
import { listNotifications } from "@/services/notifications";

const { Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    monitorCount: 0,
    totalPosts: 0,
    notificationCount: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (loading) return;
    gsap.from(".pf-item", {
      y: 24,
      autoAlpha: 0,
      duration: 0.45,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, { dependencies: [loading], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const [monitorsRes, notifRes] = await Promise.all([
          listMonitors(),
          listNotifications(),
        ]);

        const monitors = monitorsRes.data ?? [];
        let totalPosts = 0;
        for (const m of monitors) {
          if (m.id == null) continue;
          try {
            const postsRes = await listPosts({ id: m.id, limit: 0 });
            totalPosts += (postsRes.data ?? []).length;
          } catch {
            /* skip failed monitor posts */
          }
        }

        if (!cancelled) {
          setStats({
            monitorCount: monitors.length,
            totalPosts,
            notificationCount: (notifRes.data ?? []).length,
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const savedCount = (() => {
    try {
      const raw = localStorage.getItem("savedPostIds");
      return raw ? JSON.parse(raw).length : 0;
    } catch {
      return 0;
    }
  })();

  if (error) {
    return (
      <Card bordered>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={() => window.location.reload()}>重试</Button>}
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <div ref={containerRef}>
      <Flex vertical gap={16}>
        {/* User Header */}
        <div className="pf-item">
          <Card bordered>
            <Flex align="center" gap={20} wrap="wrap">
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "2px solid #eaeaea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: "#fafafa",
                }}
              >
                <UserOutlined style={{ fontSize: 28, color: "#888" }} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Text strong style={{ fontSize: 20, display: "block", marginBottom: 4 }}>
                  {user?.displayName || user?.email || "用户"}
                </Text>
                <Space>
                  <UserOutlined style={{ color: "#999" }} />
                  <Text type="secondary">{user?.email || "未设置邮箱"}</Text>
                </Space>
              </div>
            </Flex>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="pf-item">
          <Flex gap={12} wrap="wrap">
            {[
              { title: "监控配置", value: stats.monitorCount, icon: <FireOutlined /> },
              { title: "收录帖子", value: stats.totalPosts, icon: <FileTextOutlined /> },
              { title: "未读通知", value: stats.notificationCount, icon: <BellOutlined /> },
              { title: "收藏内容", value: savedCount, icon: <StarOutlined /> },
            ].map((item) => (
              <Card
                key={item.title}
                bordered
                style={{ flex: "1 1 180px", textAlign: "center" }}
                styles={{ body: { padding: "24px 16px" } }}
              >
                <Statistic
                  title={item.title}
                  value={item.value}
                  valueStyle={{ fontSize: 28, fontWeight: 600, color: "#111" }}
                  prefix={<span style={{ color: "#888", marginRight: 4, fontSize: 20 }}>{item.icon}</span>}
                />
              </Card>
            ))}
          </Flex>
        </div>

        {/* Account Details */}
        <div className="pf-item">
          <Card bordered title="账号详情">
            <Descriptions column={{ xs: 1, sm: 1, md: 1 }} size="default">
              <Descriptions.Item label="显示名称">
                {user?.displayName || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="电子邮箱">
                {user?.email || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                — <Text type="secondary">（无数据）</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="pf-item">
          <Card bordered title="快捷操作">
            <Space wrap size={12}>
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => { window.location.href = "/dashboard/settings"; }}
              >
                管理监控
              </Button>
              <Button
                icon={<BellOutlined />}
                onClick={() => { window.location.href = "/dashboard/notifications"; }}
              >
                查看通知
              </Button>
              <Button
                icon={<StarOutlined />}
                onClick={() => { window.location.href = "/dashboard/favorites"; }}
              >
                我的收藏
              </Button>
            </Space>
          </Card>
        </div>
      </Flex>
    </div>
  );
}
