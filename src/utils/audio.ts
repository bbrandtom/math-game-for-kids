import { Howl, Howler } from 'howler';

// Sound definitions - we'll use synthesized sounds initially
// Can be replaced with actual sound files later

type SoundName = 'correct' | 'incorrect' | 'capture' | 'encounter' | 'evolution' | 'throw' | 'click';

// Create synthesized sounds using Web Audio API through Howler
// These create short, game-appropriate sounds
const createSynthSound = (frequency: number, duration: number, type: OscillatorType = 'square'): string => {
  const sampleRate = 44100;
  const samples = sampleRate * duration;
  const buffer = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let value = 0;

    if (type === 'square') {
      value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 0.3 : -0.3;
    } else if (type === 'sine') {
      value = Math.sin(2 * Math.PI * frequency * t) * 0.3;
    } else if (type === 'triangle') {
      const period = sampleRate / frequency;
      const pos = i % period;
      value = (4 * Math.abs(pos / period - 0.5) - 1) * 0.3;
    }

    // Apply envelope
    const attack = 0.01;
    const decay = duration * 0.3;
    const sustain = 0.7;
    const release = duration * 0.2;

    let envelope = 1;
    if (t < attack) {
      envelope = t / attack;
    } else if (t < attack + decay) {
      envelope = 1 - (1 - sustain) * ((t - attack) / decay);
    } else if (t > duration - release) {
      envelope = sustain * (1 - (t - (duration - release)) / release);
    } else {
      envelope = sustain;
    }

    buffer[i] = value * envelope;
  }

  // Convert to WAV
  const wavBuffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(wavBuffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(44 + i * 2, sample * 0x7FFF, true);
  }

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

// Chiptune-style sound effects
const createCorrectSound = (): string => {
  // Rising arpeggio - cheerful success sound
  const sampleRate = 44100;
  const duration = 0.3;
  const samples = sampleRate * duration;
  const buffer = new Float32Array(samples);

  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  const noteLength = samples / notes.length;

  for (let i = 0; i < samples; i++) {
    const noteIndex = Math.floor(i / noteLength);
    const freq = notes[Math.min(noteIndex, notes.length - 1)];
    const t = i / sampleRate;
    const localT = (i % noteLength) / noteLength;

    const value = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.25 : -0.25;
    const envelope = localT < 0.1 ? localT / 0.1 : 1 - (localT - 0.1) * 0.5;

    buffer[i] = value * envelope;
  }

  return bufferToWav(buffer, sampleRate);
};

const createIncorrectSound = (): string => {
  // Descending buzz - gentle failure
  const sampleRate = 44100;
  const duration = 0.25;
  const samples = sampleRate * duration;
  const buffer = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const freq = 200 - t * 100;
    const value = (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.2 : -0.2);
    const envelope = 1 - t / duration;

    buffer[i] = value * envelope;
  }

  return bufferToWav(buffer, sampleRate);
};

const createCaptureSound = (): string => {
  // Triumphant fanfare
  const sampleRate = 44100;
  const duration = 0.5;
  const samples = sampleRate * duration;
  const buffer = new Float32Array(samples);

  const notes = [392, 523, 659, 784, 1047]; // G4, C5, E5, G5, C6
  const noteDurations = [0.1, 0.1, 0.1, 0.1, 0.2];

  let offset = 0;
  for (let n = 0; n < notes.length; n++) {
    const noteStart = offset * sampleRate;
    const noteEnd = (offset + noteDurations[n]) * sampleRate;

    for (let i = Math.floor(noteStart); i < Math.min(Math.floor(noteEnd), samples); i++) {
      const t = i / sampleRate;
      const localT = (i - noteStart) / (noteEnd - noteStart);
      const freq = notes[n];

      const value = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.3 : -0.3;
      const envelope = localT < 0.05 ? localT / 0.05 : Math.max(0, 1 - (localT - 0.05) * 1.5);

      buffer[i] = value * envelope;
    }

    offset += noteDurations[n];
  }

  return bufferToWav(buffer, sampleRate);
};

const bufferToWav = (buffer: Float32Array, sampleRate: number): string => {
  const samples = buffer.length;
  const wavBuffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(44 + i * 2, sample * 0x7FFF, true);
  }

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

// Lazy-loaded sounds
let sounds: Record<SoundName, Howl> | null = null;

function initSounds() {
  if (sounds) return sounds;

  sounds = {
    correct: new Howl({ src: [createCorrectSound()], format: ['wav'], volume: 0.5 }),
    incorrect: new Howl({ src: [createIncorrectSound()], format: ['wav'], volume: 0.4 }),
    capture: new Howl({ src: [createCaptureSound()], format: ['wav'], volume: 0.6 }),
    encounter: new Howl({ src: [createSynthSound(440, 0.1, 'square')], format: ['wav'], volume: 0.4 }),
    evolution: new Howl({ src: [createCaptureSound()], format: ['wav'], volume: 0.6 }), // Reuse capture for now
    throw: new Howl({ src: [createSynthSound(300, 0.15, 'sine')], format: ['wav'], volume: 0.3 }),
    click: new Howl({ src: [createSynthSound(800, 0.05, 'square')], format: ['wav'], volume: 0.2 }),
  };

  return sounds;
}

export const GameAudio = {
  play(sound: SoundName) {
    const s = initSounds();
    s[sound]?.play();
  },

  playCorrect() {
    this.play('correct');
  },

  playIncorrect() {
    this.play('incorrect');
  },

  playCapture() {
    this.play('capture');
  },

  playEncounter() {
    this.play('encounter');
  },

  playEvolution() {
    this.play('evolution');
  },

  playThrow() {
    this.play('throw');
  },

  playClick() {
    this.play('click');
  },

  setEnabled(enabled: boolean) {
    Howler.mute(!enabled);
  },

  isEnabled() {
    // Use a workaround since _muted is private
    return !(Howler as unknown as { _muted: boolean })._muted;
  },
};

export default GameAudio;
