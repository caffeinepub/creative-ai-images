import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ImageGenerationForm from "./components/ImageGenerationForm";
import { ImageDisplay } from "./components/ImageDisplay";
import PromptHistory from "./components/PromptHistory";
import { useGenerateImage, useSendQueries } from "./hooks/useQueries";
import type { PoseCriteria } from "./backend";
import { Sparkles } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import type { NegativePromptPreset } from "./constants/negativePrompts";

const queryClient = new QueryClient();

// Exported so ImageGenerationForm can import it
export type GenerationParams = {
  artStyle: "realistic" | "pencil" | "watercolors" | "cartoon" | "caricature" | "charcoal" | "";
  negativePromptPreset: NegativePromptPreset | "";
  aspectRatio: "1:1" | "2:3" | "3:2" | "16:9" | "21:9" | "9:16" | "";
  cameraAngle: string;
  lighting: string;
  environment: string;
  composition: string;
  situationBehavior: string;
};

export interface OnGeneratePayload {
  criteria: PoseCriteria;
  positivePrompt: string;
  negativePrompt: string;
  aspectRatio: string;
  seed: bigint;
  temperature: number;
  model: string;
  apiToken: string;
}

function AppContent() {
  const generateImageMutation = useGenerateImage();
  const sendQueriesMutation = useSendQueries();

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [lastModel, setLastModel] = useState<string>("");
  const [lastAspectRatio, setLastAspectRatio] = useState<string>("");

  const handleGenerate = async (payload: OnGeneratePayload) => {
    setGeneratedImageUrl(null);
    setGenerationError(null);
    setLastPrompt(payload.positivePrompt);
    setLastModel(payload.model);
    setLastAspectRatio(payload.aspectRatio);

    try {
      await sendQueriesMutation.mutateAsync({
        criteria: payload.criteria,
        combinations: payload.positivePrompt,
      });

      const result = await generateImageMutation.mutateAsync({
        positivePrompt: payload.positivePrompt,
        negativePrompt: payload.negativePrompt,
        aspectRatio: payload.aspectRatio,
        seed: payload.seed,
        temperature: payload.temperature,
        model: payload.model,
        apiToken: payload.apiToken,
      });

      if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        setGenerationError(null);
      } else {
        setGeneratedImageUrl(null);
        setGenerationError(result.error || "Image generation failed with an unknown error.");
      }
    } catch (err: unknown) {
      setGeneratedImageUrl(null);
      const message = err instanceof Error ? err.message : String(err);
      setGenerationError(message || "An unexpected error occurred during image generation.");
    }
  };

  const isGenerating = generateImageMutation.isPending || sendQueriesMutation.isPending;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero section */}
          <section className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Image Generation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Image Studio
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Create stunning AI-generated images with detailed prompt control — powered by Hugging Face
            </p>
          </section>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <ImageGenerationForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            </section>

            <section className="flex flex-col gap-6">
              <ImageDisplay
                imageUrl={generatedImageUrl}
                isLoading={isGenerating}
                error={generationError}
                prompt={lastPrompt}
                model={lastModel}
                aspectRatio={lastAspectRatio}
              />
            </section>
          </div>

          <section className="mt-10">
            <PromptHistory />
          </section>
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
