import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Ruler, Weight, Calendar, Globe, Palette, Copy, Check, ShieldAlert, Maximize2, AlertCircle, Camera, Shirt, Drama, Sun, MapPin, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { GenerationParams } from '../App';
import { NEGATIVE_PROMPT_PRESETS } from '../constants/negativePrompts';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageDisplayProps {
  params: GenerationParams;
  prompt: string;
  imageData: Uint8Array | null;
}

export default function ImageDisplay({ params, prompt, imageData }: ImageDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Convert image bytes to blob URL for display
  const imageUrl = useMemo(() => {
    if (!imageData || imageData.length === 0) {
      return null;
    }
    const blob = new Blob([new Uint8Array(imageData)], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }, [imageData]);

  // Get aspect ratio for image container
  const getAspectRatioClass = () => {
    switch (params.aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '2:3':
        return 'aspect-[2/3]';
      case '3:2':
        return 'aspect-[3/2]';
      case '16:9':
        return 'aspect-video';
      case '21:9':
        return 'aspect-[21/9]';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-square';
    }
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

  const formatArtStyleLabel = (artStyle: string): string => {
    switch (artStyle) {
      case 'realistic':
        return 'Realistic';
      case 'pencil':
        return 'Pencil';
      case 'watercolors':
        return 'Watercolors';
      case 'cartoon':
        return 'Cartoon';
      case 'caricature':
        return 'Caricature';
      case 'charcoal':
        return 'Charcoal';
      default:
        return artStyle.charAt(0).toUpperCase() + artStyle.slice(1);
    }
  };

  const hasSituationParams =
    (params.situationPose && params.situationPose !== 'none') ||
    (params.situationFiguration && params.situationFiguration !== 'none') ||
    (params.situationBehavior && params.situationBehavior !== 'none') ||
    (params.situationPosing && params.situationPosing !== 'none');

  const hasCompositionParams =
    !!params.cameraAngle ||
    !!params.lighting ||
    !!params.environment ||
    !!params.composition;

  return (
    <Card className="border-2 border-accent/20 shadow-xl shadow-accent/5 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Generated Result</CardTitle>
        <CardDescription>Your AI-generated image and parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Display */}
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 bg-muted/30">
            <div className={`w-full ${getAspectRatioClass()}`}>
              <img
                src={imageUrl}
                alt="Generated image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Image generation is currently unavailable. The backend needs to implement the Stable Diffusion API integration.
              Your prompt and parameters are displayed below.
            </AlertDescription>
          </Alert>
        )}

        {/* Prompt Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Generated Prompt
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPrompt}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-primary/10">
            <p className="text-sm text-foreground/90 whitespace-pre-wrap font-mono">
              {prompt}
            </p>
            {params.negativePromptPreset && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Negative Prompt:
                </p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap font-mono">
                  {NEGATIVE_PROMPT_PRESETS[params.negativePromptPreset]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Parameters Display */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Parameters</h3>
          <div className="flex flex-wrap gap-2">
            {params.bodyType && (
              <Badge variant="secondary" className="gap-1.5">
                <User className="w-3.5 h-3.5" />
                {params.bodyType}
              </Badge>
            )}
            {params.height && (
              <Badge variant="secondary" className="gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                {params.height}cm
              </Badge>
            )}
            {params.weight && (
              <Badge variant="secondary" className="gap-1.5">
                <Weight className="w-3.5 h-3.5" />
                {params.weight}kg
              </Badge>
            )}
            {params.age && (
              <Badge variant="secondary" className="gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {params.age}
              </Badge>
            )}
            {params.ethnicity && (
              <Badge variant="secondary" className="gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {params.ethnicity}
              </Badge>
            )}
            {params.artStyle && (
              <Badge variant="secondary" className="gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                {formatArtStyleLabel(params.artStyle)}
              </Badge>
            )}
            {params.clothing && (
              <Badge variant="secondary" className="gap-1.5">
                <Shirt className="w-3.5 h-3.5" />
                {params.clothing}
              </Badge>
            )}
            {params.negativePromptPreset && (
              <Badge variant="secondary" className="gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                {params.negativePromptPreset}
              </Badge>
            )}
            {params.aspectRatio && (
              <Badge variant="secondary" className="gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                {params.aspectRatio}
              </Badge>
            )}
            {params.cameraLens && (
              <Badge variant="secondary" className="gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                {params.cameraLens}
              </Badge>
            )}
          </div>

          {/* Situation Badges */}
          {hasSituationParams && (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1 w-full">
                <Drama className="w-3.5 h-3.5" />
                Situation:
              </span>
              {params.situationPose && params.situationPose !== 'none' && (
                <Badge variant="outline" className="gap-1.5 border-secondary/40 text-secondary">
                  <Drama className="w-3.5 h-3.5" />
                  Pose: {params.situationPose}
                </Badge>
              )}
              {params.situationFiguration && params.situationFiguration !== 'none' && (
                <Badge variant="outline" className="gap-1.5 border-secondary/40 text-secondary">
                  <Drama className="w-3.5 h-3.5" />
                  Figuration: {params.situationFiguration}
                </Badge>
              )}
              {params.situationBehavior && params.situationBehavior !== 'none' && (
                <Badge variant="outline" className="gap-1.5 border-secondary/40 text-secondary">
                  <Drama className="w-3.5 h-3.5" />
                  Behavior: {params.situationBehavior}
                </Badge>
              )}
              {params.situationPosing && params.situationPosing !== 'none' && (
                <Badge variant="outline" className="gap-1.5 border-secondary/40 text-secondary">
                  <Drama className="w-3.5 h-3.5" />
                  Posing: {params.situationPosing}
                </Badge>
              )}
            </div>
          )}

          {/* Image Composition Badges */}
          {hasCompositionParams && (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1 w-full">
                <Sun className="w-3.5 h-3.5" />
                Image Composition:
              </span>
              {params.cameraAngle && (
                <Badge variant="outline" className="gap-1.5 border-accent/40 text-accent">
                  <Camera className="w-3.5 h-3.5" />
                  {params.cameraAngle}
                </Badge>
              )}
              {params.lighting && (
                <Badge variant="outline" className="gap-1.5 border-accent/40 text-accent">
                  <Sun className="w-3.5 h-3.5" />
                  {params.lighting}
                </Badge>
              )}
              {params.environment && (
                <Badge variant="outline" className="gap-1.5 border-accent/40 text-accent">
                  <MapPin className="w-3.5 h-3.5" />
                  {params.environment}
                </Badge>
              )}
              {params.composition && (
                <Badge variant="outline" className="gap-1.5 border-accent/40 text-accent">
                  <Layout className="w-3.5 h-3.5" />
                  {params.composition}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
