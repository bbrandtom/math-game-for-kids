// Battle Module - Handles Pokemon battles with quick-time attack mechanic

const Battle = {
    // Battle state
    state: null,
    gameState: null,

    // Currently battling Pokemon
    pokemon1: null,
    pokemon2: null,

    // Current HP
    hp1: 0,
    hp2: 0,
    maxHp1: 0,
    maxHp2: 0,

    // Whose turn (1 or 2)
    currentTurn: 1,

    // Quick-time state
    quickTimeActive: false,
    markerPosition: 0,
    markerDirection: 1,
    markerSpeed: 2,
    targetStart: 40,
    targetEnd: 60,
    animationFrame: null,
    selectedAttack: null,

    // DOM elements (cached)
    elements: {},

    // Initialize battle system
    init(gameState) {
        this.gameState = gameState;
        this.cacheElements();
        this.bindEvents();
    },

    // Cache DOM elements
    cacheElements() {
        this.elements = {
            battleScreen: document.getElementById('battle-screen'),
            selectScreen: document.getElementById('battle-select-screen'),
            resultScreen: document.getElementById('battle-result-screen'),

            // Pokemon display
            pokemon1Sprite: document.getElementById('battle-pokemon1-sprite'),
            pokemon2Sprite: document.getElementById('battle-pokemon2-sprite'),
            pokemon1Name: document.getElementById('battle-pokemon1-name'),
            pokemon2Name: document.getElementById('battle-pokemon2-name'),

            // HP bars
            hp1Bar: document.getElementById('hp1-bar'),
            hp2Bar: document.getElementById('hp2-bar'),
            hp1Text: document.getElementById('hp1-text'),
            hp2Text: document.getElementById('hp2-text'),

            // Quick-time elements
            quickTimeContainer: document.getElementById('quick-time-container'),
            quickTimeMarker: document.getElementById('quick-time-marker'),
            quickTimeTarget: document.getElementById('quick-time-target'),

            // Attack buttons
            attackButtons: document.getElementById('attack-buttons'),

            // Turn indicator
            turnIndicator: document.getElementById('turn-indicator'),

            // Selection grid
            selectGrid: document.getElementById('battle-select-grid'),

            // Result elements
            winnerSprite: document.getElementById('winner-sprite'),
            winnerName: document.getElementById('winner-name'),
            xpGained: document.getElementById('xp-gained'),
            levelUpMessage: document.getElementById('level-up-message')
        };
    },

    // Bind event listeners
    bindEvents() {
        // Quick-time tap
        const quickTimeContainer = document.getElementById('quick-time-container');
        if (quickTimeContainer) {
            quickTimeContainer.addEventListener('click', () => this.handleQuickTimeTap());
        }

        // Battle continue button
        const continueBtn = document.getElementById('battle-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.endBattle());
        }
    },

    // Check if player can battle (needs 2+ caught Pokemon)
    canBattle(gameState) {
        const caughtCount = Storage.getCaughtCount(gameState);
        return caughtCount >= 2;
    },

    // Show Pokemon selection screen
    showSelectScreen(gameState) {
        this.gameState = gameState;
        this.state = 'selecting';
        this.pokemon1 = null;
        this.pokemon2 = null;

        // Get battle-ready Pokemon
        const battlePokemon = PokemonData.getBattleReadyPokemon(gameState.pokemon);

        // Build selection grid
        const grid = this.elements.selectGrid;
        if (!grid) return;

        grid.innerHTML = '';

        battlePokemon.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'battle-select-card';
            card.dataset.pokemonId = pokemon.id;

            const spriteClass = PokemonData.getCurrentSprite(pokemon.id, pokemon.stage);

            card.innerHTML = `
                <div class="select-sprite ${spriteClass}"></div>
                <p class="select-name">${PokemonData.getCurrentName(pokemon.id, pokemon.stage)}</p>
                <p class="select-level">Lv. ${pokemon.level}</p>
            `;

            card.addEventListener('click', () => this.selectPokemon(pokemon));
            grid.appendChild(card);
        });

        // Update selection instruction
        this.updateSelectionInstruction();

        // Show select screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.elements.selectScreen.classList.add('active');
    },

    // Update selection instruction text
    updateSelectionInstruction() {
        const instruction = document.getElementById('select-instruction');
        if (!instruction) return;

        if (!this.pokemon1) {
            instruction.textContent = 'Select your first Pokemon';
        } else if (!this.pokemon2) {
            instruction.textContent = 'Select your second Pokemon';
        }
    },

    // Select a Pokemon for battle
    selectPokemon(pokemon) {
        if (!this.pokemon1) {
            this.pokemon1 = pokemon;
            // Highlight selected card
            const cards = this.elements.selectGrid.querySelectorAll('.battle-select-card');
            cards.forEach(card => {
                if (card.dataset.pokemonId === pokemon.id) {
                    card.classList.add('selected-first');
                }
            });
            this.updateSelectionInstruction();
        } else if (!this.pokemon2 && pokemon.id !== this.pokemon1.id) {
            this.pokemon2 = pokemon;
            // Start the battle
            this.startBattle();
        }
    },

    // Start the actual battle
    startBattle() {
        this.state = 'battling';
        this.currentTurn = 1;

        // Calculate HP
        this.maxHp1 = PokemonData.getBattleHP(this.pokemon1.id, this.pokemon1.stage, this.pokemon1.level);
        this.maxHp2 = PokemonData.getBattleHP(this.pokemon2.id, this.pokemon2.stage, this.pokemon2.level);
        this.hp1 = this.maxHp1;
        this.hp2 = this.maxHp2;

        // Setup battle screen
        this.setupBattleScreen();

        // Show battle screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.elements.battleScreen.classList.add('active');

        // Start first turn
        this.startTurn();
    },

    // Setup battle screen display
    setupBattleScreen() {
        // Pokemon 1 (left side)
        const sprite1Class = PokemonData.getCurrentSprite(this.pokemon1.id, this.pokemon1.stage);
        this.elements.pokemon1Sprite.className = 'battle-sprite ' + sprite1Class;
        this.elements.pokemon1Name.textContent = PokemonData.getCurrentName(this.pokemon1.id, this.pokemon1.stage);

        // Pokemon 2 (right side)
        const sprite2Class = PokemonData.getCurrentSprite(this.pokemon2.id, this.pokemon2.stage);
        this.elements.pokemon2Sprite.className = 'battle-sprite ' + sprite2Class;
        this.elements.pokemon2Name.textContent = PokemonData.getCurrentName(this.pokemon2.id, this.pokemon2.stage);

        // HP bars
        this.updateHPBars();

        // Hide quick-time initially
        this.elements.quickTimeContainer.classList.add('hidden');
    },

    // Update HP bar displays
    updateHPBars() {
        const percent1 = Math.max(0, (this.hp1 / this.maxHp1) * 100);
        const percent2 = Math.max(0, (this.hp2 / this.maxHp2) * 100);

        this.elements.hp1Bar.style.width = percent1 + '%';
        this.elements.hp2Bar.style.width = percent2 + '%';

        // Color based on HP level
        this.elements.hp1Bar.className = 'hp-fill ' + this.getHPColorClass(percent1);
        this.elements.hp2Bar.className = 'hp-fill ' + this.getHPColorClass(percent2);

        this.elements.hp1Text.textContent = `${Math.max(0, this.hp1)}/${this.maxHp1}`;
        this.elements.hp2Text.textContent = `${Math.max(0, this.hp2)}/${this.maxHp2}`;
    },

    // Get HP bar color class based on percentage
    getHPColorClass(percent) {
        if (percent > 50) return 'hp-high';
        if (percent > 20) return 'hp-medium';
        return 'hp-low';
    },

    // Start a turn
    startTurn() {
        const currentPokemon = this.currentTurn === 1 ? this.pokemon1 : this.pokemon2;

        // Update turn indicator
        this.elements.turnIndicator.textContent = `${PokemonData.getCurrentName(currentPokemon.id, currentPokemon.stage)}'s Turn!`;

        // Highlight active Pokemon
        this.elements.pokemon1Sprite.classList.toggle('active-turn', this.currentTurn === 1);
        this.elements.pokemon2Sprite.classList.toggle('active-turn', this.currentTurn === 2);

        // Show attack buttons
        this.showAttackButtons(currentPokemon);
    },

    // Show available attacks for the current Pokemon
    showAttackButtons(pokemon) {
        const attacks = PokemonData.getAvailableAttacks(pokemon.id, pokemon.level);
        const container = this.elements.attackButtons;
        container.innerHTML = '';

        attacks.forEach(attack => {
            const btn = document.createElement('button');
            btn.className = 'attack-btn';
            btn.innerHTML = `
                <span class="attack-name">${attack.name}</span>
                <span class="attack-damage">${attack.damage} DMG</span>
            `;
            btn.addEventListener('click', () => this.selectAttack(attack));
            container.appendChild(btn);
        });

        container.classList.remove('hidden');
    },

    // Select an attack and start quick-time
    selectAttack(attack) {
        this.selectedAttack = attack;
        this.elements.attackButtons.classList.add('hidden');
        this.startQuickTime();
    },

    // Start the quick-time minigame
    startQuickTime() {
        this.quickTimeActive = true;
        this.markerPosition = 0;
        this.markerDirection = 1;

        // Adjust speed based on attacking Pokemon's level (higher level = slightly faster)
        const currentPokemon = this.currentTurn === 1 ? this.pokemon1 : this.pokemon2;
        this.markerSpeed = 1.5 + (currentPokemon.level * 0.1);

        // Show quick-time container
        this.elements.quickTimeContainer.classList.remove('hidden');

        // Start animation
        this.animateMarker();
    },

    // Animate the marker moving back and forth
    animateMarker() {
        if (!this.quickTimeActive) return;

        // Move marker
        this.markerPosition += this.markerSpeed * this.markerDirection;

        // Bounce at edges
        if (this.markerPosition >= 100) {
            this.markerPosition = 100;
            this.markerDirection = -1;
        } else if (this.markerPosition <= 0) {
            this.markerPosition = 0;
            this.markerDirection = 1;
        }

        // Update marker position
        this.elements.quickTimeMarker.style.left = this.markerPosition + '%';

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animateMarker());
    },

    // Handle tap on quick-time bar
    handleQuickTimeTap() {
        if (!this.quickTimeActive) return;

        // Stop animation
        this.quickTimeActive = false;
        cancelAnimationFrame(this.animationFrame);

        // Calculate accuracy based on position relative to target
        const accuracy = this.calculateAccuracy(this.markerPosition);

        // Calculate and apply damage
        this.executeAttack(accuracy);
    },

    // Calculate accuracy based on marker position
    calculateAccuracy(position) {
        const targetCenter = (this.targetStart + this.targetEnd) / 2;
        const targetWidth = this.targetEnd - this.targetStart;
        const distance = Math.abs(position - targetCenter);

        // Perfect hit (inside target zone)
        if (position >= this.targetStart && position <= this.targetEnd) {
            return 1.0;
        }

        // Near miss (within 10% of target)
        if (distance <= targetWidth) {
            return 0.5;
        }

        // Miss
        return 0.2;
    },

    // Execute the attack with calculated damage
    executeAttack(accuracy) {
        const damage = PokemonData.calculateDamage(this.selectedAttack.damage, accuracy);
        const targetPokemon = this.currentTurn === 1 ? 2 : 1;

        // Get accuracy description
        let accuracyText = '';
        if (accuracy === 1.0) {
            accuracyText = 'Perfect!';
        } else if (accuracy === 0.5) {
            accuracyText = 'Near hit!';
        } else {
            accuracyText = 'Missed...';
        }

        // Show attack result
        this.showAttackResult(accuracyText, damage);

        // Apply damage after short delay
        setTimeout(() => {
            if (targetPokemon === 2) {
                this.hp2 = Math.max(0, this.hp2 - damage);
                this.animateHit(2);
            } else {
                this.hp1 = Math.max(0, this.hp1 - damage);
                this.animateHit(1);
            }

            this.updateHPBars();

            // Hide quick-time
            this.elements.quickTimeContainer.classList.add('hidden');

            // Check for battle end
            setTimeout(() => {
                if (this.hp1 <= 0 || this.hp2 <= 0) {
                    this.finishBattle();
                } else {
                    // Switch turns
                    this.currentTurn = this.currentTurn === 1 ? 2 : 1;
                    this.startTurn();
                }
            }, 500);
        }, 800);
    },

    // Show attack result text
    showAttackResult(accuracyText, damage) {
        this.elements.turnIndicator.innerHTML = `
            <span class="accuracy-result">${accuracyText}</span>
            <span class="damage-result">${this.selectedAttack.name} deals ${damage} damage!</span>
        `;
    },

    // Animate hit on a Pokemon
    animateHit(pokemonNum) {
        const sprite = pokemonNum === 1 ? this.elements.pokemon1Sprite : this.elements.pokemon2Sprite;
        sprite.classList.add('hit-animation');

        // Play hit sound
        if (typeof GameAudio !== 'undefined' && GameAudio.playHit) {
            GameAudio.playHit();
        }

        setTimeout(() => sprite.classList.remove('hit-animation'), 400);
    },

    // Finish the battle
    finishBattle() {
        this.state = 'finished';

        // Determine winner
        const winner = this.hp1 > 0 ? this.pokemon1 : this.pokemon2;
        const loser = this.hp1 > 0 ? this.pokemon2 : this.pokemon1;

        // Calculate XP (based on loser's level)
        const xpGained = 10 + (loser.level * 5);

        // Award XP and check for level up
        const leveledUp = Storage.addBattleXP(this.gameState, winner.id, xpGained);

        // Show result screen
        this.showResultScreen(winner, xpGained, leveledUp);

        // Play victory sound
        if (typeof GameAudio !== 'undefined' && GameAudio.playEvolution) {
            GameAudio.playEvolution();
        }
    },

    // Show battle result screen
    showResultScreen(winner, xpGained, leveledUp) {
        const spriteClass = PokemonData.getCurrentSprite(winner.id, winner.stage);
        this.elements.winnerSprite.className = 'winner-sprite ' + spriteClass;
        this.elements.winnerName.textContent = PokemonData.getCurrentName(winner.id, winner.stage) + ' Wins!';
        this.elements.xpGained.textContent = `+${xpGained} XP`;

        if (leveledUp) {
            const newLevel = Storage.getPokemonLevel(this.gameState, winner.id);
            this.elements.levelUpMessage.textContent = `Level Up! Now Lv. ${newLevel}`;
            this.elements.levelUpMessage.classList.remove('hidden');
        } else {
            this.elements.levelUpMessage.classList.add('hidden');
        }

        // Show result screen
        this.elements.battleScreen.classList.remove('active');
        this.elements.resultScreen.classList.add('active');
    },

    // End battle and return to home
    endBattle() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('home-screen').classList.add('active');

        // Reset battle state
        this.state = null;
        this.pokemon1 = null;
        this.pokemon2 = null;
    }
};
