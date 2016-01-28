var spritesLink = {
    // As many sprites as direction
    // Each element in this array contains n images
    sprites : []
};

// Vars relative to the canvas
var canvas, ctx, w, h;

enemyBallImage = new Image();
enemyBallImage.src = 'sprites/EnemyBall.png';
targetAreaImage = new Image();
targetAreaImage.src = 'sprites/ruby.png';

function initSprites(spritesheet, spriteWidth, spriteHeight, nbLinesOfSprites,
                     nbSpritesPerLine) {

    // sprite extraction
    for(var i= 0; i < nbLinesOfSprites; i++) {
        var yLineForCurrentDir = i*spriteHeight;

        var sprite = new Sprite(ctx, spritesheet, 0, yLineForCurrentDir,
            spriteWidth, spriteHeight,
            nbSpritesPerLine,
            3); // draw every 1s
        spritesLink[i] = sprite;
    }
}

window.onload = function init() {
    var game = new GF();

    // load the spritesheet
    spritesheet = new Image();
    spritesheet.src="sprites/link.jpg";

    spritesheet.onload = function() {

        // info about spritesheet
        var SPRITE_WIDTH = 120;
        var SPRITE_HEIGHT = 130;
        var NB_DIRECTIONS = 8;
        var NB_FRAMES_PER_POSTURE = 10;

        initSprites(spritesheet, SPRITE_WIDTH, SPRITE_HEIGHT,
            NB_DIRECTIONS, NB_FRAMES_PER_POSTURE);
    };

    game.start();
};

// GAME FRAMEWORK STARTS HERE
var GF = function () {

    // vars for handling inputs
    var inputStates = {};

    // game states
    var gameStates = {
        mainMenu: 0,
        gameRunning: 1,
        gameOver: 2
    };
    var currentGameState = gameStates.gameRunning;
    var currentLevel = 1;
    var TIME_BETWEEN_LEVELS = 5000; // 5 seconds
    var currentLevelTime = 0;
    var gameTime = 0;
    var plopSound; // Sound of a ball exploding

    // The monster !
    var monster = {
        dead: false,
        x: 10,
        y: 10,
        width: 35,
        height: 50,
        speed: 300 // pixels/s this time !
    };

    // array of balls to animate
    var ballArray = [];
    var nbBalls = 7;

    // remaining time the monster have to be on the target area
    var remainingTargetTime = 5000;
    var targetArea = null;

    DIR_S= 4;
    DIR_W= 5;
    DIR_N = 6;
    DIR_E = 7;
    var dir = DIR_S;
    var moving = false;
    var scale = 0.5;

    document.onkeyup = function(e) {
        moving = false;
    };

    // clears the canvas content
    function clearCanvas() {
        ctx.clearRect(0, 0, w, h);
    }

    // Functions for drawing the monster and maybe other objects
    function drawMyMonster(x, y) {
        // draw a big monster !
        // head

        // save the context
        ctx.save();

        // translate the coordinate system, draw relative to it
        ctx.translate(x, y);
        ctx.scale(0.5, 0.5);

        // (0, 0) is the top left corner of the monster.
        ctx.strokeRect(0, 0, 100, 100);

        // eyes
        ctx.fillRect(20, 20, 10, 10);
        ctx.fillRect(65, 20, 10, 10);

        // nose
        ctx.strokeRect(45, 40, 10, 40);

        // mouth
        ctx.strokeRect(35, 84, 30, 10);

        // teeth
        ctx.fillRect(38, 84, 10, 10);
        ctx.fillRect(52, 84, 10, 10);

        // restore the context
        ctx.restore();
    }

    var mainLoop = function (time) {
        //main function, called each frame 
        measureFPS(time);
        //scale = 1 + 2 * (monster.y / canvas.height);

        // number of ms since last frame draw
        delta = timer(time);

        // Clear the canvas
        clearCanvas();

        if (monster.dead) {
            currentGameState = gameStates.gameOver;
        }

        switch (currentGameState) {
            case gameStates.gameRunning:

                // draw the monster
                //drawMyMonster(monster.x, monster.y);

                // Check inputs and move the monster
                updateMonsterPosition(delta);

                // update and draw balls
                updateBalls(delta);

                // display Score
                displayScore();

                // increase currentLevelTime
                currentLevelTime += delta;
                gameTime += delta;

                /**
                if (currentLevelTime < 0) {
                    goToNextLevel();
                } **/

                if (remainingTargetTime < 0) {
                    goToNextLevel();
                }

                break;
            case gameStates.mainMenu:
                // TO DO !
                break;
            case gameStates.gameOver:
                ctx.fillText("GAME OVER", 50, 100);
                ctx.fillText("Game time : ", 50, 150);
                ctx.fillText((gameTime / 1000).toFixed(1), 200, 150);
                ctx.fillText("level : ", 50, 200);
                ctx.fillText(currentLevel, 150, 200);
                ctx.fillText("Press SPACE to start again", 50, 250);
                ctx.fillText("Move with arrow keys", 50, 300);
                ctx.fillText("Survive 5 seconds on the emerald", 50, 350);
                ctx.fillText("to go to the next level", 50, 375);
                if (inputStates.space) {
                    startNewGame();
                }
                break;
        }

        if(!moving) {
            spritesLink[dir].render(monster.x-5, monster.y-10, scale);
        } else {
            spritesLink[dir].renderMoving(monster.x, monster.y, scale);
        }

        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    function startNewGame() {
        monster.dead = false;
        currentLevelTime = 0;
        gameTime = 0;
        remainingTargetTime = 5000;
        currentLevel = 1;
        nbBalls = 7;
        createBalls(nbBalls);
        currentGameState = gameStates.gameRunning;
    }

    function goToNextLevel() {
        // reset time available for next level
        // 5 seconds in this example
        currentLevelTime = 0;
        remainingTargetTime = 5000;
        currentLevel++;
        // Add two balls per level
        nbBalls += 2;
        targetArea = new Ball(w * Math.random(),
            h * Math.random(),
            (2 * Math.PI) * Math.random(),
            (50 + currentLevel*25),
            30,
            TARGETAREACOLOR(),
            TARGETAREATYPE());

        createBalls(nbBalls);
    }

    function displayScore() {
        ctx.save();
        ctx.fillStyle = 'Green';
        ctx.fillText("Level: " + currentLevel, 300, 30);
        ctx.fillText("Time: " + (currentLevelTime / 1000).toFixed(1), 300, 60);
        ctx.fillText("Balls: " + nbBalls, 300, 90);
        ctx.fillText("Target: " + (remainingTargetTime / 1000).toFixed(1), 300, 120);
        ctx.restore();
    }
    function updateMonsterPosition(delta) {
        monster.speedX = monster.speedY = 0;

        if (inputStates.left) {
            monster.speedX = -monster.speed;
            dir = DIR_W;
            moving = true;
        }
        if (inputStates.up) {
            monster.speedY = -monster.speed;
            dir = DIR_N;
            moving = true;
        }
        if (inputStates.right) {
            monster.speedX = monster.speed;
            dir = DIR_E;
            moving = true;
        }
        if (inputStates.down) {
            monster.speedY = monster.speed;
            dir = DIR_S;
            moving = true;
        }
        if (inputStates.space) {
        }
        if (inputStates.mousePos) {
        }
        if (inputStates.mousedown) {
            //monster.speed = 500;
        } else {
            // mouse up
            //monster.speed = 100;
        }

        // Compute the incX and inY in pixels depending
        // on the time elapsed since last redraw
        newX = monster.x + calcDistanceToMove(delta, monster.speedX);
        newY = monster.y + calcDistanceToMove(delta, monster.speedY);

        if (!(newX < 0) && !(newX + monster.width + 10 > canvas.width)) {
            monster.x = newX;
        }
        if (!(newY < 0) && !(newY + monster.height > canvas.height)) {
            monster.y = newY;
        }
    }

    function updateBalls(delta) {
        // Move and draw each ball, test collisions,
        for (var i = 0; i < ballArray.length; i++) {
            var ball = ballArray[i];

            // 1) move the ball
            ball.move();

            // 2) test if the ball collides with a wall
            testCollisionWithWalls(ball, w, h);

            // Test if the monster collides
            if (circRectsOverlap(monster.x, monster.y,
                    monster.width, monster.height,
                    ball.x, ball.y, ball.radius)) {

                if(ball.color == TARGETAREACOLOR()) {
                    remainingTargetTime -= delta;
                } else {
                    //change the color of the ball
                    ball.color = 'red';
                    monster.dead = true;
                    // Here, a sound effect greatly improves
                    // the experience!
                    plopSound.play();
                }
            }

            if (ball.type == ENEMYBALLTYPE()) {
                ctx.drawImage(enemyBallImage, ball.x-15, ball.y-15, 112*0.26, 119*0.26);
            } else if (ball.type == TARGETAREATYPE()) {
                ctx.drawImage(targetAreaImage, ball.x-15, ball.y-15, 179*0.140, 281*0.140);
            }

            //var enemyBallImage = document.createElement('../'); // use DOM HTMLImageElement
            //enemyBallImage.src = 'image2.jpg'
            //ctx.drawImage(new Image('../sprites/EnemyBall.png'), ball.x, ball.y)
        }
    }

    function createBalls(numberOfBalls) {
        // Start from an empty array
        ballArray = [];
        ballArray[0] = targetArea;

        for (var i = 0; i < numberOfBalls; i++) {
            // Create a ball with random position and speed. 
            // You can change the radius
            var ball = new Ball(w * Math.random(),
                    h * Math.random(),
                    (2 * Math.PI) * Math.random(),
                    (50 * Math.random() + 50),
                    30,
                    ENEMYBALLCOLOR(),
                    ENEMYBALLTYPE());

            // Do not create a ball on the player. We augmented the ball radius 
            // to sure the ball is created far from the monster. 
            if (!circRectsOverlap(monster.x, monster.y,
                    monster.width, monster.height,
                    ball.x, ball.y, ball.radius * 3)) {
                // Add it to the array
                ballArray[i+1] = ball;
            } else {
                i--;
            }
        }
    }

    function loadAssets(callback) {
        // here we should load the souds, the sprite sheets etc.
        // then at the end call the callback function

        // simple example that loads a sound and then calls the callback. We used the howler.js WebAudio lib here.
        // Load sounds asynchronously using howler.js
        plopSound = new Howl({
            urls: ['http://mainline.i3s.unice.fr/mooc/plop.mp3'],
            autoplay: false,
            volume: 1,
            onload: function () {
                //console.log("all sounds loaded");
                // We're done!
                callback();
            }
        });
    }
    var start = function () {
        initFPSCounter();


        // Canvas, context etc.
        canvas = document.querySelector("#myCanvas");

        // often useful
        w = canvas.width;
        h = canvas.height;

        targetArea = new Ball(w * Math.random(),
            h * Math.random(),
            (2 * Math.PI) * Math.random(),
            (50+currentLevel*25),
            30,
            TARGETAREACOLOR(),
            TARGETAREATYPE());

        // important, we will draw with this object
        ctx = canvas.getContext('2d');
        // default police for text
        ctx.font = "20px Arial";

        // Create the different key and mouse listeners
        addListeners(inputStates, canvas);

        // We create tge balls: try to change the parameter
        createBalls(nbBalls);

        loadAssets(function () {
            // all assets (images, sounds) loaded, we can start the animation
            requestAnimationFrame(mainLoop);
        });
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};

