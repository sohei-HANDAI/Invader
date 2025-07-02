// 1. 基本設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageEl = document.getElementById('message');
const startButton = document.getElementById('startButton');
// (追加)
const controlsInfo = document.getElementById('controls-info');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const fireBtn = document.getElementById('fire-btn');

canvas.width = 600;
canvas.height = 400;

let gameRunning = false;
let animationFrameId;

// 2. プレイヤー設定
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 40,
    width: 50,
    height: 20,
    speed: 5,
    dx: 0,
    color: '#0f0'
};

// 3. 弾の設定
const bullets = [];
const bulletSpeed = 7;

// 4. インベーダー設定 (変更なし)
const invaders = [];
const invaderRows = 4;
const invaderCols = 8;
const invaderWidth = 40;
const invaderHeight = 20;
const invaderPadding = 15;
let invaderDirection = 1;
let invaderSpeed = 1;

// ゲームの状態をリセットして初期化する関数 (変更なし)
function init() {
    player.x = canvas.width / 2 - 25;
    bullets.length = 0;
    invaders.length = 0;
    invaderDirection = 1;

    for (let c = 0; c < invaderCols; c++) {
        for (let r = 0; r < invaderRows; r++) {
            invaders.push({
                x: c * (invaderWidth + invaderPadding) + 30,
                y: r * (invaderHeight + invaderPadding) + 30,
                width: invaderWidth,
                height: invaderHeight,
                color: '#f00'
            });
        }
    }
}

// 描画関数 (変更なし)
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = '#0f0';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawInvaders() {
    invaders.forEach(invader => {
        ctx.fillStyle = invader.color;
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
    });
}

// 更新関数 (変更なし)
function updatePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function updateInvaders() {
    let moveDown = false;
    invaders.forEach(invader => {
        if ((invader.x + invader.width >= canvas.width && invaderDirection > 0) ||
            (invader.x <= 0 && invaderDirection < 0)) {
            moveDown = true;
        }
    });

    if (moveDown) {
        invaderDirection *= -1;
        invaders.forEach(invader => invader.y += invaderHeight);
    } else {
        invaders.forEach(invader => invader.x += invaderDirection * invaderSpeed);
    }
}

// 当たり判定・勝利判定 (変更なし)
function collisionDetection() {
    bullets.forEach((bullet, bIndex) => {
        invaders.forEach((invader, iIndex) => {
            if (
                bullet.x < invader.x + invader.width &&
                bullet.x + bullet.width > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + bullet.height > invader.y
            ) {
                setTimeout(() => {
                    invaders.splice(iIndex, 1);
                    bullets.splice(bIndex, 1);
                }, 0);
            }
        });
    });

    invaders.forEach(invader => {
        if (invader.y + invader.height >= player.y) {
            gameOver(false);
        }
    });
}

function checkWinCondition() {
    if (invaders.length === 0 && gameRunning) {
        gameOver(true);
    }
}

// ゲームループ (変更なし)
function gameLoop() {
    if (!gameRunning) return;
    updatePlayer();
    updateBullets();
    updateInvaders();
    collisionDetection();
    checkWinCondition();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawInvaders();
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// (変更) ゲームオーバー処理
function gameOver(isWin) {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    messageEl.style.display = 'block';
    if (isWin) {
        messageEl.innerText = 'YOU WIN!';
        messageEl.style.color = '#0f0';
    } else {
        messageEl.innerText = 'GAME OVER';
        messageEl.style.color = '#f00';
    }
    startButton.style.display = 'block';
    startButton.innerText = 'もう一度プレイ';
    controlsInfo.style.display = 'block'; // 操作方法を再表示
}

// (追加) 弾の発射を関数化
function shoot() {
    if (!gameRunning) return;
    bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10
    });
}

// PCキーボード操作
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // スペースキーでの画面スクロールを防止
        shoot();
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' || e.key === 'd' ||
        e.key === 'ArrowLeft' || e.key === 'a'
    ) {
        player.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// (追加) スマホ・タッチ操作
function handleMoveStart(direction) {
    player.dx = player.speed * direction;
}

function handleMoveEnd() {
    player.dx = 0;
}

// 左ボタン
leftBtn.addEventListener('mousedown', () => handleMoveStart(-1));
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMoveStart(-1); });
leftBtn.addEventListener('mouseup', handleMoveEnd);
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleMoveEnd(); });

// 右ボタン
rightBtn.addEventListener('mousedown', () => handleMoveStart(1));
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMoveStart(1); });
rightBtn.addEventListener('mouseup', handleMoveEnd);
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleMoveEnd(); });

// 発射ボタン
fireBtn.addEventListener('click', (e) => { e.preventDefault(); shoot(); });
fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); shoot(); });


// (変更) ゲーム開始処理
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    messageEl.style.display = 'none';
    controlsInfo.style.display = 'none'; // 操作方法を非表示
    gameRunning = true;
    init();
    gameLoop();
});
