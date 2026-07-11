"use client";

import { useState, useEffect } from "react";
import { Typography, Button, Space, Alert, Spin, Empty, Tag } from "antd";
import {
  StarOutlined,
  StarFilled,
  DeleteOutlined,
} from "@ant-design/icons";
import { listMonitors } from "@/services/monitors";
import { listPosts } from "@/services/content";

const { Text } = Typography;

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<HotKeyAPI.PostSummary[]>([]);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const savedRaw = localStorage.getItem("savedPostIds");
      const savedIds: number[] = savedRaw ? JSON.parse(savedRaw) : [];
      if (savedIds.length === 0) {
        setFavorites([]);
        return;
      }

      const savedSet = new Set(savedIds);
      const monitorsRes = await listMonitors();
      const monitors = monitorsRes.data ?? [];
      const allPosts: HotKeyAPI.PostSummary[] = [];

      for (const m of monitors) {
        if (m.id == null) continue;
        const postsRes = await listPosts({ id: m.id, limit: 100 });
        allPosts.push(...(postsRes.data ?? []));
      }

      setFavorites(
        allPosts.filter((p) => p.id != null && savedSet.has(p.id)),
      );
    } catch (err: any) {
      setError(err?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = (id: number) => {
    const savedRaw = localStorage.getItem("savedPostIds");
    const savedIds: number[] = savedRaw ? JSON.parse(savedRaw) : [];
    const next = savedIds.filter((sid) => sid !== id);
    localStorage.setItem("savedPostIds", JSON.stringify(next));
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  };

  if (error) {
    return (
      <div style={{ border: "1px solid #eaeaea", borderRadius: 8, padding: 24 }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={loadFavorites}>重试</Button>}
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
          <StarOutlined style={{ fontSize: 16, color: "#888" }} />
          收藏关注
        </div>
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

      {!loading && favorites.length === 0 && (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            padding: 60,
            textAlign: "center",
          }}
        >
          <Empty description="还没有收藏的热点，快去热点榜单收藏吧" />
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {favorites.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid #eaeaea",
              }}
            >
              <StarFilled
                style={{
                  fontSize: 16,
                  color: "#faad14",
                  marginTop: 2,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{ fontSize: 13, lineHeight: 1.5 }}
                >
                  {item.content_text?.slice(0, 100) ??
                    `Post #${item.id}`}
                </Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#999" }}>
                    {(item.author_name || item.author_handle) ?? "未知"}
                  </span>
                  {item.heat_score != null && (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "1px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        color: "#666",
                        background: "#f5f5f5",
                      }}
                    >
                      {Math.round(item.heat_score * 100)}
                    </span>
                  )}
                  {item.published_at && (
                    <span style={{ fontSize: 12, color: "#999" }}>
                      {new Date(item.published_at).toLocaleDateString(
                        "zh-CN",
                      )}
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => item.id != null && removeFavorite(item.id)}
                style={{ flexShrink: 0 }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
