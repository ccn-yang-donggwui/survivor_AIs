import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';

console.log('main.ts: Starting game initialization');

// 게임 인스턴스 생성
const game = new Phaser.Game(GameConfig);

console.log('main.ts: Game instance created');

// 윈도우 리사이즈 대응
window.addEventListener('resize', () => {
  game.scale.refresh();
});

export default game;
