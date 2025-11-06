import { z } from "zod";

// URL opcional: aceita "" e transforma para undefined
const urlOrEmpty = z
  .union([
    z.string().url("URL inválida"),
    z.literal("").transform(() => undefined),
  ])
  .optional();

// tags: aceita string[] OU string; sempre sai como string[]
const tagsSchema = z
  .union([
    z.array(z.string().trim().min(1)),
    z.string().transform((s) => {
      const str = s.trim();
      if (!str) return [];
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return parsed.map((t) => String(t)).filter(Boolean);
        }
      } catch {}
      return str
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }),
  ])
  .transform((arr) => arr as string[]) // unifica a saída
  .default([]);

// link
export const VideoLinkCreateSchema = z.object({
  socialnetwork_id: z.string().min(1, "Selecione a rede"),
  url: z.url("URL inválida"),
  posted_at: z.date({ error: "Informe a data" }),
});

// vídeo
export const VideoFormCreateSchema = z
  .object({
    title: z.string().trim().min(1, "Informe o título"),
    description: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((v) => (v && v.length ? v : null)),
    tags: tagsSchema,
    is_repost: z.boolean().default(false),
    is_sponsored: z.boolean().default(false),
    cover_image_url: urlOrEmpty,
    raw_video_url: urlOrEmpty,
    links: z
      .array(
        z.object({
          socialnetwork_id: z.string().min(1, "Selecione a rede"),
          url: z.string().url("URL inválida"),
          posted_at: z.coerce.date({ error: "Informe a data" }),
        })
      )
      .min(1, "Inclua ao menos uma rede"),
  })
  .strict();

export type VideoFormCreateInput = z.input<typeof VideoFormCreateSchema>; // entrada/“crua”
export type VideoFormCreateValues = z.output<typeof VideoFormCreateSchema>;
