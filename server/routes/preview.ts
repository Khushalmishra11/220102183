import { RequestHandler } from "express";
import { z } from "zod";
import { PreviewRequest, PreviewResponse } from "@shared/api";

const schema = z.object({ url: z.string().url() });

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 32);
}

export const handlePreview: RequestHandler = async (req, res) => {
  const parse = schema.safeParse(req.body as PreviewRequest);
  if (!parse.success) return res.status(400).json({ error: "Invalid url" });
  const { url } = parse.data;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000);
    const r = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(id);
    const text = await r.text();
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    const u = new URL(url);
    const parts = [u.hostname.replace(/^www\./, ""), ...u.pathname.split("/").filter(Boolean)];
    const guesses = new Set<string>();
    if (title) guesses.add(slugify(title));
    parts.forEach((p) => guesses.add(slugify(p)));
    guesses.add(slugify(u.hostname.replace(/^www\./, "")));

    const suggestions = Array.from(guesses).filter(Boolean).slice(0, 5);
    const response: PreviewResponse = { title, suggestions };
    res.json(response);
  } catch (e) {
    const u = new URL(url);
    const response: PreviewResponse = {
      suggestions: [slugify(u.hostname.replace(/^www\./, ""))].filter(Boolean),
    };
    res.json(response);
  }
};
