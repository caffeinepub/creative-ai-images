import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageGenerationForm from './components/ImageGenerationForm';
import ImageDisplay from './components/ImageDisplay';
import { Toaster } from '@/components/ui/sonner';
import type { NegativePromptPreset } from './constants/negativePrompts';

const queryClient = new QueryClient();

export type GenerationParams = {
  bodyType: 'skinny' | 'curvy' | 'oversized' | 'plus-size' | 'buxom' | 'saggy' | '';
  height: string;
  weight: string;
  age: 'young adult' | 'adult' | 'mature' | '';
  ethnicity: 'Caucasian' | 'African' | 'Asian' | 'Hispanic' | 'Middle Eastern' | 'Mixed' | '';
  artStyle: 'realistic' | 'pencil' | 'watercolors' | '';
  negativePromptPreset: NegativePromptPreset | '';
};

function AppContent() {
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    bodyType: '',
    height: '',
    weight: '',
    age: '',
    ethnicity: '',
    artStyle: '',
    negativePromptPreset: '',
  });
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = (params: GenerationParams) => {
    setGenerationParams(params);
    setHasGenerated(true);
  };

  const generatePrompt = (params: GenerationParams): string => {
    const parts: string[] = [];
    
    if (params.artStyle) {
      parts.push(`${params.artStyle} style`);
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
    
    return parts.join(', ');
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
                AI Image Prompt Generator
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Create comprehensive AI image prompts with detailed character specifications. 
                Customize body type, age, ethnicity, art style, and physical characteristics.
              </p>
            </section>

            {/* Form Section */}
            <section>
              <ImageGenerationForm onGenerate={handleGenerate} />
            </section>

            {/* Display Section */}
            {hasGenerated && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ImageDisplay params={generationParams} prompt={generatePrompt(generationParams)} />
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
