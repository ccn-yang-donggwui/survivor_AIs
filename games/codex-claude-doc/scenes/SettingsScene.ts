import Phaser from 'phaser';
import { SoundManager } from '../utils/SoundManager';

export class SettingsScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private masterText!: Phaser.GameObjects.Text;
  private masterMinusText!: Phaser.GameObjects.Text;
  private masterPlusText!: Phaser.GameObjects.Text;
  private sfxText!: Phaser.GameObjects.Text;
  private sfxMinusText!: Phaser.GameObjects.Text;
  private sfxPlusText!: Phaser.GameObjects.Text;
  private musicText!: Phaser.GameObjects.Text;
  private musicMinusText!: Phaser.GameObjects.Text;
  private musicPlusText!: Phaser.GameObjects.Text;
  private bgmToggleText!: Phaser.GameObjects.Text;
  private muteText!: Phaser.GameObjects.Text;
  private backText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.titleText = this.add
      .text(width * 0.5, height * 0.22, 'Settings', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '32px',
        color: '#f4f6fb'
      })
      .setOrigin(0.5);

    this.masterText = this.add
      .text(width * 0.5, height * 0.32, '', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '20px',
        color: '#c7d0e0'
      })
      .setOrigin(0.5);

    this.masterMinusText = this.add
      .text(width * 0.42, height * 0.38, '[-]', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '20px',
        color: '#7ee3ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.masterPlusText = this.add
      .text(width * 0.58, height * 0.38, '[+]', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '20px',
        color: '#7ee3ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.sfxText = this.add
      .text(width * 0.5, height * 0.44, '', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#c7d0e0'
      })
      .setOrigin(0.5);

    this.sfxMinusText = this.add
      .text(width * 0.42, height * 0.5, '[-]', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#7ee3ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.sfxPlusText = this.add
      .text(width * 0.58, height * 0.5, '[+]', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#7ee3ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.musicText = this.add
      .text(width * 0.5, height * 0.56, '', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#c7d0e0'
      })
      .setOrigin(0.5);

    this.musicMinusText = this.add
      .text(width * 0.42, height * 0.62, '[-]', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#7ee3ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.musicPlusText = this.add
      .text(width * 0.58, height * 0.62, '[+]', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#7ee3ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.bgmToggleText = this.add
      .text(width * 0.5, height * 0.7, '', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#d7e8ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.muteText = this.add
      .text(width * 0.5, height * 0.76, '', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#f4d5a4'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.backText = this.add
      .text(width * 0.5, height * 0.84, 'Back', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '20px',
        color: '#c7d0e0'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.hintText = this.add
      .text(
        width * 0.5,
        height * 0.9,
        'Left/Right: Master  Up/Down: SFX  Q/E: BGM  B: BGM On/Off  M: Mute  Esc: Back',
        {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '14px',
        color: '#7b869e'
        }
      )
      .setOrigin(0.5);

    this.masterMinusText.on('pointerdown', () => this.adjustMaster(-0.05));
    this.masterPlusText.on('pointerdown', () => this.adjustMaster(0.05));
    this.sfxMinusText.on('pointerdown', () => this.adjustSfx(-0.05));
    this.sfxPlusText.on('pointerdown', () => this.adjustSfx(0.05));
    this.musicMinusText.on('pointerdown', () => this.adjustMusic(-0.05));
    this.musicPlusText.on('pointerdown', () => this.adjustMusic(0.05));
    this.bgmToggleText.on('pointerdown', () => this.toggleBgm());
    this.muteText.on('pointerdown', () => this.toggleMute());
    this.backText.on('pointerdown', () => this.backToMenu());

    this.input.once('pointerdown', () => SoundManager.unlock());
    this.input.keyboard?.once('keydown', () => SoundManager.unlock());

    this.input.keyboard?.on('keydown-LEFT', () => this.adjustMaster(-0.05));
    this.input.keyboard?.on('keydown-RIGHT', () => this.adjustMaster(0.05));
    this.input.keyboard?.on('keydown-UP', () => this.adjustSfx(0.05));
    this.input.keyboard?.on('keydown-DOWN', () => this.adjustSfx(-0.05));
    this.input.keyboard?.on('keydown-Q', () => this.adjustMusic(-0.05));
    this.input.keyboard?.on('keydown-E', () => this.adjustMusic(0.05));
    this.input.keyboard?.on('keydown-B', () => this.toggleBgm());
    this.input.keyboard?.on('keydown-M', () => this.toggleMute());
    this.input.keyboard?.on('keydown-ESC', () => this.backToMenu());

    this.scale.on('resize', this.handleResize, this);
    this.handleResize({ width, height } as Phaser.Structs.Size);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
    });

    this.refreshText();
  }

  private adjustMaster(delta: number): void {
    const next = SoundManager.getMasterVolume() + delta;
    SoundManager.setMasterVolume(next);
    this.refreshText();
  }

  private adjustMusic(delta: number): void {
    const next = SoundManager.getMusicVolume() + delta;
    SoundManager.setMusicVolume(next);
    this.refreshText();
  }

  private adjustSfx(delta: number): void {
    const next = SoundManager.getSfxVolume() + delta;
    SoundManager.setSfxVolume(next);
    this.refreshText();
  }

  private toggleBgm(): void {
    SoundManager.setBgmEnabled(!SoundManager.isBgmEnabled());
    this.refreshText();
  }

  private toggleMute(): void {
    SoundManager.toggleMute();
    this.refreshText();
  }

  private refreshText(): void {
    const masterPercent = Math.round(SoundManager.getMasterVolume() * 100);
    const sfxPercent = Math.round(SoundManager.getSfxVolume() * 100);
    const musicPercent = Math.round(SoundManager.getMusicVolume() * 100);
    const bgmEnabled = SoundManager.isBgmEnabled();
    const muted = SoundManager.isMuted();
    this.masterText.setText(`Master Volume: ${masterPercent}%`);
    this.sfxText.setText(`SFX Volume: ${sfxPercent}%`);
    this.musicText.setText(`BGM Volume: ${musicPercent}%`);
    this.bgmToggleText.setText(`BGM: ${bgmEnabled ? 'On' : 'Off'} (Click or B)`);
    this.muteText.setText(`Mute: ${muted ? 'On' : 'Off'} (Click or M)`);
  }

  private backToMenu(): void {
    this.scene.start('MenuScene');
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    this.titleText.setPosition(width * 0.5, height * 0.22);
    this.masterText.setPosition(width * 0.5, height * 0.32);
    this.masterMinusText.setPosition(width * 0.42, height * 0.38);
    this.masterPlusText.setPosition(width * 0.58, height * 0.38);
    this.sfxText.setPosition(width * 0.5, height * 0.44);
    this.sfxMinusText.setPosition(width * 0.42, height * 0.5);
    this.sfxPlusText.setPosition(width * 0.58, height * 0.5);
    this.musicText.setPosition(width * 0.5, height * 0.56);
    this.musicMinusText.setPosition(width * 0.42, height * 0.62);
    this.musicPlusText.setPosition(width * 0.58, height * 0.62);
    this.bgmToggleText.setPosition(width * 0.5, height * 0.7);
    this.muteText.setPosition(width * 0.5, height * 0.76);
    this.backText.setPosition(width * 0.5, height * 0.84);
    this.hintText.setPosition(width * 0.5, height * 0.9);
  }
}
