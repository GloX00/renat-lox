const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const gameOverMenu = document.getElementById("gameOver");
const winMenu = document.createElement("div");

winMenu.classList.add("menu", "hidden");
winMenu.innerHTML = `<h2>Победа! Ну ты и лох 😂</h2><button onclick="restartGame()">Играть снова</button>`;
document.body.appendChild(winMenu);

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let player, bonuses, mobs, shields, level, isGameOver, lives;
let keys = {};
const MAX_LEVEL = 10;

function startGame() {
    menu.classList.add("hidden");
    canvas.classList.remove("hidden");
    gameOverMenu.classList.add("hidden");
    winMenu.classList.add("hidden");

    level = 1;
    lives = 3;
    isGameOver = false;

    player = { x: canvas.width / 2, y: canvas.height / 2, size: 30, speed: 4, shield: false };
    bonuses = [];
    mobs = [];
    shields = [];

    generateBonuses();
    generateMobs();
    generateShields();
    gameLoop();
}

function restartGame() {
    startGame();
}

let joystick = document.getElementById("joystick");
let startX, startY;
let playerVelocityX = 0;
let playerVelocityY = 0;

joystick.addEventListener("touchstart", function (e) {
    let touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
});

joystick.addEventListener("touchmove", function (e) {
    let touch = e.touches[0];
    let dx = touch.clientX - startX;
    let dy = touch.clientY - startY;
    
    let angle = Math.atan2(dy, dx);
    let distance = Math.min(50, Math.sqrt(dx * dx + dy * dy));
    let moveX = Math.cos(angle) * distance;
    let moveY = Math.sin(angle) * distance;
    
    joystick.style.transform = `translate(${moveX}px, ${moveY}px)`;
    
    playerVelocityX = (moveX / 50) * player.speed;
    playerVelocityY = (moveY / 50) * player.speed;
});

joystick.addEventListener("touchend", function () {
    joystick.style.transform = "translate(0px, 0px)";
    playerVelocityX = 0;
    playerVelocityY = 0;
});

function gameLoop() {
    if (isGameOver) return;

    player.x += playerVelocityX;
    player.y += playerVelocityY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = player.shield ? "cyan" : "blue";
    ctx.fillRect(player.x, player.y, player.size, player.size);
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
