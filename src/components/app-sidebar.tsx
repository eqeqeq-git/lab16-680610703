import { BookOpen, Home } from "lucide-react";
import { Link, useLocation } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// ผู้ใช้ตัวอย่างฝั่ง Lecture: ผู้ดูแลระบบ (ADMIN)
const NICKNAME = "Admin";
const ROLE = "ADMIN";

const items = [
  { title: "หน้าแรก", url: "/", icon: Home },
  { title: "จัดการวิชาเรียน", url: "/admin/courses", icon: BookOpen },
  { title: "จัดการการลงทะเบียน", url: "/admin/enrollments", icon: BookOpen },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-b border-border bg-sidebar">
        <div className="px-3 py-3 text-sm font-semibold tracking-wide text-sidebar-foreground">
          CPE & ISNE
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-muted-foreground">
            เมนูหลัก
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.url}
                    render={<Link to={item.url} />}
                    className={
                      location.pathname === item.url
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-sidebar p-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar className="h-9 w-9 border border-border bg-muted">
            <AvatarImage src="/profile.svg" alt={NICKNAME} />
            <AvatarFallback>{NICKNAME.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {NICKNAME}
            </span>
            <Badge
              variant="outline"
              className="w-fit border-border bg-transparent text-[10px] text-muted-foreground"
            >
              {ROLE}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
