import { RequestHandler } from "express";
import { z } from "zod";
import { ShortenRequest, ShortenResponse, LinkInfo } from "@shared/api";
import { saveLink, getLink } from "./store";

const schema = z.object({
  url: z.string().url(),
  slug: z
    .string()
    .regex(/^[a-zA-Z0-9-_]{3,32}$/)
    .optional()
    .nullable(),
  expireAt: z
    .string()
    .datetime()
    .optional()
    .nullable(),
});

function randomCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function buildBaseUrl(req: any) {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host = req.get("host");
  return `${proto}://${host}`;
}

export const handleShorten: RequestHandler = (req, res) => {
  const parse = schema.safeParse(req.body as ShortenRequest);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid request", details: parse.error.flatten() });
  }
  const { url, slug, expireAt } = parse.data;

  // If slug provided, ensure not taken
  let code = slug ?? randomCode(6);
  if (slug && getLink(slug)) {
    return res.status(409).json({ error: "Slug already in use" });
  }
  // Ensure random code is unique
  if (!slug) {
    while (getLink(code)) code = randomCode(6);
  }

  const createdAt = new Date().toISOString();
  const info: LinkInfo = {
    code,
    url,
    createdAt,
    expiresAt: expireAt ?? null,
    clicks: 0,
  };
  saveLink(info);

  const shortUrl = `${buildBaseUrl(req)}/r/${code}`;
  const response: ShortenResponse = {
    code,
    shortUrl,
    url,
    createdAt,
    expiresAt: info.expiresAt ?? null,
  };
  res.status(201).json(response);
};
