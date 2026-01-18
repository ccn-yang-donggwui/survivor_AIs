type ToneConfig = {
  frequency: number;
  durationMs: number;
  type?: OscillatorType;
  volume?: number;
  whenMs?: number;
};

export class SoundManager {
  private static context: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static sfxGain: GainNode | null = null;
  private static musicGain: GainNode | null = null;
  private static initialized = false;
  private static unlocked = false;
  private static masterVolume = 0.45;
  private static sfxVolume = 0.8;
  private static musicVolume = 0.35;
  private static muted = false;
  private static readonly storageKey = 'survivor-legend-audio';
  private static bgmEnabled = true;
  private static bgmOscillators: OscillatorNode[] | null = null;
  private static bgmMixer: GainNode | null = null;
  private static bgmIntervalId: number | null = null;
  private static bgmStep = 0;

  static init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.loadSettings();
  }

  static unlock(): void {
    this.init();
    const context = this.getContext();
    if (!context) {
      return;
    }
    if (context.state === 'suspended') {
      void context.resume();
    }
    this.unlocked = true;
    if (this.bgmEnabled) {
      this.startBgm();
    }
  }

  static startBgm(): void {
    this.init();
    this.bgmEnabled = true;
    if (!this.unlocked) {
      return;
    }
    const context = this.getContext();
    if (!context) {
      return;
    }
    if (this.bgmOscillators || !this.musicGain) {
      return;
    }

    const mixer = context.createGain();
    mixer.gain.value = 0.3;
    mixer.connect(this.musicGain);
    this.bgmMixer = mixer;

    const oscA = context.createOscillator();
    const oscB = context.createOscillator();
    oscA.type = 'sine';
    oscB.type = 'triangle';
    oscA.connect(mixer);
    oscB.connect(mixer);

    const chords: Array<[number, number]> = [
      [220, 329.63],
      [196, 293.66],
      [246.94, 369.99],
      [185, 277.18]
    ];

    const setChord = (index: number): void => {
      const [root, fifth] = chords[index];
      const now = context.currentTime;
      oscA.frequency.setTargetAtTime(root, now, 0.25);
      oscB.frequency.setTargetAtTime(fifth, now, 0.25);
    };

    this.bgmStep = 0;
    setChord(this.bgmStep);
    oscA.start();
    oscB.start();
    this.bgmOscillators = [oscA, oscB];

    this.bgmIntervalId = window.setInterval(() => {
      this.bgmStep = (this.bgmStep + 1) % chords.length;
      setChord(this.bgmStep);
    }, 4200);
  }

  static stopBgm(): void {
    this.bgmEnabled = false;
    if (this.bgmIntervalId !== null) {
      window.clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmOscillators) {
      this.bgmOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // Ignore stop errors if already stopped.
        }
        osc.disconnect();
      });
    }
    this.bgmOscillators = null;
    this.bgmMixer?.disconnect();
    this.bgmMixer = null;
  }

  static setMasterVolume(value: number): void {
    this.init();
    this.masterVolume = this.clamp(value, 0, 1);
    this.applyVolume();
    this.saveSettings();
  }

  static getMasterVolume(): number {
    this.init();
    return this.masterVolume;
  }

  static setSfxVolume(value: number): void {
    this.init();
    this.sfxVolume = this.clamp(value, 0, 1);
    this.applyVolume();
    this.saveSettings();
  }

  static getSfxVolume(): number {
    this.init();
    return this.sfxVolume;
  }

  static setMusicVolume(value: number): void {
    this.init();
    this.musicVolume = this.clamp(value, 0, 1);
    this.applyVolume();
    this.saveSettings();
  }

  static getMusicVolume(): number {
    this.init();
    return this.musicVolume;
  }

  static setBgmEnabled(enabled: boolean): void {
    this.init();
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    this.saveSettings();
  }

  static isBgmEnabled(): boolean {
    this.init();
    return this.bgmEnabled;
  }

  static setMuted(muted: boolean): void {
    this.init();
    this.muted = muted;
    this.applyVolume();
    this.saveSettings();
  }

  static toggleMute(): void {
    this.setMuted(!this.muted);
  }

  static isMuted(): boolean {
    this.init();
    return this.muted;
  }

  static playShoot(): void {
    this.playTone({ frequency: 680, durationMs: 80, type: 'square', volume: 0.08 });
  }

  static playHit(): void {
    this.playTone({ frequency: 260, durationMs: 90, type: 'triangle', volume: 0.1 });
  }

  static playPickup(): void {
    this.playTone({ frequency: 760, durationMs: 70, type: 'sine', volume: 0.08 });
  }

  static playLevelUp(): void {
    this.playTone({ frequency: 420, durationMs: 140, type: 'triangle', volume: 0.12 });
    this.playTone({ frequency: 720, durationMs: 180, type: 'sine', volume: 0.12, whenMs: 120 });
  }

  private static playTone({
    frequency,
    durationMs,
    type = 'sine',
    volume = 0.1,
    whenMs = 0
  }: ToneConfig): void {
    this.init();
    if (this.muted) {
      return;
    }
    if (!this.unlocked) {
      return;
    }

    const context = this.getContext();
    if (!context || context.state !== 'running' || !this.masterGain) {
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    const startTime = context.currentTime + whenMs / 1000;
    const duration = durationMs / 1000;
    const attack = 0.01;
    const release = 0.06;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain ?? this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + release);
  }

  private static getContext(): AudioContext | null {
    this.init();
    if (this.context) {
      return this.context;
    }

    const audioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!audioCtor) {
      return null;
    }

    this.context = new audioCtor();
    this.masterGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.applyVolume();
    this.masterGain.connect(this.context.destination);

    return this.context;
  }

  private static applyVolume(): void {
    if (!this.masterGain) {
      return;
    }
    this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private static loadSettings(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        masterVolume?: number;
        musicVolume?: number;
        sfxVolume?: number;
        volume?: number;
        bgmEnabled?: boolean;
        muted?: boolean;
      };
      if (typeof parsed.masterVolume === 'number') {
        this.masterVolume = this.clamp(parsed.masterVolume, 0, 1);
      } else if (typeof parsed.volume === 'number') {
        this.masterVolume = this.clamp(parsed.volume, 0, 1);
      }
      if (typeof parsed.sfxVolume === 'number') {
        this.sfxVolume = this.clamp(parsed.sfxVolume, 0, 1);
      }
      if (typeof parsed.musicVolume === 'number') {
        this.musicVolume = this.clamp(parsed.musicVolume, 0, 1);
      }
      if (typeof parsed.bgmEnabled === 'boolean') {
        this.bgmEnabled = parsed.bgmEnabled;
      }
      if (typeof parsed.muted === 'boolean') {
        this.muted = parsed.muted;
      }
    } catch {
      // Ignore storage errors and fall back to defaults.
    }
  }

  private static saveSettings(): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          masterVolume: this.masterVolume,
          musicVolume: this.musicVolume,
          sfxVolume: this.sfxVolume,
          bgmEnabled: this.bgmEnabled,
          muted: this.muted
        })
      );
    } catch {
      // Ignore storage errors.
    }
  }
}
