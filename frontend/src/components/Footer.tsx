import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined'
    ? encodeURIComponent(window.location.hostname)
    : 'ai-image-studio';

  return (
    <footer className="border-t border-border/40 backdrop-blur-sm bg-background/80 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>© {currentYear} AI Image Studio. All rights reserved.</span>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-destructive fill-destructive animate-pulse" />
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
