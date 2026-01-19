import Phaser from 'phaser';

export default class Projectile extends Phaser.GameObjects.Rectangle {
  private speed: number = 400;
  private lifespan: number = 2000; // 2초 후 삭제
  private damage: number = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 8, 8, 0xffff00); // 노란색 작은 사각형
    // Physics is enabled by the Group
  }

  fire(x: number, y: number, targetX: number, targetY: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.lifespan = 2000;

    // 각도 계산 및 속도 설정
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (body) {
        body.enable = true;
        this.scene.physics.velocityFromRotation(angle, this.speed, body.velocity);
    }
  }

  override update(time: number, delta: number) {
    this.lifespan -= delta;
    if (this.lifespan <= 0) {
      this.despawn();
    }
  }

  despawn() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }
  }

  public getDamage(): number {
      return this.damage;
  }
}
