"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar"
import {
  Archive,
  Gauge, LogOut, Package2, Settings, TableProperties, UserRound
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
export function AppSidebar() {
  const { data } = useSession()

    return (
        <Sidebar>
        <SidebarHeader>
          <Avatar className="size-30 mx-auto border border-accent">
            <AvatarImage src={data?.user?.image as string} />
            <AvatarFallback className="uppercase bg-muted text-primary  text-2xl">
              <UserRound className="size-16 text-primary " />
            </AvatarFallback>
          </Avatar>
            </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/dashboard">
                      <Gauge />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Package2 /> Election
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/admin/dashboard/elections/create">
                                <Archive />{" "}
                                <span>
                                  Create an Election
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/admin/dashboard/elections/lists">
                                <TableProperties />{" "}
                                <span>Election List</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </SidebarMenu>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupContent>
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Settings /> Settings
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/admin/dashboard/account-details">
                                <UserRound />{" "}
                                <span>
                                  Account
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/logout" onNavigate={(e) => {
                                e.preventDefault()
                                signOut()
                              }} >
                                <LogOut />{" "}
                                <span>
                                  Logout
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                        </SidebarMenuSub>
                      </SidebarMenu>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
