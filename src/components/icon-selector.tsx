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
  SiKuaishou, // Kwai
} from "react-icons/si"
import { FiVideo } from "react-icons/fi"

interface IconSelectProps {
  selectedIcon: string
  onIconSelect: (iconName: string) => void
  placeholder?: string
  className?: string
}

// Mantém os valores que você já usava (note o value "Tiktok"/"Youtube")
const SOCIAL_ITEMS = [
  { label: "Instagram", value: "Instagram" },
  { label: "TikTok", value: "Tiktok" },
  { label: "Pinterest", value: "Pinterest" },
  { label: "YouTube", value: "Youtube" },
  { label: "LinkedIn", value: "Linkedin" },
  { label: "Twitter/X", value: "Twitter" },
  { label: "Threads", value: "Threads" },
  { label: "Facebook", value: "Facebook" },
  { label: "Kwai", value: "Kwai" },
  { label: "Vídeo", value: "Video" },
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
  Kwai: SiKuaishou,       // Kwai = Kuaishou
  Video: FiVideo,         // fallback genérico de vídeo
}

function getIconByName(name?: string) {
  if (!name) return null
  return ICON_MAP[name] ?? null
}

export function IconSelect({
  selectedIcon,
  onIconSelect,
  placeholder = "Selecione o ícone",
  className,
}: IconSelectProps) {
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SOCIAL_ITEMS
    return SOCIAL_ITEMS.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.value.toLowerCase().includes(q)
    )
  }, [query])

  const SelectedIcon = getIconByName(selectedIcon)
  const selectedItem = React.useMemo(
    () => SOCIAL_ITEMS.find((i) => i.value === selectedIcon),
    [selectedIcon]
  )

  return (
    <Select value={selectedIcon} onValueChange={onIconSelect}>
      <SelectTrigger className={className}>
        {SelectedIcon ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SelectedIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{selectedItem?.label ?? selectedIcon}</span>
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
            const IconComp = getIconByName(item.value) ?? FiVideo
            return (
              <SelectItem key={`social-${item.value}`} value={item.value}>
                <div className="flex items-center gap-2">
                  <IconComp className="h-4 w-4" />
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
