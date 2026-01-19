import Phaser from 'phaser';
import Player from './Player';

export default class Enemy extends Phaser.GameObjects.Rectangle {
  private target: Player | null = null;
  private speed: number = 100;
  private hp: number = 20; // 기본 체력 20 (미사일 2방)
  private maxHp: number = 20;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 24, 24, 0xff0000); 
  }

  // 오브젝트 풀에서 꺼낼 때 호출
  spawn(x: number, y: number, target: Player, type: 'bat' | 'skeleton' = 'bat') {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.target = target;
    this.setAlpha(1);

    // 타입별 스탯 설정
    if (type === 'bat') {
        this.speed = 120;
        this.maxHp = 20;
        this.setFillStyle(0xff0000); // 빨강
        this.width = 24; this.height = 24;
    } else if (type === 'skeleton') {
        this.speed = 60; // 느림
        this.maxHp = 60; // 튼튼함
        this.setFillStyle(0xffffff); // 흰색
        this.width = 32; this.height = 32;
    }
    
    this.hp = this.maxHp;

    if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        // 크기 변경 시 body 사이즈도 업데이트 필요
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.width, this.height);
    }
  }

  takeDamage(amount: number) {
      this.hp -= amount;
      
      // 피격 효과 (깜빡임)
      this.scene.tweens.add({
          targets: this,
          alpha: 0.5,
          duration: 50,
          yoyo: true,
          repeat: 1
      });

      if (this.hp <= 0) {
          this.die();
      }
  }

  // 죽거나 사라질 때 호출
  die() {
    if (this.active) { // 이미 죽은 상태가 아닐 때만 실행
        // 경험치 보석 드랍 이벤트 발생
        this.scene.events.emit('spawn-gem', this.x, this.y, 10); // Exp 10
        this.scene.events.emit('enemy-killed');
    }

    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }
  }

  override update() {
    if (!this.active || !this.target) return;

    // 간단한 추적 AI (플레이어 방향으로 이동)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
        this.scene.physics.moveToObject(this, this.target, this.speed);
    }
  }
}
