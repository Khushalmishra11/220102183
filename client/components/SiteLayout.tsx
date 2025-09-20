import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-20%,hsla(258,90%,70%,0.15),transparent),radial-gradient(1000px_600px_at_90%_0%,hsla(280,85%,60%,0.12),transparent)]">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />
            <span className="font-extrabold tracking-tight text-lg">Blink.ai</span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </a>
            <Button asChild variant="outline" size="sm">
              <a href="#how">How it works</a>
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t mt-20">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} Blink.ai URL Shortener — Built with love.
          </p>
          <p>
            Redirect endpoint: <code className="text-foreground">/r/:code</code>
          </p>
        </div>
      </footer>
    </div>
  );
}
