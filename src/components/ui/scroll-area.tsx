"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "../../lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none p-0.5 transition-all duration-200 ease-out",
      orientation === "vertical" &&
        "h-full w-3 border-l border-l-transparent",
      orientation === "horizontal" &&
        "h-3 border-t border-t-transparent",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-[linear-gradient(180deg,var(--scrollbar-thumb-hover),var(--scrollbar-thumb))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,white_18%,transparent),0_10px_24px_-18px_var(--scrollbar-shadow)] transition-colors duration-200 before:absolute before:inset-x-1/2 before:top-1/2 before:h-[calc(100%-0.65rem)] before:w-[3px] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white/20 hover:bg-[linear-gradient(180deg,var(--scrollbar-thumb-active),var(--scrollbar-thumb-hover))]" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
