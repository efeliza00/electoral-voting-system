"use client"

import * as SeparatorPrimitive from "@radix-ui/react-separator"
import * as React from "react"

import { cn } from "@/lib/utils"

function Separator({
    className,
    orientation = "horizontal",
    decorative = true,
    ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
    return (
        <SeparatorPrimitive.Root
            data-slot="separator-root"
            decorative={decorative}
            orientation={orientation}
        className={cn(
               "shrink-0 bg-border",
               orientation === "horizontal" ? "h-[1px] w-full" : "min-h-full w-[1px]",
               className,
             )}
            {...props}
        />
    )
}

export { Separator }
