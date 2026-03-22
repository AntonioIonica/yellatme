"use client";

import AddSubscriptionDialog from "@/components/AddSubscriptionDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Bell,
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  SettingsIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: PieChart,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
];

const secondaryNavItems = [
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export type userType = {
  _id: String,
  name: String,
  email: String,
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<userType>();
  const [loaded, setLoaded] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("token");

    const res = await fetch("http://localhost:5500/api/v1/auth/sign-out", {
      method: "POST",
    });
    const result = await res.json();
    router.push("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const fetchUser = async () => {
      const res = await fetch("http://localhost:5500/api/v1/auth/jwt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setUser(result.user);
      setLoaded(true);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [user, loaded]);

  if (!user) return <div>Loading...</div>;

  return (
    <SidebarProvider className="bg-background">
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href="/" className="flex items-center justify-between">
                  <div className="flex items-center justify-center rounded-lg size-8 bg-accent">
                    Logo
                  </div>
                  <div className="leading-none">
                    <span>Free plan</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="flex flex-col justify-between">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm underline">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-3" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm underline">
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-3" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {/* User Name  */}
                        {user?.name.substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 leading-none">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  <DropdownMenuLabel className="font-medium text-sm">
                    My account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex">
                      <User className="mr-2 size-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex">
                      <SettingsIcon className="mr-2 size-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Button className="flex" onClick={handleLogout}>
                      <LogOut />
                      <span>Logout</span>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header
          className="h-18.25 bg-accent border-b border-border px-6
         flex items-center gap-4"
        >
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="h-19 text-accent-foreground"
          />
          <div className="flex items-center flex-1 justify-between">
            <h1 className="text-lg font-semibold">
              {mainNavItems.find((item) => pathname === item.href)?.title ||
                secondaryNavItems.find((item) => pathname === item.href)
                  ?.title ||
                "Dashboard"}
            </h1>
            <AddSubscriptionDialog />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
