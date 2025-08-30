"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "./sheet"
import { Button } from "./button"
import { FiSidebar } from "react-icons/fi"

type SimpleSidebarProps = {
  /** Estado do drawer no mobile */
  open: boolean
  /** Handler para abrir/fechar o drawer no mobile */
  onOpenChange: (open: boolean) => void
  /** Lado do sidebar (desktop + mobile) */
  side?: "left" | "right"
  /** Conteúdo do menu (lista de links, etc.) */
  children: React.ReactNode
  /** Classe opcional */
  className?: string
}

/**
 * Sidebar simples:
 * - Desktop: aside fixo visível (md+)
 * - Mobile: usa <Sheet> (off-canvas)
 * - Controle 100% por props (sem Context/Provider)
 */
export function SimpleSidebar({
  open,
  onOpenChange,
  side = "left",
  children,
  className,
}: SimpleSidebarProps) {
  return (
    <>
      {/* Desktop (fixo) */}
      <aside
        data-side={side}
        className={cn(
          "hidden md:flex md:sticky md:top-0 md:h-svh md:w-64 md:shrink-0",
          "border-r bg-sidebar text-sidebar-foreground",
          className
        )}
      >
        <div className="flex h-full w-full flex-col p-2">{children}</div>
      </aside>

      {/* Mobile (off-canvas) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={side}
          className="w-72 p-0 bg-sidebar text-sidebar-foreground [&>button]:hidden"
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}

/** Botão padrão para abrir/fechar o sidebar no mobile */
export function SidebarToggle({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("md:hidden", className)}
      onClick={onClick}
      aria-label="Abrir menu"
    >
      <FiSidebar />
    </Button>
  )
}

/** Blocos utilitários opcionais (simples, sem dependências) */
export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-2">{children}</div>
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto px-2 pb-2">
      {children}
    </div>
  )
}

export function SidebarSection({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-2">
      {title ? (
        <div className="px-2 pb-1 text-xs font-medium text-sidebar-foreground/70">
          {title}
        </div>
      ) : null}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

export function SidebarItem({
  icon,
  children,
  active,
  href,
  onClick,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  active?: boolean
  href?: string
  onClick?: () => void
}) {
  const Comp = href ? "a" : "button"
  return (
    <Comp
      {...(href ? { href } : { type: "button", onClick })}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm outline-none",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      {icon ? <span className="[&>svg]:size-4 shrink-0">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </Comp>
  )
}
