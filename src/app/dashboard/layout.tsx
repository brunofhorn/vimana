"use client"

import { SidebarContent, SidebarHeader, SidebarItem, SidebarSection, SidebarToggle, SimpleSidebar } from "@/components/sidebar";
import { useState } from "react";
import { FiHome, FiSettings, FiShare2, FiVideo } from "react-icons/fi";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <div className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
            <div className="flex">
                <SimpleSidebar open={open} onOpenChange={setOpen} side="left">
                    <SidebarHeader>
                        <div className="px-2 py-1 text-sm font-semibold">Vimana</div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarSection>
                            <SidebarItem icon={<FiHome />} href="/dashboard" active>
                                Dashboard
                            </SidebarItem>
                            <SidebarItem icon={<FiVideo />} href="/dashboard/videos/add">
                                Add Video
                            </SidebarItem>
                            <SidebarItem icon={<FiVideo />} href="/dashboard/videos">
                                Listar Videos
                            </SidebarItem>
                            <SidebarItem icon={<FiShare2 />} href="/dashboard/social">
                                Redes Sociais
                            </SidebarItem>
                        </SidebarSection>

                        <SidebarSection title="Configurações">
                            <SidebarItem icon={<FiSettings />} href="/settings">
                                Preferências
                            </SidebarItem>
                        </SidebarSection>
                    </SidebarContent>
                </SimpleSidebar>

                <div className="flex min-h-svh flex-1 flex-col">
                    {/* Topbar */}
                    <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-2">
                        <SidebarToggle onClick={() => setOpen(true)} />
                        <div className="text-sm font-medium">Topo</div>
                    </header>

                    {/* Conteúdo */}
                    <main className="flex-1 p-4">{children}</main>
                </div>
            </div>
        </div>
    )
}
