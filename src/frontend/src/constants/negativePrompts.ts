export type NegativePromptPreset =
  | "Default Safe"
  | "Low Quality"
  | "Blur & Noise"
  | "Anatomical Issues"
  | "Artifacts & Watermarks";

export const NEGATIVE_PROMPT_PRESETS: Record<NegativePromptPreset, string> = {
  "Default Safe":
    "low quality, worst quality, bad anatomy, deformed, blurry, watermark, text, extra limbs, bad hands",
  "Low Quality":
    "low quality, worst quality, jpeg artifacts, pixelated, grainy, overexposed, underexposed",
  "Blur & Noise":
    "blurry, out of focus, motion blur, grainy, noisy, soft focus, hazy",
  "Anatomical Issues":
    "bad anatomy, deformed, distorted proportions, extra limbs, missing limbs, fused fingers, malformed hands, bad hands",
  "Artifacts & Watermarks":
    "watermark, text, logo, signature, border, frame, cropped, cut off, duplicate",
};

export const NEGATIVE_PROMPT_PRESET_OPTIONS: NegativePromptPreset[] = [
  "Default Safe",
  "Low Quality",
  "Blur & Noise",
  "Anatomical Issues",
  "Artifacts & Watermarks",
];
