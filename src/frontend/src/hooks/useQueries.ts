import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PoseCriteria } from '../backend';
import { NEGATIVE_PROMPT_PRESETS, type NegativePromptPreset } from '../constants/negativePrompts';

interface SendQueriesParams {
  bodyType: string;
  height: number;
  weight: number;
  age: string;
  ethnicity: string;
  artStyle: string;
  negativePromptPreset: NegativePromptPreset | '';
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

      // Map age string to number for backend
      const ageMap: Record<string, number> = {
        'young adult': 25,
        'adult': 35,
        'mature': 50,
      };

      // Get the negative prompt text from the preset
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
      };

      return await actor.sendQueries(poseCriteria, params.combinations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
    },
  });
}
