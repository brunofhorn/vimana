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

// Importa os ícones de marcas (Simple Icons) e um fallback de "vídeo"
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
  SiSnapchat, // Kwai
} from "react-icons/si"
import { FiVideo } from "react-icons/fi"

type IconC = React.ComponentType<{ className?: string }>;

interface IconSelectItem { label: string; value: string; Icon?: IconC; }

interface IconSelectProps {
  selectedIcon: string
  onIconSelect: (iconName: string) => void
  placeholder?: string
  className?: string
  items?: IconSelectItem[]; 
}

// Mantém os valores que você já usava (note o value "Tiktok"/"Youtube")
const SOCIAL_ITEMS: IconSelectItem[] = [
  { label: "Instagram", value: "Instagram", Icon: SiInstagram },
  { label: "TikTok",    value: "Tiktok",    Icon: SiTiktok },
  { label: "Pinterest", value: "Pinterest", Icon: SiPinterest },
  { label: "YouTube",   value: "Youtube",   Icon: SiYoutube },
  { label: "LinkedIn",  value: "Linkedin",  Icon: SiLinkedin },
  { label: "Twitter/X", value: "Twitter",   Icon: SiX },
  { label: "Threads",   value: "Threads",   Icon: SiThreads },
  { label: "Facebook",  value: "Facebook",  Icon: SiFacebook },
  { label: "Snapchat",  value: "Snapchat",  Icon: SiSnapchat },
  { label: "Kwai",      value: "Kwai",      Icon: SiKuaishou },
  { label: "Vídeo",     value: "Video",     Icon: FiVideo },
] as const

// Mapa de valor -> componente do ícone
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: SiInstagram,
  Tiktok: SiTiktok,       // value "Tiktok" (label "TikTok")
  Pinterest: SiPinterest,
  Youtube: SiYoutube,     // value "Youtube" (label "YouTube")
  Linkedin: SiLinkedin,
  Twitter: SiX,     // se preferir X, pode trocar por SiX (se existir na sua versão)
  Threads: SiThreads,
  Facebook: SiFacebook,
  Snapchat: SiSnapchat,
  Kwai: SiKuaishou,       // Kwai = Kuaishou
  Video: FiVideo,         // fallback genérico de vídeo
}

export function IconSelect({
  selectedIcon,
  onIconSelect,
  placeholder = "Selecione o ícone",
  className,
  items, 
}: IconSelectProps) {
  const [query, setQuery] = React.useState("")
  const list = items ?? SOCIAL_ITEMS;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((i) =>
      i.label.toLowerCase().includes(q) || i.value.toLowerCase().includes(q)
    );
  }, [query, list]);

  const current = React.useMemo(
    () => list.find((i) => i.value === selectedIcon),
    [list, selectedIcon]
  );
  const CurrentIcon = current?.Icon;

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

      <SelectContent className="max-h-80 p-0">
        {/* Busca */}
        <div className="border-b p-2">
          <Input
            placeholder="Buscar ícone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8"
          />
        </div>

        <SelectGroup>
          <SelectLabel>Redes sociais</SelectLabel>
          {filtered.map((item) => {
            const Ico = item.Icon ?? FiVideo;
            return (
              <SelectItem key={`${item.value}`} value={item.value}>
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
