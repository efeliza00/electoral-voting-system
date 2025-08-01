import { AppSidebar } from "@/components/app-sidebar"
import Navbar from "@/components/navbar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SidebarProvider } from "@/components/ui/sidebar"

import React from "react"
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider className="flex h-screen w-screen">
            <AppSidebar />
        <main className="h-full max-h-full w-full max-w-full flex-1 overflow-hidden">
                <Navbar />
          <ScrollArea className=" shadow border rounded-lg h-[calc(100%-5.5rem)] p-4  m-4">
                        {children}
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </main>
        </SidebarProvider>
    )
}

export default DashboardLayout
