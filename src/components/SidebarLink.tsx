import { NavItem } from "@/interfaces/menu";
import Link from "next/link";

type SidebarLinkProps = {
    item: NavItem;
    collapsed: boolean;
    isActive: boolean;
};

export function SidebarLink({ item, collapsed, isActive }: SidebarLinkProps) {
    const baseClasses =
        "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold leading-normal transition-colors duration-200";

    const activeClasses = "bg-[#00348C] text-[#E0E9FF]";
    const inactiveClasses = "text-gray-300 hover:bg-white/5";

    const iconBaseClasses = "shrink-0";
    const iconActiveClasses = "text-[#60A5FA]";
    const iconInactiveClasses = "text-gray-300";

    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            <span
                className={`${iconBaseClasses} ${isActive ? iconActiveClasses : iconInactiveClasses
                    }`}
            >
                <Icon size={22} />
            </span>
            {!collapsed && <span>{item.label}</span>}
        </Link>
    );
}