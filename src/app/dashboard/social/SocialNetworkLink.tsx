"use client"

import * as React from "react"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/select"
import { FiTrash2 } from "react-icons/fi"
import type { SocialNetworkData } from "@/interfaces/social-networks"

export interface SocialLink {
  socialNetworkId: string
  url: string
  postedAt: string // OBRIGATÓRIO agora
}

interface Props {
  link: SocialLink
  socialNetworks: SocialNetworkData[]
  onUpdate: (field: keyof SocialLink, value: string) => void
  onRemove: () => void
}

export function SocialNetworkLink({
  link, socialNetworks, onUpdate, onRemove,
}: Props) {
  return (
    <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label>Rede</Label>
        <Select
          value={link.socialNetworkId}
          onValueChange={(v) => onUpdate("socialNetworkId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a rede" />
          </SelectTrigger>
          <SelectContent>
            {socialNetworks.map((sn) => (
              <SelectItem key={sn.id ?? sn.name} value={sn.id ?? sn.name}>
                {sn.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>URL do vídeo</Label>
        <Input
          placeholder="https://..."
          value={link.url}
          onChange={(e) => onUpdate("url", e.target.value)}
          required
        />
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <Label>Data de postagem</Label>
          <Input
            type="date"
            value={link.postedAt}
            onChange={(e) => onUpdate("postedAt", e.target.value)}
            required
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
          aria-label="Remover rede"
        >
          <FiTrash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
