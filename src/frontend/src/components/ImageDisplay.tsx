import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Ruler, Weight, Calendar, Globe, Palette, Copy, Check, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import type { GenerationParams } from '../App';
import { NEGATIVE_PROMPT_PRESETS } from '../constants/negativePrompts';

interface ImageDisplayProps {
  params: GenerationParams;
  prompt: string;
}

export default function ImageDisplay({ params, prompt }: ImageDisplayProps) {
  const [copied, setCopied] = useState(false);

  const getImagePath = () => {
    if (params.bodyType === 'skinny') {
      return '/assets/generated/sample-skinny.dim_512x512.png';
    } else if (params.bodyType === 'curvy') {
      return '/assets/generated/sample-curvy.dim_512x512.png';
    }
    return '/assets/generated/ai-icon.dim_128x128.png';
  };

  const getFullPromptWithNegative = () => {
    const negativePromptText = params.negativePromptPreset 
      ? NEGATIVE_PROMPT_PRESETS[params.negativePromptPreset]
      : '';
    
    if (negativePromptText) {
      return `${prompt}\n\nNegative prompt: ${negativePromptText}`;
    }
    return prompt;
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(getFullPromptWithNegative());
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  return (
    <Card className="border-2 border-accent/20 shadow-xl shadow-accent/5 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Generated Prompt</CardTitle>
        <CardDescription>
          Your comprehensive AI image generation prompt based on all specified parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Display */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">
                  AI Image Prompt
                </p>
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  {prompt}
                </p>
              </div>
              
              {params.negativePromptPreset && NEGATIVE_PROMPT_PRESETS[params.negativePromptPreset] && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">
                    Negative Prompt
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {NEGATIVE_PROMPT_PRESETS[params.negativePromptPreset]}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPrompt}
              className="shrink-0 border-primary/30 hover:bg-primary/10"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-8 flex items-center justify-center min-h-[300px]">
          <div className="relative">
            <img
              src={getImagePath()}
              alt={`Sample image - ${params.bodyType} body type`}
              className="max-w-full h-auto rounded-lg shadow-2xl shadow-primary/20 border-2 border-primary/30"
            />
            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-primary to-accent text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Sample Preview
            </div>
          </div>
        </div>

        {/* Parameters Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Body Type</p>
              <Badge variant="outline" className="mt-1 capitalize border-primary/30 text-primary">
                {params.bodyType}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Ruler className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Height</p>
              <Badge variant="outline" className="mt-1 border-accent/30 text-accent-foreground">
                {params.height} cm
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <Weight className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Weight</p>
              <Badge variant="outline" className="mt-1 border-secondary/30 text-secondary-foreground">
                {params.weight} kg
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Age</p>
              <Badge variant="outline" className="mt-1 capitalize border-accent/30 text-accent-foreground">
                {params.age}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Ethnicity</p>
              <Badge variant="outline" className="mt-1 border-secondary/30 text-secondary-foreground">
                {params.ethnicity}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Art Style</p>
              <Badge variant="outline" className="mt-1 capitalize border-primary/30 text-primary">
                {params.artStyle}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20 sm:col-span-2 lg:col-span-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Negative Prompt Preset</p>
              <Badge variant="outline" className="mt-1 border-accent/30 text-accent-foreground">
                {params.negativePromptPreset || 'None'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
