import { Activity, Database, FileText, Radar, Send } from "lucide-react";

export interface MenuItem { path: string; name: string; icon: React.ReactNode; }

export const dashboardMenuItems: MenuItem[] = [
  { path: "/dashboard", name: "工作台", icon: <Activity className="h-3.5 w-3.5" /> },
  { path: "/dashboard/settings", name: "热点监控", icon: <Radar className="h-3.5 w-3.5" /> },
  { path: "/dashboard/sources", name: "来源管理", icon: <Database className="h-3.5 w-3.5" /> },
  { path: "/dashboard/reports", name: "报告中心", icon: <FileText className="h-3.5 w-3.5" /> },
  { path: "/dashboard/notifications", name: "发布订阅", icon: <Send className="h-3.5 w-3.5" /> },
];
