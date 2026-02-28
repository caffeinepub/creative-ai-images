import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Wand2, Sparkles, Camera, Palette, Layers, Heart } from "lucide-react";
import {
  NEGATIVE_PROMPT_PRESETS,
  NEGATIVE_PROMPT_PRESET_OPTIONS,
  type NegativePromptPreset,
} from "@/constants/negativePrompts";
import { EMOTIONS, buildEmotionPrompt, type IntensityLevel } from "@/constants/emotions";
import type { OnGeneratePayload } from "@/App";

interface ImageGenerationFormProps {
  onGenerate: (payload: OnGeneratePayload) => void;
  isGenerating: boolean;
}

const ART_STYLES = [
  "Photorealistic",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "Sketch",
  "Anime",
  "Comic Book",
  "Cinematic",
  "Fantasy Art",
  "Impressionist",
  "Minimalist",
  "Surrealist",
  "Pop Art",
  "Concept Art",
  "3D Render",
];

const ASPECT_RATIOS = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Portrait (2:3)", value: "2:3" },
  { label: "Landscape (3:2)", value: "3:2" },
  { label: "Wide (16:9)", value: "16:9" },
  { label: "Tall (9:16)", value: "9:16" },
  { label: "Ultra Wide (21:9)", value: "21:9" },
];

const MODELS = [
  { label: "Stable Diffusion v1.5", value: "runwayml/stable-diffusion-v1-5" },
  { label: "Stable Diffusion XL", value: "stabilityai/stable-diffusion-xl-base-1.0" },
  { label: "Dreamshaper", value: "Lykon/dreamshaper-8" },
  { label: "Realistic Vision", value: "SG161222/Realistic_Vision_V6.0_B1_noVAE" },
  { label: "Random Model", value: "random_model" },
];

const CAMERA_LENSES = [
  "35mm",
  "50mm",
  "85mm",
  "135mm",
  "24mm wide angle",
  "Fisheye",
  "Macro",
  "Telephoto 200mm",
  "Tilt-shift",
];

const CAMERA_ANGLES = [
  "Eye level",
  "Low angle",
  "High angle",
  "Bird's eye view",
  "Dutch angle",
  "Over the shoulder",
  "Close-up",
  "Extreme close-up",
  "Medium shot",
  "Full body shot",
];

const LIGHTING_OPTIONS = [
  "Natural daylight",
  "Golden hour",
  "Blue hour",
  "Studio lighting",
  "Dramatic shadows",
  "Soft diffused",
  "Neon lights",
  "Candlelight",
  "Moonlight",
  "Backlit silhouette",
];

const ENVIRONMENTS = [
  "Urban street",
  "Forest",
  "Beach",
  "Mountain",
  "Desert",
  "Studio",
  "Indoor home",
  "Office",
  "Fantasy realm",
  "Space",
  "Underwater",
  "Rooftop",
  "Garden",
  "Industrial",
];

const COMPOSITIONS = [
  "Rule of thirds",
  "Centered",
  "Symmetrical",
  "Leading lines",
  "Frame within frame",
  "Negative space",
  "Golden ratio",
  "Dynamic diagonal",
];

const BODY_TYPES = ["Athletic", "Slim", "Curvy", "Plus size", "Muscular", "Average"];
const ETHNICITIES = [
  "Diverse",
  "Asian",
  "Black",
  "Hispanic",
  "Middle Eastern",
  "South Asian",
  "White",
];
const CLOTHING_STYLES = [
  "Casual",
  "Formal",
  "Business casual",
  "Athletic wear",
  "Evening gown",
  "Street fashion",
  "Vintage",
  "Bohemian",
  "Minimalist",
  "Haute couture",
];

export default function ImageGenerationForm({ onGenerate, isGenerating }: ImageGenerationFormProps) {
  const [artStyle, setArtStyle] = useState("Photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [model, setModel] = useState("runwayml/stable-diffusion-v1-5");
  const [negativePreset, setNegativePreset] = useState<NegativePromptPreset>("Default Safe");
  const [customNegative, setCustomNegative] = useState("");
  const [scene, setScene] = useState("");
  const [cameraLens, setCameraLens] = useState("50mm");
  const [cameraAngle, setCameraAngle] = useState("Eye level");
  const [lighting, setLighting] = useState("Natural daylight");
  const [environment, setEnvironment] = useState("Urban street");
  const [composition, setComposition] = useState("Rule of thirds");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityLevel | "">("");
  const [bodyType, setBodyType] = useState("Athletic");
  const [ethnicity, setEthnicity] = useState("Diverse");
  const [clothing, setClothing] = useState("Casual");
  const [apiToken, setApiToken] = useState(() => localStorage.getItem("hf_api_token") || "");
  const [showToken, setShowToken] = useState(false);

  const handleTokenChange = (value: string) => {
    setApiToken(value);
    localStorage.setItem("hf_api_token", value);
  };

  const buildPrompt = (): string => {
    const emotionText = buildEmotionPrompt(selectedEmotion, selectedIntensity);
    const parts = [
      scene,
      `${artStyle} style`,
      `${bodyType} body type`,
      ethnicity !== "Diverse" ? `${ethnicity} person` : "",
      `wearing ${clothing}`,
      `${environment} environment`,
      `${cameraAngle} shot`,
      `${cameraLens} lens`,
      `${lighting} lighting`,
      `${composition} composition`,
      emotionText,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleGenerate = () => {
    const negativePrompt = customNegative
      ? `${NEGATIVE_PROMPT_PRESETS[negativePreset]}, ${customNegative}`
      : NEGATIVE_PROMPT_PRESETS[negativePreset];

    onGenerate({
      positivePrompt: buildPrompt(),
      negativePrompt,
      aspectRatio,
      seed: BigInt(Math.floor(Math.random() * 255)),
      temperature: 0.7,
      model,
      apiToken,
    });
  };

  return (
    <div className="space-y-4">
      {/* API Token */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="api-token" className="text-xs text-muted-foreground">
              Hugging Face API Token
            </Label>
            <div className="relative">
              <Input
                id="api-token"
                type={showToken ? "text" : "password"}
                placeholder="hf_..."
                value={apiToken}
                onChange={(e) => handleTokenChange(e.target.value)}
                className="pr-10 bg-background/50 border-border/50 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your free token at{" "}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                huggingface.co/settings/tokens
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Style & Model */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Style & Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Art Style</Label>
            <Select value={artStyle} onValueChange={setArtStyle}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {ART_STYLES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {ASPECT_RATIOS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Negative Prompt Preset</Label>
            <Select
              value={negativePreset}
              onValueChange={(v) => setNegativePreset(v as NegativePromptPreset)}
            >
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {NEGATIVE_PROMPT_PRESET_OPTIONS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Custom Negative Prompt</Label>
            <Textarea
              placeholder="Additional things to avoid..."
              value={customNegative}
              onChange={(e) => setCustomNegative(e.target.value)}
              className="bg-background/50 border-border/50 text-sm resize-none h-16"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scene & Subject */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            Scene & Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Scene Description</Label>
            <Textarea
              placeholder="Describe your scene..."
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              className="bg-background/50 border-border/50 text-sm resize-none h-20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Body Type</Label>
            <Select value={bodyType} onValueChange={setBodyType}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {BODY_TYPES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ethnicity</Label>
            <Select value={ethnicity} onValueChange={setEthnicity}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {ETHNICITIES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Clothing Style</Label>
            <Select value={clothing} onValueChange={setClothing}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {CLOTHING_STYLES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {ENVIRONMENTS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Camera & Lighting */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            Camera & Lighting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Camera Lens</Label>
            <Select value={cameraLens} onValueChange={setCameraLens}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {CAMERA_LENSES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Camera Angle</Label>
            <Select value={cameraAngle} onValueChange={setCameraAngle}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {CAMERA_ANGLES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Lighting</Label>
            <Select value={lighting} onValueChange={setLighting}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {LIGHTING_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Composition</Label>
            <Select value={composition} onValueChange={setComposition}>
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                {COMPOSITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Emotions */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Emotions & Mood
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Emotion</Label>
            <Select
              value={selectedEmotion || "none"}
              onValueChange={(v) => {
                setSelectedEmotion(v === "none" ? "" : v);
                setSelectedIntensity("");
              }}
            >
              <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                <SelectValue placeholder="Select emotion" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[99999]">
                <SelectItem value="none">None</SelectItem>
                {EMOTIONS.map((e) => (
                  <SelectItem key={e.key} value={e.key}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmotion && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Intensity</Label>
              <div className="flex gap-2">
                {(["subtle", "moderate", "intense"] as IntensityLevel[]).map((level) => (
                  <Badge
                    key={level}
                    variant={selectedIntensity === level ? "default" : "outline"}
                    className="cursor-pointer text-xs capitalize transition-all hover:scale-105 flex-1 justify-center py-1"
                    onClick={() => setSelectedIntensity(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompt Preview */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Prompt Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed bg-background/50 rounded-md p-3 border border-border/30 min-h-[60px]">
            {buildPrompt() || "Configure settings above to see your prompt..."}
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !apiToken}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
        size="lg"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Generate Image
          </span>
        )}
      </Button>
    </div>
  );
}
