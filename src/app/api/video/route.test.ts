import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const findMany = vi.fn();
  const count = vi.fn();
  const create = vi.fn();
  const transaction = vi.fn(async (ops: Array<Promise<unknown>>) =>
    Promise.all(ops)
  );
  const handleErrorResponse = vi.fn();

  return { findMany, count, create, transaction, handleErrorResponse };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    video: {
      findMany: mocks.findMany,
      count: mocks.count,
      create: mocks.create,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/api-error", () => ({
  handleErrorResponse: mocks.handleErrorResponse,
}));

import { GET, POST } from "./route";

function makeReq(url: string) {
  return { nextUrl: new URL(url) } as never;
}

function makePostReq(body: unknown) {
  return {
    json: async () => body,
  } as Request;
}

describe("GET /api/video", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies defaults for invalid page/pageSize and returns paginated response", async () => {
    mocks.findMany.mockResolvedValueOnce([]);
    mocks.count.mockResolvedValueOnce(0);

    const res = await GET(makeReq("http://localhost/api/video?page=-1&pageSize=0"));
    const body = await res.json();

    expect(mocks.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: "desc" },
        skip: 0,
        take: 20,
        where: {},
      })
    );
    expect(body).toMatchObject({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
  });

  it("builds where clause with filters and serializes links", async () => {
    mocks.findMany.mockResolvedValueOnce([
      {
        id: "v1",
        title: "Video 1",
        description: "Desc",
        tags: ["  tag-a ", "tag-b"],
        is_repost: false,
        is_sponsored: true,
        cover_image_url: null,
        raw_video_url: null,
        created_at: new Date("2026-02-17T10:00:00.000Z"),
        updated_at: new Date("2026-02-17T10:00:00.000Z"),
        links: [
          {
            id: "l1",
            video_id: "v1",
            socialnetwork_id: "sn1",
            url: "https://example.com",
            posted_at: new Date("2026-02-17T12:00:00.000Z"),
            social_network: { id: "sn1", name: "Instagram", icon: "Instagram" },
          },
        ],
      },
    ]);
    mocks.count.mockResolvedValueOnce(17);

    const res = await GET(
      makeReq(
        "http://localhost/api/video?query=abc&social=sn1&postedDate=2026-02-17&publi=S&repost=N&order=asc&page=2&pageSize=10"
      )
    );
    const body = await res.json();

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: "asc" },
        skip: 10,
        take: 10,
        where: expect.objectContaining({
          is_sponsored: true,
          is_repost: false,
          OR: expect.any(Array),
          links: {
            some: expect.objectContaining({
              socialnetwork_id: "sn1",
              posted_at: expect.objectContaining({
                gte: new Date("2026-02-17T00:00:00.000Z"),
                lt: new Date("2026-02-18T00:00:00.000Z"),
              }),
            }),
          },
        }),
      })
    );

    expect(body.total).toBe(17);
    expect(body.page).toBe(2);
    expect(body.pageSize).toBe(10);
    expect(body.items[0].tags).toEqual(["tag-a", "tag-b"]);
    expect(body.items[0].links[0].social_network_id).toBe("sn1");
    expect(body.items[0].links[0].socialnetwork_id).toBeUndefined();
  });

  it("supports pageSize=ALL without skip/take", async () => {
    mocks.findMany.mockResolvedValueOnce([]);
    mocks.count.mockResolvedValueOnce(0);

    const res = await GET(makeReq("http://localhost/api/video?pageSize=ALL"));
    const body = await res.json();

    const args = mocks.findMany.mock.calls[0][0];
    expect(args.skip).toBeUndefined();
    expect(args.take).toBeUndefined();
    expect(body.pageSize).toBe("ALL");
  });

  it("delegates to handleErrorResponse when GET fails", async () => {
    const fallback = Response.json(
      { message: "fallback from handler" },
      { status: 500 }
    );

    mocks.findMany.mockRejectedValueOnce(new Error("db down"));
    mocks.handleErrorResponse.mockReturnValueOnce(fallback);

    const res = await GET(makeReq("http://localhost/api/video"));
    const body = await res.json();

    expect(mocks.handleErrorResponse).toHaveBeenCalledTimes(1);
    expect(body.message).toBe("fallback from handler");
  });
});

describe("POST /api/video", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates video and serializes link field names", async () => {
    mocks.create.mockResolvedValueOnce({
      id: "v1",
      title: "Titulo",
      description: null,
      tags: ["  tag-1 ", "tag-2"],
      is_repost: false,
      is_sponsored: true,
      cover_image_url: null,
      raw_video_url: null,
      created_at: new Date("2026-02-17T10:00:00.000Z"),
      updated_at: new Date("2026-02-17T10:00:00.000Z"),
      links: [
        {
          id: "l1",
          video_id: "v1",
          socialnetwork_id: "sn1",
          url: "https://example.com",
          posted_at: new Date("2026-02-17T10:00:00.000Z"),
          social_network: { id: "sn1", name: "Instagram", icon: "Instagram" },
        },
      ],
    });

    const res = await POST(
      makePostReq({
        title: "Titulo",
        description: "",
        tags: ["tag-1", "tag-2"],
        is_repost: false,
        is_sponsored: true,
        cover_image_url: "",
        raw_video_url: "",
        links: [
          {
            social_network_id: "sn1",
            url: "https://example.com",
            posted_at: "2026-02-17",
          },
        ],
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(body.links[0].social_network_id).toBe("sn1");
    expect(body.links[0].socialnetwork_id).toBeUndefined();
  });

  it("returns 400 for invalid payload", async () => {
    const res = await POST(makePostReq({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Dados invÃ¡lidos");
    expect(Array.isArray(body.issues)).toBe(true);
  });

  it("returns 500 for unexpected errors", async () => {
    mocks.create.mockRejectedValueOnce(new Error("unknown fail"));

    const res = await POST(
      makePostReq({
        title: "Titulo",
        description: "",
        tags: ["tag-1"],
        is_repost: false,
        is_sponsored: false,
        cover_image_url: "",
        raw_video_url: "",
        links: [
          {
            social_network_id: "sn1",
            url: "https://example.com",
            posted_at: "2026-02-17",
          },
        ],
      })
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Erro ao criar vÃ­deo");
  });
});
