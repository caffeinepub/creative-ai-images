import { Wand2 } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/90 to-accent/80 flex items-center justify-center shadow-glow">
              <Wand2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 blur-sm -z-10" />
          </div>

          {/* Brand */}
          <div>
            <p className="text-lg font-display font-bold leading-none text-gradient-primary tracking-tight">
              AI Image Studio
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">
              Prompt Generator · Hugging Face
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
