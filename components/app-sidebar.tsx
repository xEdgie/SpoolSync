/** @format */

"use client";

import * as React from "react";
import Link from "next/link";
import {
	Calendar,
	Home,
	Inbox,
	Search,
	Settings,
	LayoutGrid,
	PrinterIcon,
	RefreshCw,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { useAuth } from "@/components/auth-provider";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
	SidebarGroup,
	SidebarGroupLabel,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();

	const userData = {
		name: user?.displayName || user?.email?.split("@")[0] || "User",
		email: user?.email || "user@example.com",
		avatar: user?.photoURL || "/avatars/shadcn.jpg",
	};

	return (
		<Sidebar {...props}>
			<SidebarHeader className="border-sidebar-border h-16 border-b">
				<NavUser user={userData} />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Management</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/dashboard?view=filament">
									<LayoutGrid />
									<span>Filament</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/dashboard?view=printers">
									<PrinterIcon />
									<span>Printers</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/dashboard?view=sync">
									<RefreshCw />
									<span>Sync</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarSeparator className="mx-0" />
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/settings">
								<Settings />
								<span>Settings</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
