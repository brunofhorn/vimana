import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deleteSocialNetwork,
  getSocialNetworks,
  postSocialNetwork,
  putSocialNetwork,
} from "./social";

function mockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("social service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("getSocialNetworks should return array on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockResponse(200, [{ id: "sn1", name: "Instagram", url: "https://instagram.com", icon: "Instagram", created_at: "", updated_at: "" }])
      )
    );

    const result = await getSocialNetworks();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sn1");
  });

  it("postSocialNetwork should throw API error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(409, { message: "Conflito de nome" }))
    );

    await expect(
      postSocialNetwork({
        name: "Instagram",
        url: "https://instagram.com",
        icon: "Instagram",
      })
    ).rejects.toThrow("Conflito de nome");
  });

  it("putSocialNetwork should send only editable payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(200, {
        id: "sn1",
        name: "Instagram",
        url: "https://instagram.com",
        icon: "Instagram",
        created_at: "",
        updated_at: "",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await putSocialNetwork({
      id: "sn1",
      data: {
        name: "Instagram",
        url: "https://instagram.com",
        icon: "Instagram",
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestInit.method).toBe("PUT");
    expect(requestInit.body).toBe(
      JSON.stringify({
        name: "Instagram",
        url: "https://instagram.com",
        icon: "Instagram",
      })
    );
  });

  it("deleteSocialNetwork should throw fallback when response has no json body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    await expect(deleteSocialNetwork("sn1")).rejects.toThrow(
      "Falha ao excluir a rede social."
    );
  });
});
