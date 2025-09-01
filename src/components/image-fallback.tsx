// components/ImageWithFallback.tsx
"use client"
import * as React from "react"

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
    sources: string[] // candidatos em ordem de preferência
}

export function ImageWithFallback({ sources, alt, ...imgProps }: Props) {
    const [idx, setIdx] = React.useState(0)
    const src = sources[idx]

    if (!src) return null

    return (
        <img
            {...imgProps}
            alt={alt}
            src={src}
            onError={() => {
                // tenta o próximo candidato, se houver
                setIdx((i) => (i + 1 < sources.length ? i + 1 : i))
            }}
        />
    )
}
