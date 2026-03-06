import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ImageDisplay } from "@/components/ImageDisplay";
import ImageGenerationForm from "@/components/ImageGenerationForm";
import PromptHistory from "@/components/PromptHistory";
import { Toaster } from "@/components/ui/sonner";
import { useGenerateImage } from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnGeneratePayload {
  positivePrompt: string;
  negativePrompt: string;
  aspectRatio: string;
  seed: bigint;
  temperature: number;
  model: string;
  apiToken: string;
}

export interface GenerationParams {
  model: string;
  aspectRatio: string;
  prompt: string;
}

// ─── QueryClient (module-level singleton, outside React tree) ─────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// ─── Inner content (needs QueryClient context) ────────────────────────────────

function AppContent() {
  const [generationResult, setGenerationResult] = useState<{
    imageUrl?: string | null;
    error?: string | null;
    params?: GenerationParams;
  }>({});

  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const generateImageMutation = useGenerateImage({
    onRetry: (msg) => setRetryMessage(msg),
  });

  const handleGenerate = useCallback(
    async (payload: OnGeneratePayload) => {
      setGenerationResult({});
      setRetryMessage(null);
      try {
        const result = await generateImageMutation.mutateAsync({
          positivePrompt: payload.positivePrompt,
          negativePrompt: payload.negativePrompt,
          aspectRatio: payload.aspectRatio,
          seed: payload.seed,
          temperature: payload.temperature,
          model: payload.model,
          apiToken: payload.apiToken,
        });
        setGenerationResult({
          imageUrl: result.imageUrl,
          error: result.error,
          params: {
            model: payload.model,
            aspectRatio: payload.aspectRatio,
            prompt: payload.positivePrompt,
          },
        });
      } catch (err) {
        setGenerationResult({ error: String(err) });
      }
    },
    [generateImageMutation],
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-noise">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero section */}
        <section className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Prompt Generator
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight mb-3 text-gradient-primary">
            AI Image Studio
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Craft detailed prompts for Hugging Face models with comprehensive
            style, subject, and camera controls.
          </p>
        </section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">
          {/* Left panel — sticky, scrollable, overflow-x-visible for dropdown portals */}
          <aside
            className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:overflow-x-visible scrollbar-thin"
            style={{ position: "relative" }}
          >
            <ImageGenerationForm
              onGenerate={handleGenerate}
              isGenerating={generateImageMutation.isPending}
            />
          </aside>

          {/* Right panel */}
          <section className="space-y-5 animate-slide-up">
            <ImageDisplay
              imageUrl={generationResult.imageUrl ?? null}
              isLoading={generateImageMutation.isPending}
              error={generationResult.error ?? null}
              prompt={generationResult.params?.prompt}
              model={generationResult.params?.model}
              aspectRatio={generationResult.params?.aspectRatio}
              retryMessage={retryMessage}
            />
            <PromptHistory />
          </section>
        </div>
      </main>

      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

// ─── Root app with providers ──────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
