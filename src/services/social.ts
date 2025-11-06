import { ISocialNetwork } from "@/interfaces/social-networks";
import { SocialNetworksFormCreateValues } from "@/schemas/social";

export async function getSocialNetworks() {
  const res = await fetch("/api/social", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Falha ao buscar redes sociais.");
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
    throw new Error("Falha ao criar a rede social.");
  }

  const created = (await res.json()) as ISocialNetwork;

  return created;
}

export async function putSocialNetwork(social: ISocialNetwork) {
  const res = await fetch(`/api/social/${social.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(social),
  });

  if (!res.ok) {
    throw new Error("Falha ao criar a rede social.");
  }

  const updated = (await res.json()) as ISocialNetwork;

  return updated;
}

export async function deleteSocialNetwork(id: string) {
  const res = await fetch(`/api/social/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  return res;
}
