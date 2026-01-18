import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private expBar!: Phaser.GameObjects.Rectangle;
  private expBarBg!: Phaser.GameObjects.Rectangle;
  
  private hpBar!: Phaser.GameObjects.Rectangle;
  private hpBarBg!: Phaser.GameObjects.Rectangle;

  private score: number = 0;
  private level: number = 1;
  private currentExp: number = 0;
  private maxExp: number = 100;

  constructor() {
    super('UIScene');
  }

  create() {
    // 1. 레벨 텍스트 (좌측 상단)
    this.levelText = this.add.text(20, 20, 'Lv. 1', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 2. 점수(킬) 텍스트 (우측 상단)
    this.scoreText = this.add.text(1260, 20, 'Kills: 0', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    // 3. 경험치 바 (상단 중앙)
    // 배경 (회색)
    this.expBarBg = this.add.rectangle(640, 30, 800, 10, 0x333333).setOrigin(0.5, 0.5);
    // 게이지 (파란색) - 초기 scaleX 0
    this.expBar = this.add.rectangle(640 - 400, 30, 800, 10, 0x4488ff).setOrigin(0, 0.5);
    this.expBar.scaleX = 0;

    // 4. 체력 바 (플레이어 머리 위 대신 UI 하단 중앙에 배치)
    this.add.text(640, 650, 'HP', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.hpBarBg = this.add.rectangle(640, 680, 200, 20, 0x330000).setOrigin(0.5);
    this.hpBar = this.add.rectangle(640 - 100, 680, 200, 20, 0xff0000).setOrigin(0, 0.5);

    // GameScene으로부터 이벤트를 받기 위해 리스너 설정
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('update-exp', this.updateExp, this);
    gameScene.events.on('level-up', this.handleLevelUp, this);
    gameScene.events.on('enemy-killed', this.updateScore, this);
    gameScene.events.on('update-hp', this.updateHp, this);
  }

  private updateHp(data: { current: number, max: number }) {
      const percent = Phaser.Math.Clamp(data.current / data.max, 0, 1);
      this.hpBar.scaleX = percent;
  }

  private updateExp(data: { current: number, max: number }) {
      this.currentExp = data.current;
      this.maxExp = data.max;
      
      const percent = Phaser.Math.Clamp(this.currentExp / this.maxExp, 0, 1);
      this.tweens.add({
          targets: this.expBar,
          scaleX: percent,
          duration: 100
      });
  }

  private handleLevelUp(newLevel: number) {
      this.level = newLevel;
      this.levelText.setText(`Lv. ${this.level}`);
      
      // 레벨업 알림 텍스트 (잠깐 떴다 사라짐)
      const levelUpMsg = this.add.text(640, 150, 'LEVEL UP!', {
          fontSize: '64px',
          color: '#ffff00',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 6
      }).setOrigin(0.5);

      this.tweens.add({
          targets: levelUpMsg,
          y: 100,
          alpha: 0,
          duration: 1000,
          delay: 500,
          onComplete: () => levelUpMsg.destroy()
      });
  }

  private updateScore() {
      this.score++;
      this.scoreText.setText(`Kills: ${this.score}`);
  }
}
