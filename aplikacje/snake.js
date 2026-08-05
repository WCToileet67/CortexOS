// ============================================================
// aplikacje/snake.js – Snake Game
// ============================================================

export default function Snake() {
    const container = document.createElement('div');
    container.className = 'snake-game';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Snake');

    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'snake-score';
    const highDisplay = document.createElement('div');
    highDisplay.className = 'snake-high';

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const controls = document.createElement('div');
    controls.className = 'snake-controls';
    const upBtn = document.createElement('button');
    upBtn.textContent = '⬆';
    const downBtn = document.createElement('button');
    downBtn.textContent = '⬇';
    const leftBtn = document.createElement('button');
    leftBtn.textContent = '⬅';
    const rightBtn = document.createElement('button');
    rightBtn.textContent = '➡';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Reset';
    controls.append(upBtn, leftBtn, downBtn, rightBtn, resetBtn);

    container.append(scoreDisplay, highDisplay, canvas, controls);

    // Game state
    const GRID = 20;
    const SIZE = canvas.width / GRID;
    let snake = [{ x: 10, y: 10 }];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 15, y: 10 };
    let score = 0;
    let highScore = parseInt(localStorage.getItem('cortexos_snake_high') || '0');
    let gameOver = false;
    let gameLoop = null;
    let speed = 120;

    function randomFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * GRID),
                y: Math.floor(Math.random() * GRID),
            };
        } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    function draw() {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines (subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GRID; i++) {
            ctx.beginPath();
            ctx.moveTo(i * SIZE, 0);
            ctx.lineTo(i * SIZE, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * SIZE);
            ctx.lineTo(canvas.width, i * SIZE);
            ctx.stroke();
        }

        // Snake
        snake.forEach((seg, idx) => {
            const ratio = 1 - (idx / snake.length) * 0.4;
            const r = Math.round(79 * ratio);
            const g = Math.round(195 * ratio);
            const b = Math.round(247 * ratio);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.shadowColor = '#4fc3f7';
            ctx.shadowBlur = idx === 0 ? 12 : 4;
            ctx.fillRect(seg.x * SIZE + 1, seg.y * SIZE + 1, SIZE - 2, SIZE - 2);
            ctx.shadowBlur = 0;
        });

        // Food
        ctx.fillStyle = '#ff6b6b';
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(
            food.x * SIZE + SIZE / 2,
            food.y * SIZE + SIZE / 2,
            SIZE / 2 - 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Score
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px monospace';
        ctx.fillText(`Score: ${score}`, 8, 24);
        ctx.fillText(`High: ${highScore}`, 8, 42);

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '28px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('💀 GAME OVER', canvas.width / 2, canvas.height / 2 + 10);
            ctx.textAlign = 'left';
        }
    }

    function update() {
        if (gameOver) return;

        dir = { ...nextDir };

        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
            endGame();
            return;
        }

        // Self collision
        if (snake.some((s) => s.x === head.x && s.y === head.y)) {
            endGame();
            return;
        }

        snake.unshift(head);

        // Eat food
        if (head.x === food.x && head.y === food.y) {
            score++;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('cortexos_snake_high', String(highScore));
            }
            food = randomFood();
            // Speed up slightly
            speed = Math.max(60, speed - 1);
            resetLoop();
        } else {
            snake.pop();
        }

        updateDisplay();
        draw();
    }

    function endGame() {
        gameOver = true;
        clearInterval(gameLoop);
        gameLoop = null;
        draw();
        import('../main.js').then(({ showToast }) => {
            showToast('💀', `Game Over! Score: ${score}`);
        });
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score = 0;
        gameOver = false;
        speed = 120;
        food = randomFood();
        updateDisplay();
        resetLoop();
        draw();
    }

    function resetLoop() {
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, speed);
    }

    function updateDisplay() {
        scoreDisplay.textContent = `🐍 Score: ${score}`;
        highDisplay.textContent = `🏆 High Score: ${highScore}`;
    }

    // Controls
    function changeDir(dx, dy) {
        if (gameOver) return;
        if ((dir.x === -dx && dir.y === -dy) || (dir.x === dx && dir.y === dy)) return;
        nextDir = { x: dx, y: dy };
    }

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                changeDir(0, -1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                changeDir(0, 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                changeDir(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                changeDir(1, 0);
                break;
            case 'r':
                resetGame();
                break;
        }
    });

    upBtn.addEventListener('click', () => changeDir(0, -1));
    downBtn.addEventListener('click', () => changeDir(0, 1));
    leftBtn.addEventListener('click', () => changeDir(-1, 0));
    rightBtn.addEventListener('click', () => changeDir(1, 0));
    resetBtn.addEventListener('click', resetGame);

    // Init
    food = randomFood();
    updateDisplay();
    resetLoop();

    return container;
}
