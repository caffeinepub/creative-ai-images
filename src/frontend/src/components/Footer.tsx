import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? window.location.hostname
      : "ai-image-studio";

  return (
    <footer className="mt-auto border-t border-border/30 bg-background/70 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>© {currentYear} AI Image Studio.</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span className="flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-primary fill-primary mx-0.5" />
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gradient-primary hover:opacity-80 transition-opacity ml-0.5"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
