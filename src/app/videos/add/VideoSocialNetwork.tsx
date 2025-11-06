"use client"

import * as React from "react"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/select"
import { FiTrash2 } from "react-icons/fi"
import { ISocialNetwork } from "@/interfaces/social-networks"
import { InputDatePicker } from "@/components/input-date-picker"
import { VideoFormCreateInput } from "@/schemas/video"
import { Controller, useFormContext } from "react-hook-form"

export interface SocialLink {
  socialNetworkId: string
  url: string
  postedAt: Date
}

type Props = {
  index: number;
  socialNetworks: ISocialNetwork[];
  onRemove: () => void;
};

export default function VideoSocialNetwork({ index, socialNetworks, onRemove }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<VideoFormCreateInput>();

  const base = `links.${index}` as const;

  return (
    <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
      {/* Rede */}
      <div className="flex flex-col gap-2">
        <Label>Rede</Label>
        <Controller
          name={`${base}.socialnetwork_id`}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || undefined} // evita string vazia para Radix
              onValueChange={(v) => field.onChange(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a rede" />
              </SelectTrigger>
              <SelectContent>
                {socialNetworks.map((sn) => (
                  <SelectItem key={sn.id} value={sn.id}>
                    {sn.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.links?.[index]?.socialnetwork_id && (
          <span className="text-xs text-red-600">
            {errors.links[index]?.socialnetwork_id?.message as string}
          </span>
        )}
      </div>

      {/* URL */}
      <div className="flex flex-col gap-2">
        <Label>URL do vídeo</Label>
        <Input
          placeholder="https://..."
          {...register(`${base}.url`)}
        />
        {errors.links?.[index]?.url && (
          <span className="text-xs text-red-600">
            {errors.links[index]?.url?.message as string}
          </span>
        )}
      </div>

      {/* Data + Remover */}
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <Label>Data de postagem</Label>
          <Controller
            name={`${base}.posted_at`}
            control={control}
            render={({ field }) => (
              <InputDatePicker
                value={field.value as Date || null}
                onChange={(d) => field.onChange(d ?? new Date())}
                className="w-full min-w-[160px] tabular-nums"
                isClearable={false}
              />
            )}
          />
          {errors.links?.[index]?.posted_at && (
            <span className="text-xs text-red-600">
              {errors.links[index]?.posted_at?.message as string}
            </span>
          )}
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
