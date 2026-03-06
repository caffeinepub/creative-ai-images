import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GenerateImageArgs, PoseCriteria } from "../backend";
import { useActor } from "./useActor";

// ─── Fallback model list ──────────────────────────────────────────────────────

const FALLBACK_MODELS = [
  "runwayml/stable-diffusion-v1-5",
  "stabilityai/stable-diffusion-2-1",
  "CompVis/stable-diffusion-v1-4",
];

// ─── Response parsing ─────────────────────────────────────────────────────────

export interface ParsedImageResult {
  imageUrl: string | null;
  error: string | null;
}

/**
 * Strips the backend's "Unexpected response format: " wrapper and tries to
 * parse the inner payload as JSON, returning the extracted error string or
 * the raw inner text if it isn't valid JSON.
 */
function unwrapBackendErrorPrefix(response: string): string {
  const prefix = "Unexpected response format: ";
  if (response.startsWith(prefix)) {
    const inner = response.slice(prefix.length);
    try {
      const json = JSON.parse(inner);
      if (json.error) return String(json.error);
      if (json.message) return String(json.message);
      return inner;
    } catch {
      return inner;
    }
  }
  return response;
}

function isEmptyHttpResponseError(response: string): boolean {
  const lower = response.toLowerCase();
  return (
    lower.includes("empty http response") ||
    lower.includes("empty response") ||
    (lower.includes("ic0503") && lower.includes("trap")) ||
    (lower.includes("canister called") && lower.includes("empty"))
  );
}

function parseHuggingFaceApiError(
  response: string,
): { status: string; body: string } | null {
  const match = response.match(
    /hugging face api error \(status (\d+)\):\s*(.*)/i,
  );
  if (match) {
    return { status: match[1], body: match[2].trim() };
  }
  return null;
}

export function parseGenerateImageResponse(
  rawResponse: string,
): ParsedImageResult {
  // Unwrap the backend's error prefix first
  const response = unwrapBackendErrorPrefix(rawResponse);

  // 1. data URI success
  if (response.startsWith("data:image/")) {
    return { imageUrl: response, error: null };
  }

  // 2. Try JSON
  if (response.startsWith("{")) {
    try {
      const json = JSON.parse(response);

      if (json.imageUrl && typeof json.imageUrl === "string") {
        return { imageUrl: json.imageUrl, error: null };
      }

      if (
        json.error === "HF_TOKEN missing" ||
        json.error === "HF_TOKEN_MISSING"
      ) {
        return {
          imageUrl: null,
          error: "HF_TOKEN_MISSING: No API token provided.",
        };
      }

      if (json.error === "Invalid JSON") {
        return {
          imageUrl: null,
          error:
            "HF_REQUEST_FAILED:400:The request body was not valid JSON. Please try again.",
        };
      }

      if (json.error) {
        const status = json.status ?? "";
        const detail = json.detail ?? json.error;
        if (status === 401 || String(status) === "401") {
          return {
            imageUrl: null,
            error: `HF_REQUEST_FAILED:401:${detail}`,
          };
        }
        if (status === 503 || String(status) === "503") {
          return {
            imageUrl: null,
            error: `HF_REQUEST_FAILED:503:${detail}`,
          };
        }
        return {
          imageUrl: null,
          error: `HF_REQUEST_FAILED:${status}:${detail}`,
        };
      }
    } catch {
      // Not JSON — continue
    }
  }

  // 3. Base64 image magic bytes (JPEG/PNG)
  if (response.startsWith("/9j/") || response.startsWith("iVBORw0KGgo")) {
    return { imageUrl: `data:image/jpeg;base64,${response}`, error: null };
  }

  // 4. PING debug
  if (response === "PING") {
    return {
      imageUrl: null,
      error: "Backend returned a debug PING response. Please try again.",
    };
  }

  // 5. Known error strings
  if (response.startsWith("Error:") || response.startsWith("Error calling")) {
    if (isEmptyHttpResponseError(response)) {
      return {
        imageUrl: null,
        error:
          "HF_EMPTY_RESPONSE: The image generation service returned an empty response. The model may be overloaded.",
      };
    }

    const lower = response.toLowerCase();
    if (lower.includes("hf_token") || lower.includes("token")) {
      return {
        imageUrl: null,
        error: "HF_TOKEN_MISSING: No API token configured.",
      };
    }
    return { imageUrl: null, error: response };
  }

  // 6. HF API structured error
  const hfApiError = parseHuggingFaceApiError(response);
  if (hfApiError) {
    return {
      imageUrl: null,
      error: `HF_REQUEST_FAILED:${hfApiError.status}:${hfApiError.body}`,
    };
  }

  // 7. HTTP numeric error
  const httpErrorMatch = response.match(/^(\d{3})\s*[-:]?\s*(.+)$/);
  if (httpErrorMatch) {
    const [, statusCode, detail] = httpErrorMatch;
    return {
      imageUrl: null,
      error: `HF_REQUEST_FAILED:${statusCode}:${detail}`,
    };
  }

  // 8. Catch-all empty response
  if (isEmptyHttpResponseError(response)) {
    return {
      imageUrl: null,
      error:
        "HF_EMPTY_RESPONSE: The image generation service returned an empty response. The model may be overloaded.",
    };
  }

  // 9. Plain-text "Not Found" from HF (404)
  if (
    response.trim() === "Not Found" ||
    response.trim() === "404 Not Found" ||
    response.trim().toLowerCase() === "not found"
  ) {
    return {
      imageUrl: null,
      error:
        "HF_REQUEST_FAILED:404:Model not found. Please check your model name or try a different model.",
    };
  }

  // 10. Fallback
  return {
    imageUrl: null,
    error: `Generation failed: ${response.slice(0, 300)}`,
  };
}

// ─── Overload detection ───────────────────────────────────────────────────────

export function isOverloadError(result: ParsedImageResult): boolean {
  if (!result.error) return false;
  const err = result.error;
  const lower = err.toLowerCase();
  if (err.includes("503")) return true;
  if (err.includes("HF_EMPTY_RESPONSE")) return true;
  if (
    lower.includes("loading") ||
    lower.includes("overload") ||
    lower.includes("unavailable") ||
    lower.includes("capacity") ||
    lower.includes("busy") ||
    lower.includes("currently loading")
  )
    return true;
  return false;
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface GenerateImageInput {
  positivePrompt: string;
  negativePrompt: string;
  aspectRatio: string;
  seed: bigint;
  temperature: number;
  model: string;
  apiToken: string;
}

// ─── Hook options ─────────────────────────────────────────────────────────────

export interface UseGenerateImageOptions {
  onRetry?: (message: string) => void;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGenerateImage(options: UseGenerateImageOptions = {}) {
  const { actor } = useActor();
  const { onRetry } = options;

  return useMutation<ParsedImageResult, Error, GenerateImageInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend actor not initialized");

      const buildArgs = (model: string): GenerateImageArgs => ({
        positivePrompt: input.positivePrompt,
        negativePrompt: input.negativePrompt,
        aspectRatio: input.aspectRatio,
        seed: input.seed,
        temperature: input.temperature,
        model,
      });

      // Initial attempt with requested model
      const firstResponse = await actor.generateImage(
        buildArgs(input.model),
        input.apiToken,
        input.model,
      );

      let result =
        firstResponse.__kind__ === "err"
          ? parseGenerateImageResponse(firstResponse.err)
          : parseGenerateImageResponse(firstResponse.ok);

      // If not overloaded, return immediately
      if (!isOverloadError(result)) return result;

      // Fallback loop through alternative models, skipping the one already tried
      const triedModel = input.model;
      for (const fallbackModel of FALLBACK_MODELS) {
        if (fallbackModel === triedModel) continue;

        onRetry?.(
          `Modell überlastet, versuche Fallback-Modell: ${fallbackModel}`,
        );

        const fallbackResponse = await actor.generateImage(
          buildArgs(fallbackModel),
          input.apiToken,
          fallbackModel,
        );

        const fallbackResult =
          fallbackResponse.__kind__ === "err"
            ? parseGenerateImageResponse(fallbackResponse.err)
            : parseGenerateImageResponse(fallbackResponse.ok);

        if (fallbackResult.imageUrl !== null) {
          return fallbackResult;
        }

        // If this fallback is also overloaded, keep trying; otherwise stop
        if (!isOverloadError(fallbackResult)) {
          result = fallbackResult;
          break;
        }

        result = fallbackResult;
      }

      // All models exhausted — return with a clear message
      return {
        imageUrl: null,
        error:
          "Alle Modelle sind gerade überlastet. Bitte in ein paar Minuten erneut versuchen.",
      };
    },
  });
}

export function useSendQueries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    string,
    Error,
    { criteria: PoseCriteria; combinations: string }
  >({
    mutationFn: async ({ criteria, combinations }) => {
      if (!actor) throw new Error("Backend actor not initialized");
      return actor.sendQueries(criteria, combinations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promptHistory"] });
    },
  });
}

export function useSavePreset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { name: string; criteria: PoseCriteria }>({
    mutationFn: async ({ name, criteria }) => {
      if (!actor) throw new Error("Backend actor not initialized");
      return actor.savePreset(name, criteria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });
}

export function useGetPresets() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["presets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPresets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPromptHistory() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["promptHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPromptHistory();
    },
    enabled: !!actor && !isFetching,
  });
}
