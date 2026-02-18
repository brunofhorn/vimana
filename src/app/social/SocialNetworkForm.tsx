"use client"

import { Button } from "@/components/button";
import { IconSelect } from "@/components/icon-selector";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { useLoadingsContext } from "@/context/LoadingsContext";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { SocialNetworkFormCreateSchema, SocialNetworksFormCreateValues } from "@/schemas/social";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FiCheck, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

export function SocialNetworkForm() {
  const { handleLoadings } = useLoadingsContext();
  const { createSocialNetwork } = useSocialNetworkContext();
  const form = useForm<SocialNetworksFormCreateValues>({
    resolver: zodResolver(SocialNetworkFormCreateSchema),
    defaultValues: { name: "", url: "", icon: "" },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (socialData: SocialNetworksFormCreateValues) => {
    try {
      handleLoadings({
        key: "social",
        value: true,
      });

      await createSocialNetwork(socialData);
      form.reset();
      toast.success("Sucesso!", {
        description: "A rede social foi cadastrada com sucesso.",
      });
    } catch (error) {
      console.error("[SOCIAL_NETWORKS][CREATE]", error);
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao tentar cadastrar a rede social.";
      toast.error("Erro!", {
        description: message,
      });
    } finally {
      handleLoadings({
        key: "social",
        value: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Ex: YouTube, Instagram, TikTok" {...register("name")} />
          {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="url">URL Base</Label>
          <Input id="url" type="url" placeholder="https://..." {...register("url")} />
          {errors.url && <span className="text-xs text-red-600">{errors.url.message}</span>}
        </div>

        <div className="flex flex-col gap-3">
          <Label>Icone</Label>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <IconSelect
                selectedIcon={field.value}
                onIconSelect={field.onChange}
                placeholder="Selecione o icone"
                searchPlaceholder="Buscar rede social..."
                groupLabel="Redes sociais"
                className="w-full placeholder:text-white text-white"
              />
            )}
          />
          {errors.icon && <span className="text-xs text-red-600">{errors.icon.message}</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant={"default"} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <FiLoader />
              <span>Cadastrando...</span>
            </>
          ) : (
            <>
              <FiCheck />
              <span>Criar</span>
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
          <span>Cancelar</span>
        </Button>
      </div>
    </form>
  );
}
