"use client";

import { useState, useEffect } from "react";
import { Typography, Space, Spin, Alert, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
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
      <div style={{ border: "1px solid #eaeaea", borderRadius: 8, padding: 24 }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => window.location.reload()}>重试</Button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
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
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* User Header */}
      <div
        style={{
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
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
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#111",
              marginBottom: 4,
              letterSpacing: "-0.02em",
            }}
          >
            {user?.displayName || user?.email || "用户"}
          </div>
          <Space style={{ fontSize: 13, color: "#666" }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {user?.email || "未设置邮箱"}
          </Space>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {[
          {
            icon: <FireOutlined />,
            value: stats.monitorCount,
            label: "监控配置",
          },
          {
            icon: <FileTextOutlined />,
            value: stats.totalPosts,
            label: "收录帖子",
          },
          {
            icon: <BellOutlined />,
            value: stats.notificationCount,
            label: "未读通知",
          },
          {
            icon: <StarOutlined />,
            value: savedCount,
            label: "收藏内容",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: "20px 24px",
              border: "1px solid #eaeaea",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, color: "#888", marginBottom: 8 }}>
              {s.icon}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#111",
                marginBottom: 2,
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Account Details */}
      <div
        style={{
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#111",
            marginBottom: 20,
          }}
        >
          账号详情
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "显示名称", value: user?.displayName || "未设置" },
            { label: "电子邮箱", value: user?.email || "未设置" },
            { label: "注册时间", value: "—（无数据）" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#666",
                  width: 80,
                  flexShrink: 0,
                }}
              >
                {item.label}
              </span>
              <span style={{ fontSize: 13, color: "#333" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#111",
            marginBottom: 16,
          }}
        >
          快捷操作
        </div>
        <Space wrap size={12}>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => {
              window.location.href = "/dashboard/settings";
            }}
            style={{
              background: "#111",
              borderColor: "#111",
              boxShadow: "none",
            }}
          >
            管理监控
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/dashboard/notifications";
            }}
          >
            查看通知
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/dashboard/favorites";
            }}
          >
            我的收藏
          </Button>
        </Space>
      </div>
    </div>
  );
}
