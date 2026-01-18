import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Rectangle {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private speed: number = 200;
  
  public hp: number = 100;
  public maxHp: number = 100;
  private isInvulnerable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 32, 32, 0x0000ff); // 파란색 사각형

    // 씬에 추가 및 물리 엔진 활성화
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    
    // 입력 키 설정
    if(scene.input.keyboard) {
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        }) as any;
    } else {
        // Fallback or Error handling if keyboard is not present
        this.cursors = {} as any;
        this.wasd = {} as any;
    }
  }

  takeDamage(amount: number) {
      if (this.isInvulnerable) return;

      this.hp -= amount;
      this.scene.events.emit('update-hp', { current: this.hp, max: this.maxHp });

      if (this.hp <= 0) {
          this.scene.events.emit('player-dead');
          // 플레이어 비활성화
          this.setActive(false);
          this.setVisible(false);
      } else {
          // 무적 시간 부여 (1초)
          this.isInvulnerable = true;
          this.scene.tweens.add({
              targets: this,
              alpha: 0.5, // 반투명
              duration: 100,
              yoyo: true,
              repeat: 4, // 0.1s * 2 * 5 = 1초 동안 깜빡임
              onComplete: () => {
                  this.isInvulnerable = false;
                  this.alpha = 1;
              }
          });
      }
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if(!body) return;

    let velocityX = 0;
    let velocityY = 0;

    // 가로 이동
    if (this.cursors.left?.isDown || this.wasd.A?.isDown) {
      velocityX = -this.speed;
    } else if (this.cursors.right?.isDown || this.wasd.D?.isDown) {
      velocityX = this.speed;
    }

    // 세로 이동
    if (this.cursors.up?.isDown || this.wasd.W?.isDown) {
      velocityY = -this.speed;
    } else if (this.cursors.down?.isDown || this.wasd.S?.isDown) {
      velocityY = this.speed;
    }

    // 대각선 속도 정규화
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    body.setVelocity(velocityX, velocityY);
  }
}
