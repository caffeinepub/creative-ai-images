import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, ChevronDown, Clock, User, Ruler, Weight, Calendar, Globe, Palette, Maximize2, Camera } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGetPromptHistory } from '../hooks/useQueries';

export default function PromptHistory() {
  const { data: history = [], isLoading } = useGetPromptHistory();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleCopyPrompt = async (prompt: string, index: number) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedIndex(index);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const mapAgeToString = (age: bigint): string => {
    const ageNum = Number(age);
    if (ageNum <= 25) return 'young adult';
    if (ageNum <= 35) return 'adult';
    return 'mature';
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-secondary/20 shadow-xl shadow-secondary/5 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Prompt History
          </CardTitle>
          <CardDescription>Loading history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-2 border-secondary/20 shadow-xl shadow-secondary/5 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Prompt History
          </CardTitle>
          <CardDescription>Your generated prompts will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No prompt history available</p>
            <p className="text-sm mt-1">Generate your first image to see history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-secondary/20 shadow-xl shadow-secondary/5 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary" />
          Prompt History
        </CardTitle>
        <CardDescription>
          {history.length} {history.length === 1 ? 'prompt' : 'prompts'} generated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <Collapsible
                key={index}
                open={expandedIndex === index}
                onOpenChange={(open) => setExpandedIndex(open ? index : null)}
              >
                <Card className="border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    {/* Header with timestamp and copy button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimestamp(entry.timestamp)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPrompt(entry.prompt, index)}
                        className="h-8 px-2"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Prompt preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-mono text-foreground/90 line-clamp-2">
                        {entry.prompt}
                      </p>

                      {/* Key parameters badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {entry.criteria.bodyType && (
                          <Badge variant="outline" className="text-xs">
                            {entry.criteria.bodyType}
                          </Badge>
                        )}
                        {entry.criteria.artStyle && (
                          <Badge variant="outline" className="text-xs">
                            {entry.criteria.artStyle}
                          </Badge>
                        )}
                        {entry.criteria.aspectRatio && (
                          <Badge variant="outline" className="text-xs">
                            {entry.criteria.aspectRatio}
                          </Badge>
                        )}
                        {entry.criteria.cameraLens && (
                          <Badge variant="outline" className="text-xs">
                            {entry.criteria.cameraLens}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expand/collapse trigger */}
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-xs"
                      >
                        {expandedIndex === index ? 'Hide details' : 'Show details'}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedIndex === index ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>

                    {/* Expanded details */}
                    <CollapsibleContent className="space-y-3 pt-2">
                      <div className="p-3 rounded-md bg-background/50 border border-border/30">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          Full Prompt:
                        </p>
                        <p className="text-sm font-mono text-foreground/90 whitespace-pre-wrap">
                          {entry.prompt}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          All Parameters:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.criteria.bodyType && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <User className="w-3 h-3" />
                              {entry.criteria.bodyType}
                            </Badge>
                          )}
                          {entry.criteria.height > 0 && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Ruler className="w-3 h-3" />
                              {entry.criteria.height}cm
                            </Badge>
                          )}
                          {entry.criteria.weight > 0 && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Weight className="w-3 h-3" />
                              {entry.criteria.weight}kg
                            </Badge>
                          )}
                          {entry.criteria.age > 0 && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Calendar className="w-3 h-3" />
                              {mapAgeToString(entry.criteria.age)}
                            </Badge>
                          )}
                          {entry.criteria.ethnicity && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Globe className="w-3 h-3" />
                              {entry.criteria.ethnicity}
                            </Badge>
                          )}
                          {entry.criteria.artStyle && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Palette className="w-3 h-3" />
                              {entry.criteria.artStyle}
                            </Badge>
                          )}
                          {entry.criteria.aspectRatio && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Maximize2 className="w-3 h-3" />
                              {entry.criteria.aspectRatio}
                            </Badge>
                          )}
                          {entry.criteria.cameraLens && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Camera className="w-3 h-3" />
                              {entry.criteria.cameraLens}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {entry.criteria.negativePrompt && (
                        <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            Negative Prompt:
                          </p>
                          <p className="text-xs font-mono text-foreground/80">
                            {entry.criteria.negativePrompt}
                          </p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
