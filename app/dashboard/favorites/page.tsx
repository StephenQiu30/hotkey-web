"use client";

import { Card, Empty } from "antd";
import { StarOutlined } from "@ant-design/icons";

export default function FavoritesPage() {
  return (
    <Card
      title={
        <>
          <StarOutlined style={{ marginRight: 8 }} />
          收藏关注
        </>
      }
    >
      <Empty description="还没有收藏的热点，快去热点榜单看看吧" />
    </Card>
  );
}
