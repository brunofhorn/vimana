"use client";

import { NavItem } from "@/interfaces/menu";
import { useState } from "react";
import {
  HiOutlineViewGrid,
  HiOutlinePlusCircle,
  HiOutlineShare,
  HiOutlineChartPie,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFilm,
} from "react-icons/hi";
import { SidebarLink } from "./SidebarLink";
import { usePathname } from "next/navigation";

const primaryNav: NavItem[] = [
  { label: "Dashboard", icon: HiOutlineViewGrid, href: "/", active: true },
  { label: "Adicionar Vídeo", icon: HiOutlinePlusCircle, href: "/videos/add" },
  { label: "Listar Vídeos", icon: HiOutlineFilm, href: "/videos" },
  { label: "Redes Sociais", icon: HiOutlineShare, href: "/social" },
  { label: "Relatórios", icon: HiOutlineChartPie, href: "/reports" },
];

const secondaryNav: NavItem[] = [
  { label: "Configurações", icon: HiOutlineCog, href: "/settings" },
];

const normalizePath = (path: string) => {
  if (!path) return "/";
  if (path !== "/" && path.endsWith("/")) return path.slice(0, -1);
  return path;
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

 const normalizedPath = normalizePath(pathname);

  // Junta todos os itens (primário + secundário)
  const allNavItems = [...primaryNav, ...secondaryNav];

  // Descobre QUAL href é o melhor match (maior prefixo)
  let activeHref: string | null = null;

  for (const item of allNavItems) {
    const href = normalizePath(item.href);

    // regra de match genérica:
    // - é exatamente igual, ou
    // - o path começa com href + "/"
    const matches =
      normalizedPath === href || normalizedPath.startsWith(href + "/");

    if (!matches) continue;

    if (!activeHref || href.length > activeHref.length) {
      activeHref = href;
    }
  }

  return (
    <aside
      className={`flex-shrink-0 bg-[#020617] border-r border-white/10 transition-[width] duration-200 ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex h-full min-h-[700px] flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1 py-2 gap-2">
            <div className="flex items-center gap-3">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdMbh6HJmhJQURuLxnZxPv8gcOM1wQwoOMhHrAFztnLaoxZpPy_dq_4ASYpE2ujNqXXUTfgRPs3V78KBlkodpvpN8v6gmjw_d_tui_L0mANkaDN2eR2vbm2m3YorBgvzuZ_kcW-df9Z0tU-etd_zJ70Pq7QxTNOHLls0tdwm3_bqkgvW2PLtOR-lQcz8RW4blH54tas5Dqzqzi_uzFk8_8FhKkEOo2_5ujs5kQnW4MrDs37_X__ENBT7q3uarvpnQ94X_5BsAYy9vO")',
                }}
              />
              {!collapsed && (
                <div className="flex flex-col">
                  <h1 className="text-white text-sm font-semibold leading-tight">
                    Usuário
                  </h1>
                  <p className="text-gray-400 text-xs leading-tight">
                    usuario@email.com
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              aria-expanded={!collapsed}
              className="flex items-center justify-center rounded-full border border-white/10 bg-transparent size-9 hover:bg-white/5 transition-colors"
            >
              {collapsed ? (
                <HiOutlineChevronRight size={18} className="text-gray-300" />
              ) : (
                <HiOutlineChevronLeft size={18} className="text-gray-300" />
              )}
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-2">
            {primaryNav.map((item) => (
              <SidebarLink
                key={item.label}
                item={item}
                collapsed={collapsed}
                isActive={normalizePath(item.href) === activeHref}
              />
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          {secondaryNav.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              collapsed={collapsed}
              isActive={normalizePath(item.href) === activeHref}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}