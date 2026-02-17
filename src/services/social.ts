import { ISocialNetwork, SocialNetworkUpdateInput } from "@/interfaces/social-networks";
import { SocialNetworksFormCreateValues } from "@/schemas/social";
import { getHttpErrorMessage } from "@/services/http-error";

export async function getSocialNetworks() {
  const res = await fetch("/api/social", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      await getHttpErrorMessage(res, "Falha ao buscar redes sociais.")
    );
  }

  const data = (await res.json()) as ISocialNetwork[];

  return data;
}

export async function postSocialNetwork(
  social: SocialNetworksFormCreateValues
) {
  const res = await fetch("/api/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(social),
  });

  if (!res.ok) {
    throw new Error(
      await getHttpErrorMessage(res, "Falha ao criar a rede social.")
    );
  }

  const created = (await res.json()) as ISocialNetwork;

  return created;
}

export async function putSocialNetwork({ id, data }: SocialNetworkUpdateInput) {
  const res = await fetch(`/api/social/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(
      await getHttpErrorMessage(res, "Falha ao atualizar a rede social.")
    );
  }

  const updated = (await res.json()) as ISocialNetwork;

  return updated;
}

export async function deleteSocialNetwork(id: string) {
  const res = await fetch(`/api/social/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      await getHttpErrorMessage(res, "Falha ao excluir a rede social.")
    );
  }
}
