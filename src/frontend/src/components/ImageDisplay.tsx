import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ImageIcon, Info, Loader2, RefreshCw } from "lucide-react";

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  prompt?: string;
  model?: string;
  aspectRatio?: string;
  retryMessage?: string | null;
}

interface FriendlyError {
  title: string;
  message: string;
  hint?: string;
}

function getFriendlyError(error: string): FriendlyError {
  if (
    error.includes("HF_TOKEN_MISSING") ||
    error.includes("HF_TOKEN not set") ||
    error.includes("HF_TOKEN is empty") ||
    error.includes("Authentication is required")
  ) {
    return {
      title: "API Token Required",
      message:
        "Please enter your Hugging Face API token in the form panel. You can get a free token at huggingface.co/settings/tokens.",
    };
  }

  if (
    error.includes("HF_EMPTY_RESPONSE") ||
    error.includes("empty HTTP response") ||
    error.includes("empty response")
  ) {
    return {
      title: "Service Returned Empty Response",
      message:
        "The image generation model returned an empty response. This usually means it is temporarily overloaded.",
      hint: "Wait a few seconds and try again. The Hugging Face free tier can be busy during peak hours.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:401")) {
    return {
      title: "Invalid API Token",
      message:
        "Your Hugging Face API token is invalid or expired. Please update it in the API Configuration panel.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:503")) {
    return {
      title: "Model Loading",
      message:
        "The AI model is currently loading on Hugging Face servers. This can take 20–60 seconds on the free tier.",
      hint: "Try again in a moment — the model will warm up and respond faster on subsequent requests.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:429")) {
    return {
      title: "Rate Limit Reached",
      message:
        "You've hit the Hugging Face API rate limit. Please wait before retrying.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:404")) {
    return {
      title: "Model Not Found",
      message:
        "The selected model could not be found on Hugging Face. It may have been removed or renamed.",
      hint: "Try switching to a different model such as 'stabilityai/stable-diffusion-xl-base-1.0' or 'runwayml/stable-diffusion-v1-5'.",
    };
  }

  if (error.includes("HF_REQUEST_FAILED:400")) {
    return {
      title: "Bad Request",
      message:
        "The request to the image generation service was invalid. Please adjust your prompt and try again.",
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
      message:
        "The backend is not yet ready. Please wait a moment and try again.",
    };
  }

  if (
    error.toLowerCase().includes("ic0503") ||
    (error.toLowerCase().includes("canister") &&
      error.toLowerCase().includes("trap"))
  ) {
    return {
      title: "Service Temporarily Unavailable",
      message:
        "The image generation service encountered an error, often caused by a slow or empty model response.",
      hint: "Try again in a moment.",
    };
  }

  if (error.includes("is no longer supported")) {
    return {
      title: "Endpoint Outdated",
      message:
        "The image generation endpoint is outdated. Please contact support to get the latest version.",
    };
  }

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
  retryMessage,
}: ImageDisplayProps) {
  const friendlyError = error ? getFriendlyError(error) : null;

  return (
    <div className="space-y-4">
      {/* Main image card */}
      <Card className="border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div
              data-ocid="image.loading_state"
              className="flex flex-col items-center justify-center h-80 gap-5 text-muted-foreground"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-display font-semibold text-foreground/80">
                  Generating image…
                </p>
                <p className="text-sm text-muted-foreground">
                  This may take 20–60 seconds
                </p>
                {retryMessage && (
                  <p className="text-xs text-muted-foreground animate-pulse mt-2">
                    {retryMessage}
                  </p>
                )}
              </div>
            </div>
          ) : imageUrl ? (
            <div data-ocid="image.success_state" className="relative group">
              <img
                src={imageUrl}
                alt={prompt || "Generated AI image"}
                className="w-full h-auto object-contain rounded-lg animate-scale-in"
                style={{ maxHeight: "640px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 gap-4 text-muted-foreground">
              <div className="w-20 h-20 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-center">
                <ImageIcon className="w-9 h-9 opacity-25" />
              </div>
              <div className="text-center">
                <p className="font-display font-semibold text-foreground/40">
                  No image yet
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Configure your settings and click Generate
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error alert */}
      {friendlyError && !isLoading && (
        <Alert
          data-ocid="image.error_state"
          variant="destructive"
          className="border-destructive/30 bg-destructive/8 animate-slide-up"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <AlertTitle className="font-display">
            {friendlyError.title}
          </AlertTitle>
          <AlertDescription className="space-y-1.5 mt-1">
            <p className="text-sm leading-relaxed">{friendlyError.message}</p>
            {friendlyError.hint && (
              <p className="flex items-start gap-1.5 text-xs opacity-75 mt-1">
                <RefreshCw className="w-3 h-3 flex-shrink-0 mt-0.5" />
                {friendlyError.hint}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Generation metadata */}
      {imageUrl && !isLoading && (prompt || model || aspectRatio) && (
        <Card className="border-border/30 bg-card/50 shadow-card animate-fade-in">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>Generation Details</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {model && (
                <Badge variant="secondary" className="text-xs font-mono">
                  {model.split("/").pop()}
                </Badge>
              )}
              {aspectRatio && (
                <Badge variant="outline" className="text-xs border-border/40">
                  {aspectRatio}
                </Badge>
              )}
            </div>
            {prompt && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-mono">
                {prompt}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
