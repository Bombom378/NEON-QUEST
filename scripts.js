// ================================
// NEON QUEST
// A browser game made with
// HTML + CSS + JavaScript
// ================================


// CANVAS

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// UI

const scoreDisplay = document.getElementById("score");
const energyDisplay = document.getElementById("energy");
const comboDisplay = document.getElementById("combo");
const livesDisplay = document.getElementById("lives");
const timeDisplay = document.getElementById("time");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const pauseScreen = document.getElementById("pauseScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

const soundBtn = document.getElementById("soundBtn");

const finalScore = document.getElementById("finalScore");
const highScoreMessage = document.getElementById("highScoreMessage");


// GAME SETTINGS

let gameRunning = false;
let paused = false;
let soundOn = true;

let score = 0;
let energy = 0;
let combo = 0;
let lives = 3;

let timeLeft = 60;

let highScore =
    Number(localStorage.getItem("neonQuestHighScore")) || 0;


// PLAYER

const player = {

    x: 0,

    y: 0,

    size: 22,

    speed: 5,

    color: "#00eaff"

};


// OBJECTS

let orbs = [];
let meteors = [];
let particles = [];


// KEYBOARD

const keys = {};


// Resize canvas

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    player.x = Math.min(
        player.x || canvas.width / 2,
        canvas.width - player.size
    );

    player.y = Math.min(
        player.y || canvas.height / 2,
        canvas.height - player.size
    );
}

window.addEventListener("resize", resizeCanvas);


// ================================
// KEYBOARD CONTROLS
// ================================

document.addEventListener("keydown", function(event) {

    keys[event.key] = true;

    if (
        [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            " "
        ].includes(event.key)
    ) {
        event.preventDefault();
    }

});


document.addEventListener("keyup", function(event) {

    keys[event.key] = false;

});


// ================================
// RANDOM NUMBER
// ================================

function random(min, max) {

    return Math.random() * (max - min) + min;

}


// ================================
// CREATE ENERGY ORB
// ================================

function createOrb() {

    orbs.push({

        x: random(30, canvas.width - 30),

        y: random(30, canvas.height - 30),

        radius: 9,

        pulse: random(0, Math.PI * 2)

    });

}


// ================================
// CREATE METEOR
// ================================

function createMeteor() {

    meteors.push({

        x: random(0, canvas.width),

        y: -30,

        radius: random(12, 22),

        speed: random(2, 4) + score / 5000,

        angle: random(0, Math.PI * 2)

    });

}


// ================================
// PARTICLES
// ================================

function createParticles(x, y) {

    for (let i = 0; i < 15; i++) {

        particles.push({

            x: x,

            y: y,

            dx: random(-3, 3),

            dy: random(-3, 3),

            life: 1

        });

    }

}


// ================================
// COLLISION
// ================================

function distance(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);

}


// ================================
// UPDATE PLAYER
// ================================

function updatePlayer() {

    if (
        keys["ArrowUp"] ||
        keys["w"] ||
        keys["W"]
    ) {
        player.y -= player.speed;
    }

    if (
        keys["ArrowDown"] ||
        keys["s"] ||
        keys["S"]
    ) {
        player.y += player.speed;
    }

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {
        player.x -= player.speed;
    }

    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {
        player.x += player.speed;
    }


    // Keep player inside canvas

    player.x = Math.max(
        player.size,
        Math.min(
            canvas.width - player.size,
            player.x
        )
    );

    player.y = Math.max(
        player.size,
        Math.min(
            canvas.height - player.size,
            player.y
        )
    );

}


// ================================
// UPDATE ORBS
// ================================

function updateOrbs() {

    for (let i = orbs.length - 1; i >= 0; i--) {

        const orb = orbs[i];

        orb.pulse += 0.08;


        if (
            distance(
                { x: player.x, y: player.y },
                orb
            ) <
            player.size + orb.radius
        ) {

            energy++;

            combo++;

            score += 10 + combo * 2;

            createParticles(
                orb.x,
                orb.y
            );

            orbs.splice(i, 1);

            createOrb();

        }

    }

}


// ================================
// UPDATE METEORS
// ================================

function updateMeteors() {

    for (
        let i = meteors.length - 1;
        i >= 0;
        i--
    ) {

        const meteor = meteors[i];

        meteor.y += meteor.speed;

        meteor.x += Math.sin(meteor.y / 40) * 0.5;


        // Collision with player

        if (
            distance(
                { x: player.x, y: player.y },
                meteor
            ) <
            player.size + meteor.radius
        ) {

            lives--;

            combo = 0;

            createParticles(
                player.x,
                player.y
            );

            meteors.splice(i, 1);

            if (lives <= 0) {

                endGame();

                return;

            }

            continue;

        }


        // Remove meteor outside screen

        if (meteor.y > canvas.height + 50) {

            meteors.splice(i, 1);

        }

    }

}


// ================================
// UPDATE PARTICLES
// ================================

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p = particles[i];

        p.x += p.dx;
        p.y += p.dy;

        p.life -= 0.025;


        if (p.life <= 0) {

            particles.splice(i, 1);

        }

    }

}


// ================================
// DRAW BACKGROUND
// ================================

function drawBackground() {

    ctx.fillStyle = "#030612";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Grid

    ctx.strokeStyle =
        "rgba(0,234,255,0.05)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, canvas.height);

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(canvas.width, y);

        ctx.stroke();

    }

}


// ================================
// DRAW PLAYER
// ================================

function drawPlayer() {

    ctx.save();

    ctx.shadowBlur = 25;

    ctx.shadowColor = "#00eaff";

    ctx.fillStyle = "#00eaff";


    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.size,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Core

    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


// ================================
// DRAW ORBS
// ================================

function drawOrbs() {

    orbs.forEach(function(orb) {

        const size =
            orb.radius +
            Math.sin(orb.pulse) * 2;


        ctx.save();

        ctx.shadowBlur = 20;

        ctx.shadowColor = "#38ff88";

        ctx.fillStyle = "#38ff88";


        ctx.beginPath();

        ctx.arc(
            orb.x,
            orb.y,
            size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    });

}


// ================================
// DRAW METEORS
// ================================

function drawMeteors() {

    meteors.forEach(function(meteor) {

        ctx.save();

        ctx.shadowBlur = 15;

        ctx.shadowColor = "#ff2b6d";

        ctx.fillStyle = "#ff2b6d";


        ctx.beginPath();

        ctx.arc(
            meteor.x,
            meteor.y,
            meteor.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    });

}


// ================================
// DRAW PARTICLES
// ================================

function drawParticles() {

    particles.forEach(function(p) {

        ctx.save();

        ctx.globalAlpha = p.life;

        ctx.fillStyle = "#00eaff";


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    });

}


// ================================
// UPDATE SCREEN
// ================================

function updateUI() {

    scoreDisplay.textContent = score;

    energyDisplay.textContent = energy;

    comboDisplay.textContent = combo;

    livesDisplay.textContent = lives;

    timeDisplay.textContent = timeLeft;

}


// ================================
// GAME LOOP
// ================================

function gameLoop() {

    drawBackground();

    drawOrbs();

    drawMeteors();

    drawParticles();

    drawPlayer();


    if (gameRunning && !paused) {

        updatePlayer();

        updateOrbs();

        updateMeteors();

        updateParticles();

        updateUI();

    }


    requestAnimationFrame(gameLoop);

}


// ================================
// START GAME
// ================================

function startGame() {

    score = 0;

    energy = 0;

    combo = 0;

    lives = 3;

    timeLeft = 60;

    orbs = [];

    meteors = [];

    particles = [];


    player.x = canvas.width / 2;

    player.y = canvas.height / 2;


    for (let i = 0; i < 5; i++) {

        createOrb();

    }


    gameRunning = true;

    paused = false;


    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    pauseScreen.classList.add("hidden");


    pauseBtn.textContent = "⏸ Pause";

    updateUI();

}


// ================================
// END GAME
// ================================

function endGame() {

    gameRunning = false;

    paused = false;


    finalScore.textContent = score;


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "neonQuestHighScore",
            highScore
        );

        highScoreMessage.textContent =
            "🏆 NEW HIGH SCORE!";

    } else {

        highScoreMessage.textContent =
            "Your best score: " + highScore;

    }


    gameOverScreen.classList.remove("hidden");

}


// ================================
// PAUSE
// ================================

function togglePause() {

    if (!gameRunning) {
        return;
    }


    paused = !paused;


    if (paused) {

        pauseScreen.classList.remove("hidden");

        pauseBtn.textContent = "▶ Resume";

    } else {

        pauseScreen.classList.add("hidden");

        pauseBtn.textContent = "⏸ Pause";

    }

}


// ================================
// TIMER
// ================================

setInterval(function() {

    if (gameRunning && !paused) {

        timeLeft--;

        updateUI();


        if (timeLeft <= 0) {

            endGame();

        }

    }

}, 1000);


// ================================
// DIFFICULTY
// ================================

setInterval(function() {

    if (gameRunning && !paused) {

        createMeteor();

    }

}, 900);


// ================================
// BUTTON EVENTS
// ================================

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);

pauseBtn.addEventListener(
    "click",
    togglePause
);

resumeBtn.addEventListener(
    "click",
    togglePause
);


// ================================
// SOUND BUTTON
// ================================

soundBtn.addEventListener(
    "click",
    function() {

        soundOn = !soundOn;

        if (soundOn) {

            soundBtn.textContent = "🔊 Sound";

        } else {

            soundBtn.textContent = "🔇 Muted";

        }

    }
);


// ================================
// MOBILE CONTROLS
// ================================

const mobileButtons =
    document.querySelectorAll(
        ".mobile-controls button"
    );


mobileButtons.forEach(function(button) {

    const key = button.dataset.key;


    button.addEventListener(
        "touchstart",
        function(event) {

            event.preventDefault();

            keys[key] = true;

        }
    );


    button.addEventListener(
        "touchend",
        function(event) {

            event.preventDefault();

            keys[key] = false;

        }
    );


    button.addEventListener(
        "mousedown",
        function() {

            keys[key] = true;

        }
    );


    button.addEventListener(
        "mouseup",
        function() {

            keys[key] = false;

        }
    );

});


// ================================
// INITIALIZE
// ================================

resizeCanvas();

player.x = canvas.width / 2;
player.y = canvas.height / 2;

updateUI();

gameLoop();
 
