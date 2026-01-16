// Storage Module - Handles saving and loading game progress

const Storage = {
    STORAGE_KEY: 'pokemon_math_adventure',

    // Default game state
    defaultState: {
        pokeballs: 0,
        totalPokeballs: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        streak: 0,
        difficulty: 'medium',
        soundEnabled: true,
        enabledTopics: {
            'addition': true,
            'subtraction': true,
            'skip-counting': true,
            'shapes': true,
            'grouping': true,
            'place-value': true,
            'fractions': true,
            'word-problems': true
        },
        pokemon: {
            // Pokemon caught status, evolution stage, and battle stats
            'pikachu': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            'squirtle': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            'oddish': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            'porygon': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            'magnemite': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            'abra': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            'exeggcute': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            'bulbasaur': { caught: false, stage: 0, correctAnswers: 0, level: 1, xp: 0 },
            // Legendary Pokemon (caught by defeating bosses)
            'lucario': { caught: false, stage: 1, level: 1, xp: 0 },
            'mewtwo': { caught: false, stage: 1, level: 1, xp: 0 },
            'arceus': { caught: false, stage: 1, level: 1, xp: 0 }
        },
        // Track defeated legendary bosses
        legendaryDefeated: {
            'lucario': false,
            'mewtwo': false,
            'arceus': false
        },
        topicMastery: {
            'addition': { correct: 0, consecutiveCorrect: 0 },
            'subtraction': { correct: 0, consecutiveCorrect: 0 },
            'skip-counting': { correct: 0, consecutiveCorrect: 0 },
            'shapes': { correct: 0, consecutiveCorrect: 0 },
            'grouping': { correct: 0, consecutiveCorrect: 0 },
            'place-value': { correct: 0, consecutiveCorrect: 0 },
            'fractions': { correct: 0, consecutiveCorrect: 0 },
            'word-problems': { correct: 0, consecutiveCorrect: 0 }
        }
    },

    // Load game state from localStorage
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all keys exist
                return this.mergeWithDefaults(parsed);
            }
        } catch (e) {
            console.error('Error loading game state:', e);
        }
        return JSON.parse(JSON.stringify(this.defaultState));
    },

    // Save game state to localStorage
    save(state) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Error saving game state:', e);
            return false;
        }
    },

    // Merge saved state with defaults (handles new properties)
    mergeWithDefaults(saved) {
        const defaults = JSON.parse(JSON.stringify(this.defaultState));

        // Top level properties
        for (const key in defaults) {
            if (saved[key] === undefined) {
                saved[key] = defaults[key];
            } else if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
                // Nested objects
                for (const nestedKey in defaults[key]) {
                    if (saved[key][nestedKey] === undefined) {
                        saved[key][nestedKey] = defaults[key][nestedKey];
                    }
                }
            }
        }

        return saved;
    },

    // Reset all progress
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        return JSON.parse(JSON.stringify(this.defaultState));
    },

    // Quick save helpers
    updatePokeballs(state, amount) {
        state.pokeballs += amount;
        state.totalPokeballs += amount;
        this.save(state);
    },

    recordAnswer(state, topic, isCorrect) {
        state.totalAttempts++;

        if (isCorrect) {
            state.totalCorrect++;
            state.streak++;
            state.topicMastery[topic].correct++;
            state.topicMastery[topic].consecutiveCorrect++;
        } else {
            state.streak = 0;
            state.topicMastery[topic].consecutiveCorrect = 0;
        }

        this.save(state);
    },

    catchPokemon(state, pokemonId) {
        if (state.pokemon[pokemonId]) {
            state.pokemon[pokemonId].caught = true;
            state.pokemon[pokemonId].stage = 1;
            this.save(state);
        }
    },

    evolvePokemon(state, pokemonId) {
        if (state.pokemon[pokemonId] && state.pokemon[pokemonId].caught) {
            state.pokemon[pokemonId].stage++;
            this.save(state);
        }
    },

    getAccuracy(state) {
        if (state.totalAttempts === 0) return 0;
        return Math.round((state.totalCorrect / state.totalAttempts) * 100);
    },

    getCaughtCount(state) {
        return Object.values(state.pokemon).filter(p => p.caught).length;
    },

    // Battle-related methods
    addBattleXP(state, pokemonId, xpAmount) {
        if (!state.pokemon[pokemonId] || !state.pokemon[pokemonId].caught) return false;

        const pokemon = state.pokemon[pokemonId];
        pokemon.xp += xpAmount;

        // Check for level up
        const xpNeeded = PokemonData.getXPForLevel(pokemon.level);
        let leveledUp = false;

        while (pokemon.xp >= xpNeeded && pokemon.level < 10) {
            pokemon.xp -= xpNeeded;
            pokemon.level++;
            leveledUp = true;
        }

        this.save(state);
        return leveledUp;
    },

    getPokemonLevel(state, pokemonId) {
        if (!state.pokemon[pokemonId]) return 1;
        return state.pokemon[pokemonId].level || 1;
    },

    getPokemonXP(state, pokemonId) {
        if (!state.pokemon[pokemonId]) return 0;
        return state.pokemon[pokemonId].xp || 0;
    },

    // Legendary-related methods
    defeatLegendaryBoss(state, bossId) {
        if (!state.legendaryDefeated) {
            state.legendaryDefeated = { lucario: false, mewtwo: false, arceus: false };
        }
        state.legendaryDefeated[bossId] = true;

        // Catch the legendary Pokemon
        if (state.pokemon[bossId]) {
            state.pokemon[bossId].caught = true;
            state.pokemon[bossId].stage = 1;
        }

        this.save(state);
    },

    isBossDefeated(state, bossId) {
        if (!state.legendaryDefeated) return false;
        return state.legendaryDefeated[bossId] === true;
    },

    getDefeatedBossCount(state) {
        if (!state.legendaryDefeated) return 0;
        return Object.values(state.legendaryDefeated).filter(d => d).length;
    },

    // Award XP to multiple Pokemon at once (for team battles)
    addTeamBattleXP(state, pokemonIds, xpAmount) {
        const leveledUp = [];

        pokemonIds.forEach(id => {
            if (state.pokemon[id] && state.pokemon[id].caught) {
                const pokemon = state.pokemon[id];
                pokemon.xp += xpAmount;

                // Check for level up
                let xpNeeded = PokemonData.getXPForLevel(pokemon.level);
                while (pokemon.xp >= xpNeeded && pokemon.level < 10) {
                    pokemon.xp -= xpNeeded;
                    pokemon.level++;
                    leveledUp.push(id);
                    xpNeeded = PokemonData.getXPForLevel(pokemon.level);
                }
            }
        });

        this.save(state);
        return leveledUp;
    },

    // Get count of caught Pokemon (excluding legendaries for certain checks)
    getRegularCaughtCount(state) {
        return Object.entries(state.pokemon)
            .filter(([id, p]) => p.caught && !PokemonData.isLegendary(id))
            .length;
    }
};
