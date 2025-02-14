const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const gameOverMenu = document.getElementById("gameOver");
const winMenu = document.createElement("div");

winMenu.classList.add("menu", "hidden");
winMenu.innerHTML = `<h2>Победа! Ну ты и лох 😂</h2><button onclick="restartGame()" style="font-size: 14px; padding: 5px 10px;">Играть снова</button>`;
document.body.appendChild(winMenu);

// Масштабирование под телефон
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player, bonuses, mobs, shields, level, isGameOver, lives;
let keys = {};
let touchActive = false;
let touchX = null, touchY = null; // Координаты касания

const MAX_LEVEL = 10;

// Джойстик (увеличен на 35%)
const joystick = {
    x: canvas.width / 2, // Центрируем по горизонтали
    y: canvas.height - 150, // Опускаем джойстик чуть выше нижней части экрана
    radius: 27, // Увеличиваем внешний радиус джойстика на 35%
    innerRadius: 16, // Увеличиваем внутренний радиус джойстика на 35%
    touchX: null,
    touchY: null,
    isMoving: false
};

// Экран с правилами игры
const rulesScreen = document.createElement("div");
rulesScreen.classList.add("menu");
rulesScreen.innerHTML = `
    <h2>Правила игры:</h2>
    <p>Синий персонаж — это ты</p>
    <p>Синий квадрат — это щит</p>
    <p>Красный квадрат — это враг</p>
    <p>У тебя есть 3 жизни</p>
    <p>В игре 10 уровней</p>
`;
document.body.appendChild(rulesScreen);

function startGame() {
    rulesScreen.classList.add("hidden"); // Скрыть экран с правилами
    menu.classList.add("hidden");
    canvas.classList.remove("hidden");
    gameOverMenu.classList.add("hidden");
    winMenu.classList.add("hidden");

    level = 1;
    lives = 3;
    isGameOver = false;

    // Увеличили скорость персонажа на 60%
    player = { x: canvas.width / 2, y: canvas.height / 2, size: 30, speed: 9, shield: false }; // 7.84 * 1.6
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
            speedX: (Math.random() - 0.5) * 10, // Ускорим мобов
            speedY: (Math.random() - 0.5) * 10
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
    drawJoystick();
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

// Двигаем игрока с помощью джойстика
function movePlayer() {
    if (joystick.isMoving && joystick.touchX !== null && joystick.touchY !== null) {
        let dx = joystick.touchX - joystick.x;
        let dy = joystick.touchY - joystick.y;
        let length = Math.sqrt(dx * dx + dy * dy);

        if (length > joystick.innerRadius) {
            dx = (dx / length) * joystick.innerRadius;
            dy = (dy / length) * joystick.innerRadius;
        }

        // Двигаем игрока в сторону джойстика
        player.x += dx / 8;  // Уменьшил на 2 (для более быстрой реакции)
        player.y += dy / 8;
    }

    // Проверка на выход за пределы экрана
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
}

// Рисуем джойстик
function drawJoystick() {
    ctx.beginPath();
    ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();

    if (joystick.isMoving) {
        ctx.beginPath();
        ctx.arc(joystick.touchX, joystick.touchY, joystick.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
    }
}

// Обработчик событий для касания
canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    const dist = Math.sqrt(Math.pow(touch.clientX - joystick.x, 2) + Math.pow(touch.clientY - joystick.y, 2));

    if (dist <= joystick.radius) {
        joystick.touchX = touch.clientX;
        joystick.touchY = touch.clientY;
        joystick.isMoving = true;
    }
});

canvas.addEventListener("touchmove", (event) => {
    if (joystick.isMoving) {
        const touch = event.touches[0];
        joystick.touchX = touch.clientX;
        joystick.touchY = touch.clientY;
    }
});

canvas.addEventListener("touchend", () => {
    joystick.isMoving = false;
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
