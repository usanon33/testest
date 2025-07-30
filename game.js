const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let playerHorde = [];
let enemy;
let hordeBullets = [];
let enemyBullets = [];
let score = 0;
let currentStage = 1;
const maxStages = 10; // Define maximum stages
let gameStatus = 'title'; // title, playing, win, lose, showingStageIntro, gameOverCountdown
let needsStageReset = false; // Added for rotating title image
let titleRotation = 0; // Added for rotating title image
const stageIntroDuration = 1000; // 1 second
let highestStageReached = 1; // New variable to store the highest stage reached
let gameOverCountdownTime = 3; // Initial countdown time

// Image assets
const playerImage = new Image();
playerImage.src = 'me.png';
let playerImageLoaded = false;
playerImage.onload = () => {
    playerImageLoaded = true;
};

const enemyImage = new Image();
enemyImage.src = 'sky.png'; // Use local image file
let enemyImageLoaded = false;

const backgroundImage = new Image();
backgroundImage.src = 'sora.png';
let backgroundImageLoaded = false;
backgroundImage.onload = () => {
    backgroundImageLoaded = true;
};

const spaceImage = new Image();
spaceImage.src = 'space.png';
let spaceImageLoaded = false;
spaceImage.onload = () => {
    spaceImageLoaded = true;
};

const titleImage = new Image();
titleImage.src = 'title.png';
let titleImageLoaded = false;
titleImage.onload = () => {
    titleImageLoaded = true;
};

const taiyoImage = new Image();
taiyoImage.src = 'taiyo.png';
let taiyoImageLoaded = false;
taiyoImage.onload = () => {
    taiyoImageLoaded = true;
};

const redImage = new Image();
redImage.src = 'red.png';
let redImageLoaded = false;
redImage.onload = () => {
    redImageLoaded = true;
};

const yozoraImage = new Image();
yozoraImage.src = 'yozora.png';
let yozoraImageLoaded = false;
yozoraImage.onload = () => {
    yozoraImageLoaded = true;
};

const mizuiroImage = new Image();
mizuiroImage.src = 'mizuiro.png';
let mizuiroImageLoaded = false;
mizuiroImage.onload = () => {
    mizuiroImageLoaded = true;
};

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
const enemyInitialHP = 5;

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
    if (gameStatus === 'title' && e.key === 'Enter') {
        gameStatus = 'showingStageIntro';
        setTimeout(() => {
            gameStatus = 'playing';
        }, stageIntroDuration);
        return;
    }

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
    let hp = enemyInitialHP;
    if (currentStage === 2) {
        hp = 12;
    } else if (currentStage === 3) {
        hp = 15;
    } else if (currentStage === 4) {
        hp = 20;
    } else if (currentStage === 5) {
        hp = 25;
    } else if (currentStage === 6) {
        hp = 30;
    } else if (currentStage === 7) {
        hp = 35;
    } else if (currentStage === 8) {
        hp = 40;
    } else if (currentStage === 9) {
        hp = 45;
    } else if (currentStage === 10) {
        hp = 50;
    }
    enemy = { x: enemyX, y: enemyY, width: enemyWidth, height: enemyHeight, alive: true, hp: hp, maxHp: hp };
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
    console.log('hordeShoot called. Spacebar pressed:', keys[' '], 'Horde length:', playerHorde.length);
    if (keys[' '] && playerHorde.length > 0) {
        let max_y = 0;
        playerHorde.forEach(p => {
            if (p.y > max_y) {
                max_y = p.y;
            }
        });

        const frontBlocks = playerHorde.filter(p => p.y === max_y);

        if (frontBlocks.length > 0) {
            let min_x = frontBlocks[0].x;
            let max_x = frontBlocks[0].x;
            frontBlocks.forEach(b => {
                if (b.x < min_x) min_x = b.x;
                if (b.x > max_x) max_x = b.x;
            });

            const shooterX = (min_x + max_x) / 2 + blockWidth / 2;
            const shooterY = max_y + blockHeight;

            let dx = 0;
            if (keys.ArrowLeft) {
                dx = -1;
            } else if (keys.ArrowRight) {
                dx = 1;
            }
            const newBullet = { x: shooterX - bulletWidth / 2, y: shooterY - bulletHeight, width: bulletWidth, height: bulletHeight, dx: dx, dy: 1 };
            console.log('Pushing player bullet:', newBullet);
            hordeBullets.push(newBullet);
            keys[' '] = false; // Prevent continuous shooting
        }
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

    let fireRate = 0.05;
    if (currentStage >= 3 && currentStage <= 5) {
        fireRate = 0.075;
    } else if (currentStage >= 6) {
        fireRate = 0.1;
    }

    if (Math.random() < fireRate) {
        const attackType = Math.random();
        if (attackType < 0.6) {
            // Normal shot
            enemyBullets.push({ type: 'normal', x: enemy.x + enemy.width / 2 - bulletWidth / 2, y: enemy.y + enemy.height, width: bulletWidth, height: bulletHeight, dx: 0, dy: -1 });
        } else if (attackType < 0.8) {
            // Spread shot
            for (let i = -1; i <= 1; i++) {
                enemyBullets.push({ type: 'normal', x: enemy.x + enemy.width / 2 - bulletWidth / 2, y: enemy.y + enemy.height, width: bulletWidth, height: bulletHeight, dx: i, dy: -1 });
            }
        } else {
            // Bouncing shot
            enemyBullets.push({ type: 'bouncing', x: enemy.x + enemy.width / 2 - bulletWidth / 2, y: enemy.y + enemy.height, width: bulletWidth, height: bulletHeight, dx: Math.random() > 0.5 ? 1 : -1, dy: -1 });
        }
    }
}

function updateBullets() {
    // Horde bullets (move down)
    for (let i = hordeBullets.length - 1; i >= 0; i--) {
        const bullet = hordeBullets[i];
        bullet.x += bullet.dx * bulletSpeed;
        bullet.y += bullet.dy * bulletSpeed;
        if (bullet.y + bullet.height < 0 || bullet.x < 0 || bullet.x > canvas.width) {
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
                if (currentStage < maxStages) {
                    currentStage++;
                    gameStatus = 'showingStageIntro';
                    setTimeout(() => {
                        gameStatus = 'playing';
                    }, stageIntroDuration);
                    needsStageReset = true; // Reset stage after intro
                    highestStageReached = Math.max(highestStageReached, currentStage);
                } else {
                    gameStatus = 'win';
                }
            }
        }
    }

    // Enemy bullets (move up)
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.x += bullet.dx * bulletSpeed;
        bullet.y += bullet.dy * bulletSpeed;

        if (bullet.type === 'bouncing') {
            if (bullet.x < 0 || bullet.x > canvas.width - bullet.width) {
                bullet.dx *= -1;
            }
            if (bullet.y < 0) {
                enemyBullets.splice(i, 1);
                continue;
            } else if (bullet.y > canvas.height) {
                bullet.dy *= -1;
            }
        } else {
            if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
                enemyBullets.splice(i, 1);
                continue;
            }
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
        gameStatus = 'gameOverCountdown';
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            gameOverCountdownTime = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                gameStatus = 'title';
                // Reset game state for new game
                playerHorde = [];
                hordeBullets = [];
                enemyBullets = [];
                score = 0;
                currentStage = 1;
                createHorde();
                createEnemy();
            }
        }, 1000);
    }
}

function resetStage() {
    playerHorde = [];
    hordeBullets = [];
    enemyBullets = [];
    createHorde();
    createEnemy();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine background based on game state
    if (gameStatus === 'title') {
        if (backgroundImageLoaded) { // sora.png for title
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else { // For all other states (playing, win, lose, etc.)
        if (mizuiroImageLoaded) { // mizuiro.png for stages
            ctx.drawImage(mizuiroImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    if (gameStatus === 'title') {
        if (titleImageLoaded) {
            ctx.drawImage(titleImage, 0, 0, canvas.width, canvas.height);
        }
        if (taiyoImageLoaded) {
            const taiyoWidth = 200;
            const taiyoHeight = 200;
            const taiyoX = canvas.width - taiyoWidth - 20;
            const taiyoY = 20;

            ctx.save();
            ctx.translate(taiyoX + taiyoWidth / 2, taiyoY + taiyoHeight / 2);
            ctx.rotate(titleRotation);
            ctx.drawImage(taiyoImage, -taiyoWidth / 2, -taiyoHeight / 2, taiyoWidth, taiyoHeight);
            ctx.restore();
        }
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        const highestStageMessage = `Highest Stage: ${highestStageReached}`;
        ctx.fillText(highestStageMessage, canvas.width - ctx.measureText(highestStageMessage).width - 20, canvas.height - 30);
        return;
    } else if (gameStatus === 'showingStageIntro') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        const message = `STAGE ${currentStage}`;
        ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);
        return;
    }

    for (const block of playerHorde) {
        if (playerImageLoaded) {
            ctx.drawImage(playerImage, block.x, block.y, block.width, block.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    if (enemy.alive) {
        if (enemyImageLoaded) {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        const hpBarWidth = enemy.width;
        const hpBarHeight = 10;
        const hpBarX = enemy.x;
        const hpBarY = enemy.y - hpBarHeight - 5;

        // Draw background of HP bar
        ctx.fillStyle = '#333';
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

        // Draw current HP
        const currentHpWidth = (enemy.hp / enemy.maxHp) * hpBarWidth;
        ctx.fillStyle = 'red';
        ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
    }

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Stage: ${currentStage}`, 10, 60);

    // Draw horde bullets
    ctx.fillStyle = 'yellow';
    for (const bullet of hordeBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Draw enemy bullets
    ctx.fillStyle = 'purple';
    for (const bullet of enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    if (gameStatus !== 'playing') {
        ctx.font = '60px Arial';
        let message = '';
        if (gameStatus === 'win') {
            message = 'You Win!';
        }
        if (gameStatus === 'lose') message = 'Game Over';
        if (gameStatus === 'gameOverCountdown') {
            message = `Game Over! Returning to title in ${gameOverCountdownTime}`;
            ctx.font = '30px Arial'; // Smaller font for countdown
        }
        ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    if (needsStageReset) {
        resetStage();
        needsStageReset = false;
    }
    if (gameStatus === 'playing') {
        updateHorde();
        hordeShoot();
        updateEnemy();
        updateBullets();
        checkGameStatus();
    } else if (gameStatus === 'title') {
        titleRotation += 0.005; // Adjust rotation speed as needed
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
};