import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PoseCriteria, Preset, PromptHistory } from '../backend';
import { NEGATIVE_PROMPT_PRESETS, type NegativePromptPreset } from '../constants/negativePrompts';

interface SendQueriesParams {
  bodyType: string;
  height: number;
  weight: number;
  age: string;
  ethnicity: string;
  artStyle: string;
  negativePromptPreset: NegativePromptPreset | '';
  aspectRatio: string;
  cameraLens: string;
  clothing: string;
  situationPose: string;
  situationFiguration: string;
  situationBehavior: string;
  situationPosing: string;
  cameraAngle: string;
  lighting: string;
  environment: string;
  composition: string;
  combinations: string;
}

export function useSendQueries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendQueriesParams) => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }

      const ageMap: Record<string, number> = {
        'young adult': 25,
        'adult': 35,
        'mature': 50,
      };

      const negativePromptText = params.negativePromptPreset
        ? NEGATIVE_PROMPT_PRESETS[params.negativePromptPreset]
        : '';

      const poseCriteria: PoseCriteria = {
        bodyType: params.bodyType,
        age: BigInt(ageMap[params.age] || 30),
        ethnicity: params.ethnicity,
        artStyle: params.artStyle,
        height: params.height,
        weight: params.weight,
        negativePrompt: negativePromptText,
        aspectRatio: params.aspectRatio,
        cameraLens: params.cameraLens,
        clothing: params.clothing,
        situationPose: params.situationPose === 'none' ? '' : params.situationPose,
        situationFiguration: params.situationFiguration === 'none' ? '' : params.situationFiguration,
        situationBehavior: params.situationBehavior === 'none' ? '' : params.situationBehavior,
        situationPosing: params.situationPosing === 'none' ? '' : params.situationPosing,
        cameraAngle: params.cameraAngle,
        lighting: params.lighting,
        environment: params.environment,
        composition: params.composition,
      };

      return await actor.sendQueries(poseCriteria, params.combinations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      queryClient.invalidateQueries({ queryKey: ['promptHistory'] });
    },
  });
}

interface GenerateImageParams {
  bodyType: string;
  height: number;
  weight: number;
  age: string;
  ethnicity: string;
  artStyle: string;
  negativePromptPreset: NegativePromptPreset | '';
  aspectRatio: string;
  cameraLens: string;
  clothing: string;
  situationPose: string;
  situationFiguration: string;
  situationBehavior: string;
  situationPosing: string;
  cameraAngle: string;
  lighting: string;
  environment: string;
  composition: string;
  prompt: string;
}

export function useGenerateImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GenerateImageParams): Promise<Uint8Array> => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }

      const ageMap: Record<string, number> = {
        'young adult': 25,
        'adult': 35,
        'mature': 50,
      };

      const negativePromptText = params.negativePromptPreset
        ? NEGATIVE_PROMPT_PRESETS[params.negativePromptPreset]
        : '';

      const poseCriteria: PoseCriteria = {
        bodyType: params.bodyType,
        age: BigInt(ageMap[params.age] || 30),
        ethnicity: params.ethnicity,
        artStyle: params.artStyle,
        height: params.height,
        weight: params.weight,
        negativePrompt: negativePromptText,
        aspectRatio: params.aspectRatio,
        cameraLens: params.cameraLens,
        clothing: params.clothing,
        situationPose: params.situationPose === 'none' ? '' : params.situationPose,
        situationFiguration: params.situationFiguration === 'none' ? '' : params.situationFiguration,
        situationBehavior: params.situationBehavior === 'none' ? '' : params.situationBehavior,
        situationPosing: params.situationPosing === 'none' ? '' : params.situationPosing,
        cameraAngle: params.cameraAngle,
        lighting: params.lighting,
        environment: params.environment,
        composition: params.composition,
      };

      // TODO: Backend needs to implement a generateImage function that returns image bytes
      await actor.sendQueries(poseCriteria, params.prompt);
      throw new Error('Backend image generation not yet implemented. Please implement a generateImage function that calls Stable Diffusion API and returns image bytes.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
      queryClient.invalidateQueries({ queryKey: ['promptHistory'] });
    },
  });
}

interface SavePresetParams {
  name: string;
  bodyType: string;
  height: number;
  weight: number;
  age: string;
  ethnicity: string;
  artStyle: string;
  negativePromptPreset: NegativePromptPreset | '';
  aspectRatio: string;
  cameraLens: string;
  clothing: string;
  situationPose: string;
  situationFiguration: string;
  situationBehavior: string;
  situationPosing: string;
  cameraAngle: string;
  lighting: string;
  environment: string;
  composition: string;
}

export function useSavePreset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SavePresetParams) => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }

      const ageMap: Record<string, number> = {
        'young adult': 25,
        'adult': 35,
        'mature': 50,
      };

      const negativePromptText = params.negativePromptPreset
        ? NEGATIVE_PROMPT_PRESETS[params.negativePromptPreset]
        : '';

      const poseCriteria: PoseCriteria = {
        bodyType: params.bodyType,
        age: BigInt(ageMap[params.age] || 30),
        ethnicity: params.ethnicity,
        artStyle: params.artStyle,
        height: params.height,
        weight: params.weight,
        negativePrompt: negativePromptText,
        aspectRatio: params.aspectRatio,
        cameraLens: params.cameraLens,
        clothing: params.clothing,
        situationPose: params.situationPose === 'none' ? '' : params.situationPose,
        situationFiguration: params.situationFiguration === 'none' ? '' : params.situationFiguration,
        situationBehavior: params.situationBehavior === 'none' ? '' : params.situationBehavior,
        situationPosing: params.situationPosing === 'none' ? '' : params.situationPosing,
        cameraAngle: params.cameraAngle,
        lighting: params.lighting,
        environment: params.environment,
        composition: params.composition,
      };

      return await actor.savePreset(params.name, poseCriteria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
}

export function useGetPresets() {
  const { actor, isFetching } = useActor();

  return useQuery<Preset[]>({
    queryKey: ['presets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPresets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPromptHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<PromptHistory[]>({
    queryKey: ['promptHistory'],
    queryFn: async () => {
      if (!actor) return [];
      const history = await actor.getPromptHistory();
      return history.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
  });
}
