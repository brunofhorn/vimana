"use client"

import * as React from "react"
import { Input } from "@/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/select"

import {
  SiInstagram,
  SiTiktok,
  SiPinterest,
  SiYoutube,
  SiLinkedin,
  SiX,
  SiThreads,
  SiFacebook,
  SiKuaishou,
  SiSnapchat,
} from "react-icons/si"
import { FiVideo } from "react-icons/fi"

type IconC = React.ComponentType<{ className?: string }>;

interface IconSelectItem {
  label: string;
  value: string;
  Icon?: IconC;
}

interface IconSelectProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  groupLabel?: string;
  className?: string;
  items?: IconSelectItem[];
}

const SOCIAL_ITEMS: IconSelectItem[] = [
  { label: "Instagram", value: "Instagram", Icon: SiInstagram },
  { label: "TikTok", value: "Tiktok", Icon: SiTiktok },
  { label: "Pinterest", value: "Pinterest", Icon: SiPinterest },
  { label: "YouTube", value: "Youtube", Icon: SiYoutube },
  { label: "LinkedIn", value: "Linkedin", Icon: SiLinkedin },
  { label: "Twitter/X", value: "Twitter", Icon: SiX },
  { label: "Threads", value: "Threads", Icon: SiThreads },
  { label: "Facebook", value: "Facebook", Icon: SiFacebook },
  { label: "Snapchat", value: "Snapchat", Icon: SiSnapchat },
  { label: "Kwai", value: "Kwai", Icon: SiKuaishou },
  { label: "Video", value: "Video", Icon: FiVideo },
] as const

export function IconSelect({
  selectedIcon,
  onIconSelect,
  placeholder = "Selecione o icone",
  searchPlaceholder = "Buscar...",
  groupLabel = "Opcoes",
  className,
  items,
}: IconSelectProps) {
  const [query, setQuery] = React.useState("")
  const list = items ?? SOCIAL_ITEMS

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (i) => i.label.toLowerCase().includes(q) || i.value.toLowerCase().includes(q)
    )
  }, [query, list])

  const current = React.useMemo(
    () => list.find((i) => i.value === selectedIcon),
    [list, selectedIcon]
  )
  const CurrentIcon = current?.Icon

  return (
    <Select value={selectedIcon || undefined} onValueChange={onIconSelect}>
      <SelectTrigger className={className}>
        {current ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {CurrentIcon && <CurrentIcon className="h-4 w-4 shrink-0" aria-hidden />}
            <span className="truncate">{current.label}</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent className="max-h-80 p-0 bg-white text-slate-900 border-slate-200">
        <div className="border-b p-2">
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8"
          />
        </div>

        <SelectGroup>
          <SelectLabel>{groupLabel}</SelectLabel>
          {filtered.map((item) => {
            const Ico = item.Icon ?? FiVideo
            return (
              <SelectItem
                key={item.value}
                value={item.value}
                className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
              >
                <div className="flex items-center gap-2">
                  <Ico className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
