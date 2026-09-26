<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<title>Neon Battle</title>

<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
}

body {
    overflow: hidden;
    background: #02030a;
    font-family: Arial, sans-serif;
}

canvas {
    display: block;
    width: 100vw;
    height: 100vh;
}

/* GAME UI */

#ui {
    position: fixed;
    top: 15px;
    left: 18px;
    right: 18px;

    display: flex;
    justify-content: space-between;

    color: white;
    font-size: 20px;
    font-weight: bold;

    text-shadow: 0 0 12px #00eaff;
    pointer-events: none;
}

/* START SCREEN */

#message {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    background: rgba(0,0,0,.65);
    color: white;
    text-align: center;
}

#message h1 {
    font-size: clamp(40px, 9vw, 85px);
    color: #00eaff;

    text-shadow:
        0 0 10px #00eaff,
        0 0 30px #0088ff,
        0 0 60px #0044ff;
}

#message p {
    margin-top: 15px;
    font-size: 17px;
}

#startButton {
    margin-top: 25px;

    padding: 14px 40px;

    border: 2px solid #00eaff;
    border-radius: 30px;

    background: transparent;
    color: white;

    font-size: 18px;

    box-shadow: 0 0 20px #00eaff;
}

/* MOBILE CONTROLS */

#mobileControls {
    display: none;

    position: fixed;
    inset: 0;

    pointer-events: none;
}

/* Joystick */

#joystick {
    position: absolute;
    bottom: 30px;
    left: 25px;

    width: 150px;
    height: 150px;

    border-radius: 50%;

    background: rgba(0, 220, 255, .12);
    border: 2px solid rgba(0, 234, 255, .5);

    pointer-events: auto;
}

#joystickKnob {
    position: absolute;

    width: 65px;
    height: 65px;

    left: 42px;
    top: 42px;

    border-radius: 50%;

    background: rgba(0, 234, 255, .65);

    box-shadow:
        0 0 15px #00eaff,
        inset 0 0 15px #ffffff;
}

/* Buttons */

.mobileButton {
    position: absolute;

    width: 78px;
    height: 78px;

    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    color: white;
    font-weight: bold;
    font-size: 14px;

    background: rgba(20, 30, 70, .75);

    border: 2px solid #00eaff;

    box-shadow:
        0 0 15px rgba(0,234,255,.7);

    pointer-events: auto;
}

#jumpButton {
    right: 125px;
    bottom: 45px;
}

#shootButton {
    right: 25px;
    bottom: 105px;

    width: 95px;
    height: 95px;

    border-color: #ff2bd6;

    box-shadow:
        0 0 20px rgba(255,43,214,.8);
}

@media (max-width: 800px) {
    #mobileControls {
        display: block;
    }

    #ui {
        font-size: 16px;
    }

    #message p {
        max-width: 90%;
    }
}
</style>
</head>

<body>

<canvas id="game"></canvas>

<div id="ui">
    <div>⭐ Score: <span id="score">0</span></div>
    <div>❤️ Health: <span id="health">100</span></div>
</div>

<div id="message">
    <h1>NEON BATTLE</h1>

    <p>
        W = Forward &nbsp; S = Backward<br>
        A = Left &nbsp; D = Right<br>
        SPACE = Jump &nbsp; Mouse Left Click = Shoot
    </p>

    <button id="startButton">START GAME</button>
</div>


<!-- MOBILE CONTROLS -->

<div id="mobileControls">

    <div id="joystick">
        <div id="joystickKnob"></div>
    </div>

    <div id="jumpButton" class="mobileButton">
        JUMP
    </div>

    <div id="shootButton" class="mobileButton">
        SHOOT
    </div>

</div>


<script>

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);


/* =========================
   GAME VARIABLES
========================= */

let gameRunning = false;

let score = 0;
let health = 100;

let bullets = [];
let enemies = [];
let particles = [];
let stars = [];

let enemyTimer = 0;


/* =========================
   KEYBOARD
========================= */

const keys = {};

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (e.code === "Space") {

        e.preventDefault();

        keys.space = true;
    }

});

window.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;

    if (e.code === "Space") {
        keys.space = false;
    }

});


/* =========================
   MOUSE SHOOTING
========================= */

let mouseShooting = false;

canvas.addEventListener("mousedown", e => {

    if (e.button === 0) {
        mouseShooting = true;
    }

});

window.addEventListener("mouseup", e => {

    if (e.button === 0) {
        mouseShooting = false;
    }

});


/* =========================
   PLAYER
========================= */

const player = {

    x: 0,
    y: 0,

    speed: 6,

    cooldown: 0,

    jumping: false,

    jumpHeight: 0,

    jumpVelocity: 0

};


/* =========================
   STARS
========================= */

for (let i = 0; i < 200; i++) {

    stars.push({

        x: Math.random(),

        y: Math.random(),

        size: Math.random() * 2 + .5,

        speed: Math.random() * .8 + .2

    });

}


/* =========================
   START GAME
========================= */

document.getElementById("startButton").onclick = startGame;

function startGame() {

    gameRunning = true;

    score = 0;
    health = 100;

    bullets = [];
    enemies = [];
    particles = [];

    player.x = W / 2;
    player.y = H - 120;

    player.jumping = false;
    player.jumpHeight = 0;
    player.jumpVelocity = 0;

    document.getElementById("message").style.display = "none";

    updateUI();
}


/* =========================
   GAME OVER
========================= */

function gameOver() {

    gameRunning = false;

    document.getElementById("message").style.display = "flex";

    document.querySelector("#message h1").textContent =
        "GAME OVER";

    document.querySelector("#message p").textContent =
        "Your Score: " + score;

    document.getElementById("startButton").textContent =
        "PLAY AGAIN";
}


/* =========================
   UI
========================= */

function updateUI() {

    document.getElementById("score").textContent = score;

    document.getElementById("health").textContent = health;

}


/* =========================
   SHOOT
========================= */

function shoot() {

    if (player.cooldown > 0) return;

    bullets.push({

        x: player.x,

        y: player.y - 25,

        speed: 12

    });

    player.cooldown = 8;

}


/* =========================
   JUMP
========================= */

function jump() {

    if (player.jumping) return;

    player.jumping = true;

    player.jumpVelocity = 13;

}


/* =========================
   CREATE ENEMY
========================= */

function createEnemy() {

    enemies.push({

        x: Math.random() * (W - 80) + 40,

        y: -50,

        size: Math.random() * 18 + 22,

        speed: Math.random() * 2 + 1.5,

        rotation: Math.random() * Math.PI

    });

}


/* =========================
   EXPLOSION
========================= */

function explosion(x, y) {

    for (let i = 0; i < 25; i++) {

        particles.push({

            x: x,

            y: y,

            vx: (Math.random() - .5) * 9,

            vy: (Math.random() - .5) * 9,

            life: 1,

            size: Math.random() * 5 + 2

        });

    }

}


/* =========================
   UPDATE
========================= */

function update() {

    if (!gameRunning) return;


    /* MOVEMENT */

    if (keys.w) {
        player.y -= player.speed;
    }

    if (keys.s) {
        player.y += player.speed;
    }

    if (keys.a) {
        player.x -= player.speed;
    }

    if (keys.d) {
        player.x += player.speed;
    }


    /* MOBILE MOVEMENT */

    player.x += mobileMoveX * player.speed;
    player.y += mobileMoveY * player.speed;


    /* LIMIT PLAYER */

    player.x = Math.max(30, Math.min(W - 30, player.x));

    player.y = Math.max(50, Math.min(H - 40, player.y));


    /* JUMP */

    if (keys.space) {

        jump();

    }


    if (player.jumping) {

        player.jumpHeight += player.jumpVelocity;

        player.jumpVelocity -= .7;

        if (player.jumpHeight <= 0) {

            player.jumpHeight = 0;

            player.jumping = false;

            player.jumpVelocity = 0;

        }

    }


    /* SHOOT */

    if (mouseShooting || mobileShooting) {

        shoot();

    }


    if (player.cooldown > 0) {
        player.cooldown--;
    }


    /* BULLETS */

    bullets.forEach(b => {

        b.y -= b.speed;

    });

    bullets = bullets.filter(b => b.y > -30);


    /* ENEMIES */

    enemyTimer++;

    if (enemyTimer > 35) {

        createEnemy();

        enemyTimer = 0;

    }


    enemies.forEach(e => {

        e.y += e.speed;

        e.rotation += .03;

    });


    /* BULLET COLLISIONS */

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        for (let j = bullets.length - 1; j >= 0; j--) {

            const bullet = bullets[j];

            const dx = enemy.x - bullet.x;

            const dy = enemy.y - bullet.y;

            if (Math.hypot(dx, dy) < enemy.size) {

                explosion(enemy.x, enemy.y);

                enemies.splice(i, 1);

                bullets.splice(j, 1);

                score += 10;

                updateUI();

                break;

            }

        }

    }


    /* ENEMY / PLAYER COLLISION */

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        const distance =
            Math.hypot(
                enemy.x - player.x,
                enemy.y - player.y
            );


        if (
            distance < enemy.size + 25 &&
            !player.jumping
        ) {

            explosion(enemy.x, enemy.y);

            enemies.splice(i, 1);

            health -= 20;

            updateUI();

            if (health <= 0) {

                health = 0;

                updateUI();

                gameOver();

            }

        }


        /* Enemy escaped */

        if (enemy.y > H + 60) {

            enemies.splice(i, 1);

            health -= 5;

            updateUI();

            if (health <= 0) {

                health = 0;

                updateUI();

                gameOver();

            }

        }

    }


    /* PARTICLES */

    particles.forEach(p => {

        p.x += p.vx;

        p.y += p.vy;

        p.life -= .025;

    });

    particles = particles.filter(p => p.life > 0);

}


/* =========================
   BACKGROUND
========================= */

function drawBackground() {

    ctx.fillStyle = "#02030a";

    ctx.fillRect(0, 0, W, H);


    const gradient =
        ctx.createRadialGradient(
            W / 2,
            H / 2,
            20,
            W / 2,
            H / 2,
            H
        );


    gradient.addColorStop(0, "#102d5a");

    gradient.addColorStop(1, "#02030a");


    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, W, H);


    /* STARS */

    stars.forEach(s => {

        s.y += s.speed / 1000;

        if (s.y > 1) {
            s.y = 0;
        }

        ctx.globalAlpha =
            .3 + Math.random() * .7;

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            s.x * W,
            s.y * H,
            s.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    ctx.globalAlpha = 1;

}


/* =========================
   DRAW PLAYER
========================= */

function drawPlayer() {

    ctx.save();


    /*
       Jump creates a visual
       vertical effect.
    */

    ctx.translate(
        player.x,
        player.y - player.jumpHeight
    );


    /* Shadow */

    if (player.jumpHeight > 0) {

        ctx.globalAlpha = .25;

        ctx.fillStyle = "black";

        ctx.beginPath();

        ctx.ellipse(
            0,
            player.jumpHeight + 35,
            25,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;

    }


    /* Glow */

    ctx.shadowBlur = 30;

    ctx.shadowColor = "#00eaff";


    /* Ship */

    ctx.fillStyle = "#00eaff";

    ctx.beginPath();

    ctx.moveTo(0, -35);

    ctx.lineTo(28, 25);

    ctx.lineTo(0, 14);

    ctx.lineTo(-28, 25);

    ctx.closePath();

    ctx.fill();


    /* Cockpit */

    ctx.shadowBlur = 10;

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        0,
        -8,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Engine */

    ctx.fillStyle = "#ff2bd6";

    ctx.beginPath();

    ctx.moveTo(-9, 22);

    ctx.lineTo(
        0,
        45 + Math.random() * 12
    );

    ctx.lineTo(9, 22);

    ctx.closePath();

    ctx.fill();


    ctx.restore();

}


/* =========================
   DRAW BULLETS
========================= */

function drawBullets() {

    bullets.forEach(b => {

        ctx.save();

        ctx.shadowBlur = 20;

        ctx.shadowColor = "#00ffff";

        ctx.fillStyle = "white";

        ctx.fillRect(
            b.x - 3,
            b.y - 12,
            6,
            20
        );

        ctx.restore();

    });

}


/* =========================
   DRAW ENEMIES
========================= */

function drawEnemies() {

    enemies.forEach(e => {

        ctx.save();

        ctx.translate(e.x, e.y);

        ctx.rotate(e.rotation);

        ctx.shadowBlur = 25;

        ctx.shadowColor = "#ff2bd6";

        ctx.fillStyle = "#ff2bd6";


        ctx.beginPath();


        for (let i = 0; i < 6; i++) {

            const angle =
                i * Math.PI / 3;

            const radius =
                i % 2 === 0
                ? e.size
                : e.size * .45;


            ctx.lineTo(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            );

        }


        ctx.closePath();

        ctx.fill();

        ctx.restore();

    });

}


/* =========================
   DRAW PARTICLES
========================= */

function drawParticles() {

    particles.forEach(p => {

        ctx.globalAlpha = p.life;

        ctx.fillStyle = "#00eaff";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    ctx.globalAlpha = 1;

}


/* =========================
   MOBILE JOYSTICK
========================= */

let mobileMoveX = 0;
let mobileMoveY = 0;

const joystick =
    document.getElementById("joystick");

const knob =
    document.getElementById("joystickKnob");

let joystickActive = false;


function joystickMove(x, y) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;


    let dx = x - centerX;

    let dy = y - centerY;


    const maxDistance = 42;

    const distance =
        Math.hypot(dx, dy);


    if (distance > maxDistance) {

        dx =
            dx / distance *
            maxDistance;

        dy =
            dy / distance *
            maxDistance;

    }


    knob.style.transform =
        translate(${dx}px, ${dy}px);


    mobileMoveX = dx / maxDistance;

    mobileMoveY = dy / maxDistance;

}


function joystickEnd() {

    joystickActive = false;

    mobileMoveX = 0;
    mobileMoveY = 0;

    knob.style.transform =
        "translate(0px, 0px)";

}


joystick.addEventListener("touchstart", e => {

    joystickActive = true;

    const t = e.touches[0];

    joystickMove(
        t.clientX,
        t.clientY
    );

});


joystick.addEventListener("touchmove", e => {

    if (!joystickActive) return;

    const t = e.touches[0];

    joystickMove(
        t.clientX,
        t.clientY
    );

});


joystick.addEventListener(
    "touchend",
    joystickEnd
);


/* =========================
   MOBILE JUMP
========================= */

document
    .getElementById("jumpButton")
    .addEventListener("touchstart", e => {

        e.preventDefault();

        jump();

    });


/* =========================
   MOBILE SHOOT
========================= */

let mobileShooting = false;


const shootButton =
    document.getElementById("shootButton");


shootButton.addEventListener(
    "touchstart",
    e => {

        e.preventDefault();

        mobileShooting = true;

    }
);


shootButton.addEventListener(
    "touchend",
    e => {

        e.preventDefault();

        mobileShooting = false;

    }
);


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    update();

    drawBackground();

    if (gameRunning) {

        drawPlayer();

        drawBullets();

        drawEnemies();

        drawParticles();

    }

    requestAnimationFrame(gameLoop);

}


gameLoop();

</script>

</body>
</html>
