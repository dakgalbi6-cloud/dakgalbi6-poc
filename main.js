const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: '#00FF00',
    speed: 5,
    dx: 0,
    dy: 0
};

// Enemies
const enemies = [];

function spawnEnemy() {
    const size = Math.random() * 20 + 20; // Random size between 20 and 40
    let x, y;

    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - size : canvas.width + size;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - size : canvas.height + size;
    }

    const color = '#FF0000';
    const speed = 2;

    enemies.push({ x, y, size, color, speed });
}

// Drawing
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Updates
function newPos() {
    player.x += player.dx;
    player.y += player.dy;

    // Wall detection
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function updateEnemies() {
    enemies.forEach(enemy => {
        const angle = Math.atan2(player.y - (enemy.y - enemy.size / 2) + player.height/2, player.x - (enemy.x - enemy.size / 2) + player.width/2);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;

        // Collision with player
        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.height > enemy.y
        ) {
            console.log('Game Over!');
        }
    });
}

function update() {
    clear();
    drawPlayer();
    drawEnemies();
    newPos();
    updateEnemies();
    requestAnimationFrame(update);
}

// Player Movement
function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function moveRight() {
    player.dx = player.speed;
}

function keyDown(e) {
    const key = e.key.toLowerCase();
    if (key === 'arrowright' || key === 'd') moveRight();
    else if (key === 'arrowleft' || key === 'a') moveLeft();
    else if (key === 'arrowup' || key === 'w') moveUp();
    else if (key === 'arrowdown' || key === 's') moveDown();
}

function keyUp(e) {
    const key = e.key.toLowerCase();
    if (
        key === 'arrowright' || key === 'd' ||
        key === 'arrowleft' || key === 'a' ||
        key === 'arrowup' || key === 'w' ||
        key === 'arrowdown' || key === 's'
    ) {
        player.dx = 0;
        player.dy = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Game Start
setInterval(spawnEnemy, 1500); // Spawn a new enemy every 1.5 seconds

update();



