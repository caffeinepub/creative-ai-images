import { Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Image Prompt Generator
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">Powered by AI</p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-2.5 h-2.5 mr-1" />
                  NSFW Supported
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
