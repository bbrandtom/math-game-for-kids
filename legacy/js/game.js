// Main Game Module - Core game logic and UI management

const Game = {
    state: null,
    currentPuzzle: null,
    currentTopic: null,
    pendingEncounter: null,
    isFirstAttempt: true,

    // Initialize game
    init() {
        this.state = Storage.load();
        GameAudio.init(this.state.soundEnabled);
        this.setupEventListeners();
        this.updateUI();
        this.showScreen('home-screen');
    },

    // Setup all event listeners
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('play-btn').addEventListener('click', () => this.startPlaying());
        document.getElementById('pokedex-btn').addEventListener('click', () => this.showPokedex());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());

        // Back buttons
        document.querySelectorAll('.back-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.target || 'home-screen';
                this.showScreen(target);
            });
        });

        // Play screen back button
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen('home-screen'));

        // Capture screen buttons
        document.getElementById('throw-pokeball-btn').addEventListener('click', () => this.throwPokeball());
        document.getElementById('run-away-btn').addEventListener('click', () => this.runAway());
        document.getElementById('continue-btn').addEventListener('click', () => this.continueAfterCapture());

        // Encounter button
        document.getElementById('encounter-btn').addEventListener('click', () => this.goToEncounter());

        // Settings
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setDifficulty(e.target.dataset.difficulty));
        });

        document.querySelectorAll('.topic-toggle input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.toggleTopic(e.target.dataset.topic, e.target.checked));
        });

        document.getElementById('reset-progress').addEventListener('click', () => this.resetProgress());

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => this.toggleSound());

        // Pokedex detail close
        document.getElementById('close-detail').addEventListener('click', () => {
            document.getElementById('pokemon-detail').classList.add('hidden');
        });
    },

    // Screen management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'home-screen') {
            this.updateUI();
        }
    },

    // Update UI elements
    updateUI() {
        document.getElementById('home-pokeballs').textContent = this.state.pokeballs;
        document.getElementById('play-pokeballs').textContent = this.state.pokeballs;
        document.getElementById('streak-count').textContent = this.state.streak;

        // Settings stats
        document.getElementById('total-pokeballs').textContent = this.state.totalPokeballs;
        document.getElementById('total-caught').textContent = Storage.getCaughtCount(this.state);
        document.getElementById('accuracy').textContent = Storage.getAccuracy(this.state);

        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.state.difficulty);
        });

        // Topic toggles
        document.querySelectorAll('.topic-toggle input').forEach(checkbox => {
            checkbox.checked = this.state.enabledTopics[checkbox.dataset.topic];
        });

        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.querySelector('.sound-icon').textContent = this.state.soundEnabled ? '🔊' : '🔇';
            soundToggle.querySelector('.sound-text').textContent = this.state.soundEnabled ? 'Sound ON' : 'Sound OFF';
            soundToggle.classList.toggle('sound-off', !this.state.soundEnabled);
        }
    },

    // Start playing
    startPlaying() {
        this.showScreen('play-screen');
        this.generateNewPuzzle();
    },

    // Get enabled topics
    getEnabledTopics() {
        return Object.entries(this.state.enabledTopics)
            .filter(([topic, enabled]) => enabled)
            .map(([topic]) => topic);
    },

    // Generate a new puzzle
    generateNewPuzzle() {
        const enabledTopics = this.getEnabledTopics();
        if (enabledTopics.length === 0) {
            alert('Please enable at least one topic in Settings!');
            this.showScreen('settings-screen');
            return;
        }

        // Pick random topic
        this.currentTopic = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
        this.currentPuzzle = Puzzles.generate(this.currentTopic, this.state.difficulty);
        this.isFirstAttempt = true;

        // Update topic indicator
        const topicNames = {
            'addition': 'Addition',
            'subtraction': 'Subtraction',
            'skip-counting': 'Skip Counting',
            'shapes': 'Shapes',
            'grouping': 'Grouping',
            'place-value': 'Place Value',
            'fractions': 'Fractions',
            'word-problems': 'Word Problems'
        };
        document.getElementById('topic-indicator').textContent = topicNames[this.currentTopic];

        // Render puzzle
        this.renderPuzzle();

        // Hide feedback
        document.getElementById('feedback-message').classList.add('hidden');
    },

    // Render puzzle to DOM
    renderPuzzle() {
        const container = document.getElementById('puzzle-container');
        container.innerHTML = '';

        const puzzle = this.currentPuzzle;

        switch (puzzle.type) {
            case 'fill-blank':
            case 'pattern-fill':
                this.renderFillBlank(container, puzzle);
                break;

            case 'multiple-choice':
                this.renderMultipleChoice(container, puzzle);
                break;

            case 'visual-counting':
                this.renderVisualCounting(container, puzzle);
                break;

            case 'visual-groups':
                this.renderVisualGroups(container, puzzle);
                break;

            case 'shape-identify':
                this.renderShapeIdentify(container, puzzle);
                break;

            case 'shape-properties':
                this.renderShapeProperties(container, puzzle);
                break;

            case 'place-value-identify':
                this.renderPlaceValue(container, puzzle);
                break;

            case 'fraction-visual':
                this.renderFractionVisual(container, puzzle);
                break;

            case 'word-problem':
                this.renderWordProblem(container, puzzle);
                break;

            default:
                this.renderFillBlank(container, puzzle);
        }
    },

    // Render fill-in-the-blank puzzle
    renderFillBlank(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question || '';

        const equation = document.createElement('div');
        equation.className = 'puzzle-equation';
        equation.innerHTML = puzzle.display.replace('__',
            '<input type="number" class="puzzle-blank" id="answer-input" autocomplete="off">');

        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Check Answer';
        submitBtn.addEventListener('click', () => this.checkFillBlankAnswer());

        container.appendChild(question);
        container.appendChild(equation);
        container.appendChild(submitBtn);

        // Focus input
        setTimeout(() => {
            const input = document.getElementById('answer-input');
            if (input) {
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.checkFillBlankAnswer();
                });
            }
        }, 100);
    },

    // Render multiple choice puzzle
    renderMultipleChoice(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question;

        // Add visual groups if present
        if (puzzle.visualGroups) {
            const groupsDiv = document.createElement('div');
            groupsDiv.className = 'groups-container';

            for (let i = 0; i < puzzle.visualGroups.groups; i++) {
                const group = document.createElement('div');
                group.className = 'group-box';
                for (let j = 0; j < puzzle.visualGroups.itemsPerGroup; j++) {
                    const item = document.createElement('span');
                    item.className = 'visual-object';
                    item.textContent = puzzle.visualGroups.item;
                    group.appendChild(item);
                }
                groupsDiv.appendChild(group);
            }
            container.appendChild(groupsDiv);
        }

        container.appendChild(question);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'puzzle-options';

        puzzle.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkMultipleChoice(btn, option));
            optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);
    },

    // Render visual counting puzzle
    renderVisualCounting(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question;

        const objectsDiv = document.createElement('div');
        objectsDiv.className = 'visual-objects';

        puzzle.objects.forEach(obj => {
            const span = document.createElement('span');
            span.className = 'visual-object';
            span.textContent = obj;
            objectsDiv.appendChild(span);
        });

        const inputDiv = document.createElement('div');
        inputDiv.innerHTML = '<input type="number" class="puzzle-blank" id="answer-input" autocomplete="off">';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Check Answer';
        submitBtn.addEventListener('click', () => this.checkFillBlankAnswer());

        container.appendChild(question);
        container.appendChild(objectsDiv);
        container.appendChild(inputDiv);
        container.appendChild(submitBtn);

        setTimeout(() => {
            const input = document.getElementById('answer-input');
            if (input) {
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.checkFillBlankAnswer();
                });
            }
        }, 100);
    },

    // Render visual groups puzzle
    renderVisualGroups(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question;

        const groupsDiv = document.createElement('div');
        groupsDiv.className = 'groups-container';

        for (let i = 0; i < puzzle.groups; i++) {
            const group = document.createElement('div');
            group.className = 'group-box';
            for (let j = 0; j < puzzle.itemsPerGroup; j++) {
                const item = document.createElement('span');
                item.className = 'visual-object';
                item.textContent = puzzle.item;
                group.appendChild(item);
            }
            groupsDiv.appendChild(group);
        }

        const inputDiv = document.createElement('div');
        inputDiv.innerHTML = '<input type="number" class="puzzle-blank" id="answer-input" autocomplete="off">';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Check Answer';
        submitBtn.addEventListener('click', () => this.checkFillBlankAnswer());

        container.appendChild(question);
        container.appendChild(groupsDiv);
        container.appendChild(inputDiv);
        container.appendChild(submitBtn);

        setTimeout(() => {
            const input = document.getElementById('answer-input');
            if (input) input.focus();
        }, 100);
    },

    // Render shape identification puzzle
    renderShapeIdentify(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question;

        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'shape-display';

        const shape = document.createElement('div');
        shape.className = `shape ${puzzle.shapeClass}`;
        shapeDiv.appendChild(shape);

        container.appendChild(question);
        container.appendChild(shapeDiv);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'puzzle-options';

        puzzle.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            btn.addEventListener('click', () => this.checkMultipleChoice(btn, option));
            optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);
    },

    // Render shape properties puzzle
    renderShapeProperties(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question;

        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'shape-display';

        const shape = document.createElement('div');
        shape.className = `shape ${puzzle.shapeClass}`;
        shapeDiv.appendChild(shape);

        const inputDiv = document.createElement('div');
        inputDiv.innerHTML = '<input type="number" class="puzzle-blank" id="answer-input" autocomplete="off">';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Check Answer';
        submitBtn.addEventListener('click', () => this.checkFillBlankAnswer());

        container.appendChild(question);
        container.appendChild(shapeDiv);
        container.appendChild(inputDiv);
        container.appendChild(submitBtn);

        setTimeout(() => {
            const input = document.getElementById('answer-input');
            if (input) input.focus();
        }, 100);
    },

    // Render place value puzzle
    renderPlaceValue(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question;

        const numberDisplay = document.createElement('div');
        numberDisplay.className = 'puzzle-equation';
        numberDisplay.innerHTML = `<span style="font-size: 3rem; letter-spacing: 10px;">${puzzle.number}</span>`;

        const inputDiv = document.createElement('div');
        inputDiv.innerHTML = '<input type="number" class="puzzle-blank" id="answer-input" autocomplete="off">';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Check Answer';
        submitBtn.addEventListener('click', () => this.checkFillBlankAnswer());

        container.appendChild(question);
        container.appendChild(numberDisplay);
        container.appendChild(inputDiv);
        container.appendChild(submitBtn);

        setTimeout(() => {
            const input = document.getElementById('answer-input');
            if (input) input.focus();
        }, 100);
    },

    // Render fraction visual puzzle
    renderFractionVisual(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.textContent = puzzle.question;

        const fractionDiv = document.createElement('div');
        fractionDiv.className = 'fraction-visual';

        // Create visual representation
        const { numerator, denominator } = puzzle.fraction;
        for (let i = 0; i < denominator; i++) {
            const slice = document.createElement('div');
            slice.className = `fraction-slice ${i < numerator ? 'filled' : 'empty'}`;
            fractionDiv.appendChild(slice);
        }

        container.appendChild(question);
        container.appendChild(fractionDiv);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'puzzle-options';

        const options = ['1/2', '1/3', '1/4', '2/3', '3/4'];
        const shuffled = Puzzles.shuffle(options).slice(0, 4);
        if (!shuffled.includes(puzzle.correctAnswer)) {
            shuffled[0] = puzzle.correctAnswer;
        }

        Puzzles.shuffle(shuffled).forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkMultipleChoice(btn, option));
            optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);
    },

    // Render word problem
    renderWordProblem(container, puzzle) {
        const question = document.createElement('div');
        question.className = 'puzzle-question';
        question.style.fontSize = '1.4rem';
        question.textContent = puzzle.question;

        container.appendChild(question);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'puzzle-options';

        puzzle.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkMultipleChoice(btn, parseInt(option)));
            optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);
    },

    // Check fill-in-the-blank answer
    checkFillBlankAnswer() {
        const input = document.getElementById('answer-input');
        if (!input) return;

        const userAnswer = parseInt(input.value);
        const correct = userAnswer === this.currentPuzzle.correctAnswer;

        this.handleAnswer(correct);

        if (correct) {
            input.classList.add('sparkle');
        } else {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
    },

    // Check multiple choice answer
    checkMultipleChoice(button, selectedAnswer) {
        const correct = selectedAnswer === this.currentPuzzle.correctAnswer ||
                       String(selectedAnswer) === String(this.currentPuzzle.correctAnswer);

        if (correct) {
            // Disable all buttons and show correct
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.disabled = true;
            });
            button.classList.add('correct');
        } else {
            // Only disable the wrong button, let user try again
            button.disabled = true;
            button.classList.add('incorrect');
        }

        this.handleAnswer(correct);
    },

    // Handle answer result
    handleAnswer(correct) {
        const feedback = document.getElementById('feedback-message');

        if (correct) {
            GameAudio.playCorrect();

            // Calculate pokeballs
            let pokeballs = this.isFirstAttempt ? 2 : 1;

            // Streak bonus
            if ((this.state.streak + 1) % 5 === 0) {
                pokeballs += 1;
                feedback.textContent = `Correct! +${pokeballs} Pokeballs! (Streak Bonus!)`;
            } else {
                feedback.textContent = `Correct! +${pokeballs} Pokeballs!`;
            }

            feedback.className = 'feedback success';

            // Update state
            this.state.pokeballs += pokeballs;
            this.state.totalPokeballs += pokeballs;
            Storage.recordAnswer(this.state, this.currentTopic, true);

            // Check for evolution
            this.checkEvolution();

            // Check for wild Pokemon encounter
            this.checkForEncounter();

            // Next puzzle after delay
            setTimeout(() => {
                if (!this.pendingEncounter) {
                    this.generateNewPuzzle();
                }
            }, 1500);

        } else {
            GameAudio.playIncorrect();
            feedback.textContent = 'Try again!';
            feedback.className = 'feedback error';
            Storage.recordAnswer(this.state, this.currentTopic, false);
            this.isFirstAttempt = false;
        }

        feedback.classList.remove('hidden');
        this.updateUI();
    },

    // Check for Pokemon encounter
    checkForEncounter() {
        const encounter = PokemonData.getRandomEncounter(
            this.state.pokeballs,
            this.state.pokemon,
            this.state.enabledTopics
        );

        if (encounter && Math.random() < 0.3) { // 30% chance when affordable
            this.pendingEncounter = encounter;
            GameAudio.playEncounter();
            const alert = document.getElementById('wild-pokemon-alert');
            alert.classList.remove('hidden');
        }
    },

    // Go to encounter screen
    goToEncounter() {
        if (!this.pendingEncounter) return;

        document.getElementById('wild-pokemon-alert').classList.add('hidden');

        const pokemon = this.pendingEncounter;
        document.getElementById('wild-pokemon').className = `pokemon-sprite ${pokemon.spriteClass}`;
        document.getElementById('wild-pokemon-name').textContent = pokemon.name;
        document.getElementById('capture-cost').textContent = pokemon.cost;

        // Enable/disable throw button
        const throwBtn = document.getElementById('throw-pokeball-btn');
        throwBtn.disabled = this.state.pokeballs < pokemon.cost;

        // Reset capture UI
        document.getElementById('capture-animation').classList.add('hidden');
        document.getElementById('capture-result').classList.add('hidden');
        document.querySelector('.capture-container > .pokemon-sprite').style.display = '';
        document.querySelector('.capture-prompt').style.display = '';
        document.querySelector('.capture-cost').style.display = '';
        document.querySelector('.capture-buttons').style.display = '';

        this.showScreen('capture-screen');
    },

    // Throw pokeball
    throwPokeball() {
        const pokemon = this.pendingEncounter;
        if (!pokemon || this.state.pokeballs < pokemon.cost) return;

        GameAudio.playThrow();

        // Deduct pokeballs
        this.state.pokeballs -= pokemon.cost;
        Storage.save(this.state);

        // Hide UI elements
        document.querySelector('.capture-prompt').style.display = 'none';
        document.querySelector('.capture-cost').style.display = 'none';
        document.querySelector('.capture-buttons').style.display = 'none';

        // Show animation
        const animation = document.getElementById('capture-animation');
        animation.classList.remove('hidden');

        // After animation, show result
        setTimeout(() => {
            animation.classList.add('hidden');
            document.querySelector('.capture-container > .pokemon-sprite').style.display = 'none';

            // Catch Pokemon
            Storage.catchPokemon(this.state, pokemon.id);
            GameAudio.playCapture();

            // Show result
            document.getElementById('caught-pokemon-name').textContent = pokemon.name;
            document.getElementById('capture-result').classList.remove('hidden');

            this.updateUI();
        }, 2000);
    },

    // Run away from encounter
    runAway() {
        this.pendingEncounter = null;
        this.showScreen('play-screen');
        this.generateNewPuzzle();
    },

    // Continue after capture
    continueAfterCapture() {
        this.pendingEncounter = null;
        this.showScreen('play-screen');
        this.generateNewPuzzle();
    },

    // Check and handle evolution
    checkEvolution() {
        const pokemonId = PokemonData.topicToPokemon[this.currentTopic];
        const pokemonState = this.state.pokemon[pokemonId];
        const topicMastery = this.state.topicMastery[this.currentTopic];

        if (!pokemonState.caught) return;

        const canEvolve = PokemonData.canEvolve(
            pokemonId,
            pokemonState.stage,
            topicMastery.correct,
            topicMastery.consecutiveCorrect
        );

        if (canEvolve) {
            Storage.evolvePokemon(this.state, pokemonId);
            GameAudio.playEvolution();
            const newName = PokemonData.getCurrentName(pokemonId, pokemonState.stage);

            // Show evolution notification
            const feedback = document.getElementById('feedback-message');
            feedback.textContent = `Your ${PokemonData.pokemon[pokemonId].name} evolved into ${newName}!`;
            feedback.className = 'feedback success';
        }
    },

    // Show Pokedex
    showPokedex() {
        this.showScreen('pokedex-screen');
        this.renderPokedex();
    },

    // Render Pokedex grid
    renderPokedex() {
        const grid = document.getElementById('pokedex-grid');
        grid.innerHTML = '';

        PokemonData.getAllPokemon().forEach(pokemon => {
            const state = this.state.pokemon[pokemon.id];
            const entry = document.createElement('div');
            entry.className = `pokedex-entry ${state.caught ? '' : 'uncaught'}`;

            const currentSprite = state.caught
                ? PokemonData.getCurrentSprite(pokemon.id, state.stage)
                : pokemon.spriteClass;

            const currentName = state.caught
                ? PokemonData.getCurrentName(pokemon.id, state.stage)
                : '???';

            entry.innerHTML = `
                <div class="sprite ${currentSprite}"></div>
                <div class="name">${currentName}</div>
                <div class="topic">${state.caught ? this.formatTopic(pokemon.topic) : ''}</div>
            `;

            if (state.caught) {
                entry.addEventListener('click', () => this.showPokemonDetail(pokemon.id));
            }

            grid.appendChild(entry);
        });
    },

    // Show Pokemon detail
    showPokemonDetail(pokemonId) {
        const pokemon = PokemonData.pokemon[pokemonId];
        const state = this.state.pokemon[pokemonId];
        const mastery = this.state.topicMastery[pokemon.topic];

        const detail = document.getElementById('pokemon-detail');
        detail.classList.remove('hidden');

        // Current sprite and name
        const currentSprite = PokemonData.getCurrentSprite(pokemonId, state.stage);
        const currentName = PokemonData.getCurrentName(pokemonId, state.stage);

        document.getElementById('detail-sprite').className = `detail-sprite ${currentSprite}`;
        document.getElementById('detail-name').textContent = currentName.charAt(0).toUpperCase() + currentName.slice(1);
        document.getElementById('detail-topic').textContent = `Topic: ${this.formatTopic(pokemon.topic)}`;

        // Evolution chain
        const chainDiv = document.getElementById('evolution-chain');
        chainDiv.innerHTML = '';

        pokemon.evolution.forEach((evo, index) => {
            const evoSprite = document.createElement('div');
            evoSprite.className = `evo-sprite pokemon-${evo}`;
            evoSprite.style.opacity = index <= state.stage - 1 ? '1' : '0.3';
            chainDiv.appendChild(evoSprite);

            if (index < pokemon.evolution.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'evo-arrow';
                arrow.textContent = '→';
                chainDiv.appendChild(arrow);
            }
        });

        // Mastery progress
        const progress = PokemonData.getEvolutionProgress(pokemonId, state.stage, mastery.correct);
        document.getElementById('mastery-fill').style.width = `${progress.percent}%`;

        if (state.stage >= pokemon.evolution.length) {
            document.getElementById('mastery-text').textContent = 'Fully evolved!';
        } else {
            document.getElementById('mastery-text').textContent =
                `Progress: ${progress.current}/${progress.needed} correct answers`;
        }
    },

    // Format topic name
    formatTopic(topic) {
        return topic.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    // Show settings
    showSettings() {
        this.showScreen('settings-screen');
        this.updateUI();
    },

    // Set difficulty
    setDifficulty(difficulty) {
        this.state.difficulty = difficulty;
        Storage.save(this.state);
        this.updateUI();
    },

    // Toggle sound
    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        GameAudio.setEnabled(this.state.soundEnabled);
        Storage.save(this.state);
        this.updateUI();

        // Play a test sound when enabling
        if (this.state.soundEnabled) {
            GameAudio.playCorrect();
        }
    },

    // Toggle topic
    toggleTopic(topic, enabled) {
        this.state.enabledTopics[topic] = enabled;
        Storage.save(this.state);
    },

    // Reset progress
    resetProgress() {
        if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
            this.state = Storage.reset();
            this.updateUI();
            alert('Progress has been reset!');
        }
    }
};

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
