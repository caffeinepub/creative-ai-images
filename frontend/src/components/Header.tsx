import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Image Studio
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Powered by Hugging Face</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
