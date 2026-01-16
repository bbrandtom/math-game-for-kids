import type { Topic, Difficulty } from '../../stores/types';

// Base puzzle interface
export interface BasePuzzle {
  type: PuzzleType;
  topic: Topic;
  correctAnswer: number | string;
  // i18n support - questionKey + params for translation
  questionKey?: string;
  questionParams?: Record<string, string | number>;
}

export type PuzzleType =
  | 'fill-blank'
  | 'pattern-fill'
  | 'multiple-choice'
  | 'visual-counting'
  | 'visual-groups'
  | 'shape-identify'
  | 'shape-properties'
  | 'place-value-identify'
  | 'fraction-visual'
  | 'word-problem';

// Fill in the blank puzzle
export interface FillBlankPuzzle extends BasePuzzle {
  type: 'fill-blank' | 'pattern-fill';
  display: string;
  question?: string;
  correctAnswer: number;
}

// Multiple choice puzzle
export interface MultipleChoicePuzzle extends BasePuzzle {
  type: 'multiple-choice';
  question: string;
  options: (string | number)[];
  visualGroups?: VisualGroupsData;
  fractionOptions?: FractionData[];
}

// Visual counting puzzle
export interface VisualCountingPuzzle extends BasePuzzle {
  type: 'visual-counting';
  question: string;
  objects: string[];
  correctAnswer: number;
}

// Visual groups puzzle
export interface VisualGroupsPuzzle extends BasePuzzle {
  type: 'visual-groups';
  question: string;
  groups: number;
  itemsPerGroup: number;
  item: string;
  correctAnswer: number;
}

// Shape identification puzzle
export interface ShapeIdentifyPuzzle extends BasePuzzle {
  type: 'shape-identify';
  question: string;
  shapeClass: string;
  options: string[];
  correctAnswer: string;
}

// Shape properties puzzle
export interface ShapePropertiesPuzzle extends BasePuzzle {
  type: 'shape-properties';
  question: string;
  shapeClass: string;
  correctAnswer: number;
}

// Place value puzzle
export interface PlaceValuePuzzle extends BasePuzzle {
  type: 'place-value-identify';
  question: string;
  number: number;
  place: 'ones' | 'tens' | 'hundreds';
  correctAnswer: number;
}

// Fraction visual puzzle
export interface FractionVisualPuzzle extends BasePuzzle {
  type: 'fraction-visual';
  question: string;
  fraction: FractionData;
  correctAnswer: string;
}

// Word problem puzzle
export interface WordProblemPuzzle extends BasePuzzle {
  type: 'word-problem';
  question: string;
  options: string[];
  correctAnswer: number;
}

// Helper types
export interface VisualGroupsData {
  groups: number;
  itemsPerGroup: number;
  item: string;
}

export interface FractionData {
  name: string;
  numerator: number;
  denominator: number;
  display: string;
}

export interface DifficultyRange {
  min: number;
  max: number;
}

export interface ShapeData {
  name: string;
  sides: number;
  corners: number;
  class: string;
}

// Union type for all puzzles
export type Puzzle =
  | FillBlankPuzzle
  | MultipleChoicePuzzle
  | VisualCountingPuzzle
  | VisualGroupsPuzzle
  | ShapeIdentifyPuzzle
  | ShapePropertiesPuzzle
  | PlaceValuePuzzle
  | FractionVisualPuzzle
  | WordProblemPuzzle;

// Difficulty ranges
export const DIFFICULTY_RANGES: Record<Difficulty, DifficultyRange> = {
  easy: { min: 1, max: 20 },
  medium: { min: 1, max: 100 },
  hard: { min: 1, max: 1000 },
};
