// Pokemon Data Module - Pokemon definitions and evolution chains

const PokemonData = {
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
            masteryCost: 10 // Consecutive correct for final evolution
        },
        'squirtle': {
            id: 'squirtle',
            name: 'Squirtle',
            topic: 'subtraction',
            cost: 10,
            spriteClass: 'pokemon-squirtle',
            evolution: ['squirtle', 'wartortle', 'blastoise'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10
        },
        'oddish': {
            id: 'oddish',
            name: 'Oddish',
            topic: 'skip-counting',
            cost: 15,
            spriteClass: 'pokemon-oddish',
            evolution: ['oddish', 'gloom', 'vileplume'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10
        },
        'porygon': {
            id: 'porygon',
            name: 'Porygon',
            topic: 'shapes',
            cost: 25,
            spriteClass: 'pokemon-porygon',
            evolution: ['porygon', 'porygon2', 'porygon-z'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10
        },
        'magnemite': {
            id: 'magnemite',
            name: 'Magnemite',
            topic: 'grouping',
            cost: 25,
            spriteClass: 'pokemon-magnemite',
            evolution: ['magnemite', 'magneton', 'magnezone'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10
        },
        'abra': {
            id: 'abra',
            name: 'Abra',
            topic: 'place-value',
            cost: 30,
            spriteClass: 'pokemon-abra',
            evolution: ['abra', 'kadabra', 'alakazam'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10
        },
        'exeggcute': {
            id: 'exeggcute',
            name: 'Exeggcute',
            topic: 'fractions',
            cost: 40,
            spriteClass: 'pokemon-exeggcute',
            evolution: ['exeggcute', 'exeggutor'],
            evolutionCost: [0, 30],
            masteryCost: 10
        },
        'bulbasaur': {
            id: 'bulbasaur',
            name: 'Bulbasaur',
            topic: 'word-problems',
            cost: 50,
            spriteClass: 'pokemon-bulbasaur',
            evolution: ['bulbasaur', 'ivysaur', 'venusaur'],
            evolutionCost: [0, 20, 40],
            masteryCost: 10
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

    // Get uncaught Pokemon that player can afford
    getAffordablePokemon(pokeballs, caughtPokemon) {
        return Object.values(this.pokemon)
            .filter(p => !caughtPokemon[p.id]?.caught && p.cost <= pokeballs)
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
    }
};
