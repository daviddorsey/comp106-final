var gameoverState = {
    preload: function () {
        game.load.image('main-menu-button', 'img/main-menu-button.png');
        game.load.image('play-again-button', 'img/play-again-button.png');
        game.load.image('gameover-bg', 'img/gameover-bg.png');
    },
    create: function () {
        game.add.sprite(0,0,'gameover-bg');
        game.add.text(game.width / 2 - 225, 48, 'GAME OVER', {
            fontSize: '72px',
            fill: '#bbe5e0'
        });
        game.add.text(game.width / 2 - 225, 200, 'Score: ' + globalscore, {
            fontSize: '72px',
            fill: '#bbe5e0'
        });
        var mainMenuButton = game.add.sprite(game.width / 2 - 350, game.height / 2 + 125, 'main-menu-button');
        mainMenuButton.inputEnabled = true;
        mainMenuButton.events.onInputUp.add(function () {
            game.state.start('menuState');
        });
        var playAgainButton = game.add.sprite(game.width / 2 + 50, game.height / 2 + 125, 'play-again-button');
        playAgainButton.inputEnabled = true;
        playAgainButton.events.onInputUp.add(function () {
            game.state.start('playState');
        });
    }
}
