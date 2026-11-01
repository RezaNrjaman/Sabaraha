import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiUrl, fetchApiData, fetchApiEnvelope } from "@/lib/api";

const asli = process.env.API_BASE_URL;

afterEach(() => {
  process.env.API_BASE_URL = asli;
  vi.unstubAllGlobals();
});

describe("klien API", () => {
  it("membangun URL dari environment dan path", () => {
    process.env.API_BASE_URL = "https://contoh.test/api/v1/";
    expect(apiUrl("/ringkasan")).toBe("https://contoh.test/api/v1/ringkasan");
    expect(apiUrl("ringkasan")).toBe("https://contoh.test/api/v1/ringkasan");
  });

  it("mengambil data dan meneruskan revalidate 3600", async () => {
    process.env.API_BASE_URL = "https://contoh.test/api/v1";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: { nilai: 111 }, meta: { sumber: "BI" } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchApiData<{ nilai: number }>("/ringkasan");
    expect(data.nilai).toBe(111);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://contoh.test/api/v1/ringkasan",
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  it("mengembalikan envelope lengkap", async () => {
    process.env.API_BASE_URL = "https://contoh.test/api/v1";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [],
            meta: { sumber: "BI", tanggal_data_terakhir: "2026-10-20" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const envelope = await fetchApiEnvelope<unknown[]>("/komoditas");
    expect(envelope.meta.sumber).toBe("BI");
  });

  it("melempar ApiError dari bentuk galat", async () => {
    process.env.API_BASE_URL = "https://contoh.test/api/v1";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ galat: { kode: "validasi", pesan: "dari tidak valid" } }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(fetchApiData("/harga")).rejects.toMatchObject({
      name: "ApiError",
      kode: "validasi",
      status: 400,
    });
  });

  it("melempar ApiError saat jaringan gagal", async () => {
    process.env.API_BASE_URL = "https://contoh.test/api/v1";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(fetchApiData("/info")).rejects.toBeInstanceOf(ApiError);
  });
});
