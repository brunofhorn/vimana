import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVideo,
  deleteVideo,
  getVideoById,
  getVideos,
  putVideoSocial,
  updateVideo,
} from "./video";

function mockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("video service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("getVideos should serialize query params and return paginated payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(200, {
        items: [],
        total: 0,
        page: 2,
        pageSize: 20,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getVideos({
      query: "abc",
      social: "sn-1",
      postedDate: "2026-02-17",
      publi: "S",
      repost: "N",
      order: "asc",
      page: 2,
      pageSize: 20,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/video?query=abc&social=sn-1&postedDate=2026-02-17&publi=S&repost=N&order=asc&page=2&pageSize=20"
    );
    expect(result.total).toBe(0);
    expect(result.page).toBe(2);
  });

  it("getVideoById should throw API message when request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(404, { message: "Video nao encontrado" }))
    );

    await expect(getVideoById("v1")).rejects.toThrow("Video nao encontrado");
  });

  it("createVideo should throw fallback message when API returns invalid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("invalid", { status: 500, headers: { "Content-Type": "text/plain" } })
      )
    );

    await expect(
      createVideo({
        title: "Video",
        description: "",
        tags: [],
        is_repost: false,
        is_sponsored: false,
        cover_image_url: "",
        raw_video_url: "",
        links: [
          {
            social_network_id: "sn1",
            url: "https://example.com",
            posted_at: new Date("2026-02-17T00:00:00.000Z"),
          },
        ],
      })
    ).rejects.toThrow("Falha ao criar video");
  });

  it("updateVideo should return updated payload on success", async () => {
    const payload = { id: "v1", title: "Updated", links: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(200, payload)));

    const result = await updateVideo("v1", {
      title: "Updated",
      description: "",
      tags: [],
      is_repost: false,
      is_sponsored: false,
      cover_image_url: "",
      raw_video_url: "",
      links: [
        {
          social_network_id: "sn1",
          url: "https://example.com",
          posted_at: new Date("2026-02-17T00:00:00.000Z"),
        },
      ],
    });

    expect(result.id).toBe("v1");
  });

  it("putVideoSocial should throw API message on conflict", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockResponse(409, {
          message: "Ja existe uma postagem para essa rede neste video.",
        })
      )
    );

    await expect(
      putVideoSocial("v1", {
        links: [
          {
            social_network_id: "sn1",
            url: "https://example.com",
            posted_at: "2026-02-17",
          },
        ],
      })
    ).rejects.toThrow("Ja existe uma postagem para essa rede neste video.");
  });

  it("deleteVideo should throw fallback when API sends empty body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(deleteVideo("v1")).rejects.toThrow("Falha ao remover o video");
  });
});
