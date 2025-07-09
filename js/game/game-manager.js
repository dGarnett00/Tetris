// Game Manager - Main Game Logic Controller
class GameManager {
    constructor() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceFactory = new PieceFactory();
        this.lockDelay = 500; // milliseconds before piece locks
        this.lockTimer = 0;
        this.canLock = true;
        
        this.initialize();
    }

    initialize() {
        // Generate first pieces
        this.nextPiece = this.pieceFactory.getNextPiece();
        this.spawnNextPiece();
        
        // Set initial game state
        gameState.setState(GAME_STATES.PLAYING);
        gameState.updateDisplay();
    }

    reset() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceFactory = new PieceFactory();
        this.lockTimer = 0;
        this.canLock = true;
        
        // Reset game systems
        scoreManager.resetCombo();
        
        this.initialize();
    }

    update(deltaTime) {
        if (!gameState.isPlaying()) {
            return;
        }

        // Update lock timer
        this.updateLockTimer(deltaTime);
        
        // Check for game over
        if (this.checkGameOver()) {
            this.gameOver();
        }
    }

    updateLockTimer(deltaTime) {
        if (this.currentPiece && !gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.lockTimer += deltaTime;
            
            if (this.lockTimer >= this.lockDelay && this.canLock) {
                this.lockPiece();
            }
        } else {
            this.lockTimer = 0;
        }
    }

    spawnNextPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.pieceFactory.getNextPiece();
        
        // Reset lock timer
        this.lockTimer = 0;
        this.canLock = true;
        
        // Check if piece can spawn
        if (!gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }

    lockPiece() {
        if (!this.currentPiece) return;
        
        // Place piece on board
        gameBoard.placePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        
        // Check and clear lines
        const linesCleared = lineClearer.checkAndClearLines();
        
        // Update score
        if (linesCleared > 0) {
            const points = scoreManager.calculateScore('LINE_CLEAR', linesCleared, gameState.level);
            scoreManager.addScore(points);
        }
        
        // Spawn next piece
        this.spawnNextPiece();
    }

    checkGameOver() {
        // Check if blocks have reached the top
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            if (gameBoard.getCell(x, 0) !== 0) {
                return true;
            }
        }
        
        // Check if current piece can't move from spawn position
        if (this.currentPiece) {
            return !gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        }
        
        return false;
    }

    gameOver() {
        gameState.setState(GAME_STATES.GAME_OVER);
        
        // Save high score
        const isNewHighScore = scoreManager.setHighScore(gameState.score);
        
        // Show game over message
        this.showGameOverMessage(isNewHighScore);
        
        // Stop game loop
        if (gameLoop) {
            gameLoop.stop();
        }
    }

    showGameOverMessage(isNewHighScore) {
        const message = document.getElementById('gameMessage');
        const highScoreText = isNewHighScore ? '<p style="color: #ffd700;">New High Score!</p>' : '';
        
        message.innerHTML = `
            <h2>Game Over</h2>
            <p>Score: ${gameState.score}</p>
            <p>Lines: ${gameState.lines}</p>
            <p>Level: ${gameState.level}</p>
            ${highScoreText}
            <p>Press SPACE to restart</p>
        `;
    }

    restart() {
        // Reset all game systems
        gameState.reset();
        gameBoard.reset();
        this.reset();
        
        // Restart game loop
        if (gameLoop) {
            gameLoop.restart();
        }
    }

    // Movement helpers
    movePieceLeft() {
        if (this.currentPiece && gameState.canMove()) {
            this.currentPiece.moveLeft();
            this.resetLockTimer();
        }
    }

    movePieceRight() {
        if (this.currentPiece && gameState.canMove()) {
            this.currentPiece.moveRight();
            this.resetLockTimer();
        }
    }

    movePieceDown() {
        if (this.currentPiece && gameState.canMove()) {
            if (this.currentPiece.moveDown()) {
                // Award soft drop points
                const points = scoreManager.calculateScore('SOFT_DROP', 0, gameState.level);
                scoreManager.addScore(points);
                this.resetLockTimer();
            }
        }
    }

    rotatePiece() {
        if (this.currentPiece && gameState.canMove()) {
            this.currentPiece.rotate();
            this.resetLockTimer();
        }
    }

    hardDrop() {
        if (this.currentPiece && gameState.canMove()) {
            const dropDistance = this.currentPiece.getGhostPosition() - this.currentPiece.y;
            this.currentPiece.hardDrop();
            
            // Award hard drop points
            const points = scoreManager.calculateScore('HARD_DROP', 0, gameState.level) * dropDistance;
            scoreManager.addScore(points);
            
            this.lockPiece();
        }
    }

    resetLockTimer() {
        this.lockTimer = 0;
    }

    // Utility methods
    getCurrentPieceInfo() {
        if (!this.currentPiece) return null;
        
        return {
            type: this.currentPiece.type,
            x: this.currentPiece.x,
            y: this.currentPiece.y,
            rotation: this.currentPiece.currentRotation,
            ghostY: this.currentPiece.getGhostPosition()
        };
    }

    getNextPieceInfo() {
        if (!this.nextPiece) return null;
        
        return {
            type: this.nextPiece.type,
            shape: this.nextPiece.getCurrentShape()
        };
    }
}

// Create global game manager
window.gameManager = new GameManager();
