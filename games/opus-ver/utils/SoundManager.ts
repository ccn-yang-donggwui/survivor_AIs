// 사운드 매니저 - BGM 및 SFX 관리

import Phaser from 'phaser';
import { settingsStore } from '../systems/SettingsStore';
import { AUDIO } from '../config/Constants';

export type SoundKey =
  | 'bgm_menu'
  | 'bgm_game'
  | 'bgm_boss'
  | 'sfx_hit'
  | 'sfx_kill'
  | 'sfx_levelup'
  | 'sfx_pickup'
  | 'sfx_weapon'
  | 'sfx_evolution'
  | 'sfx_death'
  | 'sfx_button'
  | 'sfx_pause';

export class SoundManager {
  private scene: Phaser.Scene;
  private bgmSound: Phaser.Sound.BaseSound | null = null;
  private currentBgmKey: string | null = null;
  private sfxSounds: Map<string, Phaser.Sound.BaseSound[]> = new Map();

  // 사운드 풀 크기
  private readonly SFX_POOL_SIZE = 5;

  // 실제 사운드 파일이 없으므로 더미 모드
  private isDummyMode: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 설정 변경 리스너
    settingsStore.subscribe(() => {
      this.updateVolumes();
    });
  }

  // 사운드 에셋 로드 (PreloadScene에서 호출)
  static preload(scene: Phaser.Scene): void {
    // 실제 오디오 파일이 있다면 여기서 로드
    // scene.load.audio('bgm_menu', 'assets/audio/bgm_menu.mp3');
    // scene.load.audio('sfx_hit', 'assets/audio/sfx_hit.wav');
    // 등등...

    // 현재는 더미 모드이므로 로드하지 않음
    console.log('SoundManager: Running in dummy mode (no audio files)');
  }

  // 초기화 (사운드 풀 생성)
  initialize(): void {
    if (this.isDummyMode) return;

    // SFX 사운드 풀 생성
    const sfxKeys: SoundKey[] = [
      'sfx_hit',
      'sfx_kill',
      'sfx_levelup',
      'sfx_pickup',
      'sfx_weapon',
      'sfx_evolution',
      'sfx_death',
      'sfx_button',
      'sfx_pause',
    ];

    sfxKeys.forEach(key => {
      if (this.scene.cache.audio.exists(key)) {
        const pool: Phaser.Sound.BaseSound[] = [];
        for (let i = 0; i < this.SFX_POOL_SIZE; i++) {
          pool.push(this.scene.sound.add(key));
        }
        this.sfxSounds.set(key, pool);
      }
    });
  }

  // BGM 재생
  playBgm(key: SoundKey, fadeIn: boolean = true): void {
    if (this.isDummyMode) {
      console.log(`SoundManager: Would play BGM '${key}'`);
      return;
    }

    // 같은 BGM이면 무시
    if (this.currentBgmKey === key && this.bgmSound?.isPlaying) return;

    // 기존 BGM 정지
    this.stopBgm(fadeIn);

    // 새 BGM 시작
    if (this.scene.cache.audio.exists(key)) {
      this.bgmSound = this.scene.sound.add(key, {
        loop: true,
        volume: fadeIn ? 0 : settingsStore.getBgmVolume(),
      });

      this.bgmSound.play();
      this.currentBgmKey = key;

      if (fadeIn) {
        this.scene.tweens.add({
          targets: this.bgmSound,
          volume: settingsStore.getBgmVolume(),
          duration: AUDIO.FADE_DURATION,
        });
      }
    }
  }

  // BGM 정지
  stopBgm(fadeOut: boolean = true): void {
    if (this.isDummyMode) return;

    if (this.bgmSound && this.bgmSound.isPlaying) {
      if (fadeOut) {
        this.scene.tweens.add({
          targets: this.bgmSound,
          volume: 0,
          duration: AUDIO.FADE_DURATION,
          onComplete: () => {
            this.bgmSound?.stop();
            this.bgmSound = null;
            this.currentBgmKey = null;
          },
        });
      } else {
        this.bgmSound.stop();
        this.bgmSound = null;
        this.currentBgmKey = null;
      }
    }
  }

  // BGM 일시정지/재개
  pauseBgm(): void {
    if (this.isDummyMode) return;

    if (this.bgmSound && this.bgmSound.isPlaying) {
      this.bgmSound.pause();
    }
  }

  resumeBgm(): void {
    if (this.isDummyMode) return;

    if (this.bgmSound && this.bgmSound.isPaused) {
      this.bgmSound.resume();
    }
  }

  // SFX 재생
  playSfx(key: SoundKey, volume?: number): void {
    if (this.isDummyMode) {
      // 너무 많은 로그를 피하기 위해 특정 SFX만 로그
      if (key === 'sfx_levelup' || key === 'sfx_evolution' || key === 'sfx_death') {
        console.log(`SoundManager: Would play SFX '${key}'`);
      }
      return;
    }

    const pool = this.sfxSounds.get(key);
    if (!pool) return;

    // 사용 가능한 사운드 찾기
    const sound = pool.find(s => !s.isPlaying);
    if (sound) {
      const sfxVolume = volume ?? settingsStore.getSfxVolume();
      (sound as any).setVolume(sfxVolume);
      sound.play();
    }
  }

  // 볼륨 업데이트
  private updateVolumes(): void {
    if (this.isDummyMode) return;

    // BGM 볼륨
    if (this.bgmSound) {
      (this.bgmSound as any).setVolume(settingsStore.getBgmVolume());
    }

    // SFX는 재생 시 적용됨
  }

  // 음소거 토글
  toggleBgmMute(): boolean {
    const muted = settingsStore.toggleBgmMute();
    this.updateVolumes();
    return muted;
  }

  toggleSfxMute(): boolean {
    return settingsStore.toggleSfxMute();
  }

  // 모든 사운드 정지
  stopAll(): void {
    this.stopBgm(false);
    if (!this.isDummyMode) {
      this.scene.sound.stopAll();
    }
  }

  // 정리
  destroy(): void {
    this.stopAll();
    this.sfxSounds.clear();
  }

  // 더미 모드 확인
  isDummyModeEnabled(): boolean {
    return this.isDummyMode;
  }

  // 실제 오디오 모드로 전환 (나중에 오디오 파일 추가 시)
  enableRealAudio(): void {
    this.isDummyMode = false;
    this.initialize();
  }

  // 현재 재생 중인 BGM
  getCurrentBgm(): string | null {
    return this.currentBgmKey;
  }

  // BGM 재생 중인지 확인
  isBgmPlaying(): boolean {
    return this.bgmSound?.isPlaying ?? false;
  }
}

// 전역 인스턴스를 위한 헬퍼
let globalSoundManager: SoundManager | null = null;

export function initSoundManager(scene: Phaser.Scene): SoundManager {
  globalSoundManager = new SoundManager(scene);
  return globalSoundManager;
}

export function getSoundManager(): SoundManager | null {
  return globalSoundManager;
}
