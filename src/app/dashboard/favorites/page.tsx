"use client";

import { useState, useEffect } from "react";
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
      <Card bordered>
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
    <Flex vertical gap={16}>
      <Card bordered>
        <Flex align="center" gap={8}>
          <StarOutlined style={{ fontSize: 16, color: "#888" }} />
          <Text strong>收藏关注</Text>
        </Flex>
      </Card>

      {loading && (
        <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
          <Spin size="large" />
        </Card>
      )}

      {!loading && favorites.length === 0 && (
        <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
          <Empty description="还没有收藏的热点，快去热点榜单收藏吧" />
        </Card>
      )}

      {!loading && favorites.length > 0 && (
        <Card
          bordered
          styles={{ body: { padding: 0 } }}
        >
          <List
            dataSource={favorites}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => item.id != null && removeFavorite(item.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <StarFilled style={{ fontSize: 18, color: "#faad14" }} />
                  }
                  title={
                    <Text style={{ fontSize: 13 }}>
                      {item.content_text?.slice(0, 100) ?? `Post #${item.id}`}
                    </Text>
                  }
                  description={
                    <Flex align="center" gap={8} style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {(item.author_name || item.author_handle) ?? "未知"}
                      </Text>
                      {item.heat_score != null && (
                        <Tag style={{ fontSize: 11, lineHeight: "18px" }}>
                          {Math.round(item.heat_score * 100)}
                        </Tag>
                      )}
                      {item.published_at && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(item.published_at).toLocaleDateString("zh-CN")}
                        </Text>
                      )}
                    </Flex>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </Flex>
  );
}
