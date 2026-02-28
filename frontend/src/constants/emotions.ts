export type IntensityLevel = "subtle" | "moderate" | "intense";

export interface EmotionIntensity {
  label: string;
  description: string;
  keywords: string[];
}

export interface Emotion {
  key: string;
  label: string;
  keywords: string[];
  intensities: Record<IntensityLevel, EmotionIntensity>;
}

export const EMOTIONS: Emotion[] = [
  {
    key: "joy",
    label: "Joy / Happiness",
    keywords: ["joyful", "happy", "smiling", "radiant"],
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Gentle smile, soft warmth",
        keywords: ["gentle smile", "soft warmth", "content expression"],
      },
      moderate: {
        label: "Moderate",
        description: "Clear happiness, bright eyes",
        keywords: ["bright smile", "happy expression", "cheerful demeanor"],
      },
      intense: {
        label: "Intense",
        description: "Beaming joy, radiant energy",
        keywords: ["beaming smile", "radiant joy", "exuberant happiness", "laughing"],
      },
    },
  },
  {
    key: "sadness",
    label: "Sadness / Melancholy",
    keywords: ["sad", "melancholic", "wistful", "pensive"],
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Wistful, quietly pensive",
        keywords: ["wistful expression", "pensive gaze", "quiet contemplation"],
      },
      moderate: {
        label: "Moderate",
        description: "Visibly sad, downcast",
        keywords: ["sad expression", "downcast eyes", "melancholic mood"],
      },
      intense: {
        label: "Intense",
        description: "Deep sorrow, tearful",
        keywords: ["deep sorrow", "tearful eyes", "grief-stricken expression"],
      },
    },
  },
  {
    key: "anger",
    label: "Anger / Determination",
    keywords: ["determined", "fierce", "intense gaze", "strong"],
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Focused, resolute",
        keywords: ["focused expression", "resolute gaze", "determined look"],
      },
      moderate: {
        label: "Moderate",
        description: "Clearly intense, strong-willed",
        keywords: ["intense expression", "strong-willed", "fierce determination"],
      },
      intense: {
        label: "Intense",
        description: "Powerful, commanding presence",
        keywords: ["powerful expression", "commanding presence", "fierce intensity"],
      },
    },
  },
  {
    key: "fear",
    label: "Fear / Anxiety",
    keywords: ["anxious", "worried", "tense", "apprehensive"],
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Slightly uneasy, cautious",
        keywords: ["cautious expression", "slightly uneasy", "apprehensive look"],
      },
      moderate: {
        label: "Moderate",
        description: "Visibly worried, tense",
        keywords: ["worried expression", "tense posture", "anxious look"],
      },
      intense: {
        label: "Intense",
        description: "Fearful, wide-eyed",
        keywords: ["fearful expression", "wide eyes", "startled look", "tense"],
      },
    },
  },
];

export function buildEmotionPrompt(emotionKey: string, intensity: IntensityLevel | ""): string {
  if (!emotionKey || !intensity) return "";
  const emotion = EMOTIONS.find((e) => e.key === emotionKey);
  if (!emotion) return "";
  const intensityData = emotion.intensities[intensity];
  if (!intensityData) return "";
  return intensityData.keywords.join(", ");
}
