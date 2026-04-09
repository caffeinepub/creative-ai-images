import { useActor as useCaffeineActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

/**
 * Returns the backend actor and its loading state.
 * Wraps the platform's useActor with the generated createActor factory.
 */
export function useActor() {
  return useCaffeineActor(createActor);
}
