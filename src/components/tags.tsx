"use client";

import * as React from "react";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils"; // se quiser estilizar como seu Input

type BaseProps = {
    /** Estado controlado (opcional). Se não passar, o componente gerencia internamente. */
    value?: string[];
    /** Callback quando as tags mudarem (opcional). */
    onChange?: (next: string[]) => void;
    placeholder?: string;
    /** Conteúdo extra de classe para o container */
    className?: string;
};

/**
 * Props que o RHF injeta via {...register("tags")}, e que repassamos ao input hidden.
 * Removemos 'value' e 'onChange' (string) do HTMLInput porque aqui trabalhamos com string[].
 */
type RHFBridgeProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
> &
    BaseProps;

export const Tags = React.forwardRef<HTMLInputElement, RHFBridgeProps>(
    (
        {
            value,
            onChange,
            placeholder = "Digite e pressione Enter",
            className,
            name,      // vindo do register
            id,        // para <label htmlFor>
            onBlur,    // vindo do register
            disabled,
            ...rest    // qualquer outra prop para o input hidden (ex.: required)
        },
        ref
    ) => {
        const [input, setInput] = React.useState("");
        const [internal, setInternal] = React.useState<string[]>([]);

        // Se 'value' vier, componente fica controlado; senão usa 'internal'
        const tags = value ?? internal;

        // helper para emitir mudanças para quem controla (pai e RHF)
        const emitChange = React.useCallback(
            (next: string[]) => {
                // controla interno se for não-controlado
                if (value === undefined) setInternal(next);
                // avisa o pai (controlado)
                onChange?.(next);
            },
            [onChange, value]
        );

        const addTag = (raw: string) => {
            const t = raw.trim();
            if (!t) return;
            if (tags.includes(t)) {
                setInput("");
                return;
            }
            emitChange([...tags, t]);
            setInput("");
        };

        const removeTag = (tag: string) => {
            emitChange(tags.filter((t) => t !== tag));
        };

        const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
            if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
                e.preventDefault();
                addTag(input);
            } else if (e.key === "Backspace" && input.length === 0 && tags.length) {
                e.preventDefault();
                emitChange(tags.slice(0, -1));
            }
        };

        // Valor serializado que o RHF vai ler do input hidden
        const serialized = React.useMemo(() => JSON.stringify(tags), [tags]);

        return (
            <div className={cn("rounded-md border p-2", className)}>
                {/* input hidden que o RHF registra */}
                <input
                    type="hidden"
                    name={name}
                    value={serialized}
                    onBlur={onBlur}
                    ref={ref}
                    disabled={disabled}
                    id={id}
                    {...rest}
                />

                <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                        >
                            {tag}
                            <button
                                type="button"
                                className="opacity-70 hover:opacity-100"
                                onClick={() => removeTag(tag)}
                                aria-label={`Remover ${tag}`}
                                disabled={disabled}
                            >
                                <FiX className="h-3 w-3" />
                            </button>
                        </span>
                    ))}

                    <input
                        id={id}
                        disabled={disabled}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        className="min-w-[160px] flex-1 bg-transparent p-1 text-sm outline-none"
                    />
                </div>
            </div>
        );
    }
);

Tags.displayName = "Tags";
