import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { FiExternalLink, FiTrash2 } from "react-icons/fi"
import { getBrandIcon } from "@/components/social-icons"
import { Video } from "@/interfaces/videos"

type AnyLink = {
  id: string
  url: string
  socialNetwork?: { name: string; icon: string }
  social_network?: { name: string; icon: string }
}

/** Garante um Date a partir de Date | string (ISO) | undefined */
function toDate(d?: Date | string): Date {
  if (d instanceof Date) return d
  if (typeof d === "string") return new Date(d)
  return new Date()
}

/** Normaliza tags (Json do SQLite vira array) */
function normalizeTags(tags: unknown): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean)
  }
  if (typeof tags === "string") {
    // pode ser um JSON stringificado ("[\"tag1\",\"tag2\"]") ou uma string "tag1, tag2"
    const s = tags.trim()
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) {
          return arr.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean)
        }
      } catch {}
    }
    return s.split(",").map((t) => t.trim()).filter(Boolean)
  }
  return []
}

export const VideoCard = ({ video }: { video: Video }) => {
  const createdAt = toDate((video as Video).createdAt ?? (video as Video).created_at)
  const tags = normalizeTags((video as Video).tags)

  const links: AnyLink[] =
    ((video as Video).socialNetworks as AnyLink[] | undefined) ??
    ((video as Video).links as AnyLink[] | undefined) ??
    []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{(video as Video).title}</CardTitle>
            {(video as Video).description && (
              <p className="mt-1 text-sm text-muted-foreground">{(video as Video).description}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <Badge key={`${tag}-${i}`} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Publicado em:</h4>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">Não publicado em redes sociais</p>
          ) : (
            <div className="space-y-2">
              {links.map((link) => {
                const sn = link.socialNetwork ?? link.social_network
                const Icon = getBrandIcon(sn?.icon)
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-md bg-muted p-2"
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="text-sm font-medium">{sn?.name ?? "Rede"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <FiExternalLink className="h-3 w-3" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {}}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        aria-label="Remover publicação"
                      >
                        <FiTrash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Criado em {createdAt.toLocaleDateString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  )
}
