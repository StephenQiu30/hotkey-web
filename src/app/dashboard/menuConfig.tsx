import {
  FireOutlined,
  FileTextOutlined,
  StarOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

export const dashboardMenuItems: MenuItem[] = [
  {
    path: "/dashboard",
    name: "热点榜单",
    icon: <FireOutlined />,
  },
  {
    path: "/dashboard/topics",
    name: "内容选题",
    icon: <FileTextOutlined />,
  },
  {
    path: "/dashboard/favorites",
    name: "收藏关注",
    icon: <StarOutlined />,
  },
  {
    path: "/dashboard/notifications",
    name: "通知配置",
    icon: <BellOutlined />,
  },
  {
    path: "/dashboard/settings",
    name: "设置",
    icon: <SettingOutlined />,
  },
];
