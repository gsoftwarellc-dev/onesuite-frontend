"use client"

import * as React from "react"
import {
    Briefcase,
    ChevronDown,
    CreditCard,
    DollarSign,
    FileText,
    LayoutDashboard,
    LogOut,
    PieChart,
    Settings,
    Users,
    Bell,
    CheckCircle,
} from "lucide-react"

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
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { notificationService } from "@/services/notificationService"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, logout } = useAuth()
    const [unreadCount, setUnreadCount] = React.useState(0)

    // Fetch unread notification count
    React.useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        let isTabVisible = true;

        const fetchUnreadCount = async () => {
            // Only fetch if user is authenticated and tab is visible
            if (!user || !isTabVisible) return;

            try {
                const data = await notificationService.getUnreadCount();
                setUnreadCount(data.unread_count);
            } catch (error) {
                console.error('Failed to fetch notification count:', error);
                // Don't show error to user, just silently fail
            }
        };

        const handleVisibilityChange = () => {
            isTabVisible = !document.hidden;

            // Fetch immediately when tab becomes visible
            if (isTabVisible && user) {
                fetchUnreadCount();
            }
        };

        // Initial fetch
        if (user) {
            fetchUnreadCount();

            // Poll every 60 seconds
            intervalId = setInterval(() => {
                if (isTabVisible) {
                    fetchUnreadCount();
                }
            }, 60000);

            //Listen to visibility changes
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user]);

    // Define menus for different roles
    const navItems = [
        {
            title: "Dashboard",
            url: "/consultant",
            icon: LayoutDashboard,
            roles: ["consultant"],
        },
        {
            title: "Dashboard",
            url: "/manager",
            icon: LayoutDashboard,
            roles: ["manager"],
        },
        {
            title: "Dashboard",
            url: "/finance",
            icon: LayoutDashboard,
            roles: ["finance", "admin"],
        },
        {
            title: "Dashboard",
            url: "/director",
            icon: LayoutDashboard,
            roles: ["director"],
        },
        {
            title: "Commissions", // "consultant → commissions"
            url: "#",
            icon: DollarSign,
            items: [
                {
                    title: "Submit New",
                    url: "/submit-commission",
                },
                {
                    title: "History",
                    url: "/history",
                },
            ],
            roles: ["consultant"],
        },
        {
            title: "Approvals", // "manager → approvals"
            url: "/manager?view=review",
            icon: CheckCircle, // Need to ensure imported or use accessible icon
            roles: ["manager", "finance", "director"],
        },
        {
            title: "Team", // "manager → team"
            url: "/manager?view=team",
            icon: Users,
            roles: ["manager", "director"],
        },
        {
            title: "Payouts", // "finance → payouts", "consultant → payouts" (Assuming Consultant Payouts view)
            url: "/payouts",
            icon: CreditCard,
            roles: ["finance", "consultant", "director"],
        },
        {
            title: "Payments", // "finance → payments"
            url: "/payments",
            icon: DollarSign,
            roles: ["finance"],
        },
        {
            title: "Analytics", // "admin/director → analytics"
            url: "/analytics",
            icon: PieChart,
            roles: ["director", "admin"],
        },
        {
            title: "Notifications",
            url: "/notifications",
            icon: Bell,
            showBadge: true,
            // All roles
        },
        {
            title: "Payslips",
            url: "/payslips",
            icon: FileText,
            // All roles (or typically employees)
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
            // All roles
        },
    ]

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold">One Suite</span>
                        <span className="">Advisory</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <div className="flex flex-col gap-1 py-2">
                                            <div className="flex items-center gap-2 px-2 py-1.5 font-medium text-sm">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </div>
                                            <div className="pl-6 flex flex-col gap-0.5">
                                                {item.items.map((subItem) => (
                                                    <a
                                                        key={subItem.title}
                                                        href={subItem.url}
                                                        className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1.5 rounded-md transition-colors cursor-pointer"
                                                    >
                                                        {subItem.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <SidebarMenuButton asChild tooltip={item.title}>
                                            <a href={item.url} className="relative">
                                                <item.icon />
                                                <span>{item.title}</span>
                                                {item.showBadge && unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}
                                            </a>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout} tooltip="Logout">
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
