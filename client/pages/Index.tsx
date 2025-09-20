import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { PreviewResponse, ShortenRequest, ShortenResponse } from "@shared/api";

export default function Index() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [days, setDays] = useState<number | "never">("never");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<number | null>(null);

  const expireAt = useMemo(() => {
    if (days === "never") return null;
    const d = new Date();
    d.setDate(d.getDate() + (days as number));
    return d.toISOString();
  }, [days]);

  useEffect(() => {
    if (!url || !/^https?:\/\//i.test(url)) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const r = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = (await r.json()) as PreviewResponse;
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  }, [url]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (!url) return toast.error("Enter a valid URL (https://...)");
    if (!/^https?:\/\//i.test(url)) return toast.error("URL must start with http(s)://");
    setLoading(true);
    try {
      const payload: ShortenRequest = { url, slug: slug || null, expireAt };
      const r = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Failed to shorten URL");
      }
      const data = (await r.json()) as ShortenResponse;
      setResult(data);
      toast.success("Short link created");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative pt-16 pb-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-secondary/50">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              AI-crafted, privacy-first short links
            </div>
            <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight">
              Make long links <span className="bg-gradient-to-b from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">beautiful</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Blink.ai creates lightning-fast short URLs with smart, AI-like slug suggestions. Copy, share, and track in seconds.
            </p>
          </div>

          <Card className="mx-auto mt-10 max-w-3xl backdrop-blur bg-card/80 border-primary/10 shadow-[0_10px_40px_-15px_hsla(258,90%,60%,0.35)]">
            <CardHeader>
              <CardTitle>Shorten a URL</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_minmax(140px,220px)]">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/very/long/path?with=params"
                    inputMode="url"
                    autoFocus
                  />
                  <Button type="submit" className="h-10" disabled={loading}>
                    {loading ? "Shortening..." : "Shorten"}
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1">Custom slug (optional)</label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. launch, summer-sale, khushal"
                    />
                    {!!suggestions.length && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSlug(s)}
                            className="text-xs rounded-full border px-3 py-1 hover:bg-secondary"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Expiration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["never", 1, 7].map((opt) => (
                        <button
                          key={String(opt)}
                          type="button"
                          onClick={() => setDays(opt as any)}
                          className={`h-10 rounded-md border ${
                            days === opt ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                          }`}
                        >
                          {opt === "never" ? "Never" : `${opt}d`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>

              {result && (
                <div className="mt-6 rounded-lg border p-4 bg-secondary/40">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="truncate">
                      <div className="text-xs text-muted-foreground">Your short link</div>
                      <a href={result.shortUrl} target="_blank" className="font-medium text-primary hover:underline">
                        {result.shortUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(result.shortUrl);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        Copy
                      </Button>
                      <Button asChild>
                        <a href={result.shortUrl} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div id="how" className="mx-auto max-w-5xl mt-20 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Paste",
                desc: "Drop any http(s) link. We validate and fetch a title for smart suggestions.",
              },
              {
                title: "Customize",
                desc: "Pick an AI-like slug suggestion or set your own. Add an expiry if needed.",
              },
              {
                title: "Share",
                desc: "Copy your beautiful short link and share. Redirects served at /r/:code.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border p-6 bg-card/70">
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-4xl mt-16 rounded-xl border bg-card/70 p-6">
            <h3 className="font-semibold mb-3">Setup & Deploy</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Short links redirect via <code className="text-foreground">/r/:code</code>. API: <code className="text-foreground">POST /api/shorten</code>.</li>
              <li>Works on Windows and macOS using Node and pnpm. Dev: <code className="text-foreground">pnpm dev</code>. Build: <code className="text-foreground">pnpm build</code>.</li>
              <li>Deploy with Netlify or Vercel. Set the build command to <code className="text-foreground">pnpm build</code> and publish the output.</li>
              <li>If you have a private Google Doc with extra steps, share view access or paste the steps and we’ll integrate them.</li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
