export type IntensityLevel = "subtle" | "moderate" | "intense";

export interface EmotionIntensity {
  label: string;
  description: string;
  keywords: string;
}

export interface Emotion {
  key: string;
  label: string;
  icon: string;
  intensities: Record<IntensityLevel, EmotionIntensity>;
}

export const EMOTIONS: Emotion[] = [
  {
    key: "joy",
    label: "Joy / Happiness",
    icon: "😊",
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Gentle smile, soft warmth",
        keywords: "gentle smile, content expression, soft eyes",
      },
      moderate: {
        label: "Moderate",
        description: "Warm smile, bright eyes",
        keywords: "warm smile, bright eyes, slight laugh lines",
      },
      intense: {
        label: "Intense",
        description: "Beaming joy, radiant energy",
        keywords: "beaming smile, laughing openly, radiant joy",
      },
    },
  },
  {
    key: "sadness",
    label: "Sadness / Melancholy",
    icon: "😔",
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Wistful, quietly pensive",
        keywords: "wistful expression, pensive gaze, quiet contemplation",
      },
      moderate: {
        label: "Moderate",
        description: "Visibly sad, downcast",
        keywords: "sad expression, downcast eyes, melancholic mood",
      },
      intense: {
        label: "Intense",
        description: "Deep sorrow, tearful",
        keywords: "deep sorrow, tearful eyes, grief-stricken expression",
      },
    },
  },
  {
    key: "anger",
    label: "Anger / Determination",
    icon: "😤",
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Focused, resolute",
        keywords: "focused expression, resolute gaze, determined look",
      },
      moderate: {
        label: "Moderate",
        description: "Intense, strong-willed",
        keywords: "intense expression, fierce determination",
      },
      intense: {
        label: "Intense",
        description: "Powerful, commanding",
        keywords: "powerful expression, commanding presence, fierce intensity",
      },
    },
  },
  {
    key: "fear",
    label: "Fear / Anxiety",
    icon: "😰",
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Slightly uneasy, cautious",
        keywords: "cautious expression, slightly uneasy, apprehensive look",
      },
      moderate: {
        label: "Moderate",
        description: "Visibly worried, tense",
        keywords: "worried expression, tense posture, anxious look",
      },
      intense: {
        label: "Intense",
        description: "Fearful, wide-eyed",
        keywords: "fearful expression, wide eyes, startled look",
      },
    },
  },
  {
    key: "surprise",
    label: "Surprise / Wonder",
    icon: "😲",
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Raised brow, curious",
        keywords: "raised eyebrows, curious expression",
      },
      moderate: {
        label: "Moderate",
        description: "Wide eyes, open mouth",
        keywords: "wide eyes, open mouth, surprised look",
      },
      intense: {
        label: "Intense",
        description: "Jaw-dropped, astonished",
        keywords: "jaw dropped, astonished, amazed expression",
      },
    },
  },
  {
    key: "confidence",
    label: "Confidence / Pride",
    icon: "😎",
    intensities: {
      subtle: {
        label: "Subtle",
        description: "Calm, self-assured",
        keywords: "calm confident smile, relaxed posture",
      },
      moderate: {
        label: "Moderate",
        description: "Proud, strong gaze",
        keywords: "proud expression, upright posture, strong gaze",
      },
      intense: {
        label: "Intense",
        description: "Commanding, triumphant",
        keywords: "commanding presence, triumphant expression, powerful stance",
      },
    },
  },
];

export function buildEmotionPrompt(
  emotionKey: string,
  intensity: IntensityLevel | "",
): string {
  if (!emotionKey || !intensity) return "";
  const emotion = EMOTIONS.find((e) => e.key === emotionKey);
  if (!emotion) return "";
  const intensityData = emotion.intensities[intensity];
  if (!intensityData) return "";
  return intensityData.keywords;
}
