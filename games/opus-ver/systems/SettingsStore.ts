// 게임 설정 저장소 - localStorage 기반

export interface GameSettings {
  // 오디오
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  bgmMuted: boolean;
  sfxMuted: boolean;

  // 그래픽
  showDamageNumbers: boolean;
  showFPS: boolean;
  screenShake: boolean;
  particleEffects: boolean;

  // 게임플레이
  autoAim: boolean;
  pauseOnFocusLoss: boolean;

  // 접근성
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  largeText: boolean;
}

const STORAGE_KEY = 'opus-ver-settings';

const DEFAULT_SETTINGS: GameSettings = {
  // 오디오
  masterVolume: 0.7,
  bgmVolume: 0.5,
  sfxVolume: 0.8,
  bgmMuted: false,
  sfxMuted: false,

  // 그래픽
  showDamageNumbers: true,
  showFPS: false,
  screenShake: true,
  particleEffects: true,

  // 게임플레이
  autoAim: true,
  pauseOnFocusLoss: true,

  // 접근성
  colorBlindMode: 'none',
  largeText: false,
};

export class SettingsStore {
  private settings: GameSettings;
  private listeners: Set<(settings: GameSettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
  }

  // localStorage에서 설정 로드
  private loadSettings(): GameSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  // localStorage에 설정 저장
  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // 리스너
  subscribe(listener: (settings: GameSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // 전체 설정
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  // 오디오 설정
  getMasterVolume(): number {
    return this.settings.masterVolume;
  }

  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  getBgmVolume(): number {
    return this.settings.bgmMuted ? 0 : this.settings.bgmVolume * this.settings.masterVolume;
  }

  setBgmVolume(volume: number): void {
    this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  getSfxVolume(): number {
    return this.settings.sfxMuted ? 0 : this.settings.sfxVolume * this.settings.masterVolume;
  }

  setSfxVolume(volume: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  toggleBgmMute(): boolean {
    this.settings.bgmMuted = !this.settings.bgmMuted;
    this.saveSettings();
    return this.settings.bgmMuted;
  }

  toggleSfxMute(): boolean {
    this.settings.sfxMuted = !this.settings.sfxMuted;
    this.saveSettings();
    return this.settings.sfxMuted;
  }

  isBgmMuted(): boolean {
    return this.settings.bgmMuted;
  }

  isSfxMuted(): boolean {
    return this.settings.sfxMuted;
  }

  // 그래픽 설정
  isShowDamageNumbers(): boolean {
    return this.settings.showDamageNumbers;
  }

  setShowDamageNumbers(show: boolean): void {
    this.settings.showDamageNumbers = show;
    this.saveSettings();
  }

  isShowFPS(): boolean {
    return this.settings.showFPS;
  }

  setShowFPS(show: boolean): void {
    this.settings.showFPS = show;
    this.saveSettings();
  }

  isScreenShakeEnabled(): boolean {
    return this.settings.screenShake;
  }

  setScreenShake(enabled: boolean): void {
    this.settings.screenShake = enabled;
    this.saveSettings();
  }

  isParticleEffectsEnabled(): boolean {
    return this.settings.particleEffects;
  }

  setParticleEffects(enabled: boolean): void {
    this.settings.particleEffects = enabled;
    this.saveSettings();
  }

  // 게임플레이 설정
  isAutoAimEnabled(): boolean {
    return this.settings.autoAim;
  }

  setAutoAim(enabled: boolean): void {
    this.settings.autoAim = enabled;
    this.saveSettings();
  }

  isPauseOnFocusLoss(): boolean {
    return this.settings.pauseOnFocusLoss;
  }

  setPauseOnFocusLoss(enabled: boolean): void {
    this.settings.pauseOnFocusLoss = enabled;
    this.saveSettings();
  }

  // 접근성 설정
  getColorBlindMode(): 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' {
    return this.settings.colorBlindMode;
  }

  setColorBlindMode(mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'): void {
    this.settings.colorBlindMode = mode;
    this.saveSettings();
  }

  isLargeText(): boolean {
    return this.settings.largeText;
  }

  setLargeText(enabled: boolean): void {
    this.settings.largeText = enabled;
    this.saveSettings();
  }
}

// 싱글톤 인스턴스
export const settingsStore = new SettingsStore();
