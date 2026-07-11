"use client";

import { useState, useEffect } from "react";
import { Typography, Space, Spin, Alert, Button } from "antd";
import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import {
  UserOutlined,
  MailOutlined,
  FireOutlined,
  SettingOutlined,
  BellOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { listMonitors } from "@/services/monitors";
import { listPosts } from "@/services/content";
import { listNotifications } from "@/services/notifications";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    monitorCount: 0,
    totalPosts: 0,
    notificationCount: 0,
  });

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
          } catch { /* skip failed monitor posts */ }
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
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <ProCard title={<><UserOutlined style={{ marginRight: 8 }} />个人信息</>}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={() => window.location.reload()}>重试</Button>}
        />
      </ProCard>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* User Header */}
      <ProCard style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1677FF, #69b1ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Title level={4} style={{ margin: 0 }}>
              {user?.displayName || user?.email || "用户"}
            </Title>
            <Space style={{ marginTop: 4 }}>
              <Text type="secondary">
                <MailOutlined style={{ marginRight: 4 }} />
                {user?.email || "未设置邮箱"}
              </Text>
            </Space>
          </div>
        </div>
      </ProCard>

      {/* Stats Cards */}
      <ProCard.Group gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <FireOutlined style={{ fontSize: 24, color: "#1677FF" }} />
            <div style={{ fontSize: 28, fontWeight: 600, margin: "8px 0 2px" }}>
              {stats.monitorCount}
            </div>
            <Text type="secondary">监控配置</Text>
          </div>
        </ProCard>
        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <FileTextOutlined style={{ fontSize: 24, color: "#52c41a" }} />
            <div style={{ fontSize: 28, fontWeight: 600, margin: "8px 0 2px" }}>
              {stats.totalPosts}
            </div>
            <Text type="secondary">收录帖子</Text>
          </div>
        </ProCard>
        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <BellOutlined style={{ fontSize: 24, color: "#faad14" }} />
            <div style={{ fontSize: 28, fontWeight: 600, margin: "8px 0 2px" }}>
              {stats.notificationCount}
            </div>
            <Text type="secondary">未读通知</Text>
          </div>
        </ProCard>
        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <StarOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
            <div style={{ fontSize: 28, fontWeight: 600, margin: "8px 0 2px" }}>
              {(() => {
                try {
                  const raw = localStorage.getItem("savedPostIds");
                  return raw ? JSON.parse(raw).length : 0;
                } catch {
                  return 0;
                }
              })()}
            </div>
            <Text type="secondary">收藏内容</Text>
          </div>
        </ProCard>
      </ProCard.Group>

      {/* Account Details */}
      <ProCard title="账号详情" style={{ marginBottom: 16 }}>
        <ProDescriptions column={1} size="default">
          <ProDescriptions.Item
            label="显示名称"
            valueType="text"
          >
            {user?.displayName || "未设置"}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="电子邮箱"
            valueType="text"
          >
            {user?.email || "未设置"}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="注册时间" valueType="text">
            — <Text type="secondary">（无数据）</Text>
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      {/* Quick Actions */}
      <ProCard title="快捷操作">
        <Space wrap size={16}>
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
      </ProCard>
    </div>
  );
}
