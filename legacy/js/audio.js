// Audio Module - Sound effects using Web Audio API

const GameAudio = {
    context: null,
    enabled: true,

    // Initialize audio context
    init(enabled = true) {
        this.enabled = enabled;
        // AudioContext is created on first user interaction to comply with browser policies
    },

    // Ensure audio context exists
    ensureContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        return this.context;
    },

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },

    // Set enabled state
    setEnabled(enabled) {
        this.enabled = enabled;
    },

    // Play a tone with given frequency, duration, and type
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled) return;

        const ctx = this.ensureContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    },

    // Play a sequence of notes
    playSequence(notes, tempo = 150) {
        if (!this.enabled) return;

        const ctx = this.ensureContext();
        let time = ctx.currentTime;

        notes.forEach(note => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = note.freq;
            oscillator.type = note.type || 'sine';

            const duration = (note.duration || 1) * (60 / tempo);
            gainNode.gain.setValueAtTime(note.volume || 0.3, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.9);

            oscillator.start(time);
            oscillator.stop(time + duration);

            time += duration;
        });
    },

    // Correct answer - cheerful ascending chime
    playCorrect() {
        if (!this.enabled) return;

        this.playSequence([
            { freq: 523, duration: 0.5, volume: 0.3 },  // C5
            { freq: 659, duration: 0.5, volume: 0.3 },  // E5
            { freq: 784, duration: 0.75, volume: 0.35 } // G5
        ], 300);
    },

    // Incorrect answer - gentle descending tone
    playIncorrect() {
        if (!this.enabled) return;

        this.playSequence([
            { freq: 350, duration: 0.5, type: 'triangle', volume: 0.25 },
            { freq: 280, duration: 0.75, type: 'triangle', volume: 0.2 }
        ], 200);
    },

    // Wild Pokemon encounter - alert/exciting sound
    playEncounter() {
        if (!this.enabled) return;

        this.playSequence([
            { freq: 440, duration: 0.25, type: 'square', volume: 0.2 },
            { freq: 554, duration: 0.25, type: 'square', volume: 0.2 },
            { freq: 659, duration: 0.25, type: 'square', volume: 0.2 },
            { freq: 880, duration: 0.5, type: 'square', volume: 0.25 }
        ], 400);
    },

    // Pokeball throw - whoosh sound
    playThrow() {
        if (!this.enabled) return;

        const ctx = this.ensureContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    },

    // Capture success - fanfare celebration
    playCapture() {
        if (!this.enabled) return;

        this.playSequence([
            { freq: 523, duration: 0.3, volume: 0.3 },   // C5
            { freq: 523, duration: 0.3, volume: 0.3 },   // C5
            { freq: 523, duration: 0.3, volume: 0.3 },   // C5
            { freq: 523, duration: 0.6, volume: 0.3 },   // C5
            { freq: 415, duration: 0.6, volume: 0.3 },   // Ab4
            { freq: 466, duration: 0.6, volume: 0.3 },   // Bb4
            { freq: 523, duration: 0.6, volume: 0.35 },  // C5
            { freq: 466, duration: 0.3, volume: 0.3 },   // Bb4
            { freq: 523, duration: 1.0, volume: 0.4 }    // C5
        ], 280);
    },

    // Evolution - magical ascending sequence
    playEvolution() {
        if (!this.enabled) return;

        const ctx = this.ensureContext();
        const notes = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698, 784];
        let time = ctx.currentTime;

        notes.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = i % 2 === 0 ? 'sine' : 'triangle';

            const duration = 0.15;
            gainNode.gain.setValueAtTime(0.2 + (i * 0.015), time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.9);

            oscillator.start(time);
            oscillator.stop(time + duration);

            time += duration * 0.8;
        });

        // Final chord
        setTimeout(() => {
            if (!this.enabled) return;
            const ctx = this.ensureContext();
            [523, 659, 784].forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.8);
            });
        }, notes.length * 0.15 * 0.8 * 1000);
    }
};
