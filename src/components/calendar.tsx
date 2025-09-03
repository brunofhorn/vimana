// components/calendar.tsx
"use client"

import * as React from "react"
import {
  DayPicker,
  type DayPickerProps,
  type NavProps,
} from "react-day-picker"
import "react-day-picker/dist/style.css" // PRECISA para o layout em grid
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Locale as DfnsLocale } from "date-fns"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale: rdpLocale, // <- locale do DayPicker (Partial<Locale>)
  ...props
}: CalendarProps) {
  // Locale "completo" para usar no date-fns/format
  const dfnsLocale = (rdpLocale ?? ptBR) as unknown as DfnsLocale

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // locale parcial para o DayPicker (ok)
      locale={rdpLocale ?? ptBR}
      // formatters do cabeçalho e weekday usando Locale COMPLETO
      formatters={{
        formatCaption: (month) =>
          // mês por extenso + ano em pt-BR
          format(month, "LLLL yyyy", { locale: dfnsLocale }),
        formatWeekdayName: (day) =>
          // nomes curtos: dom, seg, ter...
          format(day, "eee", { locale: dfnsLocale }),
      }}
      className={cn("p-3", className)}
      classNames={{
        // não sobrescreva grid/tabela: o CSS base cuida
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-medium capitalize",
        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",

        // estilo dos dias
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",

        ...classNames,
      }}
      components={{
        // v9: Nav só tem os handlers/meses
        Nav: ({ onPreviousClick, onNextClick, previousMonth, nextMonth }: NavProps) => (
          <div className="flex items-center">
            <button
              type="button"
              disabled={!previousMonth}
              onClick={onPreviousClick}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
              )}
              aria-label="Mês anterior"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!nextMonth}
              onClick={onNextClick}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
              )}
              aria-label="Próximo mês"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        ),
      }}
      {...props}
    />
  )
}
