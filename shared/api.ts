
export interface DemoResponse {
  message: string;
}

/** URL Shortener types */
export interface ShortenRequest {
  url: string;
  slug?: string | null;
  /** ISO timestamp when the link expires */
  expireAt?: string | null;
}

export interface ShortenResponse {
  code: string;
  shortUrl: string;
  url: string;
  createdAt: string; // ISO
  expiresAt?: string | null;
}

export interface PreviewRequest {
  url: string;
}

export interface PreviewResponse {
  title?: string;
  suggestions: string[];
}

export interface LinkInfo {
  code: string;
  url: string;
  createdAt: string; // ISO
  expiresAt?: string | null;
  clicks: number;
}
