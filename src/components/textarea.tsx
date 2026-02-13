import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    `flex min-h-20 w-full rounded-md border border-gray-700 
                    dark:border-gray-800 bg-white/5 px-3 py-2 text-sm text-white 
                    ring-offset-white/5 placeholder:text-white/25 
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                    focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
