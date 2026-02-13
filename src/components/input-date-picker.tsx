"use client"

import * as React from "react"
import DatePicker, { registerLocale } from "react-datepicker"
import { ptBR } from "date-fns/locale"
import "react-datepicker/dist/react-datepicker.css"

import { Input } from "@/components/input"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

registerLocale("pt-BR", ptBR)

type Props = {
  value: Date | null
  onChange: (date: Date | null) => void
  className?: string
  isClearable?: boolean
}

export function InputDatePicker({
  value,
  onChange,
  className,
  isClearable = false,
}: Props) {
  return (
    <div className="relative w-full">
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        locale="pt-BR"
        isClearable={isClearable}
        popperPlacement="bottom-start"
        portalId="__next"
        wrapperClassName="w-full"
        customInput={
          <Input
            className={cn("w-full pr-10 tabular-nums cursor-pointer", className)}
            readOnly
          />
        }
      />

      {!value && (
        <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      )}
    </div>
  )
}
