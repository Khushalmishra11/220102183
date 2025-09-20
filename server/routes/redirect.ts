import { RequestHandler } from "express";
import { getLink, incrementClicks, isExpired } from "./store";

export const handleRedirect: RequestHandler = (req, res) => {
  const code = req.params.code;
  if (!code) return res.status(400).send("Missing code");
  const link = getLink(code);
  if (!link) return res.status(404).send("Link not found");
  if (isExpired(link)) return res.status(410).send("Link expired");

  incrementClicks(code);
  res.redirect(302, link.url);
};
