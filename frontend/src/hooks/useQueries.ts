import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { GenerateImageArgs, PoseCriteria } from "../backend";

// ─── Response parsing ────────────────────────────────────────────────────────

interface ParsedImageResult {
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
      // Return the stringified object so downstream handlers can still read it
      return inner;
    } catch {
      return inner;
    }
  }
  return response;
}

/**
 * Detects whether the error string indicates an empty HTTP response from the
 * Hugging Face endpoint (IC trap with 'empty HTTP response' message).
 */
function isEmptyHttpResponseError(response: string): boolean {
  const lower = response.toLowerCase();
  return (
    lower.includes("empty http response") ||
    lower.includes("empty response") ||
    (lower.includes("ic0503") && lower.includes("trap")) ||
    (lower.includes("canister called") && lower.includes("empty"))
  );
}

/**
 * Detects whether the error string indicates a Hugging Face API HTTP error
 * with a status code, e.g. "Hugging Face API error (status 503): ..."
 */
function parseHuggingFaceApiError(response: string): { status: string; body: string } | null {
  const match = response.match(/hugging face api error \(status (\d+)\):\s*(.*)/i);
  if (match) {
    return { status: match[1], body: match[2].trim() };
  }
  return null;
}

function parseGenerateImageResponse(rawResponse: string): ParsedImageResult {
  // Unwrap the backend's "Unexpected response format: {...}" wrapper first
  const response = unwrapBackendErrorPrefix(rawResponse);

  // 1. Try JSON parse first
  try {
    const json = JSON.parse(response);

    // Success: { imageUrl: "data:..." }
    if (json.imageUrl && typeof json.imageUrl === "string") {
      return { imageUrl: json.imageUrl, error: null };
    }

    // Error: { error: "HF_TOKEN missing" }
    if (json.error === "HF_TOKEN missing" || json.error === "HF_TOKEN_MISSING") {
      return {
        imageUrl: null,
        error: "HF_TOKEN_MISSING: No API token provided. Please enter your Hugging Face API token.",
      };
    }

    // Error: { error: "Invalid JSON" } — malformed request body sent to HF
    if (json.error === "Invalid JSON") {
      return {
        imageUrl: null,
        error: "HF_REQUEST_FAILED:400:The request body was not valid JSON. Please try again.",
      };
    }

    // Error: { error: "...", status: 401, detail: "..." }
    if (json.error) {
      const status = json.status ?? "";
      const detail = json.detail ?? json.error;
      if (status === 401 || String(status) === "401") {
        return {
          imageUrl: null,
          error: `HF_REQUEST_FAILED:401:${detail} — Your API token appears to be invalid or expired.`,
        };
      }
      if (status === 503 || String(status) === "503") {
        return {
          imageUrl: null,
          error: `HF_REQUEST_FAILED:503:${detail} — The model is currently loading. Please try again in a moment.`,
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

  // 2. Legacy data URI
  if (response.startsWith("data:image/")) {
    return { imageUrl: response, error: null };
  }

  // 3. Binary image detection (base64 JPEG/PNG magic bytes)
  if (response.startsWith("/9j/") || response.startsWith("iVBORw0KGgo")) {
    return { imageUrl: `data:image/jpeg;base64,${response}`, error: null };
  }

  // 4. PING debug response
  if (response === "PING") {
    return { imageUrl: null, error: "Backend returned a debug PING response. Please try again." };
  }

  // 5. Known error strings from backend
  if (response.startsWith("Error:") || response.startsWith("Error calling")) {
    const lower = response.toLowerCase();

    // 5a. Empty HTTP response from Hugging Face (IC trap)
    if (isEmptyHttpResponseError(response)) {
      return {
        imageUrl: null,
        error: "HF_EMPTY_RESPONSE: The image generation service returned an empty response. This can happen when the model is overloaded. Please try again in a moment.",
      };
    }

    if (lower.includes("hf_token") || lower.includes("token")) {
      return {
        imageUrl: null,
        error: "HF_TOKEN_MISSING: No API token configured. Please enter your Hugging Face API token.",
      };
    }
    return { imageUrl: null, error: response };
  }

  // 6. Hugging Face API error with status code returned as structured text
  const hfApiError = parseHuggingFaceApiError(response);
  if (hfApiError) {
    return {
      imageUrl: null,
      error: `HF_REQUEST_FAILED:${hfApiError.status}:${hfApiError.body}`,
    };
  }

  // 7. HTTP error strings
  const httpErrorMatch = response.match(/^(\d{3})\s*[-:]?\s*(.+)$/);
  if (httpErrorMatch) {
    const [, statusCode, detail] = httpErrorMatch;
    return { imageUrl: null, error: `HF_REQUEST_FAILED:${statusCode}:${detail}` };
  }

  // 8. Catch-all empty response check (in case the error arrives without the "Error calling" prefix)
  if (isEmptyHttpResponseError(response)) {
    return {
      imageUrl: null,
      error: "HF_EMPTY_RESPONSE: The image generation service returned an empty response. This can happen when the model is overloaded. Please try again in a moment.",
    };
  }

  // 9. Fallback — show the (already-unwrapped) response text directly
  return {
    imageUrl: null,
    error: `Generation failed: ${response.slice(0, 300)}`,
  };
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

interface GenerateImageInput {
  positivePrompt: string;
  negativePrompt: string;
  aspectRatio: string;
  seed: bigint;
  temperature: number;
  model: string;
  apiToken: string;
}

export function useGenerateImage() {
  const { actor } = useActor();

  return useMutation<ParsedImageResult, Error, GenerateImageInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend actor not initialized");

      const args: GenerateImageArgs = {
        positivePrompt: input.positivePrompt,
        negativePrompt: input.negativePrompt,
        aspectRatio: input.aspectRatio,
        seed: input.seed,
        temperature: input.temperature,
        model: input.model,
      };

      // Use generateImage with the user-supplied token
      const response = await actor.generateImage(args, input.apiToken, input.model);

      // Handle the GenerateImageResult variant type
      if (response.__kind__ === "err") {
        return parseGenerateImageResponse(response.err);
      }
      return parseGenerateImageResponse(response.ok);
    },
  });
}

export function useSendQueries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<string, Error, { criteria: PoseCriteria; combinations: string }>({
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
