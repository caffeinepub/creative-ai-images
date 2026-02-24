import { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useGenerateImage, useSavePreset, useGetPresets } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Save, BookmarkPlus, Drama, Camera, Sun, MapPin, Layout } from 'lucide-react';
import { toast } from 'sonner';
import type { GenerationParams } from '../App';
import { NEGATIVE_PROMPT_PRESET_OPTIONS, type NegativePromptPreset, NEGATIVE_PROMPT_PRESETS } from '../constants/negativePrompts';

interface ImageGenerationFormProps {
  onGenerate: (params: GenerationParams, prompt: string, imageData: Uint8Array | null) => void;
  generatePrompt: (params: GenerationParams) => string;
}

export default function ImageGenerationForm({ onGenerate, generatePrompt }: ImageGenerationFormProps) {
  const { actor } = useActor();
  const generateImageMutation = useGenerateImage();
  const savePresetMutation = useSavePreset();
  const { data: presets = [], isLoading: presetsLoading } = useGetPresets();

  const [bodyType, setBodyType] = useState<GenerationParams['bodyType']>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState<GenerationParams['age']>('');
  const [ethnicity, setEthnicity] = useState<GenerationParams['ethnicity']>('');
  const [artStyle, setArtStyle] = useState<GenerationParams['artStyle']>('');
  const [negativePromptPreset, setNegativePromptPreset] = useState<NegativePromptPreset | ''>('');
  const [aspectRatio, setAspectRatio] = useState<GenerationParams['aspectRatio']>('1:1');
  const [cameraLens, setCameraLens] = useState<string>('');
  const [clothing, setClothing] = useState<string>('');

  // Situation parameters
  const [situationPose, setSituationPose] = useState<string>('');
  const [situationFiguration, setSituationFiguration] = useState<string>('');
  const [situationBehavior, setSituationBehavior] = useState<string>('');
  const [situationPosing, setSituationPosing] = useState<string>('');

  // Bildgestaltung parameters
  const [cameraAngle, setCameraAngle] = useState<string>('');
  const [lighting, setLighting] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [composition, setComposition] = useState<string>('');

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bodyType || !height || !weight || !age || !ethnicity || !artStyle || !negativePromptPreset || !aspectRatio) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready');
      return;
    }

    const params: GenerationParams = {
      bodyType,
      height,
      weight,
      age,
      ethnicity,
      artStyle,
      negativePromptPreset,
      aspectRatio,
      cameraLens,
      clothing,
      situationPose,
      situationFiguration,
      situationBehavior,
      situationPosing,
      cameraAngle,
      lighting,
      environment,
      composition,
    };

    const prompt = generatePrompt(params);

    try {
      const imageData = await generateImageMutation.mutateAsync({
        bodyType,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age,
        ethnicity,
        artStyle,
        negativePromptPreset,
        aspectRatio,
        cameraLens,
        clothing,
        situationPose,
        situationFiguration,
        situationBehavior,
        situationPosing,
        cameraAngle,
        lighting,
        environment,
        composition,
        prompt,
      });

      onGenerate(params, prompt, imageData);
      toast.success('Image generated successfully!', {
        description: 'Your AI-generated image is ready.',
      });
    } catch (error) {
      // Show the image display with prompt even if generation fails
      onGenerate(params, prompt, null);

      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000,
      });
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    if (!bodyType || !height || !weight || !age || !ethnicity || !artStyle || !negativePromptPreset || !aspectRatio) {
      toast.error('Please fill in all required fields before saving');
      return;
    }

    try {
      await savePresetMutation.mutateAsync({
        name: presetName,
        bodyType,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age,
        ethnicity,
        artStyle,
        negativePromptPreset,
        aspectRatio,
        cameraLens,
        clothing,
        situationPose,
        situationFiguration,
        situationBehavior,
        situationPosing,
        cameraAngle,
        lighting,
        environment,
        composition,
      });

      toast.success('Preset saved successfully!', {
        description: `"${presetName}" has been saved.`,
      });
      setPresetName('');
      setSaveDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save preset', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleLoadPreset = (selectedPresetName: string) => {
    const preset = presets.find(p => p.name === selectedPresetName);
    if (!preset) return;

    const criteria = preset.criteria;

    // Map age number back to string
    const ageMap: Record<number, GenerationParams['age']> = {
      25: 'young adult',
      35: 'adult',
      50: 'mature',
    };

    // Find the negative prompt preset that matches the text
    let matchingPreset: NegativePromptPreset | '' = '';
    for (const [key, value] of Object.entries(NEGATIVE_PROMPT_PRESETS)) {
      if (value === criteria.negativePrompt) {
        matchingPreset = key as NegativePromptPreset;
        break;
      }
    }

    setBodyType(criteria.bodyType as GenerationParams['bodyType']);
    setHeight(criteria.height.toString());
    setWeight(criteria.weight.toString());
    setAge(ageMap[Number(criteria.age)] || 'adult');
    setEthnicity(criteria.ethnicity as GenerationParams['ethnicity']);
    setArtStyle(criteria.artStyle as GenerationParams['artStyle']);
    setNegativePromptPreset(matchingPreset);
    setAspectRatio(criteria.aspectRatio as GenerationParams['aspectRatio']);
    setCameraLens(criteria.cameraLens);
    setClothing(criteria.clothing);
    setSituationPose(criteria.situationPose || '');
    setSituationFiguration(criteria.situationFiguration || '');
    setSituationBehavior(criteria.situationBehavior || '');
    setSituationPosing(criteria.situationPosing || '');
    setCameraAngle(criteria.cameraAngle || '');
    setLighting(criteria.lighting || '');
    setEnvironment(criteria.environment || '');
    setComposition(criteria.composition || '');

    toast.success('Preset loaded!', {
      description: `"${selectedPresetName}" parameters have been applied.`,
    });
  };

  const isLoading = generateImageMutation.isPending;
  const isSaving = savePresetMutation.isPending;

  return (
    <Card className="border-2 border-primary/20 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Generate Your Image
        </CardTitle>
        <CardDescription>
          Customize all parameters to create your AI-generated image with Stable Diffusion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Load Preset Section */}
          {presets.length > 0 && (
            <div className="space-y-2 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <Label htmlFor="loadPreset" className="text-sm font-medium flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Load Saved Preset
              </Label>
              <Select onValueChange={handleLoadPreset}>
                <SelectTrigger
                  id="loadPreset"
                  className="border-accent/30 focus:border-accent focus:ring-accent/20"
                >
                  <SelectValue placeholder="Select a preset to load" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {presetsLoading && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading presets...
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Body Type */}
            <div className="space-y-2">
              <Label htmlFor="bodyType" className="text-sm font-medium">
                Body Type
              </Label>
              <Select value={bodyType} onValueChange={(value) => setBodyType(value as GenerationParams['bodyType'])}>
                <SelectTrigger
                  id="bodyType"
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skinny">Skinny</SelectItem>
                  <SelectItem value="curvy">Curvy</SelectItem>
                  <SelectItem value="oversized">Oversized</SelectItem>
                  <SelectItem value="plus-size">Plus-size</SelectItem>
                  <SelectItem value="buxom">Buxom</SelectItem>
                  <SelectItem value="saggy">Saggy</SelectItem>
                  <SelectItem value="soft belly">Soft Belly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium">
                Age
              </Label>
              <Select value={age} onValueChange={(value) => setAge(value as GenerationParams['age'])}>
                <SelectTrigger
                  id="age"
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="young adult">Young Adult</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="mature">Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ethnicity */}
            <div className="space-y-2">
              <Label htmlFor="ethnicity" className="text-sm font-medium">
                Ethnicity
              </Label>
              <Select value={ethnicity} onValueChange={(value) => setEthnicity(value as GenerationParams['ethnicity'])}>
                <SelectTrigger
                  id="ethnicity"
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Caucasian">Caucasian</SelectItem>
                  <SelectItem value="African">African</SelectItem>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Hispanic">Hispanic</SelectItem>
                  <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g. 165"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="140"
                max="210"
                className="border-primary/30 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g. 60"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="40"
                max="200"
                className="border-primary/30 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Art Style */}
            <div className="space-y-2">
              <Label htmlFor="artStyle" className="text-sm font-medium">
                Art Style
              </Label>
              <Select value={artStyle} onValueChange={(value) => setArtStyle(value as GenerationParams['artStyle'])}>
                <SelectTrigger
                  id="artStyle"
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select art style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="pencil">Pencil</SelectItem>
                  <SelectItem value="watercolors">Watercolors</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="caricature">Caricature</SelectItem>
                  <SelectItem value="charcoal">Charcoal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clothing */}
            <div className="space-y-2">
              <Label htmlFor="clothing" className="text-sm font-medium">
                Clothing / Outfit
              </Label>
              <Select value={clothing} onValueChange={setClothing}>
                <SelectTrigger
                  id="clothing"
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select clothing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form-fitting dress">Form-fitting Dress</SelectItem>
                  <SelectItem value="casual wear">Casual Wear</SelectItem>
                  <SelectItem value="formal attire">Formal Attire</SelectItem>
                  <SelectItem value="swimwear">Swimwear</SelectItem>
                  <SelectItem value="lingerie">Lingerie</SelectItem>
                  <SelectItem value="none/nude">None / Nude</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Camera Lens */}
            <div className="space-y-2">
              <Label htmlFor="cameraLens" className="text-sm font-medium">
                Camera Lens
              </Label>
              <Select value={cameraLens} onValueChange={setCameraLens}>
                <SelectTrigger
                  id="cameraLens"
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select lens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50mm">50mm (Standard)</SelectItem>
                  <SelectItem value="85mm">85mm (Portrait)</SelectItem>
                  <SelectItem value="35mm">35mm (Wide)</SelectItem>
                  <SelectItem value="24mm">24mm (Ultra-wide)</SelectItem>
                  <SelectItem value="Wide-angle">Wide-angle</SelectItem>
                  <SelectItem value="Telephoto">Telephoto</SelectItem>
                  <SelectItem value="Macro">Macro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label htmlFor="aspectRatio" className="text-sm font-medium">
                Aspect Ratio
              </Label>
              <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as GenerationParams['aspectRatio'])}>
                <SelectTrigger
                  id="aspectRatio"
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="2:3">2:3 (Portrait)</SelectItem>
                  <SelectItem value="3:2">3:2 (Landscape)</SelectItem>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negativePrompt" className="text-sm font-medium">
              Negative Prompt Preset
            </Label>
            <Select value={negativePromptPreset} onValueChange={(value) => setNegativePromptPreset(value as NegativePromptPreset | '')}>
              <SelectTrigger
                id="negativePrompt"
                className="border-primary/30 focus:border-primary focus:ring-primary/20"
              >
                <SelectValue placeholder="Select negative prompt preset" />
              </SelectTrigger>
              <SelectContent>
                {NEGATIVE_PROMPT_PRESET_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {negativePromptPreset && negativePromptPreset !== 'None' && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {NEGATIVE_PROMPT_PRESETS[negativePromptPreset]}
              </p>
            )}
          </div>

          <Separator />

          {/* Situation Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Drama className="w-5 h-5 text-secondary" />
              <h3 className="text-base font-semibold">Situation</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Situation Pose */}
              <div className="space-y-2">
                <Label htmlFor="situationPose" className="text-sm font-medium">
                  Pose
                </Label>
                <Select value={situationPose} onValueChange={setSituationPose}>
                  <SelectTrigger
                    id="situationPose"
                    className="border-secondary/30 focus:border-secondary focus:ring-secondary/20"
                  >
                    <SelectValue placeholder="Select pose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="The Reclining Odalisque">The Reclining Odalisque</SelectItem>
                    <SelectItem value="Boudoir-Setting">Boudoir-Setting</SelectItem>
                    <SelectItem value="The Gaze">The Gaze</SelectItem>
                    <SelectItem value="Suggestive Reveal">Suggestive Reveal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Situation Figuration */}
              <div className="space-y-2">
                <Label htmlFor="situationFiguration" className="text-sm font-medium">
                  Figuration
                </Label>
                <Select value={situationFiguration} onValueChange={setSituationFiguration}>
                  <SelectTrigger
                    id="situationFiguration"
                    className="border-secondary/30 focus:border-secondary focus:ring-secondary/20"
                  >
                    <SelectValue placeholder="Select figuration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="The Reclining Odalisque">The Reclining Odalisque</SelectItem>
                    <SelectItem value="Boudoir-Setting">Boudoir-Setting</SelectItem>
                    <SelectItem value="The Gaze">The Gaze</SelectItem>
                    <SelectItem value="Suggestive Reveal">Suggestive Reveal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Situation Behavior */}
              <div className="space-y-2">
                <Label htmlFor="situationBehavior" className="text-sm font-medium">
                  Behavior
                </Label>
                <Select value={situationBehavior} onValueChange={setSituationBehavior}>
                  <SelectTrigger
                    id="situationBehavior"
                    className="border-secondary/30 focus:border-secondary focus:ring-secondary/20"
                  >
                    <SelectValue placeholder="Select behavior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="The Reclining Odalisque">The Reclining Odalisque</SelectItem>
                    <SelectItem value="Boudoir-Setting">Boudoir-Setting</SelectItem>
                    <SelectItem value="The Gaze">The Gaze</SelectItem>
                    <SelectItem value="Suggestive Reveal">Suggestive Reveal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Situation Posing */}
              <div className="space-y-2">
                <Label htmlFor="situationPosing" className="text-sm font-medium">
                  Posing
                </Label>
                <Select value={situationPosing} onValueChange={setSituationPosing}>
                  <SelectTrigger
                    id="situationPosing"
                    className="border-secondary/30 focus:border-secondary focus:ring-secondary/20"
                  >
                    <SelectValue placeholder="Select posing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="The Reclining Odalisque">The Reclining Odalisque</SelectItem>
                    <SelectItem value="Boudoir-Setting">Boudoir-Setting</SelectItem>
                    <SelectItem value="The Gaze">The Gaze</SelectItem>
                    <SelectItem value="Suggestive Reveal">Suggestive Reveal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bildgestaltung Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-accent" />
              <h3 className="text-base font-semibold">Image Composition</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Camera Angle */}
              <div className="space-y-2">
                <Label htmlFor="cameraAngle" className="text-sm font-medium flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-accent" />
                  Camera Angle
                </Label>
                <Select value={cameraAngle} onValueChange={setCameraAngle}>
                  <SelectTrigger
                    id="cameraAngle"
                    className="border-accent/30 focus:border-accent focus:ring-accent/20"
                  >
                    <SelectValue placeholder="Select angle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low angle">Low Angle</SelectItem>
                    <SelectItem value="high angle">High Angle</SelectItem>
                    <SelectItem value="from behind">From Behind</SelectItem>
                    <SelectItem value="side view">Side View</SelectItem>
                    <SelectItem value="top-down view">Top-Down View</SelectItem>
                    <SelectItem value="close-up">Close-Up</SelectItem>
                    <SelectItem value="full body">Full Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lighting */}
              <div className="space-y-2">
                <Label htmlFor="lighting" className="text-sm font-medium flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-accent" />
                  Lighting
                </Label>
                <Select value={lighting} onValueChange={setLighting}>
                  <SelectTrigger
                    id="lighting"
                    className="border-accent/30 focus:border-accent focus:ring-accent/20"
                  >
                    <SelectValue placeholder="Select lighting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dramatic lighting">Dramatic Lighting</SelectItem>
                    <SelectItem value="rim lighting">Rim Lighting</SelectItem>
                    <SelectItem value="soft shadows">Soft Shadows</SelectItem>
                    <SelectItem value="backlit">Backlit</SelectItem>
                    <SelectItem value="volumetric light">Volumetric Light</SelectItem>
                    <SelectItem value="dim lighting">Dim Lighting</SelectItem>
                    <SelectItem value="neon lighting">Neon Lighting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <Label htmlFor="environment" className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  Environment
                </Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger
                    id="environment"
                    className="border-accent/30 focus:border-accent focus:ring-accent/20"
                  >
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="shower">Shower</SelectItem>
                    <SelectItem value="balcony">Balcony</SelectItem>
                    <SelectItem value="forest">Forest</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="night city">Night City</SelectItem>
                    <SelectItem value="rooftop">Rooftop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Composition */}
              <div className="space-y-2">
                <Label htmlFor="composition" className="text-sm font-medium flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-accent" />
                  Composition
                </Label>
                <Select value={composition} onValueChange={setComposition}>
                  <SelectTrigger
                    id="composition"
                    className="border-accent/30 focus:border-accent focus:ring-accent/20"
                  >
                    <SelectValue placeholder="Select composition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rule of thirds">Rule of Thirds</SelectItem>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="sensual">Sensual</SelectItem>
                    <SelectItem value="intimate">Intimate</SelectItem>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="intricate details">Intricate Details</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gap-2 text-base py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </Button>

            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4" />
                  Save Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Preset</DialogTitle>
                  <DialogDescription>
                    Save your current settings as a preset for future use.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="presetName">Preset Name</Label>
                    <Input
                      id="presetName"
                      placeholder="Enter preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSavePreset();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSaveDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePreset}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
