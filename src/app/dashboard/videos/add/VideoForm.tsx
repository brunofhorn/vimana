"use client"

import { useState } from "react"
import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Textarea } from "@/components/textarea"
import { Switch } from "@/components/switch"
import { FiPlus, FiX } from "react-icons/fi"
import type { SocialNetworkData } from "@/interfaces/social-networks"
import { SocialLink, SocialNetworkLink } from "@/app/dashboard/social/SocialNetworkLink"

// -------- Tags (chips) ----------
function TagsInput({
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

// -------- VideoForm ----------
interface VideoFormProps {
  onSuccess: () => void
  socialNetworks: SocialNetworkData[] // passe sua lista real (id, name, url, icon)
}

export const VideoForm = ({ onSuccess, socialNetworks }: VideoFormProps) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isRepost, setIsRepost] = useState(false)
  const [isSponsored, setIsSponsored] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [rawVideoUrl, setRawVideoUrl] = useState("")

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTags([])
    setIsRepost(false)
    setIsSponsored(false)
    setSocialLinks([])
    setCoverImageUrl("")
    setRawVideoUrl("")
  }

  const addSocialLink = () => {
    // postedAt é obrigatório no schema => já coloca hoje por padrão (YYYY-MM-DD)
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")

    setSocialLinks((prev) => [
      ...prev,
      { socialNetworkId: "", url: "", postedAt: `${yyyy}-${mm}-${dd}` },
    ])
  }

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    setSocialLinks((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      window.alert("Título é obrigatório.")
      return
    }

    // validação mínima dos links (todos os campos obrigatórios)
    for (const l of socialLinks) {
      if (!l.socialNetworkId || !l.url || !l.postedAt) {
        window.alert("Preencha rede, URL e data de postagem em todas as linhas.")
        return
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      tags,
      isRepost,
      isSponsored,
      coverImageUrl: coverImageUrl || undefined,
      rawVideoUrl: rawVideoUrl || undefined,
      links: socialLinks,
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Falha ao criar vídeo")

      resetForm()
      onSuccess()
    } catch (err) {
      console.error(err)
      window.alert("Não foi possível criar o vídeo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Vídeo</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do vídeo"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do vídeo"
              rows={3}
            />
          </div>

          <div>
            <Label>Tags</Label>
            <TagsInput value={tags} onChange={setTags} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-sm font-medium">É repostagem?</Label>
                <p className="text-xs text-muted-foreground">
                  Marque se este vídeo já foi postado anteriormente.
                </p>
              </div>
              <Switch checked={isRepost} onCheckedChange={setIsRepost} />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-sm font-medium">É publi?</Label>
                <p className="text-xs text-muted-foreground">
                  Indique se o vídeo é conteúdo patrocinado.
                </p>
              </div>
              <Switch checked={isSponsored} onCheckedChange={setIsSponsored} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cover">Capa (link do Drive)</Label>
                <Input
                  id="cover"
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <Label htmlFor="raw">Vídeo bruto (link do Drive)</Label>
                <Input
                  id="raw"
                  type="url"
                  value={rawVideoUrl}
                  onChange={(e) => setRawVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Redes Sociais</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                <FiPlus className="mr-2 h-4 w-4" />
                Adicionar rede
              </Button>
            </div>

            {socialLinks.map((link, index) => (
              <SocialNetworkLink
                key={index}
                link={link}
                socialNetworks={socialNetworks || []}
                onUpdate={(field, value) => updateSocialLink(index, field, value)}
                onRemove={() => removeSocialLink(index)}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar"}
            </Button>
            <Button type="button" variant="outline" onClick={onSuccess} disabled={submitting}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
