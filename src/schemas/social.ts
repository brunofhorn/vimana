import z from "zod";

export const SocialNetworkFormCreateSchema = z.object({
  name: z.string().min(2, "O nome da rede social precisa ter mais que 2 caracteres."),
  url: z.url("A URL da rede social é obrigatória."),
  icon: z.string().min(1, "É necessário selecionar o ícone da rede social."),
});

export type SocialNetworksFormCreateValues = z.infer<typeof SocialNetworkFormCreateSchema>
