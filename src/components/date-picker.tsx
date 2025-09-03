/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import DatePicker, {
  CalendarContainer,
  registerLocale,
  setDefaultLocale,
} from "react-datepicker"
import {ptBR} from "date-fns/locale/pt-BR"
import { format, isSameDay } from "date-fns"
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi"

import { Input } from "@/components/input"
import { Button } from "@/components/button"
import { buttonVariants } from "@/components/button"
import { cn } from "@/lib/utils"

registerLocale("pt-BR", ptBR)
setDefaultLocale("pt-BR")

type Props = {
  value: Date | null
  onChange: (d: Date | null) => void
  placeholder?: string
  className?: string
  minDate?: Date
  maxDate?: Date
  isClearable?: boolean
}

const DPInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full">
      <Input ref={ref} {...props} className={cn("pr-10", className)} />
      <FiCalendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
)
DPInput.displayName = "DPInput"

export function DatePickerShadcn({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  className,
  minDate,
  maxDate,
  isClearable = true,
}: Props) {
  // container com rodapé custom (Hoje/Limpar)
  const Container = (p: any) => (
    <CalendarContainer {...p}>
      <div className={cn("rounded-md border bg-popover p-2 shadow-md", p.className)}>
        {p.children}
        <div className="mt-2 border-t pt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Limpar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onChange(new Date())}>
            Hoje
          </Button>
        </div>
      </div>
    </CalendarContainer>
  )

  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      locale="pt-BR"
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      isClearable={isClearable}
      minDate={minDate}
      maxDate={maxDate}
      // visual do popover
      popperClassName="z-50"
      showPopperArrow={false}
      popperPlacement="bottom-start"
      calendarContainer={Container}
      customInput={<DPInput className={className} />}
      // header custom (mês/ano + setas)
      renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
        <div className="mb-2 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0 opacity-80")}
            aria-label="Mês anterior"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium capitalize">
            {format(date, "LLLL yyyy", { locale: ptBR })}
          </div>
          <button
            type="button"
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0 opacity-80")}
            aria-label="Próximo mês"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      // classes extras nos dias e cabeçalho (pra casar com shadcn)
      weekDayClassName={() => "text-xs font-normal text-muted-foreground"}
      dayClassName={(d) =>
        cn(
          "mx-auto h-9 w-9 rounded-md text-sm leading-9 hover:bg-accent hover:text-accent-foreground",
          value && isSameDay(d, value) && "bg-primary text-primary-foreground"
        )
      }
    />
  )
}
