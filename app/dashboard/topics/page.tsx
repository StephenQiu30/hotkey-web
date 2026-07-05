"use client";

import { Card, Empty } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

export default function TopicsPage() {
  return (
    <Card
      title={
        <>
          <FileTextOutlined style={{ marginRight: 8 }} />
          内容选题
        </>
      }
    >
      <Empty description="暂无选题数据，请在热点榜单中生成长按选题" />
    </Card>
  );
}
