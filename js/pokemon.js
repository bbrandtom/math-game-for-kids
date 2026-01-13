// Pokemon Data Module - Pokemon definitions and evolution chains

const PokemonData = {
    // Base stats for battle
    baseHP: 100,
    baseAttackDamage: 20,

    // Pokemon definitions with math topics
    pokemon: {
        'pikachu': {
            id: 'pikachu',
            name: 'Pikachu',
            topic: 'addition',
            cost: 10,
            spriteClass: 'pokemon-pikachu',
            evolution: ['pikachu', 'raichu'],
            evolutionCost: [0, 20], // Correct answers needed to evolve
            masteryCost: 10, // Consecutive correct for final evolution
            // Battle data
            baseHP: [80, 120], // HP per evolution stage
            attacks: [
                { name: 'Plus Bolt', damage: 15, unlockLevel: 1 },
                { name: 'Sum Strike', damage: 25, unlockLevel: 3 },
                { name: 'Add Surge', damage: 35, unlockLevel: 5 }
            ]
        },
        'squirtle': {
            id: 'squirtle',
            name: 'Squirtle',
            topic: 'subtraction',
            cost: 10,
            spriteClass: 'pokemon-squirtle',
            evolution: ['squirtle', 'wartortle', 'blastoise'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10,
            baseHP: [70, 100, 140],
            attacks: [
                { name: 'Minus Wave', damage: 15, unlockLevel: 1 },
                { name: 'Take Away Splash', damage: 25, unlockLevel: 3 },
                { name: 'Subtract Storm', damage: 35, unlockLevel: 5 }
            ]
        },
        'oddish': {
            id: 'oddish',
            name: 'Oddish',
            topic: 'skip-counting',
            cost: 15,
            spriteClass: 'pokemon-oddish',
            evolution: ['oddish', 'gloom', 'vileplume'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10,
            baseHP: [65, 95, 130],
            attacks: [
                { name: 'Count Barrage', damage: 15, unlockLevel: 1 },
                { name: 'Skip Strike', damage: 25, unlockLevel: 3 },
                { name: 'Sequence Slam', damage: 35, unlockLevel: 5 }
            ]
        },
        'porygon': {
            id: 'porygon',
            name: 'Porygon',
            topic: 'shapes',
            cost: 25,
            spriteClass: 'pokemon-porygon',
            evolution: ['porygon', 'porygon2', 'porygon-z'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10,
            baseHP: [75, 105, 145],
            attacks: [
                { name: 'Polygon Blast', damage: 18, unlockLevel: 1 },
                { name: 'Shape Shift', damage: 28, unlockLevel: 3 },
                { name: 'Geometry Crush', damage: 38, unlockLevel: 5 }
            ]
        },
        'magnemite': {
            id: 'magnemite',
            name: 'Magnemite',
            topic: 'grouping',
            cost: 25,
            spriteClass: 'pokemon-magnemite',
            evolution: ['magnemite', 'magneton', 'magnezone'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10,
            baseHP: [70, 100, 140],
            attacks: [
                { name: 'Group Zap', damage: 18, unlockLevel: 1 },
                { name: 'Array Attack', damage: 28, unlockLevel: 3 },
                { name: 'Multiply Blast', damage: 38, unlockLevel: 5 }
            ]
        },
        'abra': {
            id: 'abra',
            name: 'Abra',
            topic: 'place-value',
            cost: 30,
            spriteClass: 'pokemon-abra',
            evolution: ['abra', 'kadabra', 'alakazam'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10,
            baseHP: [60, 90, 130],
            attacks: [
                { name: 'Digit Strike', damage: 20, unlockLevel: 1 },
                { name: 'Place Pulse', damage: 30, unlockLevel: 3 },
                { name: 'Value Blast', damage: 40, unlockLevel: 5 }
            ]
        },
        'exeggcute': {
            id: 'exeggcute',
            name: 'Exeggcute',
            topic: 'fractions',
            cost: 40,
            spriteClass: 'pokemon-exeggcute',
            evolution: ['exeggcute', 'exeggutor'],
            evolutionCost: [0, 30],
            masteryCost: 10,
            baseHP: [85, 135],
            attacks: [
                { name: 'Half Blast', damage: 20, unlockLevel: 1 },
                { name: 'Fraction Fury', damage: 30, unlockLevel: 3 },
                { name: 'Divide & Conquer', damage: 40, unlockLevel: 5 }
            ]
        },
        'bulbasaur': {
            id: 'bulbasaur',
            name: 'Bulbasaur',
            topic: 'word-problems',
            cost: 50,
            spriteClass: 'pokemon-bulbasaur',
            evolution: ['bulbasaur', 'ivysaur', 'venusaur'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10,
            baseHP: [75, 105, 150],
            attacks: [
                { name: 'Story Slam', damage: 20, unlockLevel: 1 },
                { name: 'Problem Solver', damage: 30, unlockLevel: 3 },
                { name: 'Word Power', damage: 40, unlockLevel: 5 }
            ]
        },
        // Legendary Pokemon (obtained by defeating bosses)
        'lucario': {
            id: 'lucario',
            name: 'Lucario',
            isLegendary: true,
            spriteClass: 'pokemon-lucario',
            evolution: ['lucario'],
            baseHP: [180],
            attacks: [
                { name: 'Aura Sphere', damage: 35, unlockLevel: 1 },
                { name: 'Close Combat', damage: 45, unlockLevel: 1 },
                { name: 'Flash Cannon', damage: 55, unlockLevel: 1 }
            ]
        },
        'mewtwo': {
            id: 'mewtwo',
            name: 'Mewtwo',
            isLegendary: true,
            spriteClass: 'pokemon-mewtwo',
            evolution: ['mewtwo'],
            baseHP: [220],
            attacks: [
                { name: 'Psychic', damage: 40, unlockLevel: 1 },
                { name: 'Shadow Ball', damage: 50, unlockLevel: 1 },
                { name: 'Psystrike', damage: 65, unlockLevel: 1 }
            ]
        },
        'arceus': {
            id: 'arceus',
            name: 'Arceus',
            isLegendary: true,
            spriteClass: 'pokemon-arceus',
            evolution: ['arceus'],
            baseHP: [260],
            attacks: [
                { name: 'Judgment', damage: 50, unlockLevel: 1 },
                { name: 'Hyper Beam', damage: 60, unlockLevel: 1 },
                { name: 'Cosmic Power', damage: 75, unlockLevel: 1 }
            ]
        }
    },

    // Legendary Boss definitions (for boss fights)
    legendaryBosses: {
        'lucario': {
            id: 'lucario',
            name: 'Lucario',
            hp: 300,
            damage: [25, 35],
            spriteClass: 'pokemon-lucario',
            specialAttack: {
                name: 'Aura Sphere',
                description: 'Hits 2 random Pokemon',
                targets: 2,
                damageMultiplier: 0.8
            },
            xpReward: 30,
            order: 1
        },
        'mewtwo': {
            id: 'mewtwo',
            name: 'Mewtwo',
            hp: 500,
            damage: [35, 50],
            spriteClass: 'pokemon-mewtwo',
            specialAttack: {
                name: 'Psychic',
                description: 'Hits ALL Pokemon for reduced damage',
                targets: 'all',
                damageMultiplier: 0.5
            },
            xpReward: 50,
            order: 2,
            requires: 'lucario'
        },
        'arceus': {
            id: 'arceus',
            name: 'Arceus',
            hp: 800,
            damage: [50, 70],
            spriteClass: 'pokemon-arceus',
            specialAttack: {
                name: 'Judgment',
                description: 'Massive damage + Boss heals 50 HP',
                targets: 1,
                damageMultiplier: 1.5,
                heals: 50
            },
            xpReward: 80,
            order: 3,
            requires: 'mewtwo'
        }
    },

    // Topic to Pokemon mapping
    topicToPokemon: {
        'addition': 'pikachu',
        'subtraction': 'squirtle',
        'skip-counting': 'oddish',
        'shapes': 'porygon',
        'grouping': 'magnemite',
        'place-value': 'abra',
        'fractions': 'exeggcute',
        'word-problems': 'bulbasaur'
    },

    // Get Pokemon by ID
    getPokemon(id) {
        return this.pokemon[id];
    },

    // Get Pokemon by topic
    getPokemonByTopic(topic) {
        const id = this.topicToPokemon[topic];
        return this.pokemon[id];
    },

    // Get all Pokemon as array
    getAllPokemon() {
        return Object.values(this.pokemon);
    },

    // Get current evolution stage sprite class
    getCurrentSprite(pokemonId, stage) {
        const pokemon = this.pokemon[pokemonId];
        if (!pokemon) return '';

        const evolutionIndex = Math.min(stage, pokemon.evolution.length - 1);
        const currentForm = pokemon.evolution[evolutionIndex];
        return `pokemon-${currentForm}`;
    },

    // Get current evolution name
    getCurrentName(pokemonId, stage) {
        const pokemon = this.pokemon[pokemonId];
        if (!pokemon) return '';

        const evolutionIndex = Math.min(stage, pokemon.evolution.length - 1);
        return pokemon.evolution[evolutionIndex];
    },

    // Check if Pokemon can evolve
    canEvolve(pokemonId, stage, topicCorrect, consecutiveCorrect) {
        const pokemon = this.pokemon[pokemonId];
        if (!pokemon || stage <= 0) return false;

        const nextStage = stage;
        if (nextStage >= pokemon.evolution.length) return false;

        // Check if enough correct answers for next evolution
        const neededCorrect = pokemon.evolutionCost[nextStage];

        // For final evolution, also need mastery (consecutive correct)
        if (nextStage === pokemon.evolution.length - 1) {
            return topicCorrect >= neededCorrect && consecutiveCorrect >= pokemon.masteryCost;
        }

        return topicCorrect >= neededCorrect;
    },

    // Get evolution progress
    getEvolutionProgress(pokemonId, stage, topicCorrect) {
        const pokemon = this.pokemon[pokemonId];
        if (!pokemon || stage <= 0) return { current: 0, needed: 0, percent: 100 };

        const nextStage = stage;
        if (nextStage >= pokemon.evolution.length) {
            return { current: topicCorrect, needed: topicCorrect, percent: 100 };
        }

        const needed = pokemon.evolutionCost[nextStage];
        const percent = Math.min(100, Math.round((topicCorrect / needed) * 100));

        return { current: topicCorrect, needed, percent };
    },

    // Get uncaught Pokemon that player can afford (excludes legendaries)
    getAffordablePokemon(pokeballs, caughtPokemon) {
        return Object.values(this.pokemon)
            .filter(p => !p.isLegendary && !caughtPokemon[p.id]?.caught && p.cost <= pokeballs)
            .sort((a, b) => a.cost - b.cost);
    },

    // Get random uncaught Pokemon weighted by affordability
    getRandomEncounter(pokeballs, caughtPokemon, enabledTopics) {
        const affordable = this.getAffordablePokemon(pokeballs, caughtPokemon)
            .filter(p => enabledTopics[p.topic]);

        if (affordable.length === 0) return null;

        // Weight towards cheaper Pokemon for more frequent rewards
        const weighted = [];
        affordable.forEach(p => {
            const weight = Math.max(1, 4 - Math.floor(p.cost / 15));
            for (let i = 0; i < weight; i++) {
                weighted.push(p);
            }
        });

        const randomIndex = Math.floor(Math.random() * weighted.length);
        return weighted[randomIndex];
    },

    // ==========================================
    // BATTLE METHODS
    // ==========================================

    // Get Pokemon HP based on evolution stage and level
    getBattleHP(pokemonId, stage, level = 1) {
        const pokemon = this.pokemon[pokemonId];
        if (!pokemon || !pokemon.baseHP) return 100;

        const stageIndex = Math.min(stage - 1, pokemon.baseHP.length - 1);
        const baseHP = pokemon.baseHP[Math.max(0, stageIndex)] || 100;

        // Level adds 5 HP per level
        return baseHP + ((level - 1) * 5);
    },

    // Get available attacks for a Pokemon based on level
    getAvailableAttacks(pokemonId, level = 1) {
        const pokemon = this.pokemon[pokemonId];
        if (!pokemon || !pokemon.attacks) return [];

        return pokemon.attacks.filter(attack => attack.unlockLevel <= level);
    },

    // Get all attacks for a Pokemon (for display)
    getAllAttacks(pokemonId) {
        const pokemon = this.pokemon[pokemonId];
        if (!pokemon || !pokemon.attacks) return [];
        return pokemon.attacks;
    },

    // Calculate damage based on attack and timing accuracy
    calculateDamage(baseDamage, accuracy) {
        // accuracy: 1.0 = perfect, 0.5 = near, 0.2 = miss
        return Math.round(baseDamage * accuracy);
    },

    // Get XP needed for next level
    getXPForLevel(level) {
        // XP needed increases: 10, 20, 30, 40, 50...
        return level * 10;
    },

    // Get caught Pokemon that can battle (for selection)
    getBattleReadyPokemon(pokemonState) {
        return Object.entries(pokemonState)
            .filter(([id, state]) => state.caught)
            .map(([id, state]) => ({
                id,
                ...this.pokemon[id],
                stage: state.stage,
                level: state.level || 1,
                xp: state.xp || 0
            }));
    },

    // ==========================================
    // LEGENDARY METHODS
    // ==========================================

    // Get legendary boss by ID
    getLegendaryBoss(bossId) {
        return this.legendaryBosses[bossId];
    },

    // Get all legendary bosses as array
    getAllLegendaryBosses() {
        return Object.values(this.legendaryBosses).sort((a, b) => a.order - b.order);
    },

    // Check if a boss is available to fight
    isBossAvailable(bossId, defeatedBosses) {
        const boss = this.legendaryBosses[bossId];
        if (!boss) return false;

        // First boss is always available
        if (!boss.requires) return true;

        // Check if required boss was defeated
        return defeatedBosses[boss.requires] === true;
    },

    // Get available bosses based on progress
    getAvailableBosses(defeatedBosses) {
        return this.getAllLegendaryBosses().filter(boss =>
            this.isBossAvailable(boss.id, defeatedBosses)
        );
    },

    // Check if Pokemon is legendary
    isLegendary(pokemonId) {
        const pokemon = this.pokemon[pokemonId];
        return pokemon && pokemon.isLegendary === true;
    },

    // Get all non-legendary Pokemon (for regular encounters)
    getRegularPokemon() {
        return Object.values(this.pokemon).filter(p => !p.isLegendary);
    }
};
