// Negative prompt presets for Stable Diffusion
export const NEGATIVE_PROMPT_PRESETS = {
  'Low Quality': 'low quality, blurry, pixelated, distorted, jpeg artifacts, low resolution, poorly rendered, bad quality, worst quality, low detail, grainy, noisy, out of focus, fuzzy',
  'Anatomical Issues': 'bad anatomy, deformed, mutated, disfigured, extra limbs, missing limbs, extra fingers, missing fingers, fused fingers, malformed hands, poorly drawn hands, poorly drawn face, mutation, ugly, bad proportions, gross proportions, asymmetric, unnatural pose',
  'Artifacts': 'artifacts, noise, compression artifacts, watermark, signature, text, logo, username, error, glitch, duplicate, cloned, repeated patterns, tiling, seams, stitching errors, border artifacts',
  'Default Safe': 'nsfw, nude, naked, explicit, sexual content, inappropriate, adult content, violence, gore, blood, disturbing, offensive',
  'None': '',
} as const;

export type NegativePromptPreset = keyof typeof NEGATIVE_PROMPT_PRESETS;

export const NEGATIVE_PROMPT_PRESET_OPTIONS: NegativePromptPreset[] = [
  'Low Quality',
  'Anatomical Issues',
  'Artifacts',
  'Default Safe',
  'None',
];
