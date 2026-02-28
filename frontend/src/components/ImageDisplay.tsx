import { Loader2, ImageIcon, AlertCircle, Info, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  prompt?: string;
  model?: string;
  aspectRatio?: string;
}

function getFriendlyError(error: string): { title: string; message: string; hint?: string } {
  if (
    error.includes("HF_TOKEN_MISSING") ||
    error.includes("HF_TOKEN not set") ||
    error.includes("HF_TOKEN is empty")
  ) {
    return {
      title: "API Token Required",
      message:
        "Please enter your Hugging Face API token in the form above. You can get a free token at huggingface.co/settings/tokens.",
    };
  }

  if (error.includes("HF_EMPTY_RESPONSE") || error.includes("empty HTTP response") || error.includes("empty response")) {
    return {
      title: "Service Returned Empty Response",
      message:
        "The image generation service returned an empty response. This usually means the model is temporarily overloaded or unavailable.",
      hint: "Please wait a few seconds and try again. If the issue persists, the Hugging Face service may be experiencing high traffic.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:401")) {
    return {
      title: "Invalid API Token",
      message:
        "Your Hugging Face API token is invalid or expired. Please check your token and try again.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:503")) {
    return {
      title: "Model Loading",
      message:
        "The AI model is currently loading on Hugging Face servers. This can take 20–60 seconds. Please try again shortly.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:429")) {
    return {
      title: "Rate Limit Reached",
      message:
        "You've hit the Hugging Face API rate limit. Please wait a moment before trying again.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:400")) {
    return {
      title: "Bad Request",
      message:
        "The request to the image generation service was malformed. Please try again or adjust your prompt.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED")) {
    const match = error.match(/HF_REQUEST_FAILED:(\d+):(.+)/);
    if (match) {
      return {
        title: `API Error (${match[1]})`,
        message: match[2].trim(),
      };
    }
  }

  if (error.includes("Backend actor not initialized")) {
    return {
      title: "Connection Error",
      message: "The backend is not yet ready. Please wait a moment and try again.",
    };
  }

  // Catch IC trap / canister error messages about empty responses
  if (
    error.toLowerCase().includes("ic0503") ||
    (error.toLowerCase().includes("canister") && error.toLowerCase().includes("trap"))
  ) {
    return {
      title: "Service Temporarily Unavailable",
      message:
        "The image generation service encountered an error. This is often caused by an empty or invalid response from the AI model.",
      hint: "Please try again in a moment.",
    };
  }

  // Strip the "Generation failed: " prefix for display if present
  const displayMessage = error.startsWith("Generation failed: ")
    ? error.slice("Generation failed: ".length)
    : error;

  return {
    title: "Generation Failed",
    message: displayMessage,
  };
}

export function ImageDisplay({
  imageUrl,
  isLoading,
  error,
  prompt,
  model,
  aspectRatio,
}: ImageDisplayProps) {
  const friendlyError = error ? getFriendlyError(error) : null;

  return (
    <div className="space-y-4">
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4 text-muted-foreground">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Generating your image…</p>
                <p className="text-sm text-muted-foreground mt-1">This may take 20–60 seconds</p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="relative group">
              <img
                src={imageUrl}
                alt={prompt || "Generated image"}
                className="w-full h-auto object-contain rounded-lg"
                style={{ maxHeight: "600px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 gap-3 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 opacity-40" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground/60">No image yet</p>
                <p className="text-sm mt-1">Configure your settings and click Generate</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {friendlyError && !isLoading && (
        <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{friendlyError.title}</AlertTitle>
          <AlertDescription className="space-y-1">
            <p>{friendlyError.message}</p>
            {friendlyError.hint && (
              <p className="flex items-center gap-1.5 text-xs opacity-80 mt-1">
                <RefreshCw className="w-3 h-3 flex-shrink-0" />
                {friendlyError.hint}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {imageUrl && !isLoading && (prompt || model || aspectRatio) && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium text-foreground/70">Generation Details</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {model && (
                <Badge variant="secondary" className="text-xs">
                  {model.split("/").pop()}
                </Badge>
              )}
              {aspectRatio && (
                <Badge variant="outline" className="text-xs border-border/60">
                  {aspectRatio}
                </Badge>
              )}
            </div>
            {prompt && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{prompt}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
