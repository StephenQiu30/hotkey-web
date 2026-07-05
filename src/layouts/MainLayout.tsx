"use client";

import { useEffect, useRef } from "react";
import ProLayout from "@ant-design/pro-layout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FireOutlined,
  FileTextOutlined,
  StarOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, Avatar } from "antd";
import { useAuthStore } from "@/stores/authStore";

const menuItems = [
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

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, hydrate } = useAuthStore();
  const actionRef = useRef<any>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人信息",
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <SettingOutlined />,
      label: "退出登录",
      danger: true,
    },
  ];

  return (
    <ProLayout
      actionRef={actionRef}
      logo={<FireOutlined style={{ fontSize: 24, color: "#1677FF" }} />}
      title="HotKey"
      layout="top"
      navTheme="light"
      fixedHeader
      contentWidth="Fluid"
      menu={{ locale: false }}
      menuDataRender={() => menuItems}
      location={{ pathname } as any}
      menuItemRender={(item: any, _dom: React.ReactNode) => {
        if (!item.path) return _dom;
        return <Link href={item.path}>{item.name}</Link>;
      }}
      onMenuHeaderClick={() => { window.location.href = "/dashboard"; }}
      actionsRender={() => [
        <Dropdown
          key="user"
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => {
              if (key === "profile") {
                window.location.href = "/dashboard/profile";
              } else if (key === "logout") {
                logout();
                window.location.href = "/login";
              }
            },
          }}
        >
          <Avatar
            style={{ cursor: "pointer", backgroundColor: "#1677FF", verticalAlign: "middle" }}
            icon={<UserOutlined />}
          />
        </Dropdown>,
      ]}
    >
      {children}
    </ProLayout>
  );
}
