var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'gameCanvas');

game.state.add('menuState', menuState);
game.state.add('playState', playState);
game.state.add('gameoverState', gameoverState);

game.state.start('menuState');