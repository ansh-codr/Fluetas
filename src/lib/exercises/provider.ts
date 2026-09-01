/**
 * Exercise Provider Factory
 * Abstracted entrypoint for exercise content and temporary video streaming.
 */

import { ExerciseProvider } from './types';
import { YourMoveExerciseProvider } from './ymove';

// Default provider is YourMove
let currentProvider: ExerciseProvider = new YourMoveExerciseProvider();

export function getExerciseProvider(): ExerciseProvider {
  return currentProvider;
}

export function setExerciseProvider(provider: ExerciseProvider) {
  currentProvider = provider;
}

export * from './types';
