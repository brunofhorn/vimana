"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"
import { MdClose } from "react-icons/md"

type TagsInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange"
> & {
  name: string
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (tags: string[]) => void
  dedupe?: boolean
  separators?: string[]
  maxTags?: number
  label?: string
}

function normalizeTag(tag: string) {
  return tag.trim().replace(/\s+/g, " ")
}

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  (
    {
      className,
      name,
      value,
      defaultValue,
      onValueChange,
      dedupe = true,
      separators = [","],
      maxTags,
      label,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    const isControlled = Array.isArray(value)
    const [internalTags, setInternalTags] = React.useState<string[]>(
      defaultValue ?? []
    )
    const tags = isControlled ? (value as string[]) : internalTags

    const [inputValue, setInputValue] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement | null>(null)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const commitTags = React.useCallback(
      (next: string[]) => {
        if (!isControlled) setInternalTags(next)
        onValueChange?.(next)
      },
      [isControlled, onValueChange]
    )

    const addTag = React.useCallback(
      (raw: string) => {
        if (disabled) return
        const tag = normalizeTag(raw)
        if (!tag) return

        if (maxTags !== undefined && tags.length >= maxTags) return

        if (dedupe) {
          const exists = tags.some(
            (t) => t.toLowerCase() === tag.toLowerCase()
          )
          if (exists) return
        }

        commitTags([...tags, tag])
      },
      [commitTags, dedupe, disabled, maxTags, tags]
    )

    const removeTag = React.useCallback(
      (index: number) => {
        if (disabled) return
        const next = tags.filter((_, i) => i !== index)
        commitTags(next)
      },
      [commitTags, disabled, tags]
    )

    const tryCommitFromInput = React.useCallback(() => {
      const raw = inputValue
      const tag = normalizeTag(raw)
      if (!tag) return
      addTag(tag)
      setInputValue("")
    }, [addTag, inputValue])

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      if (e.key === "Enter") {
        e.preventDefault()
        tryCommitFromInput()
        return
      }

      if (separators.includes(e.key)) {
        e.preventDefault()
        tryCommitFromInput()
        return
      }

      if (e.key === "Backspace" && inputValue.length === 0 && tags.length > 0) {
        removeTag(tags.length - 1)
      }
    }

    const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return

      const text = e.clipboardData.getData("text")
      if (!text) return

      const parts = text
        .split(/[,;\n]/g)
        .map(normalizeTag)
        .filter(Boolean)

      if (parts.length <= 1) return

      e.preventDefault()

      let next = [...tags]
      for (const p of parts) {
        if (maxTags !== undefined && next.length >= maxTags) break
        if (dedupe) {
          const exists = next.some((t) => t.toLowerCase() === p.toLowerCase())
          if (exists) continue
        }
        next.push(p)
      }
      commitTags(next)
      setInputValue("")
    }

    return (
      <div className={cn("w-full", className)}>
        {label ? (
          <LabelPrimitive.Root className="mb-2 block text-sm text-white">
            {label}
          </LabelPrimitive.Root>
        ) : null}

        <div
          className={cn(
            `flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-gray-700 dark:border-gray-800
             bg-white/5 px-3 py-1 text-base text-white ring-offset-white/5
             placeholder:text-white/25 focus-within:outline-none focus-within:ring-2
             focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed
             disabled:opacity-50 md:text-sm`,
            disabled && "cursor-not-allowed opacity-50"
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
        >
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border border-gray-700/60 bg-black/20 px-2 py-1 text-sm text-white"
              )}
            >
              <span className="leading-none">{tag}</span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(index)
                }}
                className={cn(
                  "ml-1 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-white/10",
                  disabled && "pointer-events-none"
                )}
                aria-label={`Remover tag ${tag}`}
              >
                <MdClose className="h-3.5 w-3.5" />
              </button>

              <input type="hidden" name={`${name}[]`} value={tag} />
            </span>
          ))}

          <input
            ref={inputRef}
            disabled={disabled}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder={tags.length === 0 ? placeholder : undefined}
            className={cn(
              "min-w-[140px] flex-1 bg-transparent outline-none",
              "placeholder:text-white/25"
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)

TagsInput.displayName = "TagsInput"
