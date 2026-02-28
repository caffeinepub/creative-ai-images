import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useSavePreset, useGetPresets } from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  BookmarkPlus,
  Camera,
  Sun,
  MapPin,
  Layout,
  Smile,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import type { GenerationParams, OnGeneratePayload } from "../App";
import {
  NEGATIVE_PROMPT_PRESET_OPTIONS,
  type NegativePromptPreset,
  NEGATIVE_PROMPT_PRESETS,
} from "../constants/negativePrompts";
import { EMOTIONS, buildEmotionPrompt, type IntensityLevel } from "../constants/emotions";
import type { PoseCriteria } from "../backend";

const SITUATION_BEHAVIOR_OPTIONS: { value: string; label: string }[] = [
  {
    value: "gazing wistfully into distance, gentle smile, serene contemplation",
    label: "Gazing Wistfully — Serene Contemplation",
  },
  {
    value: "laughing joyfully while twirling, carefree and energetic",
    label: "Laughing & Twirling — Carefree Energy",
  },
  {
    value: "leaning in for a kiss, intense eye contact, romantic tension",
    label: "Leaning In — Romantic Tension",
  },
  {
    value: "reading a book by the window, soft light, peaceful",
    label: "Reading by the Window — Peaceful",
  },
  {
    value: "walking through a park, relaxed stride, natural movement",
    label: "Walking in a Park — Natural Movement",
  },
  {
    value: "sitting at a cafe, thoughtful expression, coffee in hand",
    label: "Sitting at a Café — Thoughtful",
  },
];

const INTENSITY_OPTIONS: { value: IntensityLevel; label: string; description: string }[] = [
  { value: "subtle", label: "Subtle", description: "Understated, nuanced expression" },
  { value: "moderate", label: "Moderate", description: "Clear, recognizable emotion" },
  { value: "intense", label: "Intense", description: "Strong, dramatic expression" },
];

// Shared class for all SelectContent dropdowns — ensures fully opaque background and high z-index
const SELECT_CONTENT_CLASS =
  "z-[9999] bg-popover border-border shadow-2xl backdrop-blur-none";

interface ImageGenerationFormProps {
  onGenerate: (payload: OnGeneratePayload) => void;
  isGenerating: boolean;
}

function buildPrompt(
  params: GenerationParams,
  emotionKey: string,
  emotionIntensity: IntensityLevel | ""
): string {
  const parts: string[] = [];

  if (params.artStyle) {
    const styleMap: Record<string, string> = {
      realistic: "realistic style, photorealistic",
      pencil: "pencil sketch style",
      watercolors: "watercolor painting style",
      cartoon: "cartoon illustration style",
      caricature: "caricature style",
      charcoal: "charcoal drawing style",
    };
    parts.push(styleMap[params.artStyle] ?? `${params.artStyle} style`);
  }

  if (params.situationBehavior && params.situationBehavior !== "none") {
    parts.push(params.situationBehavior);
  }

  if (params.cameraAngle) parts.push(`${params.cameraAngle} shot`);
  if (params.lighting) parts.push(params.lighting);
  if (params.environment) parts.push(`${params.environment} setting`);
  if (params.composition) parts.push(`${params.composition} composition`);

  const emotionPrompt = buildEmotionPrompt(emotionKey, emotionIntensity);
  if (emotionPrompt) parts.push(emotionPrompt);

  return parts.join(", ");
}

const EMPTY_POSE_CRITERIA: PoseCriteria = {
  bodyType: "",
  age: BigInt(0),
  ethnicity: "",
  artStyle: "",
  height: 0,
  weight: 0,
  negativePrompt: "",
  aspectRatio: "1:1",
  cameraLens: "",
  clothing: "",
  situationPose: "",
  situationFiguration: "",
  situationBehavior: "",
  situationPosing: "",
  cameraAngle: "",
  lighting: "",
  environment: "",
  composition: "",
};

export default function ImageGenerationForm({ onGenerate, isGenerating }: ImageGenerationFormProps) {
  const { actor } = useActor();
  const savePresetMutation = useSavePreset();
  const { data: presets = [], isLoading: presetsLoading } = useGetPresets();

  // Core generation params
  const [artStyle, setArtStyle] = useState<GenerationParams["artStyle"]>("");
  const [negativePromptPreset, setNegativePromptPreset] = useState<NegativePromptPreset | "">("");
  const [aspectRatio, setAspectRatio] = useState<GenerationParams["aspectRatio"]>("1:1");
  const [model, setModel] = useState("stabilityai/stable-diffusion-xl-base-1.0");

  // Situation / scene
  const [situationBehavior, setSituationBehavior] = useState("");

  // Bildgestaltung
  const [cameraAngle, setCameraAngle] = useState("");
  const [lighting, setLighting] = useState("");
  const [environment, setEnvironment] = useState("");
  const [composition, setComposition] = useState("");

  // Emotions
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityLevel | "">("");

  // API Token
  const [apiToken, setApiToken] = useState(() => localStorage.getItem("hf_api_token") || "");
  const [showToken, setShowToken] = useState(false);

  // Preset dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  const handleTokenChange = (value: string) => {
    setApiToken(value);
    localStorage.setItem("hf_api_token", value);
  };

  const handleEmotionChange = (value: string) => {
    setSelectedEmotion(value === "none" ? "" : value);
    setSelectedIntensity("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiToken.trim()) {
      toast.error("Please enter your Hugging Face API Token", {
        description: "A valid API token is required to generate images.",
      });
      return;
    }

    if (!artStyle || !negativePromptPreset || !aspectRatio) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!actor) {
      toast.error("Backend connection not ready");
      return;
    }

    const params: GenerationParams = {
      artStyle,
      negativePromptPreset,
      aspectRatio,
      cameraAngle,
      lighting,
      environment,
      composition,
      situationBehavior,
    };

    const positivePrompt = buildPrompt(params, selectedEmotion, selectedIntensity);
    const negativePrompt = negativePromptPreset ? NEGATIVE_PROMPT_PRESETS[negativePromptPreset] : "";
    const seed = BigInt(Math.floor(Math.random() * 255));

    onGenerate({
      criteria: {
        ...EMPTY_POSE_CRITERIA,
        artStyle,
        negativePrompt,
        aspectRatio: aspectRatio || "1:1",
        cameraAngle,
        lighting,
        environment,
        composition,
        situationBehavior,
      },
      positivePrompt,
      negativePrompt,
      aspectRatio: aspectRatio || "1:1",
      seed,
      temperature: 0.7,
      model,
      apiToken: apiToken.trim(),
    });
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    try {
      await savePresetMutation.mutateAsync({
        name: presetName,
        criteria: {
          ...EMPTY_POSE_CRITERIA,
          artStyle,
          negativePrompt: negativePromptPreset ? NEGATIVE_PROMPT_PRESETS[negativePromptPreset] : "",
          aspectRatio: aspectRatio || "1:1",
          cameraAngle,
          lighting,
          environment,
          composition,
          situationBehavior,
        },
      });

      toast.success("Preset saved!", { description: `"${presetName}" has been saved.` });
      setPresetName("");
      setSaveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save preset", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleLoadPreset = (selectedPresetName: string) => {
    const preset = presets.find((p) => p.name === selectedPresetName);
    if (!preset) return;
    const c = preset.criteria;
    setArtStyle((c.artStyle as GenerationParams["artStyle"]) || "");
    setCameraAngle(c.cameraAngle || "");
    setLighting(c.lighting || "");
    setEnvironment(c.environment || "");
    setComposition(c.composition || "");
    setSituationBehavior(c.situationBehavior || "");
    toast.success("Preset loaded!", { description: `"${selectedPresetName}" applied.` });
  };

  const selectedEmotionData = EMOTIONS.find((e) => e.key === selectedEmotion);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* API Token */}
      <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
            <Key className="w-4 h-4" />
            Hugging Face API Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="api-token" className="text-xs text-muted-foreground">
              API Token <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="api-token"
                type={showToken ? "text" : "password"}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiToken}
                onChange={(e) => handleTokenChange(e.target.value)}
                className="pr-10 font-mono text-sm bg-background/60 border-border/60 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showToken ? "Hide token" : "Show token"}
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
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Style & Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Art Style <span className="text-destructive">*</span>
              </Label>
              <Select value={artStyle} onValueChange={(v) => setArtStyle(v as GenerationParams["artStyle"])}>
                <SelectTrigger className="bg-background/60 border-border/60">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  <SelectItem value="realistic">Realistic / Photo</SelectItem>
                  <SelectItem value="pencil">Pencil Sketch</SelectItem>
                  <SelectItem value="watercolors">Watercolors</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="caricature">Caricature</SelectItem>
                  <SelectItem value="charcoal">Charcoal Drawing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Aspect Ratio <span className="text-destructive">*</span>
              </Label>
              <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as GenerationParams["aspectRatio"])}>
                <SelectTrigger className="bg-background/60 border-border/60">
                  <SelectValue placeholder="Select ratio" />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                  <SelectItem value="2:3">2:3 Portrait</SelectItem>
                  <SelectItem value="3:2">3:2 Landscape</SelectItem>
                  <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                  <SelectItem value="9:16">9:16 Vertical</SelectItem>
                  <SelectItem value="21:9">21:9 Ultrawide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-background/60 border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT_CLASS}>
                <SelectItem value="stabilityai/stable-diffusion-xl-base-1.0">
                  Stable Diffusion XL 1.0
                </SelectItem>
                <SelectItem value="stabilityai/stable-diffusion-2-1">
                  Stable Diffusion 2.1
                </SelectItem>
                <SelectItem value="runwayml/stable-diffusion-v1-5">
                  Stable Diffusion 1.5
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Negative Prompt Preset <span className="text-destructive">*</span>
            </Label>
            <Select
              value={negativePromptPreset}
              onValueChange={(v) => setNegativePromptPreset(v as NegativePromptPreset)}
            >
              <SelectTrigger className="bg-background/60 border-border/60">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT_CLASS}>
                {NEGATIVE_PROMPT_PRESET_OPTIONS.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {negativePromptPreset && (
              <p className="text-xs text-muted-foreground italic truncate">
                {NEGATIVE_PROMPT_PRESETS[negativePromptPreset]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scene / Behavior */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Scene & Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Subject Behavior / Pose</Label>
            <Select value={situationBehavior} onValueChange={setSituationBehavior}>
              <SelectTrigger className="bg-background/60 border-border/60">
                <SelectValue placeholder="Select behavior" />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT_CLASS}>
                <SelectItem value="none">None</SelectItem>
                {SITUATION_BEHAVIOR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="bg-background/60 border-border/60">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT_CLASS}>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="outdoor park">Outdoor Park</SelectItem>
                <SelectItem value="urban street">Urban Street</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="beach">Beach</SelectItem>
                <SelectItem value="mountain">Mountain</SelectItem>
                <SelectItem value="cafe interior">Café Interior</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="rooftop">Rooftop</SelectItem>
                <SelectItem value="night city">Night City</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Camera & Lighting */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            Camera & Lighting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Camera Angle</Label>
              <Select value={cameraAngle} onValueChange={setCameraAngle}>
                <SelectTrigger className="bg-background/60 border-border/60">
                  <SelectValue placeholder="Select angle" />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="eye-level">Eye Level</SelectItem>
                  <SelectItem value="low angle">Low Angle</SelectItem>
                  <SelectItem value="high angle">High Angle</SelectItem>
                  <SelectItem value="bird's eye">Bird's Eye</SelectItem>
                  <SelectItem value="dutch angle">Dutch Angle</SelectItem>
                  <SelectItem value="close-up">Close-Up</SelectItem>
                  <SelectItem value="wide">Wide Shot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Lighting</Label>
              <Select value={lighting} onValueChange={setLighting}>
                <SelectTrigger className="bg-background/60 border-border/60">
                  <SelectValue placeholder="Select lighting" />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="natural daylight">Natural Daylight</SelectItem>
                  <SelectItem value="golden hour">Golden Hour</SelectItem>
                  <SelectItem value="blue hour">Blue Hour</SelectItem>
                  <SelectItem value="studio lighting">Studio Lighting</SelectItem>
                  <SelectItem value="dramatic side lighting">Dramatic Side Lighting</SelectItem>
                  <SelectItem value="soft diffused light">Soft Diffused Light</SelectItem>
                  <SelectItem value="neon lighting">Neon Lighting</SelectItem>
                  <SelectItem value="candlelight">Candlelight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Composition</Label>
            <Select value={composition} onValueChange={setComposition}>
              <SelectTrigger className="bg-background/60 border-border/60">
                <SelectValue placeholder="Select composition" />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT_CLASS}>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="rule of thirds">Rule of Thirds</SelectItem>
                <SelectItem value="centered">Centered</SelectItem>
                <SelectItem value="symmetrical">Symmetrical</SelectItem>
                <SelectItem value="leading lines">Leading Lines</SelectItem>
                <SelectItem value="frame within frame">Frame Within Frame</SelectItem>
                <SelectItem value="negative space">Negative Space</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Emotions */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Smile className="w-4 h-4 text-primary" />
            Emotion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Emotion Type</Label>
              <Select value={selectedEmotion || "none"} onValueChange={handleEmotionChange}>
                <SelectTrigger className="bg-background/60 border-border/60">
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  <SelectItem value="none">None</SelectItem>
                  {EMOTIONS.map((emotion) => (
                    <SelectItem key={emotion.key} value={emotion.key}>
                      {emotion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Intensity</Label>
              <Select
                value={selectedIntensity || "none"}
                onValueChange={(v) => setSelectedIntensity(v === "none" ? "" : (v as IntensityLevel))}
                disabled={!selectedEmotion}
              >
                <SelectTrigger className="bg-background/60 border-border/60 disabled:opacity-50">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  <SelectItem value="none">None</SelectItem>
                  {INTENSITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmotionData && selectedIntensity && (
            <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Preview: </span>
                {selectedEmotionData.intensities[selectedIntensity]?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Presets */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-primary" />
            Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {presets.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Load Preset</Label>
              <Select onValueChange={handleLoadPreset}>
                <SelectTrigger className="bg-background/60 border-border/60">
                  <SelectValue placeholder={presetsLoading ? "Loading…" : "Select a preset"} />
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  {presets.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-border/60 hover:border-primary/40 hover:bg-primary/5"
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Current as Preset
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/60">
              <DialogHeader>
                <DialogTitle>Save Preset</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Save your current settings as a reusable preset.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="preset-name" className="text-sm">
                  Preset Name
                </Label>
                <Input
                  id="preset-name"
                  placeholder="e.g. Golden Hour Portrait"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="bg-background/60 border-border/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSavePreset();
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                  className="border-border/60"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSavePreset}
                  disabled={savePresetMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {savePresetMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Preset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Separator className="bg-border/40" />

      {/* Generate Button */}
      <Button
        type="submit"
        disabled={isGenerating || !actor}
        className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow disabled:opacity-50 disabled:shadow-none transition-all"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Image
          </>
        )}
      </Button>
    </form>
  );
}
