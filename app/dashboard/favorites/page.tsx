"use client";

import { useState, useEffect } from "react";
import { Tag, Typography, Button, Space, Alert } from "antd";
import { ProCard, ProList } from "@ant-design/pro-components";
import { StarOutlined, StarFilled, DeleteOutlined } from "@ant-design/icons";
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
      <ProCard
        title={<><StarOutlined style={{ marginRight: 8 }} />收藏关注</>}
      >
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={loadFavorites}>重试</Button>}
        />
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <>
          <StarOutlined style={{ marginRight: 8 }} />
          收藏关注
        </>
      }
    >
      <ProList<HotKeyAPI.PostSummary>
        rowKey="id"
        loading={loading}
        dataSource={favorites}
        showActions="hover"
        locale={{ emptyText: "还没有收藏的热点，快去热点榜单收藏吧" }}
        metas={{
          avatar: {
            render: () => <StarFilled style={{ fontSize: 20, color: "#faad14" }} />,
          },
          title: {
            render: (_, item) => (
              <Text strong>
                {item.content_text?.slice(0, 100) ?? `Post #${item.id}`}
              </Text>
            ),
          },
          description: {
            render: (_, item) => (
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
            ),
          },
          actions: {
            render: (_, item) => [
              <Button
                key="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => item.id != null && removeFavorite(item.id)}
              />,
            ],
          },
        }}
      />
    </ProCard>
  );
}
