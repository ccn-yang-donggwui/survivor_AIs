export type SettingsState = {
  masterVolume: number;
  sfxVolume: number;
};

const STORAGE_KEY = "vamseryu.settings";

const DEFAULT_SETTINGS: SettingsState = {
  masterVolume: 0.8,
  sfxVolume: 0.7
};

export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as SettingsState;
    return {
      masterVolume: clamp(Number(parsed.masterVolume ?? DEFAULT_SETTINGS.masterVolume)),
      sfxVolume: clamp(Number(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume))
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(state: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}
