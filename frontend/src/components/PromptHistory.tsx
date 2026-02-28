import { useState } from "react";
import { useGetPromptHistory } from "../hooks/useQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { History, Copy, ChevronDown, ChevronUp, Clock } from "lucide-react";
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

  const sortedHistory = [...history].sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left group">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Prompt History
                {history.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {history.length}
                  </Badge>
                )}
              </CardTitle>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                Loading history…
              </div>
            ) : sortedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <History className="w-8 h-8 opacity-30" />
                <p className="text-sm">No prompts generated yet</p>
              </div>
            ) : (
              <ScrollArea className="h-72">
                <div className="space-y-3 pr-3">
                  {sortedHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border/40 bg-background/40 p-3 space-y-2 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground/90 leading-relaxed flex-1 line-clamp-2">
                          {entry.prompt}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary"
                          onClick={() => handleCopy(entry.prompt)}
                          title="Copy prompt"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
