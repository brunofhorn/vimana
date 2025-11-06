"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type LoaderProps = {
    fullScreen?: boolean
    label?: string | null
    size?: "sm" | "md" | "lg"
    className?: string
}

const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-[3px]",
}

export function Loader({
    fullScreen = false,
    label = "Carregando...",
    size = "md",
    className,
}: LoaderProps) {
    const spinner = (
        <span
            aria-hidden="true"
            className={cn(
                "inline-block animate-spin rounded-full border-muted-foreground border-t-transparent",
                sizeMap[size]
            )}
        />
    )

    const content = (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={cn("inline-flex items-center gap-2", className)}
        >
            {spinner}
            {label && <span className="text-sm text-muted-foreground">{label}</span>}
        </div>
    )

    if (!fullScreen) return content

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-md bg-card px-4 py-3 shadow">
                {spinner}
                {label && <span className="text-sm text-muted-foreground">{label}</span>}
            </div>
        </div>
    )
}
