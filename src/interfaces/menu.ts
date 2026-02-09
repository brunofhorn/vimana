import type { IconType } from "react-icons";

export type NavItem = {
  label: string;
  icon: IconType;
  href: string;
  active?: boolean;
};