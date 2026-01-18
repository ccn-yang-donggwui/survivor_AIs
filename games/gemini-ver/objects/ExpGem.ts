import Phaser from 'phaser';
import Player from './Player';

export default class ExpGem extends Phaser.GameObjects.Rectangle {
  private value: number = 10;
  private isCollected: boolean = false;
  private target: Player | null = null;
  private speed: number = 400; // 빨려오는 속도

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 10, 10, 0x00ffff); // 청록색(Cyan) 보석
  }

  spawn(x: number, y: number, value: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.value = value;
    this.isCollected = false;
    this.target = null;
    
    if (this.body) {
        this.body.enable = true;
        // @ts-ignore
        this.body.setVelocity(0, 0);
    }
  }

  // 플레이어가 자석 범위 내에 들어오면 호출
  magnetize(player: Player) {
      this.isCollected = true;
      this.target = player;
  }

  update(time: number, delta: number) {
      if (this.isCollected && this.target) {
          // 플레이어 쪽으로 가속 이동
          this.scene.physics.moveToObject(this, this.target, this.speed);
          
          // 거리가 매우 가까워지면(충돌 직전) 먹은 것으로 처리하는 로직은
          // GameScene의 Overlap에서 처리
      }
  }

  getValue() {
      return this.value;
  }
}
