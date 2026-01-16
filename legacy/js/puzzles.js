// Puzzle Generator Module - Creates math puzzles for each topic

const Puzzles = {
    // Difficulty ranges
    ranges: {
        easy: { min: 1, max: 20 },
        medium: { min: 1, max: 100 },
        hard: { min: 1, max: 1000 }
    },

    // Get random number in range
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Shuffle array
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Generate a puzzle based on topic and difficulty
    generate(topic, difficulty = 'medium') {
        const range = this.ranges[difficulty];

        switch (topic) {
            case 'addition':
                return this.generateAddition(range);
            case 'subtraction':
                return this.generateSubtraction(range);
            case 'skip-counting':
                return this.generateSkipCounting(range);
            case 'shapes':
                return this.generateShapes();
            case 'grouping':
                return this.generateGrouping(range);
            case 'place-value':
                return this.generatePlaceValue(range);
            case 'fractions':
                return this.generateFractions();
            case 'word-problems':
                return this.generateWordProblem(range);
            default:
                return this.generateAddition(range);
        }
    },

    // ADDITION PUZZLES
    generateAddition(range) {
        const puzzleTypes = ['fill-blank', 'multiple-choice', 'visual'];
        const type = puzzleTypes[this.random(0, puzzleTypes.length - 1)];

        // Scale numbers based on range
        const maxNum = Math.min(range.max, 50); // Cap for reasonable addition
        const a = this.random(1, Math.floor(maxNum / 2));
        const b = this.random(1, Math.floor(maxNum / 2));
        const answer = a + b;

        if (type === 'fill-blank') {
            const blankPosition = this.random(0, 2); // 0: first, 1: second, 2: result

            if (blankPosition === 0) {
                return {
                    type: 'fill-blank',
                    display: `__ + ${b} = ${answer}`,
                    equation: { blank: 'first', a, b, answer },
                    correctAnswer: a,
                    topic: 'addition'
                };
            } else if (blankPosition === 1) {
                return {
                    type: 'fill-blank',
                    display: `${a} + __ = ${answer}`,
                    equation: { blank: 'second', a, b, answer },
                    correctAnswer: b,
                    topic: 'addition'
                };
            } else {
                return {
                    type: 'fill-blank',
                    display: `${a} + ${b} = __`,
                    equation: { blank: 'result', a, b, answer },
                    correctAnswer: answer,
                    topic: 'addition'
                };
            }
        } else if (type === 'multiple-choice') {
            const options = this.generateOptions(answer, 4, 1, range.max);
            return {
                type: 'multiple-choice',
                question: `What is ${a} + ${b}?`,
                options: options,
                correctAnswer: answer,
                topic: 'addition'
            };
        } else {
            // Visual counting
            const count = this.random(2, Math.min(12, range.max));
            return {
                type: 'visual-counting',
                question: 'How many stars are there?',
                objects: Array(count).fill('⭐'),
                correctAnswer: count,
                topic: 'addition'
            };
        }
    },

    // SUBTRACTION PUZZLES
    generateSubtraction(range) {
        const puzzleTypes = ['fill-blank', 'multiple-choice'];
        const type = puzzleTypes[this.random(0, puzzleTypes.length - 1)];

        const maxNum = Math.min(range.max, 100);
        const answer = this.random(1, Math.floor(maxNum / 2));
        const b = this.random(1, Math.floor(maxNum / 2));
        const a = answer + b;

        if (type === 'fill-blank') {
            const blankPosition = this.random(0, 2);

            if (blankPosition === 0) {
                return {
                    type: 'fill-blank',
                    display: `__ - ${b} = ${answer}`,
                    equation: { blank: 'first', a, b, answer },
                    correctAnswer: a,
                    topic: 'subtraction'
                };
            } else if (blankPosition === 1) {
                return {
                    type: 'fill-blank',
                    display: `${a} - __ = ${answer}`,
                    equation: { blank: 'second', a, b, answer },
                    correctAnswer: b,
                    topic: 'subtraction'
                };
            } else {
                return {
                    type: 'fill-blank',
                    display: `${a} - ${b} = __`,
                    equation: { blank: 'result', a, b, answer },
                    correctAnswer: answer,
                    topic: 'subtraction'
                };
            }
        } else {
            const options = this.generateOptions(answer, 4, 0, maxNum);
            return {
                type: 'multiple-choice',
                question: `What is ${a} - ${b}?`,
                options: options,
                correctAnswer: answer,
                topic: 'subtraction'
            };
        }
    },

    // SKIP COUNTING PUZZLES
    generateSkipCounting(range) {
        const skips = [2, 5, 10];
        const skipBy = skips[this.random(0, skips.length - 1)];
        const start = skipBy * this.random(1, 5);

        const sequence = [];
        for (let i = 0; i < 4; i++) {
            sequence.push(start + (skipBy * i));
        }
        const answer = start + (skipBy * 4);

        const puzzleTypes = ['fill-blank', 'multiple-choice'];
        const type = puzzleTypes[this.random(0, 1)];

        if (type === 'fill-blank') {
            return {
                type: 'pattern-fill',
                question: `What comes next?\n${sequence.join(', ')}, __`,
                sequence: sequence,
                skipBy: skipBy,
                correctAnswer: answer,
                topic: 'skip-counting'
            };
        } else {
            const options = this.generateOptions(answer, 4, skipBy, range.max);
            return {
                type: 'multiple-choice',
                question: `Counting by ${skipBy}s: ${sequence.join(', ')}, ?`,
                options: options,
                correctAnswer: answer,
                topic: 'skip-counting'
            };
        }
    },

    // SHAPES PUZZLES
    generateShapes() {
        const shapes = [
            { name: 'circle', sides: 0, corners: 0, class: 'shape-circle' },
            { name: 'square', sides: 4, corners: 4, class: 'shape-square' },
            { name: 'triangle', sides: 3, corners: 3, class: 'shape-triangle' },
            { name: 'rectangle', sides: 4, corners: 4, class: 'shape-rectangle' },
            { name: 'pentagon', sides: 5, corners: 5, class: 'shape-pentagon' },
            { name: 'hexagon', sides: 6, corners: 6, class: 'shape-hexagon' }
        ];

        const puzzleTypes = ['identify', 'properties', 'multiple-choice'];
        const type = puzzleTypes[this.random(0, puzzleTypes.length - 1)];

        const shape = shapes[this.random(0, shapes.length - 1)];

        if (type === 'identify') {
            const otherShapes = shapes.filter(s => s.name !== shape.name).slice(0, 3);
            const options = this.shuffle([shape, ...otherShapes]).map(s => s.name);

            return {
                type: 'shape-identify',
                question: 'What shape is this?',
                shapeClass: shape.class,
                options: options,
                correctAnswer: shape.name,
                topic: 'shapes'
            };
        } else if (type === 'properties') {
            const askSides = this.random(0, 1) === 0;

            if (askSides && shape.sides > 0) {
                return {
                    type: 'shape-properties',
                    question: `How many sides does a ${shape.name} have?`,
                    shapeClass: shape.class,
                    correctAnswer: shape.sides,
                    topic: 'shapes'
                };
            } else {
                return {
                    type: 'shape-properties',
                    question: `How many corners does a ${shape.name} have?`,
                    shapeClass: shape.class,
                    correctAnswer: shape.corners,
                    topic: 'shapes'
                };
            }
        } else {
            // Multiple choice - which has X sides
            const sidesCount = [3, 4, 5, 6][this.random(0, 3)];
            const correctShape = shapes.find(s => s.sides === sidesCount);
            const otherShapes = shapes.filter(s => s.sides !== sidesCount).slice(0, 3);
            const options = this.shuffle([correctShape.name, ...otherShapes.map(s => s.name)]);

            return {
                type: 'multiple-choice',
                question: `Which shape has ${sidesCount} sides?`,
                options: options,
                correctAnswer: correctShape.name,
                topic: 'shapes'
            };
        }
    },

    // VISUAL GROUPING (Multiplication intro)
    generateGrouping(range) {
        const groups = this.random(2, 5);
        const itemsPerGroup = this.random(2, 5);
        const total = groups * itemsPerGroup;

        const items = ['🍎', '⭐', '🔵', '🟡', '❤️'];
        const item = items[this.random(0, items.length - 1)];

        const puzzleTypes = ['count-groups', 'multiple-choice'];
        const type = puzzleTypes[this.random(0, 1)];

        if (type === 'count-groups') {
            return {
                type: 'visual-groups',
                question: `${groups} groups of ${itemsPerGroup}. How many in total?`,
                groups: groups,
                itemsPerGroup: itemsPerGroup,
                item: item,
                correctAnswer: total,
                topic: 'grouping'
            };
        } else {
            const options = this.generateOptions(total, 4, 1, 30);
            return {
                type: 'multiple-choice',
                question: `${groups} groups of ${itemsPerGroup} = ?`,
                visualGroups: { groups, itemsPerGroup, item },
                options: options.map(String),
                correctAnswer: total,
                topic: 'grouping'
            };
        }
    },

    // PLACE VALUE PUZZLES
    generatePlaceValue(range) {
        let number;
        if (range.max >= 1000) {
            number = this.random(100, 999);
        } else if (range.max >= 100) {
            number = this.random(10, 99);
        } else {
            number = this.random(10, 20);
        }

        const digits = String(number).split('').map(Number);
        const puzzleTypes = ['identify-digit', 'build-number', 'multiple-choice'];
        const type = puzzleTypes[this.random(0, puzzleTypes.length - 1)];

        if (type === 'identify-digit' && digits.length >= 2) {
            const places = ['ones', 'tens', 'hundreds'];
            const placeIndex = this.random(0, Math.min(digits.length - 1, 2));
            const place = places[placeIndex];
            const answer = digits[digits.length - 1 - placeIndex];

            return {
                type: 'place-value-identify',
                question: `In ${number}, what digit is in the ${place} place?`,
                number: number,
                place: place,
                correctAnswer: answer,
                topic: 'place-value'
            };
        } else if (type === 'build-number' && digits.length >= 2) {
            const hundreds = digits.length >= 3 ? digits[0] : 0;
            const tens = digits.length >= 3 ? digits[1] : digits[0];
            const ones = digits.length >= 3 ? digits[2] : digits[1];

            let question = '';
            if (hundreds > 0) {
                question = `${hundreds} hundreds + ${tens} tens + ${ones} ones = ?`;
            } else {
                question = `${tens} tens + ${ones} ones = ?`;
            }

            return {
                type: 'fill-blank',
                question: question,
                display: question.replace('?', '__'),
                correctAnswer: number,
                topic: 'place-value'
            };
        } else {
            const options = this.generateOptions(digits[digits.length - 1], 4, 0, 9);
            return {
                type: 'multiple-choice',
                question: `What is the ones digit in ${number}?`,
                options: options.map(String),
                correctAnswer: digits[digits.length - 1],
                topic: 'place-value'
            };
        }
    },

    // FRACTIONS PUZZLES
    generateFractions() {
        const fractions = [
            { name: 'one half', numerator: 1, denominator: 2, display: '1/2' },
            { name: 'one third', numerator: 1, denominator: 3, display: '1/3' },
            { name: 'one quarter', numerator: 1, denominator: 4, display: '1/4' },
            { name: 'two thirds', numerator: 2, denominator: 3, display: '2/3' },
            { name: 'three quarters', numerator: 3, denominator: 4, display: '3/4' }
        ];

        const fraction = fractions[this.random(0, fractions.length - 1)];
        const puzzleTypes = ['visual-identify', 'multiple-choice'];
        const type = puzzleTypes[this.random(0, 1)];

        if (type === 'visual-identify') {
            return {
                type: 'fraction-visual',
                question: 'What fraction is shaded?',
                fraction: fraction,
                correctAnswer: fraction.display,
                topic: 'fractions'
            };
        } else {
            const otherFractions = fractions.filter(f => f.display !== fraction.display).slice(0, 3);
            const options = this.shuffle([fraction.display, ...otherFractions.map(f => f.display)]);

            return {
                type: 'multiple-choice',
                question: `Which shows ${fraction.name}?`,
                fractionOptions: this.shuffle([fraction, ...otherFractions]),
                options: options,
                correctAnswer: fraction.display,
                topic: 'fractions'
            };
        }
    },

    // WORD PROBLEMS
    generateWordProblem(range) {
        const maxNum = Math.min(range.max, 50);
        const templates = [
            // Addition
            {
                template: (a, b, item) => `You have ${a} ${item}. You get ${b} more. How many do you have now?`,
                operation: 'add',
                items: ['apples', 'cookies', 'toys', 'stickers', 'pencils']
            },
            // Subtraction
            {
                template: (a, b, item) => `You have ${a} ${item}. You give away ${b}. How many are left?`,
                operation: 'subtract',
                items: ['candies', 'marbles', 'cards', 'crayons', 'books']
            },
            // Addition (joining)
            {
                template: (a, b, item) => `${a} birds are in a tree. ${b} more fly in. How many birds are there now?`,
                operation: 'add',
                items: ['birds']
            },
            // Subtraction (leaving)
            {
                template: (a, b, item) => `There are ${a} fish in a pond. ${b} swim away. How many fish are left?`,
                operation: 'subtract',
                items: ['fish']
            }
        ];

        const problem = templates[this.random(0, templates.length - 1)];
        const item = problem.items[this.random(0, problem.items.length - 1)];

        let a, b, answer;
        if (problem.operation === 'add') {
            a = this.random(2, Math.floor(maxNum / 2));
            b = this.random(2, Math.floor(maxNum / 2));
            answer = a + b;
        } else {
            answer = this.random(1, Math.floor(maxNum / 2));
            b = this.random(1, Math.floor(maxNum / 3));
            a = answer + b;
        }

        const question = problem.template(a, b, item);
        const options = this.generateOptions(answer, 4, 1, maxNum);

        return {
            type: 'word-problem',
            question: question,
            options: options.map(String),
            correctAnswer: answer,
            topic: 'word-problems'
        };
    },

    // Generate wrong options for multiple choice
    generateOptions(correct, count, min, max) {
        const options = new Set([correct]);

        while (options.size < count) {
            let wrong;
            const variance = Math.max(3, Math.floor(correct * 0.3));

            // Generate plausible wrong answers
            const offset = this.random(1, variance);
            wrong = this.random(0, 1) === 0 ? correct + offset : correct - offset;

            if (wrong >= min && wrong <= max && wrong !== correct) {
                options.add(wrong);
            }
        }

        return this.shuffle(Array.from(options));
    }
};
