import {
  Flame,
  FileText,
  Star,
  Bell,
  Settings,
} from "lucide-react";

export interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

export const dashboardMenuItems: MenuItem[] = [
  {
    path: "/dashboard",
    name: "热点榜单",
    icon: <Flame className="h-4 w-4" />,
  },
  {
    path: "/dashboard/topics",
    name: "内容选题",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    path: "/dashboard/favorites",
    name: "收藏关注",
    icon: <Star className="h-4 w-4" />,
  },
  {
    path: "/dashboard/notifications",
    name: "通知配置",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    path: "/dashboard/settings",
    name: "设置",
    icon: <Settings className="h-4 w-4" />,
  },
];
