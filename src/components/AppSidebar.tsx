"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileBarChart2,
  LayoutDashboard,
  Users,
  UserCog,
  Settings,
} from "lucide-react";
import { usePermissions } from "@/providers/PermissionProvider";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  requiredPermission: string;
};

const allItems: MenuItem[] = [
  {
    title: "Transactions",
    url: "/staff/",
    icon: LayoutDashboard,
    requiredPermission: "Quản lý giao dịch",
  },
  {
    title: "Readers",
    url: "/staff/readers",
    icon: Users,
    requiredPermission: "Quản lí độc giả",
  },
  {
    title: "Staff",
    url: "/staff/staff",
    icon: UserCog,
    requiredPermission: "Quản lí nhân viên",
  },
  {
    title: "Books",
    url: "/staff/books",
    icon: BookOpen,
    requiredPermission: "Quản lí sách",
  },
  {
    title: "Reports",
    url: "/staff/reports",
    icon: FileBarChart2,
    requiredPermission: "Báo cáo thống kê",
  },
  {
    title: "Payments",
    url: "/staff/payments",
    icon: FileBarChart2,
    requiredPermission: "Quản lí thanh toán",
  },
  {
    title: "Settings",
    url: "/staff/settings",
    icon: Settings,
    requiredPermission: "Cài đặt",
  },
];

export function AppSidebar() {
  const { permissions, loading } = usePermissions();
  const pathname = usePathname();

  const allowedItems = useMemo(() => {
    return allItems.filter((item) =>
      permissions.includes(item.requiredPermission),
    );
  }, [permissions]);

  if (loading) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Library Management System</SidebarGroupLabel>
            <SidebarGroupContent className="pt-2">
              <div className="p-4">Loading menu...</div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library Management System</SidebarGroupLabel>
          <SidebarGroupContent className="pt-2">
            <SidebarMenu>
              {allowedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={pathname === item.url ? "bg-accent" : ""}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
