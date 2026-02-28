import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGenerationForm from "@/components/ImageGenerationForm";
import { ImageDisplay } from "@/components/ImageDisplay";
import PromptHistory from "@/components/PromptHistory";
import { useGenerateImage } from "@/hooks/useQueries";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Sparkles } from "lucide-react";

const queryClient = new QueryClient();

export interface OnGeneratePayload {
  positivePrompt: string;
  negativePrompt: string;
  aspectRatio: string;
  seed: bigint;
  temperature: number;
  model: string;
  apiToken: string;
}

function AppContent() {
  const [generationResult, setGenerationResult] = useState<{
    imageUrl?: string | null;
    error?: string | null;
  }>({});

  const generateImageMutation = useGenerateImage();

  const handleGenerate = async (payload: OnGeneratePayload) => {
    setGenerationResult({});
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
      setGenerationResult({ imageUrl: result.imageUrl, error: result.error });
    } catch (err) {
      setGenerationResult({ error: String(err) });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero */}
        <section className="text-center mb-8">
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

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
          {/* Left panel — no overflow:hidden, no transforms to avoid stacking context issues with dropdowns */}
          <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overflow-x-visible pr-1">
            <ImageGenerationForm
              onGenerate={handleGenerate}
              isGenerating={generateImageMutation.isPending}
            />
          </aside>

          {/* Right panel */}
          <section className="space-y-6">
            <ImageDisplay
              imageUrl={generationResult.imageUrl ?? null}
              isLoading={generateImageMutation.isPending}
              error={generationResult.error ?? null}
            />
            <PromptHistory />
          </section>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
