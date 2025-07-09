// Game Manager - Core Game Logic
class GameManager {
    constructor() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceFactory = new PieceFactory();
        this.lockDelay = 500;
        this.lockTimer = 0;
        this.initialize();
    }

    initialize() {
        this.nextPiece = this.pieceFactory.getNextPiece();
        this.spawnNextPiece();
        gameState.setState(GAME_STATES.PLAYING);
        gameState.updateDisplay();
    }

    reset() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceFactory = new PieceFactory();
        this.lockTimer = 0;
        scoreManager.resetCombo();
        this.initialize();
    }

    update(deltaTime) {
        if (!gameState.isPlaying()) return;
        this.updateLockTimer(deltaTime);
        if (this.checkGameOver()) this.gameOver();
    }

    updateLockTimer(deltaTime) {
        if (this.currentPiece && !gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.lockTimer += deltaTime;
            if (this.lockTimer >= this.lockDelay) this.lockPiece();
        } else {
            this.lockTimer = 0;
        }
    }

    spawnNextPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.pieceFactory.getNextPiece();
        this.lockTimer = 0;
        if (!gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }

    lockPiece() {
        if (!this.currentPiece) return;
        gameBoard.placePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        const linesCleared = lineClearer.checkAndClearLines();
        if (linesCleared > 0) {
            const points = scoreManager.calculateScore('LINE_CLEAR', linesCleared, gameState.level);
            scoreManager.addScore(points);
        }
        this.spawnNextPiece();
    }

    checkGameOver() {
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            if (gameBoard.getCell(x, 0) !== 0) return true;
        }
        return this.currentPiece && !gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
    }

    gameOver() {
        gameState.setState(GAME_STATES.GAME_OVER);
        const isNewHighScore = scoreManager.setHighScore(gameState.score);
        this.showGameOverMessage(isNewHighScore);
        gameLoop?.stop();
    }

    showGameOverMessage(isNewHighScore) {
        const message = document.getElementById('gameMessage');
        const highScoreText = isNewHighScore ? '<p style="color: #ffd700;">New High Score!</p>' : '';
        message.innerHTML = `<h2>Game Over</h2><p>Score: ${gameState.score}</p><p>Lines: ${gameState.lines}</p><p>Level: ${gameState.level}</p>${highScoreText}<p>Press SPACE to restart</p>`;
    }

    restart() {
        gameState.reset();
        gameBoard.reset();
        this.reset();
        gameLoop?.restart();
    }

    // Movement methods
    movePieceLeft() {
        if (this.currentPiece && gameState.canMove()) {
            this.currentPiece.moveLeft();
            this.lockTimer = 0;
        }
    }

    movePieceRight() {
        if (this.currentPiece && gameState.canMove()) {
            this.currentPiece.moveRight();
            this.lockTimer = 0;
        }
    }

    movePieceDown() {
        if (this.currentPiece && gameState.canMove() && this.currentPiece.moveDown()) {
            const points = scoreManager.calculateScore('SOFT_DROP', 0, gameState.level);
            scoreManager.addScore(points);
            this.lockTimer = 0;
        }
    }

    rotatePiece() {
        if (this.currentPiece && gameState.canMove()) {
            this.currentPiece.rotate();
            this.lockTimer = 0;
        }
    }

    hardDrop() {
        if (this.currentPiece && gameState.canMove()) {
            const dropDistance = this.currentPiece.hardDrop();
            const points = scoreManager.calculateScore('HARD_DROP', 0, gameState.level, dropDistance);
            scoreManager.addScore(points);
            this.showHardDropFeedback();
            this.lockPiece();
        }
    }

    showHardDropFeedback() {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.style.filter = 'brightness(1.3)';
            setTimeout(() => gameBoard.style.filter = 'brightness(1)', 100);
        }
    }

    // Getters
    getCurrentPieceInfo() {
        return this.currentPiece ? {
            type: this.currentPiece.type,
            x: this.currentPiece.x,
            y: this.currentPiece.y,
            rotation: this.currentPiece.currentRotation,
            ghostY: this.currentPiece.getGhostPosition()
        } : null;
    }

    getNextPieceInfo() {
        return this.nextPiece ? {
            type: this.nextPiece.type,
            shape: this.nextPiece.getCurrentShape()
        } : null;
    }
}

window.gameManager = new GameManager();
