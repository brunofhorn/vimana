import { ISocialNetwork, SocialNetworkUpdateInput } from "@/interfaces/social-networks";
import { SocialNetworksFormCreateValues } from "@/schemas/social";
import { getHttpErrorMessage } from "@/services/http-error";
import { getApiJsonHeaders } from "@/services/http-headers";

export async function getSocialNetworks() {
  const res = await fetch("/api/social", {
    method: "GET",
    headers: getApiJsonHeaders(),
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
    headers: getApiJsonHeaders(),
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
    headers: getApiJsonHeaders(),
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
    headers: getApiJsonHeaders(),
  });

  if (!res.ok) {
    throw new Error(
      await getHttpErrorMessage(res, "Falha ao excluir a rede social.")
    );
  }
}
