const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('wormHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let gameSpeed = 100;

highScoreElement.textContent = highScore;

// Initialize game
function init() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    isPaused = false;
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#667eea';
            ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
            ctx.fillStyle = 'white';
            ctx.fillRect(segment.x * gridSize + 5, segment.y * gridSize + 5, 4, 4);
            ctx.fillRect(segment.x * gridSize + 11, segment.y * gridSize + 5, 4, 4);
        } else {
            // Body
            const gradient = ctx.createLinearGradient(
                segment.x * gridSize, segment.y * gridSize,
                segment.x * gridSize + gridSize, segment.y * gridSize + gridSize
            );
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
        }
    });

    // Draw food (apple emoji)
    ctx.font = `${gridSize - 4}px Arial`;
    ctx.fillText('🍎', food.x * gridSize + 2, food.y * gridSize + gridSize - 4);
}

// Update game state
function update() {
    if (isPaused || (dx === 0 && dy === 0)) return;

    // Calculate new head position
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('wormHighScore', highScore);
        }

        generateFood();

        // Increase speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Game step
function gameStep() {
    update();
    draw();
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('انتهت اللعبة!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '20px Arial';
    ctx.fillText(`النقاط: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = 'العب مرة أخرى';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            e.preventDefault();
            break;
        case ' ':
            if (gameLoop && !isPaused) {
                pauseBtn.click();
            }
            e.preventDefault();
            break;
    }
});

// Start button
startBtn.addEventListener('click', () => {
    if (gameLoop) {
        clearInterval(gameLoop);
    }

    gameSpeed = 100;
    init();
    draw();
    gameLoop = setInterval(gameStep, gameSpeed);

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    startBtn.textContent = 'ابدأ اللعبة';
});

// Pause button
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'استئناف' : 'إيقاف مؤقت';
});

// Initial draw
draw();
