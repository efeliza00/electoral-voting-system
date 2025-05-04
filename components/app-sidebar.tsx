"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Archive, TableProperties, Vote } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "./ui/skeleton"
export function AppSidebar() {
    const { data, status } = useSession()

    if (status === "loading") <></>

    return (
        <Sidebar>
            <SidebarHeader className="flex items-center justify-center">
                {status === "loading" ? (
                    <Skeleton className="size-24 text-secondary rounded-full" />
                ) : (
                    <Image
                        src={data?.user?.image || "/images/no-image.png"}
                        alt="profile-image"
                        height={100}
                        width={100}
                        className="rounded-full object-cover border-2 "
                    />
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem className="font-medium tracking-tight flex items-center gap-1">
                            <Vote className="size-4" /> <span>Elections</span>
                        </SidebarMenuItem>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                    <Link href="/dashboard/elections/create">
                                        <Archive />{" "}
                                        <span>Create an Election</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                <Link href="/dashboard/elections/list">
                                <TableProperties />{" "}
                                        <span>Election List</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>Settings</SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    )
}
