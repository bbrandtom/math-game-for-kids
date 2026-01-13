import type { Topic, Difficulty } from '../../stores/types';
import type {
  Puzzle,
  DifficultyRange,
  ShapeData,
  FractionData,
} from './types';
import { DIFFICULTY_RANGES } from './types';

// Utility functions
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateOptions(correct: number, count: number, min: number, max: number): number[] {
  const options = new Set([correct]);

  while (options.size < count) {
    const variance = Math.max(3, Math.floor(correct * 0.3));
    const offset = random(1, variance);
    const wrong = random(0, 1) === 0 ? correct + offset : correct - offset;

    if (wrong >= min && wrong <= max && wrong !== correct) {
      options.add(wrong);
    }
  }

  return shuffle(Array.from(options));
}

// Shape definitions
const SHAPES: ShapeData[] = [
  { name: 'circle', sides: 0, corners: 0, class: 'shape-circle' },
  { name: 'square', sides: 4, corners: 4, class: 'shape-square' },
  { name: 'triangle', sides: 3, corners: 3, class: 'shape-triangle' },
  { name: 'rectangle', sides: 4, corners: 4, class: 'shape-rectangle' },
  { name: 'pentagon', sides: 5, corners: 5, class: 'shape-pentagon' },
  { name: 'hexagon', sides: 6, corners: 6, class: 'shape-hexagon' },
];

// Fraction definitions
const FRACTIONS: FractionData[] = [
  { name: 'one half', numerator: 1, denominator: 2, display: '1/2' },
  { name: 'one third', numerator: 1, denominator: 3, display: '1/3' },
  { name: 'one quarter', numerator: 1, denominator: 4, display: '1/4' },
  { name: 'two thirds', numerator: 2, denominator: 3, display: '2/3' },
  { name: 'three quarters', numerator: 3, denominator: 4, display: '3/4' },
];

// Visual items for puzzles
const VISUAL_ITEMS = ['🍎', '⭐', '🔵', '🟡', '❤️'];

// Generate addition puzzles
function generateAddition(range: DifficultyRange): Puzzle {
  const types = ['fill-blank', 'multiple-choice', 'visual'] as const;
  const type = types[random(0, types.length - 1)];

  const maxNum = Math.min(range.max, 50);
  const a = random(1, Math.floor(maxNum / 2));
  const b = random(1, Math.floor(maxNum / 2));
  const answer = a + b;

  if (type === 'fill-blank') {
    const blankPosition = random(0, 2);

    if (blankPosition === 0) {
      return {
        type: 'fill-blank',
        display: `__ + ${b} = ${answer}`,
        correctAnswer: a,
        topic: 'addition',
      };
    } else if (blankPosition === 1) {
      return {
        type: 'fill-blank',
        display: `${a} + __ = ${answer}`,
        correctAnswer: b,
        topic: 'addition',
      };
    } else {
      return {
        type: 'fill-blank',
        display: `${a} + ${b} = __`,
        correctAnswer: answer,
        topic: 'addition',
      };
    }
  } else if (type === 'multiple-choice') {
    const options = generateOptions(answer, 4, 1, range.max);
    return {
      type: 'multiple-choice',
      question: `What is ${a} + ${b}?`,
      options,
      correctAnswer: answer,
      topic: 'addition',
    };
  } else {
    const count = random(2, Math.min(12, range.max));
    return {
      type: 'visual-counting',
      question: 'How many stars are there?',
      objects: Array(count).fill('⭐'),
      correctAnswer: count,
      topic: 'addition',
    };
  }
}

// Generate subtraction puzzles
function generateSubtraction(range: DifficultyRange): Puzzle {
  const types = ['fill-blank', 'multiple-choice'] as const;
  const type = types[random(0, types.length - 1)];

  const maxNum = Math.min(range.max, 100);
  const answer = random(1, Math.floor(maxNum / 2));
  const b = random(1, Math.floor(maxNum / 2));
  const a = answer + b;

  if (type === 'fill-blank') {
    const blankPosition = random(0, 2);

    if (blankPosition === 0) {
      return {
        type: 'fill-blank',
        display: `__ - ${b} = ${answer}`,
        correctAnswer: a,
        topic: 'subtraction',
      };
    } else if (blankPosition === 1) {
      return {
        type: 'fill-blank',
        display: `${a} - __ = ${answer}`,
        correctAnswer: b,
        topic: 'subtraction',
      };
    } else {
      return {
        type: 'fill-blank',
        display: `${a} - ${b} = __`,
        correctAnswer: answer,
        topic: 'subtraction',
      };
    }
  } else {
    const options = generateOptions(answer, 4, 0, maxNum);
    return {
      type: 'multiple-choice',
      question: `What is ${a} - ${b}?`,
      options,
      correctAnswer: answer,
      topic: 'subtraction',
    };
  }
}

// Generate skip counting puzzles
function generateSkipCounting(range: DifficultyRange): Puzzle {
  const skips = [2, 5, 10];
  const skipBy = skips[random(0, skips.length - 1)];
  const start = skipBy * random(1, 5);

  const sequence: number[] = [];
  for (let i = 0; i < 4; i++) {
    sequence.push(start + skipBy * i);
  }
  const answer = start + skipBy * 4;

  const types = ['fill-blank', 'multiple-choice'] as const;
  const type = types[random(0, 1)];

  if (type === 'fill-blank') {
    return {
      type: 'pattern-fill',
      display: `${sequence.join(', ')}, __`,
      question: 'What comes next?',
      correctAnswer: answer,
      topic: 'skip-counting',
    };
  } else {
    const options = generateOptions(answer, 4, skipBy, range.max);
    return {
      type: 'multiple-choice',
      question: `Counting by ${skipBy}s: ${sequence.join(', ')}, ?`,
      options,
      correctAnswer: answer,
      topic: 'skip-counting',
    };
  }
}

// Generate shape puzzles
function generateShapes(): Puzzle {
  const types = ['identify', 'properties', 'multiple-choice'] as const;
  const type = types[random(0, types.length - 1)];
  const shape = SHAPES[random(0, SHAPES.length - 1)];

  if (type === 'identify') {
    const otherShapes = SHAPES.filter((s) => s.name !== shape.name).slice(0, 3);
    const options = shuffle([shape, ...otherShapes]).map((s) => s.name);

    return {
      type: 'shape-identify',
      question: 'What shape is this?',
      shapeClass: shape.class,
      options,
      correctAnswer: shape.name,
      topic: 'shapes',
    };
  } else if (type === 'properties') {
    const askSides = random(0, 1) === 0;

    if (askSides && shape.sides > 0) {
      return {
        type: 'shape-properties',
        question: `How many sides does a ${shape.name} have?`,
        shapeClass: shape.class,
        correctAnswer: shape.sides,
        topic: 'shapes',
      };
    } else {
      return {
        type: 'shape-properties',
        question: `How many corners does a ${shape.name} have?`,
        shapeClass: shape.class,
        correctAnswer: shape.corners,
        topic: 'shapes',
      };
    }
  } else {
    const sidesCount = [3, 4, 5, 6][random(0, 3)];
    const correctShape = SHAPES.find((s) => s.sides === sidesCount)!;
    const otherShapes = SHAPES.filter((s) => s.sides !== sidesCount).slice(0, 3);
    const options = shuffle([correctShape.name, ...otherShapes.map((s) => s.name)]);

    return {
      type: 'multiple-choice',
      question: `Which shape has ${sidesCount} sides?`,
      options,
      correctAnswer: correctShape.name,
      topic: 'shapes',
    };
  }
}

// Generate grouping puzzles
function generateGrouping(): Puzzle {
  const groups = random(2, 5);
  const itemsPerGroup = random(2, 5);
  const total = groups * itemsPerGroup;
  const item = VISUAL_ITEMS[random(0, VISUAL_ITEMS.length - 1)];

  const types = ['count-groups', 'multiple-choice'] as const;
  const type = types[random(0, 1)];

  if (type === 'count-groups') {
    return {
      type: 'visual-groups',
      question: `${groups} groups of ${itemsPerGroup}. How many in total?`,
      groups,
      itemsPerGroup,
      item,
      correctAnswer: total,
      topic: 'grouping',
    };
  } else {
    const options = generateOptions(total, 4, 1, 30);
    return {
      type: 'multiple-choice',
      question: `${groups} groups of ${itemsPerGroup} = ?`,
      visualGroups: { groups, itemsPerGroup, item },
      options: options.map(String),
      correctAnswer: total,
      topic: 'grouping',
    };
  }
}

// Generate place value puzzles
function generatePlaceValue(range: DifficultyRange): Puzzle {
  let number: number;
  if (range.max >= 1000) {
    number = random(100, 999);
  } else if (range.max >= 100) {
    number = random(10, 99);
  } else {
    number = random(10, 20);
  }

  const digits = String(number).split('').map(Number);
  const types = ['identify-digit', 'build-number', 'multiple-choice'] as const;
  const type = types[random(0, types.length - 1)];

  if (type === 'identify-digit' && digits.length >= 2) {
    const places = ['ones', 'tens', 'hundreds'] as const;
    const placeIndex = random(0, Math.min(digits.length - 1, 2));
    const place = places[placeIndex];
    const answer = digits[digits.length - 1 - placeIndex];

    return {
      type: 'place-value-identify',
      question: `In ${number}, what digit is in the ${place} place?`,
      number,
      place,
      correctAnswer: answer,
      topic: 'place-value',
    };
  } else if (type === 'build-number' && digits.length >= 2) {
    const hundreds = digits.length >= 3 ? digits[0] : 0;
    const tens = digits.length >= 3 ? digits[1] : digits[0];
    const ones = digits.length >= 3 ? digits[2] : digits[1];

    let question: string;
    if (hundreds > 0) {
      question = `${hundreds} hundreds + ${tens} tens + ${ones} ones = ?`;
    } else {
      question = `${tens} tens + ${ones} ones = ?`;
    }

    return {
      type: 'fill-blank',
      question,
      display: question.replace('?', '__'),
      correctAnswer: number,
      topic: 'place-value',
    };
  } else {
    const options = generateOptions(digits[digits.length - 1], 4, 0, 9);
    return {
      type: 'multiple-choice',
      question: `What is the ones digit in ${number}?`,
      options: options.map(String),
      correctAnswer: digits[digits.length - 1],
      topic: 'place-value',
    };
  }
}

// Generate fraction puzzles
function generateFractions(): Puzzle {
  const fraction = FRACTIONS[random(0, FRACTIONS.length - 1)];
  const types = ['visual-identify', 'multiple-choice'] as const;
  const type = types[random(0, 1)];

  if (type === 'visual-identify') {
    return {
      type: 'fraction-visual',
      question: 'What fraction is shaded?',
      fraction,
      correctAnswer: fraction.display,
      topic: 'fractions',
    };
  } else {
    const otherFractions = FRACTIONS.filter((f) => f.display !== fraction.display).slice(0, 3);
    const options = shuffle([fraction.display, ...otherFractions.map((f) => f.display)]);

    return {
      type: 'multiple-choice',
      question: `Which shows ${fraction.name}?`,
      fractionOptions: shuffle([fraction, ...otherFractions]),
      options,
      correctAnswer: fraction.display,
      topic: 'fractions',
    };
  }
}

// Generate word problem puzzles
function generateWordProblem(range: DifficultyRange): Puzzle {
  const maxNum = Math.min(range.max, 50);

  type ProblemTemplate = {
    template: (a: number, b: number, item: string) => string;
    operation: 'add' | 'subtract';
    items: string[];
  };

  const templates: ProblemTemplate[] = [
    {
      template: (a, b, item) => `You have ${a} ${item}. You get ${b} more. How many do you have now?`,
      operation: 'add',
      items: ['apples', 'cookies', 'toys', 'stickers', 'pencils'],
    },
    {
      template: (a, b, item) => `You have ${a} ${item}. You give away ${b}. How many are left?`,
      operation: 'subtract',
      items: ['candies', 'marbles', 'cards', 'crayons', 'books'],
    },
    {
      template: (a, b) => `${a} birds are in a tree. ${b} more fly in. How many birds are there now?`,
      operation: 'add',
      items: ['birds'],
    },
    {
      template: (a, b) => `There are ${a} fish in a pond. ${b} swim away. How many fish are left?`,
      operation: 'subtract',
      items: ['fish'],
    },
  ];

  const problem = templates[random(0, templates.length - 1)];
  const item = problem.items[random(0, problem.items.length - 1)];

  let a: number, b: number, answer: number;
  if (problem.operation === 'add') {
    a = random(2, Math.floor(maxNum / 2));
    b = random(2, Math.floor(maxNum / 2));
    answer = a + b;
  } else {
    answer = random(1, Math.floor(maxNum / 2));
    b = random(1, Math.floor(maxNum / 3));
    a = answer + b;
  }

  const question = problem.template(a, b, item);
  const options = generateOptions(answer, 4, 1, maxNum);

  return {
    type: 'word-problem',
    question,
    options: options.map(String),
    correctAnswer: answer,
    topic: 'word-problems',
  };
}

// Main puzzle generator
export function generatePuzzle(topic: Topic, difficulty: Difficulty = 'medium'): Puzzle {
  const range = DIFFICULTY_RANGES[difficulty];

  switch (topic) {
    case 'addition':
      return generateAddition(range);
    case 'subtraction':
      return generateSubtraction(range);
    case 'skip-counting':
      return generateSkipCounting(range);
    case 'shapes':
      return generateShapes();
    case 'grouping':
      return generateGrouping();
    case 'place-value':
      return generatePlaceValue(range);
    case 'fractions':
      return generateFractions();
    case 'word-problems':
      return generateWordProblem(range);
    default:
      return generateAddition(range);
  }
}

// Export utilities for components
export { shuffle, SHAPES, FRACTIONS };
