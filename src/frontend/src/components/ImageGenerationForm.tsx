import { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useSendQueries } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { GenerationParams } from '../App';
import { NEGATIVE_PROMPT_PRESET_OPTIONS, type NegativePromptPreset } from '../constants/negativePrompts';

interface ImageGenerationFormProps {
  onGenerate: (params: GenerationParams) => void;
}

export default function ImageGenerationForm({ onGenerate }: ImageGenerationFormProps) {
  const { actor } = useActor();
  const sendQueriesMutation = useSendQueries();

  const [bodyType, setBodyType] = useState<GenerationParams['bodyType']>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState<GenerationParams['age']>('');
  const [ethnicity, setEthnicity] = useState<GenerationParams['ethnicity']>('');
  const [artStyle, setArtStyle] = useState<GenerationParams['artStyle']>('');
  const [negativePromptPreset, setNegativePromptPreset] = useState<NegativePromptPreset | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bodyType || !height || !weight || !age || !ethnicity || !artStyle || !negativePromptPreset) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready');
      return;
    }

    const combinations = `${artStyle} style, ${age}, ${ethnicity}, ${bodyType} body type, ${height}cm tall, ${weight}kg`;

    try {
      await sendQueriesMutation.mutateAsync({
        bodyType,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age,
        ethnicity,
        artStyle,
        negativePromptPreset,
        combinations,
      });
      onGenerate({ bodyType, height, weight, age, ethnicity, artStyle, negativePromptPreset });
      toast.success('Prompt generated successfully!', {
        description: 'Your AI image prompt is ready.',
      });
    } catch (error) {
      toast.error('Failed to generate prompt', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const isLoading = sendQueriesMutation.isPending;

  return (
    <Card className="border-2 border-primary/20 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Generate Your Prompt
        </CardTitle>
        <CardDescription>
          Customize all parameters to create a comprehensive AI image generation prompt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="e.g., 170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="100"
                max="250"
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
                placeholder="e.g., 65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="30"
                max="200"
                className="border-primary/30 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Negative Prompt Preset */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="negativePromptPreset" className="text-sm font-medium">
                Negative Prompt Preset
              </Label>
              <Select value={negativePromptPreset} onValueChange={(value) => setNegativePromptPreset(value as NegativePromptPreset)}>
                <SelectTrigger 
                  id="negativePromptPreset" 
                  className="border-primary/30 focus:border-primary focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select negative prompt preset" />
                </SelectTrigger>
                <SelectContent>
                  {NEGATIVE_PROMPT_PRESET_OPTIONS.map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-semibold shadow-lg shadow-primary/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Prompt
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
