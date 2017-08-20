import GameState from './GameState.js';

let game = new Phaser.Game(1024, 768, Phaser.AUTO);

game.state.add('GameState', GameState);

game.state.start('GameState');
