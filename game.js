const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let playerHorde = [];
let enemy;
let hordeBullets = [];
let enemyBullets = [];
let score = 0;
let gameStatus = 'playing'; // playing, win, lose

// Image assets
const enemyImage = new Image();
enemyImage.src = 'sky.png'; // Use local image file
let enemyImageLoaded = false;

// Horde properties
const hordeRows = 3;
const hordeCols = 10;
const blockWidth = 50;
const blockHeight = 50;
const blockSpacing = 20;
const hordeSpeed = 3;

// Enemy properties
const enemyWidth = 60; // Adjusted for image aspect ratio
const enemyHeight = 60;
let enemyX = canvas.width / 2 - enemyWidth / 2;
const enemyY = canvas.height - enemyHeight - 50;
let enemySpeed = 3;
let enemyDirection = 1;
const enemyInitialHP = 3; // Enemy has 3 HP

// Bullet properties
const bulletWidth = 5;
const bulletHeight = 15;
const bulletSpeed = 7;

// Key state
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false
};

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

function createHorde() {
    for (let row = 0; row < hordeRows; row++) {
        for (let col = 0; col < hordeCols; col++) {
            playerHorde.push({
                x: col * (blockWidth + blockSpacing) + blockSpacing,
                y: row * (blockHeight + blockSpacing) + 50,
                width: blockWidth,
                height: blockHeight
            });
        }
    }
}

function createEnemy() {
    enemy = { x: enemyX, y: enemyY, width: enemyWidth, height: enemyHeight, alive: true, hp: enemyInitialHP };
}

function updateHorde() {
    let dx = 0;
    if (keys.ArrowLeft) dx = -hordeSpeed;
    if (keys.ArrowRight) dx = hordeSpeed;

    if (dx !== 0) {
        const leftmostBlock = playerHorde.reduce((min, b) => b.x < min.x ? b : min, playerHorde[0]);
        const rightmostBlock = playerHorde.reduce((max, b) => b.x > max.x ? b : max, playerHorde[0]);

        if ((dx < 0 && leftmostBlock.x + dx > 0) || (dx > 0 && rightmostBlock.x + rightmostBlock.width + dx < canvas.width)) {
            for (const block of playerHorde) {
                block.x += dx;
            }
        }
    }
}

function hordeShoot() {
    if (keys[' '] && playerHorde.length > 0) {
        const shootingBlock = playerHorde[Math.floor(Math.random() * playerHorde.length)];
        hordeBullets.push({ x: shootingBlock.x + shootingBlock.width / 2 - bulletWidth / 2, y: shootingBlock.y + shootingBlock.height, width: bulletWidth, height: bulletHeight });
        keys[' '] = false; // Prevent continuous shooting
    }
}

function updateEnemy() {
    if (!enemy.alive) return;

    // Randomly change direction
    if (Math.random() < 0.02) {
        const newDirection = Math.random();
        if (newDirection < 0.45) {
            enemyDirection = -1; // Move left
        } else if (newDirection < 0.9) {
            enemyDirection = 1; // Move right
        } else {
            enemyDirection = 0; // Stay still
        }
    }

    const nextX = enemy.x + enemySpeed * enemyDirection;
    if (nextX > 0 && nextX < canvas.width - enemy.width) {
        enemy.x = nextX;
    }

    if (Math.random() < 0.015) {
        enemyBullets.push({ x: enemy.x + enemy.width / 2 - bulletWidth / 2, y: enemy.y, width: bulletWidth, height: bulletHeight });
    }
}

function updateBullets() {
    // Horde bullets (move down)
    for (let i = hordeBullets.length - 1; i >= 0; i--) {
        const bullet = hordeBullets[i];
        bullet.y += bulletSpeed;
        if (bullet.y > canvas.height) {
            hordeBullets.splice(i, 1);
            continue;
        }

        if (enemy.alive && bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
            hordeBullets.splice(i, 1);
            enemy.hp -= 1;
            score += 10;
            if (enemy.hp <= 0) {
                enemy.alive = false;
                score += 100;
                gameStatus = 'win';
            }
        }
    }

    // Enemy bullets (move up)
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
            enemyBullets.splice(i, 1);
            continue;
        }

        for (let j = playerHorde.length - 1; j >= 0; j--) {
            const block = playerHorde[j];
            if (bullet.x < block.x + block.width &&
                bullet.x + bullet.width > block.x &&
                bullet.y < block.y + block.height &&
                bullet.y + bullet.height > block.y) {
                enemyBullets.splice(i, 1);
                playerHorde.splice(j, 1);
                score -= 10;
                break; 
            }
        }
    }
}

function checkGameStatus() {
    if (playerHorde.length === 0 && gameStatus === 'playing') {
        gameStatus = 'lose';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'green';
    for (const block of playerHorde) {
        ctx.fillRect(block.x, block.y, block.width, block.height);
    }

    if (enemy.alive) {
        if (enemyImageLoaded) {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`HP: ${enemy.hp}`, enemy.x + 10, enemy.y - 10);
    }

    ctx.fillStyle = 'white';
    for (const bullet of hordeBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    ctx.fillStyle = 'yellow';
    for (const bullet of enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    if (gameStatus !== 'playing') {
        ctx.font = '60px Arial';
        let message = '';
        if (gameStatus === 'win') message = 'You Win!';
        if (gameStatus === 'lose') message = 'Game Over';
        ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    if (gameStatus === 'playing') {
        updateHorde();
        hordeShoot();
        updateEnemy();
        updateBullets();
        checkGameStatus();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game when the image is loaded
enemyImage.onload = () => {
    enemyImageLoaded = true;
    createHorde();
    createEnemy();
    gameLoop();
};

// Fallback if image fails to load
enemyImage.onerror = () => {
    console.error("Failed to load enemy image.");
    createHorde();
    createEnemy();
    gameLoop();
}