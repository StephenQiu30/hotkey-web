"use client";

import { useRef } from "react";
import ProLayout from "@ant-design/pro-layout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dropdown, Avatar } from "antd";
import {
  FireOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

interface BasicLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  logo?: React.ReactNode;
  title?: string;
  headerRight?: React.ReactNode;
  onLogoClick?: () => void;
}

const defaultLogo = (
  <FireOutlined style={{ fontSize: 24, color: "var(--ant-color-primary)" }} />
);

export default function BasicLayout({
  children,
  menuItems,
  logo = defaultLogo,
  title = "HotKey",
  headerRight,
  onLogoClick,
}: BasicLayoutProps) {
  const pathname = usePathname();
  const actionRef = useRef<any>(null);
  const { logout } = useAuthStore();

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

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      window.location.href = "/dashboard/profile";
    } else if (key === "logout") {
      logout();
      window.location.href = "/login";
    }
  };

  const defaultHeaderRight = (
    <Dropdown
      key="user"
      menu={{ items: userMenuItems, onClick: handleMenuClick }}
    >
      <Avatar
        style={{
          cursor: "pointer",
          backgroundColor: "var(--ant-color-primary)",
          verticalAlign: "middle",
        }}
        icon={<UserOutlined />}
      />
    </Dropdown>
  );

  return (
    <ProLayout
      actionRef={actionRef}
      logo={logo}
      title={title}
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
      onMenuHeaderClick={() => {
        if (onLogoClick) {
          onLogoClick();
        } else {
          window.location.href = "/dashboard";
        }
      }}
      actionsRender={() => [headerRight ?? defaultHeaderRight]}
    >
      {children}
    </ProLayout>
  );
}
