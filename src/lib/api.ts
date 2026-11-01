import type { Envelope } from "./types";

const BASE_DEFAULT = "http://localhost:3000/api/v1";

export class ApiError extends Error {
  readonly kode: string;
  readonly status: number;

  constructor(kode: string, pesan: string, status = 500) {
    super(pesan);
    this.name = "ApiError";
    this.kode = kode;
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  return (process.env.API_BASE_URL || BASE_DEFAULT).replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

export async function fetchApiEnvelope<T>(
  path: string,
  options: FetchOptions = {},
): Promise<Envelope<T>> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers ?? {}),
      },
      next: options.next ?? { revalidate: 3600 },
    });
  } catch {
    throw new ApiError(
      "jaringan",
      "Data belum bisa dimuat. Periksa koneksi lalu coba lagi.",
      503,
    );
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const galat =
      body && typeof body === "object" && "galat" in body
        ? (body as { galat?: { kode?: string; pesan?: string } }).galat
        : undefined;
    throw new ApiError(
      galat?.kode ?? "galat_internal",
      galat?.pesan ?? "Data belum bisa dimuat. Coba lagi.",
      response.status,
    );
  }

  if (!body || typeof body !== "object" || !("data" in body)) {
    throw new ApiError(
      "respons_tidak_valid",
      "Respons API tidak sesuai format yang diharapkan.",
      502,
    );
  }

  return body as Envelope<T>;
}

export async function fetchApiData<T>(path: string): Promise<T> {
  const envelope = await fetchApiEnvelope<T>(path);
  return envelope.data;
}

export async function cobaAmbil<T>(path: string): Promise<T | null> {
  try {
    return await fetchApiData<T>(path);
  } catch {
    return null;
  }
}
