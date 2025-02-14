const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const gameOverMenu = document.getElementById("gameOver");
const winMenu = document.createElement("div");

winMenu.classList.add("menu", "hidden");
winMenu.innerHTML = `<h2>Победа! Ну ты и лох 😂</h2><button onclick="restartGame()">Играть снова</button>`;
document.body.appendChild(winMenu);

// Масштабирование под телефон
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let player, bonuses, mobs, shields, level, isGameOver, lives;
let keys = {};
let touchActive = false;
let touchX = null, touchY = null; // Координаты касания

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

function generateBonuses() {
    bonuses = [];
    for (let i = 0; i < level * 2; i++) {
        bonuses.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 20
        });
    }
}

function generateMobs() {
    mobs = [];
    for (let i = 0; i < level; i++) {
        mobs.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 30,
            speedX: (Math.random() - 0.5) * 3,
            speedY: (Math.random() - 0.5) * 3
        });
    }
}

function generateShields() {
    shields = [];
    for (let i = 0; i < 1; i++) {
        shields.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 30
        });
    }
}

function gameLoop() {
    if (isGameOver) return;

    movePlayer();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем игрока
    ctx.fillStyle = player.shield ? "cyan" : "blue";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Рисуем бонусы
    bonuses.forEach((bonus, index) => {
        ctx.fillStyle = "green";
        ctx.fillRect(bonus.x, bonus.y, bonus.size, bonus.size);

        if (isColliding(player, bonus)) {
            bonuses.splice(index, 1);
        }
    });

    // Рисуем щиты
    shields.forEach((shield, index) => {
        ctx.fillStyle = "blue";
        ctx.fillRect(shield.x, shield.y, shield.size, shield.size);

        if (isColliding(player, shield)) {
            player.shield = true;
            shields.splice(index, 1);
        }
    });

    // Двигаем мобов и рисуем их
    mobs.forEach((mob, index) => {
        mob.x += mob.speedX;
        mob.y += mob.speedY;

        if (mob.x < 0 || mob.x + mob.size > canvas.width) mob.speedX *= -1;
        if (mob.y < 0 || mob.y + mob.size > canvas.height) mob.speedY *= -1;

        ctx.fillStyle = "red";
        ctx.fillRect(mob.x, mob.y, mob.size, mob.size);

        // Проверка столкновения с мобом
        if (isColliding(player, mob)) {
            if (player.shield) {
                player.shield = false;
            } else {
                lives--;
                if (lives <= 0) {
                    gameOver();
                    return;
                }
            }
            mobs.splice(index, 1);
        }
    });

    // Если все бонусы собраны
    if (bonuses.length === 0) {
        if (level === MAX_LEVEL) {
            winGame();
            return;
        }
        level++;
        generateBonuses();
        generateMobs();
        generateShields();
    }

    drawLives();
    drawLevel();
    requestAnimationFrame(gameLoop);
}

// Проверка столкновения
function isColliding(a, b) {
    return (
        a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y
    );
}

// Рисуем жизни
function drawLives() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Жизни: " + lives, 10, 20);
}

// Рисуем уровень
function drawLevel() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Уровень: " + level, canvas.width - 120, 20);
}

// Двигаем игрока (исправлено касание!)
function movePlayer() {
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    if (touchActive && touchX !== null && touchY !== null) {
        let dx = touchX - (player.x + player.size / 2);
        let dy = touchY - (player.y + player.size / 2);
        let length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 10) {
            player.x += (dx / length) * player.speed;
            player.y += (dy / length) * player.speed;
        }
    }
}

// Функции касания (исправлено)
canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
    touchActive = true;
});

canvas.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
});

canvas.addEventListener("touchend", () => {
    touchActive = false;
});

// Функции клавиатуры
document.addEventListener("keydown", (event) => keys[event.key] = true);
document.addEventListener("keyup", (event) => keys[event.key] = false);

function gameOver() {
    isGameOver = true;
    gameOverMenu.classList.remove("hidden");
    canvas.classList.add("hidden");
}

function winGame() {
    isGameOver = true;
    winMenu.classList.remove("hidden");
    canvas.classList.add("hidden");
}
