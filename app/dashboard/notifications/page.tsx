"use client";

import { Card, Empty } from "antd";
import { BellOutlined } from "@ant-design/icons";

export default function NotificationsPage() {
  return (
    <Card
      title={
        <>
          <BellOutlined style={{ marginRight: 8 }} />
          通知配置
        </>
      }
    >
      <Empty description="暂无通知配置，通知功能正在开发中" />
    </Card>
  );
}
