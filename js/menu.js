var menuState = {
    preload: function () {
        game.load.image('menu-bg', 'img/main-menu.png');
        game.load.image('start-button', 'img/startbutton.png');
    },
    create: function () {
        game.add.sprite(0, 0, 'menu-bg');   
        var startButton = game.add.sprite(game.width / 2 - 150, game.height / 2 + 25, 'start-button');
        startButton.inputEnabled = true;
        startButton.events.onInputUp.add(function () {
            game.state.start('playState');
        });
    },

}
