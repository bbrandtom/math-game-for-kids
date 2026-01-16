// Legendary Boss Fight Module - Team vs Boss battles

const Legendary = {
    // Battle state
    gameState: null,
    currentBoss: null,
    team: [],
    teamHP: {},
    bossHP: 0,
    bossMaxHP: 0,

    // Quick-time state
    quickTimeActive: false,
    markerPosition: 0,
    markerDirection: 1,
    markerSpeed: 2.0, // Faster than regular battles (slowed 20% from 2.5)
    targetStart: 40,
    targetEnd: 60,
    animationFrame: null,

    // DOM elements
    elements: {},

    // Initialize legendary system
    init(gameState) {
        this.gameState = gameState;
        this.cacheElements();
        this.bindEvents();
    },

    // Cache DOM elements
    cacheElements() {
        this.elements = {
            selectScreen: document.getElementById('legendary-select-screen'),
            battleScreen: document.getElementById('legendary-battle-screen'),
            resultScreen: document.getElementById('legendary-result-screen'),

            // Boss select
            bossGrid: document.getElementById('boss-select-grid'),

            // Battle elements
            teamContainer: document.getElementById('legendary-team-container'),
            bossSprite: document.getElementById('legendary-boss-sprite'),
            bossName: document.getElementById('legendary-boss-name'),
            bossHPBar: document.getElementById('boss-hp-bar'),
            bossHPText: document.getElementById('boss-hp-text'),

            // Quick-time
            quickTimeContainer: document.getElementById('legendary-quick-time'),
            quickTimeMarker: document.getElementById('legendary-marker'),

            // Turn info
            turnInfo: document.getElementById('legendary-turn-info'),
            attackButton: document.getElementById('team-attack-btn'),

            // Result
            resultTitle: document.getElementById('legendary-result-title'),
            resultSprite: document.getElementById('legendary-result-sprite'),
            resultMessage: document.getElementById('legendary-result-message'),
            resultXP: document.getElementById('legendary-result-xp')
        };
    },

    // Bind events
    bindEvents() {
        // Attack button
        const attackBtn = document.getElementById('team-attack-btn');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => this.startTeamAttack());
        }

        // Quick-time tap
        const qtContainer = document.getElementById('legendary-quick-time');
        if (qtContainer) {
            qtContainer.addEventListener('click', () => this.handleQuickTimeTap());
        }

        // Continue button
        const continueBtn = document.getElementById('legendary-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.endBattle());
        }
    },

    // Check if player can attempt legendary battles
    canAttemptLegendary(gameState) {
        const caughtCount = Storage.getRegularCaughtCount(gameState);
        return caughtCount >= 2;
    },

    // Show boss select screen
    showSelectScreen(gameState) {
        this.gameState = gameState;

        // Build boss selection grid
        const grid = this.elements.bossGrid;
        if (!grid) return;

        grid.innerHTML = '';

        const allBosses = PokemonData.getAllLegendaryBosses();
        const defeatedBosses = gameState.legendaryDefeated || {};

        allBosses.forEach(boss => {
            const card = document.createElement('div');
            const isAvailable = PokemonData.isBossAvailable(boss.id, defeatedBosses);
            const isDefeated = defeatedBosses[boss.id];

            card.className = `boss-select-card ${isAvailable ? '' : 'locked'} ${isDefeated ? 'defeated' : ''}`;
            card.dataset.bossId = boss.id;

            card.innerHTML = `
                <div class="boss-select-sprite ${boss.spriteClass} ${isAvailable ? '' : 'silhouette'}"></div>
                <p class="boss-select-name">${isAvailable ? boss.name : '???'}</p>
                <p class="boss-select-hp">${isAvailable ? `HP: ${boss.hp}` : 'Locked'}</p>
                ${isDefeated ? '<span class="defeated-badge">CAUGHT</span>' : ''}
            `;

            if (isAvailable && !isDefeated) {
                card.addEventListener('click', () => this.selectBoss(boss));
            }

            grid.appendChild(card);
        });

        // Show screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.elements.selectScreen.classList.add('active');
    },

    // Select a boss to fight
    selectBoss(boss) {
        this.currentBoss = boss;
        this.startBossFight();
    },

    // Start the boss fight
    startBossFight() {
        // Get all caught Pokemon for the team
        this.team = PokemonData.getBattleReadyPokemon(this.gameState.pokemon);

        if (this.team.length < 2) {
            alert('You need at least 2 Pokemon to challenge a legendary boss!');
            return;
        }

        // Initialize HP for each team member
        this.teamHP = {};
        this.team.forEach(pokemon => {
            this.teamHP[pokemon.id] = {
                current: PokemonData.getBattleHP(pokemon.id, pokemon.stage, pokemon.level),
                max: PokemonData.getBattleHP(pokemon.id, pokemon.stage, pokemon.level)
            };
        });

        // Initialize boss HP
        this.bossHP = this.currentBoss.hp;
        this.bossMaxHP = this.currentBoss.hp;

        // Setup battle screen
        this.setupBattleScreen();

        // Show battle screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.elements.battleScreen.classList.add('active');

        // Play boss encounter sound
        if (typeof GameAudio !== 'undefined' && GameAudio.playBossEncounter) {
            GameAudio.playBossEncounter();
        }

        // Show initial turn info
        this.elements.turnInfo.textContent = `${this.currentBoss.name} appeared! Prepare your team!`;
        this.elements.attackButton.classList.remove('hidden');
        this.elements.quickTimeContainer.classList.add('hidden');
    },

    // Setup battle screen UI
    setupBattleScreen() {
        // Boss display
        this.elements.bossSprite.className = 'legendary-boss-sprite ' + this.currentBoss.spriteClass;
        this.elements.bossName.textContent = this.currentBoss.name;
        this.updateBossHP();

        // Team display
        this.renderTeam();
    },

    // Render team Pokemon
    renderTeam() {
        const container = this.elements.teamContainer;
        container.innerHTML = '';

        this.team.forEach(pokemon => {
            const hp = this.teamHP[pokemon.id];
            const isKO = hp.current <= 0;
            const spriteClass = PokemonData.getCurrentSprite(pokemon.id, pokemon.stage);

            const card = document.createElement('div');
            card.className = `team-pokemon-card ${isKO ? 'knocked-out' : ''}`;
            card.dataset.pokemonId = pokemon.id;

            const hpPercent = Math.max(0, (hp.current / hp.max) * 100);
            const hpColorClass = hpPercent > 50 ? 'hp-high' : hpPercent > 20 ? 'hp-medium' : 'hp-low';

            card.innerHTML = `
                <div class="team-sprite ${spriteClass}"></div>
                <div class="team-hp-bar">
                    <div class="team-hp-fill ${hpColorClass}" style="width: ${hpPercent}%"></div>
                </div>
                <span class="team-hp-text">${Math.max(0, hp.current)}</span>
                ${isKO ? '<span class="ko-badge">KO</span>' : ''}
            `;

            container.appendChild(card);
        });
    },

    // Update boss HP display
    updateBossHP() {
        const percent = Math.max(0, (this.bossHP / this.bossMaxHP) * 100);
        const hpColorClass = percent > 50 ? 'hp-high' : percent > 20 ? 'hp-medium' : 'hp-low';

        this.elements.bossHPBar.style.width = percent + '%';
        this.elements.bossHPBar.className = 'boss-hp-fill ' + hpColorClass;
        this.elements.bossHPText.textContent = `${Math.max(0, this.bossHP)} / ${this.bossMaxHP}`;
    },

    // Start team attack (show quick-time)
    startTeamAttack() {
        this.elements.attackButton.classList.add('hidden');
        this.elements.turnInfo.textContent = 'Tap when the marker hits the target!';

        // Start quick-time
        this.quickTimeActive = true;
        this.markerPosition = 0;
        this.markerDirection = 1;

        this.elements.quickTimeContainer.classList.remove('hidden');
        this.animateMarker();
    },

    // Animate marker
    animateMarker() {
        if (!this.quickTimeActive) return;

        this.markerPosition += this.markerSpeed * this.markerDirection;

        if (this.markerPosition >= 100) {
            this.markerPosition = 100;
            this.markerDirection = -1;
        } else if (this.markerPosition <= 0) {
            this.markerPosition = 0;
            this.markerDirection = 1;
        }

        this.elements.quickTimeMarker.style.left = this.markerPosition + '%';
        this.animationFrame = requestAnimationFrame(() => this.animateMarker());
    },

    // Handle quick-time tap
    handleQuickTimeTap() {
        if (!this.quickTimeActive) return;

        this.quickTimeActive = false;
        cancelAnimationFrame(this.animationFrame);

        // Calculate accuracy
        const accuracy = this.calculateAccuracy(this.markerPosition);

        // Execute team attack
        this.executeTeamAttack(accuracy);
    },

    // Calculate accuracy
    calculateAccuracy(position) {
        const targetCenter = (this.targetStart + this.targetEnd) / 2;
        const targetWidth = this.targetEnd - this.targetStart;
        const distance = Math.abs(position - targetCenter);

        if (position >= this.targetStart && position <= this.targetEnd) {
            return 1.0; // Perfect
        }
        if (distance <= targetWidth) {
            return 0.5; // Near
        }
        return 0.2; // Miss
    },

    // Execute team attack
    executeTeamAttack(accuracy) {
        // Calculate total team damage
        let totalDamage = 0;
        const alivePokemon = this.team.filter(p => this.teamHP[p.id].current > 0);

        alivePokemon.forEach(pokemon => {
            const attacks = PokemonData.getAvailableAttacks(pokemon.id, pokemon.level);
            if (attacks.length > 0) {
                // Use highest damage attack
                const bestAttack = attacks.reduce((a, b) => a.damage > b.damage ? a : b);
                totalDamage += PokemonData.calculateDamage(bestAttack.damage, accuracy);
            }
        });

        // Show accuracy result
        let accuracyText = accuracy === 1.0 ? 'Perfect!' : accuracy === 0.5 ? 'Near hit!' : 'Missed...';
        this.elements.turnInfo.innerHTML = `
            <span class="accuracy-result">${accuracyText}</span>
            <span class="damage-result">Team deals ${totalDamage} damage!</span>
        `;

        // Hide quick-time
        this.elements.quickTimeContainer.classList.add('hidden');

        // Apply damage to boss
        setTimeout(() => {
            this.bossHP = Math.max(0, this.bossHP - totalDamage);
            this.updateBossHP();
            this.animateBossHit();

            // Play boss hit sound
            if (typeof GameAudio !== 'undefined' && GameAudio.playBossHit) {
                GameAudio.playBossHit();
            }

            // Check if boss defeated
            setTimeout(() => {
                if (this.bossHP <= 0) {
                    this.victory();
                } else {
                    this.bossAttack();
                }
            }, 600);
        }, 500);
    },

    // Animate boss getting hit
    animateBossHit() {
        this.elements.bossSprite.classList.add('boss-hit');
        setTimeout(() => this.elements.bossSprite.classList.remove('boss-hit'), 400);
    },

    // Boss attack phase
    bossAttack() {
        const boss = this.currentBoss;
        const alivePokemon = this.team.filter(p => this.teamHP[p.id].current > 0);

        if (alivePokemon.length === 0) {
            this.defeat();
            return;
        }

        // Determine attack type (30% chance for special)
        const useSpecial = Math.random() < 0.3;
        const special = boss.specialAttack;

        let attackName, targets, damage;

        if (useSpecial && special) {
            attackName = special.name;

            // Determine targets
            if (special.targets === 'all') {
                targets = [...alivePokemon];
            } else if (typeof special.targets === 'number') {
                targets = this.getRandomTargets(alivePokemon, special.targets);
            } else {
                targets = this.getRandomTargets(alivePokemon, 1);
            }

            // Calculate damage
            const baseDamage = boss.damage[0] + Math.floor(Math.random() * (boss.damage[1] - boss.damage[0]));
            damage = Math.round(baseDamage * special.damageMultiplier);

            // Boss heal if applicable
            if (special.heals) {
                this.bossHP = Math.min(this.bossMaxHP, this.bossHP + special.heals);
                this.updateBossHP();
            }
        } else {
            attackName = 'Attack';
            targets = this.getRandomTargets(alivePokemon, 1);
            damage = boss.damage[0] + Math.floor(Math.random() * (boss.damage[1] - boss.damage[0]));
        }

        // Show attack info
        const targetNames = targets.map(p => PokemonData.getCurrentName(p.id, p.stage)).join(', ');
        this.elements.turnInfo.innerHTML = `
            <span class="boss-attack-name">${boss.name} uses ${attackName}!</span>
            <span class="boss-attack-target">Hits: ${targetNames} for ${damage} damage!</span>
        `;

        // Play boss attack sound
        if (typeof GameAudio !== 'undefined' && GameAudio.playBossAttack) {
            GameAudio.playBossAttack();
        }

        // Apply damage after delay
        setTimeout(() => {
            targets.forEach(pokemon => {
                this.teamHP[pokemon.id].current = Math.max(0, this.teamHP[pokemon.id].current - damage);
                this.animateTeamHit(pokemon.id);
            });

            this.renderTeam();

            // Check if team wiped
            setTimeout(() => {
                const stillAlive = this.team.filter(p => this.teamHP[p.id].current > 0);

                if (stillAlive.length === 0) {
                    this.defeat();
                } else {
                    // Next turn
                    this.elements.turnInfo.textContent = 'Your turn! Attack the boss!';
                    this.elements.attackButton.classList.remove('hidden');
                }
            }, 600);
        }, 800);
    },

    // Get random targets from alive Pokemon
    getRandomTargets(alivePokemon, count) {
        const shuffled = [...alivePokemon].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    },

    // Animate team member getting hit
    animateTeamHit(pokemonId) {
        const card = document.querySelector(`.team-pokemon-card[data-pokemon-id="${pokemonId}"]`);
        if (card) {
            card.classList.add('team-hit');
            setTimeout(() => card.classList.remove('team-hit'), 400);
        }
    },

    // Victory - defeated the boss
    victory() {
        // Mark boss as defeated
        Storage.defeatLegendaryBoss(this.gameState, this.currentBoss.id);

        // Award XP to team
        const teamIds = this.team.map(p => p.id);
        const xpAmount = this.currentBoss.xpReward;
        const leveledUp = Storage.addTeamBattleXP(this.gameState, teamIds, xpAmount);

        // Play boss victory sound
        if (typeof GameAudio !== 'undefined' && GameAudio.playBossVictory) {
            GameAudio.playBossVictory();
        }

        // Show result screen
        this.elements.resultTitle.textContent = 'Victory!';
        this.elements.resultTitle.className = 'legendary-result-title victory';
        this.elements.resultSprite.className = 'legendary-result-sprite ' + this.currentBoss.spriteClass;
        this.elements.resultMessage.textContent = `You caught ${this.currentBoss.name}!`;
        this.elements.resultXP.textContent = `All team members gained ${xpAmount} XP!`;

        if (leveledUp.length > 0) {
            this.elements.resultXP.textContent += ` (${leveledUp.length} leveled up!)`;
        }

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.elements.resultScreen.classList.add('active');
    },

    // Defeat - team wiped
    defeat() {
        // Play defeat sound
        if (typeof GameAudio !== 'undefined' && GameAudio.playIncorrect) {
            GameAudio.playIncorrect();
        }

        // Show result screen
        this.elements.resultTitle.textContent = 'Defeated...';
        this.elements.resultTitle.className = 'legendary-result-title defeat';
        this.elements.resultSprite.className = 'legendary-result-sprite ' + this.currentBoss.spriteClass;
        this.elements.resultMessage.textContent = `${this.currentBoss.name} was too strong!`;
        this.elements.resultXP.textContent = 'Train your Pokemon and try again!';

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.elements.resultScreen.classList.add('active');
    },

    // End battle and return home
    endBattle() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('home-screen').classList.add('active');

        // Reset state
        this.currentBoss = null;
        this.team = [];
        this.teamHP = {};
    }
};
