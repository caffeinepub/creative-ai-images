import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetPromptHistory } from "@/hooks/useQueries";
import { ChevronDown, ChevronUp, Clock, Copy, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PromptHistory() {
  const { data: history = [], isLoading } = useGetPromptHistory();
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const sortedHistory = [...history].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        data-ocid="history.panel"
        className="border-border/30 bg-card/60 backdrop-blur-sm shadow-card"
      >
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-between w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Prompt History
                {history.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs ml-0.5 bg-primary/10 text-primary border-primary/20"
                  >
                    {history.length}
                  </Badge>
                )}
              </CardTitle>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Loading history…
              </div>
            ) : sortedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
                  <History className="w-5 h-5 opacity-30" />
                </div>
                <p className="text-sm">No prompts generated yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Generate your first image to see history here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-72 scrollbar-thin">
                <div className="space-y-2.5 pr-2">
                  {sortedHistory.map((entry) => (
                    <div
                      key={`${String(entry.timestamp)}-${entry.prompt.slice(0, 16)}`}
                      className="rounded-lg border border-border/30 bg-background/30 p-3 space-y-2 hover:border-primary/25 hover:bg-primary/4 transition-all duration-150"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground/85 leading-relaxed flex-1 line-clamp-2 font-mono">
                          {entry.prompt}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleCopy(entry.prompt)}
                          title="Copy prompt"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
