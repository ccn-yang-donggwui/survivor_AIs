import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number;
  public piercing: number;
  private hitCount: number = 0;
  private lifetime: number = 5000;
  private age: number = 0;
  private initialVelocityX: number;
  private initialVelocityY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    velocityX: number,
    velocityY: number,
    damage: number,
    piercing: number = 0
  ) {
    super(scene, x, y, texture);

    this.damage = damage;
    this.piercing = piercing;
    this.initialVelocityX = velocityX;
    this.initialVelocityY = velocityY;

    // 속도 방향으로 회전
    const angle = Math.atan2(velocityY, velocityX);
    this.setRotation(angle + Math.PI / 2);

    this.setOrigin(0.5);
  }

  // 물리 바디가 설정된 후 호출
  public initPhysics(): void {
    this.setVelocity(this.initialVelocityX, this.initialVelocityY);
  }

  public update(_time: number, delta: number): void {
    this.age += delta;

    // 수명 만료 시 제거
    if (this.age >= this.lifetime) {
      this.destroy();
      return;
    }

    // 화면 밖으로 나가면 제거
    const camera = this.scene.cameras.main;
    const bounds = {
      left: camera.worldView.x - 100,
      right: camera.worldView.x + camera.width + 100,
      top: camera.worldView.y - 100,
      bottom: camera.worldView.y + camera.height + 100
    };

    if (this.x < bounds.left || this.x > bounds.right ||
        this.y < bounds.top || this.y > bounds.bottom) {
      this.destroy();
    }
  }

  public hitEnemy(): boolean {
    this.hitCount++;

    // 관통 횟수 초과 시 true 반환 (제거 필요)
    return this.hitCount > this.piercing;
  }
}
