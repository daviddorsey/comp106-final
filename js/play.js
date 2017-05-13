var globalscore = 0;
var playState = {
    game_bg_mid: null, //a reference to the background, used for tweens
    game_bg_back: null, //a reference to the back section of the background, used for paralax
    game_bg_ground: null, //a reference to background imagery used for paralax
    currentStage: 1, //the stage of the game the user is currently on
    levelTimer: 0, //time remaining in the current stage
    score: 0, //score for the current game
    pointsPerHit: 10, //the maximum number of points that can be earned for hitting an enemy
    spawnNext: 0, //a Date().getTime() value representing the next spawn time
    spawnRate: 750, //amount of time in milliseconds between spawns
    shooterX: 500, //starting X position of the shooter
    velocityX: 0, //starting X velocity of the shooter
    alliesShown: 0, //number of allies currently shown on screen
    spawnLocations: [{
        x: 600,
        y: 255,
        scale: 0.24
    }, {
        x: 520,
        y: 195,
        scale: 0.15
    }, {
        x: 440,
        y: 185,
        scale: 0.12
    }, {
        x: 260,
        y: 205,
        scale: 0.19
    }], //array containing x,y coordinate pairs of locations for spawns
    preload: function () {
        game.load.image('game-bg', 'img/game-bg-mid.png');
        game.load.image('game-bg-back', 'img/game-bg-back.png');
        game.load.image('game-bg-ground', 'img/game-bg-ground.png');
        game.load.image('shooter', 'img/shooter.png');
        game.load.spritesheet('enemy', 'img/enemy_spritesheet.png', 360, 580);
        game.load.spritesheet('ally', 'img/ally_spritesheet.png', 360, 580);
        game.load.image('bullet', 'img/bullet.png');
    },
    create: function () {
        globalscore = 0;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game_bg_ground = game.add.sprite(0, 0, 'game-bg-ground');
        this.game_bg_back = game.add.sprite(0, 0, 'game-bg-back');
        this.game_bg_mid = game.add.sprite(0, 0, 'game-bg');
        shooter = game.add.sprite(this.shooterX, 415, 'shooter');
        shooter.scale.set(0.4, 0.4);
        timer = game.add.text(game.width - 50, 24, this.levelTimer, {
            fill: '#44526b'
        });
        this.levelTimer = new Date().getTime() + 20000;
        scoreText = game.add.text(24, 24, '0000', {
            fill: '#44526b  '
        });
        this.spawnNext = new Date().getTime();
        enemies = game.add.group();
        enemies.enableBody = true;
        allies = game.add.group();
        allies.enableBody = true;
        cursors = game.input.keyboard.createCursorKeys();
        spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        bullets = game.add.group();
        bullets.enableBody = true;
        //creates 20 instances of bullets that can be recycled, allowing multiple bullets to exist on screen at the same time
        for (var i = 0; i < 20; i++) {
            var b = bullets.create(0, 0, 'bullet');
            b.scale.set(0.25, 0.25);
            b.name = 'bullet' + i;
            b.exists = false;
            b.visible = false;
            b.checkWorldBounds = true;
            b.events.onOutOfBounds.add(this.resetBullet, this);
        }
        bulletTime = 0; //cooldown on shooting consecutive bullets
    },
    update: function () {

        //handle the timer
        var d = new Date().getTime();
        var displayTime = Math.ceil((this.levelTimer - d) / 1000);
        displayTime < 0 ? displayTime = 0 : displayTime = displayTime;
        displayTime > 20 ? displayTime = 20 : displayTime = displayTime;
        timer.text = displayTime;

        //handle random spawns
        if (this.spawnNext <= d) {
            var select = Math.floor(Math.random() * this.spawnLocations.length);
            if (Math.random() <= 0.8 || this.alliesShown >= 2) {
                var newEnemy = enemies.create(this.spawnLocations[select].x, this.spawnLocations[select].y, 'enemy');
                newEnemy.scale.setTo(this.spawnLocations[select].scale, this.spawnLocations[select].scale);
                newEnemy.animations.add('spawn', [0,1,2,3,4,5,6,7,8], 16, false);
                newEnemy.animations.play('spawn');
            } else {
                var newAlly = allies.create(this.spawnLocations[select].x, this.spawnLocations[select].y, 'ally');
                newAlly.scale.setTo(this.spawnLocations[select].scale, this.spawnLocations[select].scale);
                newAlly.animations.add('spawn', [0,1,2,3,4,5,6,7,8], 16, false);
                newAlly.animations.play('spawn');
                this.alliesShown += 1;
            }
            this.spawnNext += this.spawnRate;
        }

        //handle user input for moving the shooter
        if (cursors.left.isDown) {
            this.velocityX = -10;
        } else if (cursors.right.isDown) {
            this.velocityX = 10;
        } else {
            this.velocityX = 0;
        }

        //handle updarting shooter position
        if (this.shooterX + this.velocityX >= game.width - shooter.width) {
            this.shooterX = game.width - shooter.width;
        } else if (this.shooterX + this.velocityX <= 0) {
            this.shooterX = 0;
        } else {
            this.shooterX += this.velocityX;
        }
        shooter.kill();
        shooter = game.add.sprite(this.shooterX, 415, 'shooter');
        shooter.scale.set(0.4, 0.4);

        //handle shooting
        if (spaceKey.isDown) {
            if (game.time.now > bulletTime) {
                bullet = bullets.getFirstExists(false);
                if (bullet) {
                    bullet.reset(this.shooterX + 49, 400);
                    bullet.body.velocity.y = -800;
                    bulletTime = game.time.now + 200;
                }
            }
        }

        //handle bullet hits
        game.physics.arcade.overlap(enemies, bullets, this.hitEnemy, null, this);
        game.physics.arcade.overlap(allies, bullets, this.hitAlly, null, this);

        //advance to the next stage
        if (displayTime === 0 && this.currentStage < 5) {
            //stop this function from propagating
            displayTime = -1;
            //tween to update the background position
            game.add.tween(this.game_bg_mid).to({
                x: this.game_bg_mid.x - 1000
            }, 2000, Phaser.Easing.Quadratic.InOut, true);
            game.add.tween(this.game_bg_ground).to({
                x: this.game_bg_ground.x - 1000
            }, 2000, Phaser.Easing.Quadratic.InOut, true);
            game.add.tween(this.game_bg_back).to({
                x: this.game_bg_back.x - 800
            }, 2000, Phaser.Easing.Quadratic.InOut, true);
            //reset the timer to the length of the next stage plus the tween animation time
            this.levelTimer = new Date().getTime() + 22000;
            //updates other variable to values for the next stage
            this.currentStage += 1;
            this.pointsPerHit += 10;
            this.spawnRate -= 30;
            //clears board of current spawns
            enemies.callAll('kill');
            allies.callAll('kill');
            this.alliesShown = 0;
            //pause spawns for background animation duration
            this.spawnNext += 2000;
            //update potential spawn locations
            switch (this.currentStage) {
            case 2:
                this.spawnLocations = [{
                    x: 385,
                    y: 180,
                    scale: 0.11
                }, {
                    x: 480,
                    y: 265,
                    scale: 0.22
                }, {
                    x: 780,
                    y: 278,
                    scale: 0.24
                }, {
                    x: 16,
                    y: 240,
                    scale: 0.21
                }];
                break;
            case 3:
                this.spawnLocations = [{
                    x: 670,
                    y: 190,
                    scale: 0.1
                }, {
                    x: 810,
                    y: 185,
                    scale: 0.1
                }, {
                    x: 450,
                    y: 200,
                    scale: 0.12
                }, {
                    x: 330,
                    y: 195,
                    scale: 0.07
                }, {
                    x: 925,
                    y: 192,
                    scale: 0.07
                }];
                break;
            case 4:
                this.spawnLocations = [{
                    x: 520,
                    y: 195,
                    scale: 0.08
                }, {
                    x: 427,
                    y: 198,
                    scale: 0.1
                }, {
                    x: 635,
                    y: 201,
                    scale: 0.095
                }, {
                    x: 850,
                    y: 195,
                    scale: 0.06
                }, {
                    x: 65,
                    y: 195,
                    scale: 0.09
                }]; 
                break;
            case 5:
                this.spawnLocations = [{
                    x: 520,
                    y: 195,
                    scale: 0.08
                }, {
                    x: 431,
                    y: 200,
                    scale: 0.095
                }, {
                    x: 675,
                    y: 198,
                    scale: 0.085
                }, {
                    x: 920,
                    y: 194,
                    scale: 0.06
                }, {
                    x: 90,
                    y: 216,
                    scale: 0.13
                }]; 
                break;
            default:
                this.spawnLocations = [{
                    x: 500,
                    y: 200,
                    scale: 0.25
                }];
                break;
            }

        }
        //reset variables and switch to the gameover state when the timer has run out on stage 5
        else if (displayTime === 0 && this.currentStage === 5) {
            this.score = 0;
            this.pointsPerHit = 10;
            this.spawnRate = 750;
            this.currentStage = 1;
            this.shooterX = game.width / 2;
            this.velocityX = 0;
            this.alliesShown = 0;
            this.spawnLocations = [{
                x: 600,
                y: 255,
                scale: 0.24
            }, {
                x: 520,
                y: 195,
                scale: 0.15
            }, {
                x: 440,
                y: 185,
                scale: 0.12
            }, {
                x: 260,
                y: 205,
                scale: 0.19
            }];
            //saves score to be accessed in the next state
            globalscore = this.score;
            game.state.start('gameoverState');
        }
    },
    hitEnemy: function (bullet, enemy) {
        console.log("hit enemy");
        enemy.kill();
        bullet.kill();
        //updates displayed score and formats it to 4 digits
        this.score += this.pointsPerHit;
        scoreText.text = ('000' + this.score).slice(-4);
    },
    hitAlly: function (bullet, ally) {
        console.log("hit ally");
        this.alliesShown -= 1;
        ally.kill();
        bullet.kill();
        //updates displayed score and formats it to 4 digits
        this.score < this.pointsPerHit ? this.score = 0 : this.score -= this.pointsPerHit;

        scoreText.text = ('000' + this.score).slice(-4);
    },
    resetBullet: function (bullet) {
        this.score < this.pointsPerHit / 2 ? this.score = 0 : this.score -= this.pointsPerHit / 2;
        scoreText.text = ('000' + this.score).slice(-4);
        bullet.kill()
    }
};