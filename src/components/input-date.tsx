"use client"

import * as React from "react"
import { format, parse, isValid, isAfter, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

import { Input } from "@/components/input"
import { Button } from "@/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { Calendar } from "@/components/calendar"
import { FiCalendar, FiX } from "react-icons/fi"

export type DateInputProps = {
    value?: Date
    onChange: (date?: Date) => void
    placeholder?: string
    minDate?: Date
    maxDate?: Date
    disabled?: boolean
    required?: boolean
    id?: string
    name?: string
    className?: string
    /** Deixa o calendário abrir ao focar no input (default: false) */
    openOnFocus?: boolean
}

function toBR(date?: Date) {
    return date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : ""
}

function parseBR(s: string): Date | undefined {
    // aceita apenas "dd/MM/yyyy" com 8 dígitos
    const digits = s.replace(/\D/g, "")
    if (digits.length !== 8) return undefined
    const d = parse(s, "dd/MM/yyyy", new Date(), { locale: ptBR })
    return isValid(d) ? d : undefined
}

function maskBR(s: string) {
    // mantém somente dígitos e coloca as barras
    const d = s.replace(/\D/g, "").slice(0, 8)
    const p1 = d.slice(0, 2)
    const p2 = d.slice(2, 4)
    const p3 = d.slice(4, 8)
    if (d.length <= 2) return p1
    if (d.length <= 4) return `${p1}/${p2}`
    return `${p1}/${p2}/${p3}`
}

export function DateInput({
    value,
    onChange,
    placeholder = "DD/MM/AAAA",
    minDate,
    maxDate,
    disabled,
    required,
    id,
    name,
    className,
    openOnFocus = false,
}: DateInputProps) {
    const [open, setOpen] = React.useState(false)
    const [text, setText] = React.useState(toBR(value))
    const [invalid, setInvalid] = React.useState<string | null>(null)

    // sincroniza quando value externo muda
    React.useEffect(() => {
        setText(toBR(value))
        setInvalid(null)
    }, [value])

    function validateAndCommit(next?: Date) {
        if (!next) {
            setInvalid(null)
            onChange(undefined)
            return
        }
        if (minDate && isBefore(next, minDate)) {
            setInvalid(`Selecione uma data a partir de ${toBR(minDate)}`)
            return
        }
        if (maxDate && isAfter(next, maxDate)) {
            setInvalid(`Selecione uma data até ${toBR(maxDate)}`)
            return
        }
        setInvalid(null)
        onChange(next)
    }

    return (
        <div className={cn("relative", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Input
                            id={id}
                            name={name}
                            inputMode="numeric"
                            placeholder={placeholder}
                            disabled={disabled}
                            required={required}
                            value={text}
                            onChange={(e) => {
                                const v = maskBR(e.target.value)
                                setText(v)
                            }}
                            onFocus={() => {
                                if (openOnFocus && !disabled) setOpen(true)
                            }}
                            onBlur={() => {
                                // tenta converter o que foi digitado
                                const d = parseBR(text)
                                if (!text) {
                                    validateAndCommit(undefined)
                                    return
                                }
                                if (!d) {
                                    setInvalid("Data inválida")
                                    return
                                }
                                validateAndCommit(d)
                                // normaliza a máscara com zeros corretos
                                setText(toBR(d))
                            }}
                            aria-invalid={!!invalid}
                            className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
                        />

                        {/* Botão limpar */}
                        {text && !disabled ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-9 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                onClick={() => {
                                    setText("")
                                    setInvalid(null)
                                    onChange(undefined)
                                }}
                                aria-label="Limpar data"
                            >
                                <FiX className="h-4 w-4" />
                            </Button>
                        ) : null}

                        {/* Botão calendário */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => !disabled && setOpen((o) => !o)}
                            disabled={disabled}
                            aria-label="Abrir calendário"
                        >
                            <FiCalendar className="h-4 w-4" />
                        </Button>
                    </div>
                </PopoverTrigger>

                <PopoverContent className="p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(d) => {
                            setOpen(false)
                            setText(toBR(d))
                            validateAndCommit(d)
                        }}
                        showOutsideDays
                        locale={ptBR}
                        // opcional: limites
                        {...(minDate ? { fromDate: minDate } : {})}
                        {...(maxDate ? { toDate: maxDate } : {})}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {invalid && (
                <p className="mt-1 text-xs text-destructive">{invalid}</p>
            )}
        </div>
    )
}
