import { useState } from "react"
import { FiX } from "react-icons/fi"

export function InputTags({
    value,
    onChange,
    placeholder = "Digite e pressione Enter",
}: {
    value: string[]
    onChange: (next: string[]) => void
    placeholder?: string
}) {
    const [input, setInput] = useState("")

    const addTag = (raw: string) => {
        const t = raw.trim()
        if (!t) return
        if (value.includes(t)) {
            setInput("")
            return
        }
        onChange([...value, t])
        setInput("")
    }

    const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag))

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
            e.preventDefault()
            addTag(input)
        } else if (e.key === "Backspace" && input.length === 0 && value.length) {
            e.preventDefault()
            onChange(value.slice(0, -1))
        }
    }

    return (
        <div className="rounded-md border p-2">
            <div className="flex flex-wrap items-center gap-2">
                {value.map((tag) => (
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
                        >
                            <FiX className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className="min-w-[160px] flex-1 bg-transparent p-1 text-sm outline-none"
                />
            </div>
        </div>
    )
}