import Phaser from 'phaser';
import Player from '../objects/Player';
import Enemy from '../objects/Enemy';
import Projectile from '../objects/Projectile';
import ExpGem from '../objects/ExpGem';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private gems!: Phaser.Physics.Arcade.Group;
  
  private spawnEvent!: Phaser.Time.TimerEvent;
  private attackEvent!: Phaser.Time.TimerEvent;

  // 성장 관련 변수
  private exp: number = 0;
  private level: number = 1;
  private nextLevelExp: number = 100;
  private killCount: number = 0;

  // 시간 경과에 따른 난이도 조절
  private gameTime: number = 0;

  constructor() {
    super('GameScene');
  }

  create() {
    // 변수 초기화 (재시작 시 필요)
    this.exp = 0;
    this.level = 1;
    this.nextLevelExp = 100;
    this.killCount = 0;
    this.gameTime = 0;

    // UI Scene 실행 (이미 실행 중이면 restart)
    this.scene.launch('UIScene');
    // Note: UIScene이 이미 켜져있는 경우 이벤트를 다시 연결해야 할 수 있음.
    // 여기서는 간단히 UIScene이 GameScene의 이벤트를 listen하므로, 
    // UIScene을 껐다가 켜거나 이벤트를 재설정하는 로직이 이상적이지만,
    // 간단히 GameScene이 새로 시작될 때 UIScene도 재시작하도록 처리.
    if (this.scene.get('UIScene').scene.isActive()) {
        this.scene.stop('UIScene');
        this.scene.launch('UIScene');
    }

    // 1. 월드 설정
    this.cameras.main.setBackgroundColor('#1a1a1a');
    this.add.grid(0, 0, 3000, 3000, 32, 32, 0x000000, 0, 0x222222, 1);
    this.physics.world.setBounds(-1500, -1500, 3000, 3000);

    // 2. 플레이어 생성
    this.player = new Player(this, 0, 0);
    this.cameras.main.startFollow(this.player);

    // 플레이어 사망 이벤트 리스너
    this.events.on('player-dead', this.handlePlayerDead, this);

    // 3. 적 그룹 생성
    this.enemies = this.physics.add.group({
      classType: Enemy,
      maxSize: 200, // 물량 증가
      runChildUpdate: true,
    });

    // 4. 발사체 그룹 생성
    this.projectiles = this.physics.add.group({
      classType: Projectile,
      maxSize: 100,
      runChildUpdate: true,
    });

    // 5. 경험치 보석 그룹 생성
    this.gems = this.physics.add.group({
        classType: ExpGem,
        maxSize: 300,
        runChildUpdate: true
    });

    // 6. 충돌 및 이벤트 설정
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);
    this.physics.add.overlap(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, undefined, this);
    this.physics.add.overlap(this.player, this.gems, this.handlePlayerGemCollision, undefined, this);

    this.events.on('spawn-gem', this.spawnGem, this);

    // 7. 타이머 설정
    this.spawnEvent = this.time.addEvent({
      delay: 500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    this.attackEvent = this.time.addEvent({
        delay: 300,
        callback: this.fireWeapon,
        callbackScope: this,
        loop: true
    });
  }

  override update(time: number, delta: number) {
    if (!this.player.active) return; // 죽었으면 업데이트 중지

    this.player.update();
    
    // 게임 시간 업데이트 (난이도 조절용)
    this.gameTime += delta;

    // 자석 효과
    if (this.player && this.gems) {
        const magnetRange = 150; 
        // @ts-ignore
        this.gems.getChildren().forEach((gem: ExpGem) => {
            if (gem.active) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, gem.x, gem.y);
                if (dist <= magnetRange) {
                    gem.magnetize(this.player);
                }
            }
        });
    }
  }

  private spawnEnemy() {
    if (!this.player || !this.player.active) return;

    const distance = Phaser.Math.Between(500, 700);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    
    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;

    const enemy = this.enemies.get(x, y) as Enemy;
    if (enemy) {
      // 30초가 지나면 30% 확률로 Skeleton 등장
      let type: 'bat' | 'skeleton' = 'bat';
      if (this.gameTime > 30000 && Math.random() < 0.3) {
          type = 'skeleton';
      }

      enemy.spawn(x, y, this.player, type);
    }
  }

  private spawnGem(x: number, y: number, value: number) {
      const gem = this.gems.get(x, y) as ExpGem;
      if (gem) {
          gem.spawn(x, y, value);
      }
  }

  private fireWeapon() {
      if (!this.player || !this.player.active || !this.enemies) return;

      let nearestEnemy: Enemy | null = null;
      let minDistance = Infinity;
      const attackRange = 400;

      const activeEnemies = this.enemies.getChildren().filter(e => e.active) as Enemy[];

      activeEnemies.forEach(enemy => {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
          if (dist < minDistance && dist <= attackRange) {
              minDistance = dist;
              nearestEnemy = enemy;
          }
      });

      if (nearestEnemy) {
          const projectile = this.projectiles.get(this.player.x, this.player.y) as Projectile;
          if (projectile) {
              // @ts-ignore
              projectile.fire(this.player.x, this.player.y, nearestEnemy.x, nearestEnemy.y);
          }
      }
  }

  private handlePlayerEnemyCollision(obj1: any, obj2: any) {
    // 플레이어 데미지 처리
    const enemy = obj2 as Enemy;
    if (enemy.active) {
        this.player.takeDamage(10); // 10 데미지
        this.cameras.main.shake(100, 0.01);
    }
  }

  private handleProjectileEnemyCollision(projectileStart: any, enemyStart: any) {
      const projectile = projectileStart as Projectile;
      const enemy = enemyStart as Enemy;

      if (!projectile.active || !enemy.active) return;

      enemy.takeDamage(projectile.getDamage());
      projectile.despawn();
  }

  private handlePlayerGemCollision(playerObj: any, gemObj: any) {
      const gem = gemObj as ExpGem;
      if (!gem.active) return;

      this.gainExp(gem.getValue());
      
      gem.setActive(false);
      gem.setVisible(false);
      if (gem.body) {
        (gem.body as Phaser.Physics.Arcade.Body).enable = false;
      }
  }

  private gainExp(amount: number) {
      this.exp += amount;
      
      if (this.exp >= this.nextLevelExp) {
          this.levelUp();
      }

      this.events.emit('update-exp', { current: this.exp, max: this.nextLevelExp });
  }

  private levelUp() {
      this.exp -= this.nextLevelExp;
      this.level++;
      this.nextLevelExp = Math.floor(this.nextLevelExp * 1.2);
      
      this.events.emit('level-up', this.level);
      
      // 레벨업 보상 (임시): 플레이어 체력 회복
      if (this.player.hp < this.player.maxHp) {
          this.player.hp = Math.min(this.player.hp + 20, this.player.maxHp);
          this.events.emit('update-hp', { current: this.player.hp, max: this.player.maxHp });
      }

      if (this.exp >= this.nextLevelExp) {
          this.levelUp();
      }
  }

  private handlePlayerDead() {
      // 1초 뒤 게임 오버 화면으로
      this.time.delayedCall(1000, () => {
          this.scene.pause();
          this.scene.launch('GameOverScene', { score: this.killCount });
      });
  }
}
