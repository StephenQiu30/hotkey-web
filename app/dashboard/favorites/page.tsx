"use client";

import { useState, useEffect } from "react";
import { Card, List, Tag, Typography, Spin, Empty, Alert, Button, Space } from "antd";
import {
  StarOutlined,
  StarFilled,
  DeleteOutlined,
} from "@ant-design/icons";
import { listMonitors } from "@/services/hotkey/hotkey-server/monitors";
import { listPosts } from "@/services/hotkey/hotkey-server/content";

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

      setFavorites(allPosts.filter((p) => p.id != null && savedSet.has(p.id)));
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
      <Card title={<><StarOutlined style={{ marginRight: 8 }} />收藏关注</>}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={loadFavorites}>重试</Button>}
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <>
          <StarOutlined style={{ marginRight: 8 }} />
          收藏关注
        </>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : favorites.length === 0 ? (
        <Empty description="还没有收藏的热点，快去热点榜单收藏吧" />
      ) : (
        <List
          dataSource={favorites}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => item.id != null && removeFavorite(item.id)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<StarFilled style={{ fontSize: 20, color: "#faad14" }} />}
                title={
                  <Text strong>
                    {item.content_text?.slice(0, 100) ?? `Post #${item.id}`}
                  </Text>
                }
                description={
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {(item.author_name || item.author_handle) ?? "未知"}
                    </Text>
                    {item.heat_score != null && (
                      <Tag color="blue" style={{ fontSize: 11 }}>
                        热度 {Math.round(item.heat_score * 100)}
                      </Tag>
                    )}
                    {item.published_at && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(item.published_at).toLocaleDateString("zh-CN")}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
