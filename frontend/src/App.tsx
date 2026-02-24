import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageGenerationForm from './components/ImageGenerationForm';
import ImageDisplay from './components/ImageDisplay';
import PromptHistory from './components/PromptHistory';
import { Toaster } from '@/components/ui/sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import type { NegativePromptPreset } from './constants/negativePrompts';

const queryClient = new QueryClient();

export type GenerationParams = {
  bodyType: 'skinny' | 'curvy' | 'oversized' | 'plus-size' | 'buxom' | 'saggy' | 'soft belly' | '';
  height: string;
  weight: string;
  age: 'young adult' | 'adult' | 'mature' | '';
  ethnicity: 'Caucasian' | 'African' | 'Asian' | 'Hispanic' | 'Middle Eastern' | 'Mixed' | '';
  artStyle: 'realistic' | 'pencil' | 'watercolors' | 'cartoon' | 'caricature' | 'charcoal' | '';
  negativePromptPreset: NegativePromptPreset | '';
  aspectRatio: '1:1' | '2:3' | '3:2' | '16:9' | '21:9' | '9:16' | '';
  cameraLens: string;
  clothing: string;
  situationPose: string;
  situationFiguration: string;
  situationBehavior: string;
  situationPosing: string;
  cameraAngle: string;
  lighting: string;
  environment: string;
  composition: string;
};

export type GenerationResult = {
  params: GenerationParams;
  prompt: string;
  imageData: Uint8Array | null;
};

// Mapping of situation option values to their AI keywords
const SITUATION_KEYWORDS: Record<string, string> = {
  'The Reclining Odalisque': 'reclining odalisque, sensual posture, arched back, relaxed limbs',
  'Boudoir-Setting': 'intimate boudoir, disheveled silk sheets, dim warm lighting, veiled background',
  'The Gaze': 'sultry gaze, bedroom eyes, half-closed eyelids, inviting smile',
  'Suggestive Reveal': 'shoulder strap slipping, strategic placement, translucent fabric, tousled hair',
};

function AppContent() {
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGenerate = (params: GenerationParams, prompt: string, imageData: Uint8Array | null) => {
    setGenerationResult({
      params,
      prompt,
      imageData,
    });
  };

  const generatePrompt = (params: GenerationParams): string => {
    const parts: string[] = [];

    if (params.artStyle) {
      const artStyleDescriptor = formatArtStyleDescriptor(params.artStyle);
      parts.push(artStyleDescriptor);
    }

    if (params.age) {
      parts.push(params.age);
    }

    if (params.ethnicity) {
      parts.push(params.ethnicity);
    }

    if (params.bodyType) {
      parts.push(`${params.bodyType} body type`);
    }

    if (params.height) {
      parts.push(`${params.height}cm tall`);
    }

    if (params.weight) {
      parts.push(`${params.weight}kg`);
    }

    if (params.clothing) {
      const clothingDescriptor = formatClothingDescriptor(params.clothing);
      parts.push(clothingDescriptor);
    }

    if (params.cameraLens) {
      const lensDescriptor = formatLensDescriptor(params.cameraLens);
      parts.push(lensDescriptor);
    }

    if (params.aspectRatio) {
      parts.push(`aspect ratio: ${params.aspectRatio}`);
    }

    // Append situation keywords
    if (params.situationPose && params.situationPose !== 'none') {
      const keywords = SITUATION_KEYWORDS[params.situationPose];
      if (keywords) parts.push(keywords);
    }

    if (params.situationFiguration && params.situationFiguration !== 'none') {
      const keywords = SITUATION_KEYWORDS[params.situationFiguration];
      if (keywords) parts.push(keywords);
    }

    if (params.situationBehavior && params.situationBehavior !== 'none') {
      const keywords = SITUATION_KEYWORDS[params.situationBehavior];
      if (keywords) parts.push(keywords);
    }

    if (params.situationPosing && params.situationPosing !== 'none') {
      const keywords = SITUATION_KEYWORDS[params.situationPosing];
      if (keywords) parts.push(keywords);
    }

    // Camera angle
    if (params.cameraAngle) {
      parts.push(`${params.cameraAngle} shot`);
    }

    // Lighting
    if (params.lighting) {
      parts.push(params.lighting);
    }

    // Environment
    if (params.environment) {
      parts.push(`${params.environment} setting`);
    }

    // Composition
    if (params.composition) {
      parts.push(`${params.composition} composition`);
    }

    return parts.join(', ');
  };

  const formatArtStyleDescriptor = (artStyle: string): string => {
    switch (artStyle) {
      case 'realistic':
        return 'realistic style';
      case 'pencil':
        return 'pencil style';
      case 'watercolors':
        return 'watercolors style';
      case 'cartoon':
        return 'in cartoon style';
      case 'caricature':
        return 'in caricature style';
      case 'charcoal':
        return 'charcoal drawing';
      default:
        return `${artStyle} style`;
    }
  };

  const formatClothingDescriptor = (clothing: string): string => {
    switch (clothing) {
      case 'form-fitting dress':
        return 'wearing form-fitting dress';
      case 'casual wear':
        return 'dressed in casual wear';
      case 'formal attire':
        return 'dressed in formal attire';
      case 'swimwear':
        return 'wearing swimwear';
      case 'lingerie':
        return 'wearing lingerie';
      case 'none/nude':
        return 'nude';
      default:
        return `wearing ${clothing}`;
    }
  };

  const formatLensDescriptor = (lens: string): string => {
    switch (lens) {
      case '50mm':
        return 'photographed with 50mm lens';
      case '85mm':
        return 'photographed with 85mm lens';
      case '35mm':
        return 'photographed with 35mm lens';
      case '24mm':
        return 'photographed with 24mm lens';
      case 'Wide-angle':
        return 'wide-angle shot';
      case 'Telephoto':
        return 'telephoto lens photography';
      case 'Macro':
        return 'macro photography';
      default:
        return lens;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <section className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center justify-center mb-4">
                <img
                  src="/assets/generated/ai-icon.dim_128x128.png"
                  alt="AI Icon"
                  className="w-20 h-20 animate-pulse"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                AI Image Generator
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Generate stunning AI images with Stable Diffusion. Customize body type, age, ethnicity,
                art style, and physical characteristics to create your perfect image.
              </p>

              {/* History Toggle Button */}
              <div className="pt-4">
                <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2">
                      <History className="w-5 h-5" />
                      View Prompt History
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Prompt History</SheetTitle>
                      <SheetDescription>
                        View and copy your previously generated prompts
                      </SheetDescription>
                    </SheetHeader>
                    <PromptHistory />
                  </SheetContent>
                </Sheet>
              </div>
            </section>

            {/* Form Section */}
            <section>
              <ImageGenerationForm
                onGenerate={handleGenerate}
                generatePrompt={generatePrompt}
              />
            </section>

            {/* Display Section */}
            {generationResult && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ImageDisplay
                  params={generationResult.params}
                  prompt={generationResult.prompt}
                  imageData={generationResult.imageData}
                />
              </section>
            )}
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
