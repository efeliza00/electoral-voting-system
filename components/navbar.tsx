"use client"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "./ui/button"
import { SidebarTrigger } from "./ui/sidebar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"

const Navbar = () => {
    return (
        <TooltipProvider>
            <div className="border-b w-full flex items-center justify-between px-6 py-4">
                <SidebarTrigger />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => signOut()}
                            size="icon"
                            variant="outline"
                        >
                            <LogOut />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Logout</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}

export default Navbar
