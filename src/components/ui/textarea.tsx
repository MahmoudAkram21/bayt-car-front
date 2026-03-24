import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground min-h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:text-sm resize-vertical",
        "focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-500 dark:focus:border-orange-500",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
