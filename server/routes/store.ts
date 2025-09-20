import type { LinkInfo } from "@shared/api";

// Simple in-memory store. Replace with a database for production.
const links = new Map<string, LinkInfo>();

export function saveLink(info: LinkInfo) {
  links.set(info.code, info);
}

export function getLink(code: string): LinkInfo | undefined {
  return links.get(code);
}

export function incrementClicks(code: string) {
  const link = links.get(code);
  if (link) {
    link.clicks += 1;
    links.set(code, link);
  }
}

export function isExpired(info: LinkInfo): boolean {
  if (!info.expiresAt) return false;
  return new Date(info.expiresAt).getTime() < Date.now();
}
