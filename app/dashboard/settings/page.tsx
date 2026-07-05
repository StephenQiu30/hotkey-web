"use client";

import { Card, Empty } from "antd";
import { SettingOutlined } from "@ant-design/icons";

export default function SettingsPage() {
  return (
    <Card
      title={
        <>
          <SettingOutlined style={{ marginRight: 8 }} />
          设置
        </>
      }
    >
      <Empty description="设置功能正在开发中" />
    </Card>
  );
}
