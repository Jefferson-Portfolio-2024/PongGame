// variables go here
let startGame = false;
let rad, ballCol, x_dir, y_dir, x, y, ballSpeed, paddleHeight, opPaddleHeight;
let paddlex_loc1, paddlex_loc2, paddle1_col, paddle2_col, soothing;
let customFont, maxMovePerFrame;
let paddle2y = 0;
// for the sounds
let gameWon, gameLost, ambience, hit;

// parameters for the tweakpane
const PARAMS = {
    //create a deafult difficulty
    Difficulty: 'Normal',
    ballColor: 'rgb(130, 50, 100)',
    Paddle_1_Color: 'rgb(200, 150, 30)',
    Paddle_2_Color: 'rgb(100, 120, 10)',
};

//make a tweakpane
window.onload =  function()
{
    const pane = new Tweakpane.Pane(
        {
            title: "Settings",
            expanded: true,
        }
    );
    // add the difficulty 
    pane.addInput(PARAMS, 'Difficulty', {
        options: {
            // list of the difficulties which will effect how hard the game is
            Easy: 'Easy',
            Normal: "Normal",
            Hard: "Hard"
        },
    }).on('change', (value) => 
    {
        adjustDifficulty(value);
        if(startGame)
        {
            setup();
            startGame = false;
        }
    });
    // add the ability to change the ball color
    pane.addInput(PARAMS, 'ballColor').on('change', (value) =>{
        ballCol = value;
    });
    // add the ability to change the paddle colors
    pane.addInput(PARAMS, 'Paddle_1_Color').on('change', (value) => {
        paddle1_col = value;
    });
    pane.addInput(PARAMS, 'Paddle_2_Color').on('change', (value) => {
        paddle2_col = value;
    });

};

// load everything I need
function preload()
{
    // get a custom font
    customFont = loadFont("PixeloidSansBold-PKnYd.ttf");
    gameWon = loadSound("270319__littlerobotsoundfactory__jingle_win_01.wav");
    gameLost = loadSound("533034__evretro__8-bit-game-over-soundtune.wav");
    ambience = loadSound("435782__shiftkun__8bit_chase_music-loop.wav");
    hit = loadSound("527527__jerimee__bright-bounce.wav");
}

// difficulty will change the speed of the ball and the height
// of the player's paddle
function adjustDifficulty(value)
{
    switch(value)
    {
        case 'Easy':
            ballSpeed = 5;
            paddleHeight = 600;
            opPaddleHeight = 100;
            soothing = 1.7;
            maxMovePerFrame = 5;
            break;
        case 'Normal':
            ballSpeed = 8;
            paddleHeight = 100;
            opPaddleHeight = 100;
            soothing = 1.0;
            maxMovePerFrame = 15;
            break;
        case 'Hard':
            ballSpeed = 12;
            paddleHeight = 50;
            opPaddleHeight = 200;
            soothing = 0.5;
            maxMovePerFrame = 25;
            break;
    }
}



// set everything up that will not chnage (color will)
function setup()
{
    frameRate(60);
    createCanvas(windowWidth, windowHeight);
    textFont(customFont, 32);
    ambience.playMode("sustain");
    gameWon.playMode('restart');
    gameLost.playMode("restart");
    hit.playMode('restart');
    // color of the background
    bg = color(0, 0, 0);
    // radius
    rad = 6;
    // starting positions
    x = windowWidth / 2;   
    y = windowHeight / 2;
    paddlex_loc1 = Math.floor(windowWidth / 10);
    paddlex_loc2 = Math.floor(windowWidth - (windowWidth / 9));
    // the ball will move to randomly
    x_dir = random([-1, 1]);
    y_dir = random([-1, 1]);
    adjustDifficulty(PARAMS.Difficulty);
}

function draw()
{
    background(bg);
    if(!startGame)
    {
        fill(255);
        textAlign(CENTER, CENTER);
        text("Press any key to begin!!!", width / 2, height / 2);
        ambience.stop();
    }
    else
    {
        playPong();
    }
}

function keyPressed()
{
    startGame = true;
    ambience.play();
    // reset the game at will 
    if((key === 'r' || key === 'R') && startGame)
    {
        resetGame();
    }
}

// if reset is hit during the game do this
function resetGame()
{
    startGame = false
    setup();
    loop();
}

function playPong()
{
    // get the colors from the tweak pane
    ballCol = PARAMS.ballColor
    paddle1_col = PARAMS.Paddle_1_Color;
    paddle2_col = PARAMS.Paddle_2_Color;
    // the mouse position will be right on the center of the rectangle
    let paddley = mouseY - paddleHeight / 2;
    // this lets the oposing paddle move
    let targetY = y - opPaddleHeight / 2;
    // this will move it arroding to the difficulty
    //let paddle2y = y - opPaddleHeight / 2 + (targetY - (y - opPaddleHeight / 2)) * soothing;
    // the distance the 2nd paddle needs to move
    let distanceToMove = targetY - paddle2y;
    // constarain that movement
    distanceToMove = constrain(distanceToMove, -maxMovePerFrame, maxMovePerFrame);
    paddle2y += distanceToMove;
    // this will constrain the paddle within the bounds of the screen
    paddle2y = constrain(paddle2y, 0, windowHeight - opPaddleHeight);
    // this will contrain the paddle from leaving the screen
    paddley = constrain(paddley, 0, windowHeight - paddleHeight);
    // create the paddles and the ball
    fill(paddle1_col);
    rect(paddlex_loc1, paddley, 10, paddleHeight);
    
    fill(paddle2_col);
    rect(paddlex_loc2, paddle2y, 10, opPaddleHeight);
    
    fill(ballCol)
    // the ball moves
    x += x_dir * ballSpeed;
    y += y_dir * ballSpeed;
    ellipse(x, y, rad*2, rad*2);
    // bounds detection
    if(x - rad <= 0 || x + rad >= windowWidth)
    {
        x_dir *= -1;
    }
    if(y - rad <= 0 || y + rad >= windowHeight)
    {
        y_dir *= -1;
    }
    // paddle collison detection
    if(x + rad >= paddlex_loc1 && x - rad <= paddlex_loc1 + 10 && y >=  paddley && y <= paddley + paddleHeight)
    {
        // this will cause a bounce to the right
        x_dir = 1;
        let rel_hit = (y - (paddley + paddleHeight / 2)) / (paddleHeight / 2);
        // this makes the way in which the ball bounces random from the point of contact
        y_dir = rel_hit * random(0.8, 2);
        // the ball will get faster
        ballSpeed += 0.2;
        hit.play();
    }
    if(x - rad <= paddlex_loc2 + 10 && x + rad >= paddlex_loc2 && y + rad >= paddle2y && y - rad <= paddle2y + opPaddleHeight)
    {
        // there was a collision with the oposing paddle
        x_dir = -1;
        let rel_hit = (y - (y - opPaddleHeight / 2 + opPaddleHeight / 2)) / (opPaddleHeight / 2);
        y_dir = rel_hit * random(0.8, 2);
        // the ball will get faster
        ballSpeed += 0.2;
        hit.play();
    }
    // The ball crosses over the paddle resulting in either a win or a lose
    if(x - rad < 0)
    {
        ambience.stop();
        gameLost.play();
        gameOver("CPU Wins!!!\n (Press \'R\' to restart)");
    }
    if(x + rad > windowWidth)
    {
        ambience.stop();
        youWin("You Win!!!\n (Press \'R\' to restart)");
        gameWon.play();
    }
}

function gameOver(loseText)
{
    textFont(customFont, 32);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text(loseText, width / 2, height / 2);
    noLoop();
}

function youWin(winText)
{
    textFont(customFont, 32);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text(winText, width / 2, height / 2);
    noLoop();
}