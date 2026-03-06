import type { OnGeneratePayload } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  EMOTIONS,
  type IntensityLevel,
  buildEmotionPrompt,
} from "@/constants/emotions";
import {
  NEGATIVE_PROMPT_PRESETS,
  NEGATIVE_PROMPT_PRESET_OPTIONS,
  type NegativePromptPreset,
} from "@/constants/negativePrompts";
import {
  Camera,
  ExternalLink,
  Eye,
  EyeOff,
  Heart,
  Layers,
  Loader2,
  Palette,
  Smile,
  Sparkles,
  User,
  Wand2,
} from "lucide-react";
import { useCallback, useState } from "react";

// ─── Data constants ───────────────────────────────────────────────────────────

const ART_STYLES = [
  "Photorealistic",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "Sketch",
  "Pencil Sketch",
  "Charcoal",
  "Anime",
  "Comic Book",
  "Cartoon",
  "Caricature",
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
  { label: "1:1 Square", value: "1:1" },
  { label: "2:3 Portrait", value: "2:3" },
  { label: "3:2 Landscape", value: "3:2" },
  { label: "16:9 Wide", value: "16:9" },
  { label: "9:16 Tall", value: "9:16" },
  { label: "21:9 Ultra Wide", value: "21:9" },
];

const MODELS = [
  { label: "Stable Diffusion v1.5", value: "runwayml/stable-diffusion-v1-5" },
  {
    label: "Stable Diffusion XL",
    value: "stabilityai/stable-diffusion-xl-base-1.0",
  },
  { label: "Dreamshaper 8", value: "Lykon/dreamshaper-8" },
  {
    label: "Realistic Vision V6",
    value: "SG161222/Realistic_Vision_V6.0_B1_noVAE",
  },
  { label: "Random Model", value: "random_model" },
];

const BODY_TYPES = [
  "Athletic",
  "Slim",
  "Average",
  "Curvy",
  "Chubby",
  "Soft belly",
  "Plus size",
  "Buxom",
  "Mature",
  "Muscular",
];

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
  "Form-fitting dress",
  "Beachwear",
  "Swimwear",
  "Bikini",
  "Sarong",
  "Sun dress",
];

const ENVIRONMENTS = [
  "Urban street",
  "Forest",
  "Beach",
  "Tropical beach",
  "Sandy beach at golden hour",
  "Ocean waves",
  "Beach cabana",
  "Poolside",
  "Tropical resort pool",
  "Beach volleyball court",
  "Coral reef underwater",
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
  "Park",
  "Bedroom",
  "Shower",
  "Balcony",
];

const CAMERA_LENSES = [
  "24mm wide angle",
  "35mm",
  "50mm",
  "85mm",
  "135mm",
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
  "Tropical sunlight",
  "Sun-drenched",
  "Sunset glow over water",
  "Bright midday sun",
  "Soft beach haze",
  "Studio lighting",
  "Dramatic shadows",
  "Soft diffused",
  "Neon lights",
  "Candlelight",
  "Moonlight",
  "Backlit silhouette",
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
  "Intimate",
];

const SITUATION_BEHAVIORS = [
  "gazing wistfully into distance, gentle smile, serene contemplation",
  "laughing joyfully while twirling, carefree and energetic",
  "leaning in for a kiss, intense eye contact, romantic tension",
  "sitting quietly, deep in thought, contemplative mood",
  "stretching arms wide, embracing the world, full of energy",
  "running through open space, hair flowing, joyful movement",
  "curled up reading, cozy and absorbed, soft candlelight",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Short display label for a long behavior string */
function behaviorLabel(behavior: string): string {
  const firstPhrase = behavior.split(",")[0];
  return firstPhrase.charAt(0).toUpperCase() + firstPhrase.slice(1);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ImageGenerationFormProps {
  onGenerate: (payload: OnGeneratePayload) => void;
  isGenerating: boolean;
}

// ─── Card section wrapper ─────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-sm shadow-card">
      <CardHeader className="pb-2.5 pt-4 px-4">
        <CardTitle className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <Separator className="opacity-30 mx-4 w-auto" />
      <CardContent className="pt-3 px-4 pb-4 space-y-3">{children}</CardContent>
    </Card>
  );
}

// ─── Select field ─────────────────────────────────────────────────────────────

interface FieldSelectProps {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  ocid?: string;
  children: React.ReactNode;
  placeholder?: string;
}

function FieldSelect({
  label,
  value,
  onValueChange,
  ocid,
  children,
  placeholder,
}: FieldSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          data-ocid={ocid}
          className="bg-background/40 border-border/30 text-sm h-9 focus:ring-ring/50"
        >
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="z-[99999]">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ImageGenerationForm({
  onGenerate,
  isGenerating,
}: ImageGenerationFormProps) {
  // API Config
  const [apiToken, setApiToken] = useState(
    () => localStorage.getItem("hf_api_token") || "",
  );
  const [showToken, setShowToken] = useState(false);

  // Style & Model
  const [artStyle, setArtStyle] = useState("Photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [model, setModel] = useState("runwayml/stable-diffusion-v1-5");
  const [negativePreset, setNegativePreset] =
    useState<NegativePromptPreset>("Default Safe");
  const [customNegative, setCustomNegative] = useState("");

  // Scene & Subject
  const [scene, setScene] = useState("");
  const [bodyType, setBodyType] = useState("Average");
  const [ethnicity, setEthnicity] = useState("Diverse");
  const [clothing, setClothing] = useState("Casual");
  const [environment, setEnvironment] = useState("Urban street");

  // Camera & Lighting
  const [cameraLens, setCameraLens] = useState("50mm");
  const [cameraAngle, setCameraAngle] = useState("Eye level");
  const [lighting, setLighting] = useState("Natural daylight");
  const [composition, setComposition] = useState("Rule of thirds");

  // Emotions
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedIntensity, setSelectedIntensity] = useState<
    IntensityLevel | ""
  >("");

  // Situation
  const [situationBehavior, setSituationBehavior] = useState("");

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleTokenChange = useCallback((value: string) => {
    setApiToken(value);
    localStorage.setItem("hf_api_token", value);
  }, []);

  const buildPrompt = useCallback((): string => {
    const emotionText = buildEmotionPrompt(selectedEmotion, selectedIntensity);
    const parts = [
      scene.trim(),
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
      situationBehavior,
    ].filter(Boolean);
    return parts.join(", ");
  }, [
    scene,
    artStyle,
    bodyType,
    ethnicity,
    clothing,
    environment,
    cameraAngle,
    cameraLens,
    lighting,
    composition,
    selectedEmotion,
    selectedIntensity,
    situationBehavior,
  ]);

  const handleGenerate = useCallback(() => {
    const negativePrompt = customNegative.trim()
      ? `${NEGATIVE_PROMPT_PRESETS[negativePreset]}, ${customNegative.trim()}`
      : NEGATIVE_PROMPT_PRESETS[negativePreset];

    onGenerate({
      positivePrompt: buildPrompt(),
      negativePrompt,
      aspectRatio,
      seed: BigInt(Math.floor(Math.random() * 4294967295)),
      temperature: 0.7,
      model,
      apiToken,
    });
  }, [
    customNegative,
    negativePreset,
    buildPrompt,
    aspectRatio,
    model,
    apiToken,
    onGenerate,
  ]);

  const prompt = buildPrompt();

  return (
    <div className="space-y-3">
      {/* ── 1. API Configuration ─────────────────────────────────────────── */}
      <SectionCard
        icon={<Sparkles className="w-3.5 h-3.5" />}
        title="API Configuration"
      >
        <div className="space-y-1.5">
          <Label htmlFor="api-token" className="text-xs text-muted-foreground">
            Hugging Face API Token
          </Label>
          <div className="relative">
            <Input
              id="api-token"
              data-ocid="form.api_token.input"
              type={showToken ? "text" : "password"}
              placeholder="hf_..."
              value={apiToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="pr-10 bg-background/40 border-border/30 text-sm h-9 font-mono focus:ring-ring/50"
            />
            <button
              type="button"
              onClick={() => setShowToken((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
              aria-label={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get your free token at{" "}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              huggingface.co/settings/tokens
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </SectionCard>

      {/* ── 2. Style & Model ─────────────────────────────────────────────── */}
      <SectionCard
        icon={<Palette className="w-3.5 h-3.5" />}
        title="Style & Model"
      >
        <FieldSelect
          label="Art Style"
          value={artStyle}
          onValueChange={setArtStyle}
          ocid="form.art_style.select"
        >
          {ART_STYLES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Aspect Ratio"
          value={aspectRatio}
          onValueChange={setAspectRatio}
          ocid="form.aspect_ratio.select"
        >
          {ASPECT_RATIOS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="AI Model"
          value={model}
          onValueChange={setModel}
          ocid="form.model.select"
        >
          {MODELS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Negative Prompt Preset"
          value={negativePreset}
          onValueChange={(v) => setNegativePreset(v as NegativePromptPreset)}
        >
          {NEGATIVE_PROMPT_PRESET_OPTIONS.map((key) => (
            <SelectItem key={key} value={key}>
              {key}
            </SelectItem>
          ))}
        </FieldSelect>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Custom Negative Prompt
          </Label>
          <Textarea
            placeholder="Additional things to avoid..."
            value={customNegative}
            onChange={(e) => setCustomNegative(e.target.value)}
            className="bg-background/40 border-border/30 text-sm resize-none h-16 focus:ring-ring/50"
          />
        </div>
      </SectionCard>

      {/* ── 3. Scene & Subject ───────────────────────────────────────────── */}
      <SectionCard
        icon={<User className="w-3.5 h-3.5" />}
        title="Scene & Subject"
      >
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Scene Description
          </Label>
          <Textarea
            placeholder="Describe your scene, subject, or specific details..."
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            className="bg-background/40 border-border/30 text-sm resize-none h-20 focus:ring-ring/50"
          />
        </div>

        <FieldSelect
          label="Body Type"
          value={bodyType}
          onValueChange={setBodyType}
          ocid="form.body_type.select"
        >
          {BODY_TYPES.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Ethnicity / Diversity"
          value={ethnicity}
          onValueChange={setEthnicity}
        >
          {ETHNICITIES.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Clothing Style"
          value={clothing}
          onValueChange={setClothing}
        >
          {CLOTHING_STYLES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Environment"
          value={environment}
          onValueChange={setEnvironment}
        >
          {ENVIRONMENTS.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </FieldSelect>
      </SectionCard>

      {/* ── 4. Camera & Lighting ─────────────────────────────────────────── */}
      <SectionCard
        icon={<Camera className="w-3.5 h-3.5" />}
        title="Camera & Lighting"
      >
        <FieldSelect
          label="Camera Lens"
          value={cameraLens}
          onValueChange={setCameraLens}
        >
          {CAMERA_LENSES.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Camera Angle"
          value={cameraAngle}
          onValueChange={setCameraAngle}
        >
          {CAMERA_ANGLES.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Lighting"
          value={lighting}
          onValueChange={setLighting}
        >
          {LIGHTING_OPTIONS.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </FieldSelect>

        <FieldSelect
          label="Composition"
          value={composition}
          onValueChange={setComposition}
        >
          {COMPOSITIONS.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </FieldSelect>
      </SectionCard>

      {/* ── 5. Emotions & Mood ───────────────────────────────────────────── */}
      <SectionCard
        icon={<Heart className="w-3.5 h-3.5" />}
        title="Emotions & Mood"
      >
        <FieldSelect
          label="Emotion"
          value={selectedEmotion || "none"}
          onValueChange={(v) => {
            setSelectedEmotion(v === "none" ? "" : v);
            setSelectedIntensity("");
          }}
          ocid="form.emotion.select"
          placeholder="Select emotion"
        >
          <SelectItem value="none">None</SelectItem>
          {EMOTIONS.map((e) => (
            <SelectItem key={e.key} value={e.key}>
              <span className="flex items-center gap-2">
                <span>{e.icon}</span>
                <span>{e.label}</span>
              </span>
            </SelectItem>
          ))}
        </FieldSelect>

        {selectedEmotion && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Intensity</Label>
            <div className="flex gap-2">
              {(["subtle", "moderate", "intense"] as IntensityLevel[]).map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedIntensity(level)}
                    className={[
                      "flex-1 py-1.5 px-2 text-xs font-medium rounded-md border capitalize transition-all duration-150",
                      selectedIntensity === level
                        ? "border-primary/60 bg-primary/15 text-primary shadow-glow-sm"
                        : "border-border/30 bg-background/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    ].join(" ")}
                  >
                    {level}
                  </button>
                ),
              )}
            </div>
            {selectedIntensity && (
              <p className="text-xs text-muted-foreground/70 italic px-0.5">
                {
                  EMOTIONS.find((e) => e.key === selectedEmotion)?.intensities[
                    selectedIntensity
                  ]?.description
                }
              </p>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── 6. Situation & Behavior ──────────────────────────────────────── */}
      <SectionCard
        icon={<Smile className="w-3.5 h-3.5" />}
        title="Situation & Behavior"
      >
        <FieldSelect
          label="Behavior Preset"
          value={situationBehavior || "none"}
          onValueChange={(v) => setSituationBehavior(v === "none" ? "" : v)}
          ocid="form.situation.select"
          placeholder="Select behavior"
        >
          <SelectItem value="none">None</SelectItem>
          {SITUATION_BEHAVIORS.map((b) => (
            <SelectItem key={b} value={b}>
              {behaviorLabel(b)}
            </SelectItem>
          ))}
        </FieldSelect>

        {situationBehavior && (
          <p className="text-xs text-muted-foreground/70 italic px-0.5 leading-relaxed">
            "{situationBehavior}"
          </p>
        )}
      </SectionCard>

      {/* ── 7. Prompt Preview ────────────────────────────────────────────── */}
      <SectionCard
        icon={<Layers className="w-3.5 h-3.5" />}
        title="Prompt Preview"
      >
        <div className="rounded-md bg-background/40 border border-border/20 p-3 min-h-[64px]">
          {prompt ? (
            <p className="text-xs text-foreground/80 leading-relaxed font-mono break-words">
              {prompt}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">
              Configure settings above to see your assembled prompt…
            </p>
          )}
        </div>
      </SectionCard>

      {/* ── 8. Generate button ───────────────────────────────────────────── */}
      <Button
        data-ocid="form.generate.primary_button"
        onClick={handleGenerate}
        disabled={isGenerating || !apiToken.trim()}
        className="w-full h-11 font-display font-semibold text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-glow transition-all duration-200 disabled:opacity-40 disabled:shadow-none"
        size="lg"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Generate Image
          </span>
        )}
      </Button>

      {!apiToken.trim() && (
        <p className="text-center text-xs text-muted-foreground/60">
          Enter your HF API token above to enable generation
        </p>
      )}
    </div>
  );
}
