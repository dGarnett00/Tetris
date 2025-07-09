// Game Manager - Core Game Logic
class GameManager {
    constructor() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        this.pieceFactory = new PieceFactory();
        this.lockDelay = GAME_CONFIG.LOCK_DELAY;
        this.lockTimer = 0;
        this.gravityTimer = 0;
        this.gravityInterval = GAME_CONFIG.GRAVITY_INTERVAL;
        this.autoLockExtensions = 0;
        this.maxLockExtensions = GAME_CONFIG.MAX_LOCK_EXTENSIONS;
        this.lastMoveTime = 0;
        this.pieceHistory = [];
        this.initialize();
    }

    initialize() {
        this.nextPiece = this.pieceFactory.getNextPiece();
        this.spawnNextPiece();
        this.updateGravityInterval();
        gameState.setState(GAME_STATES.PLAYING);
        gameState.updateDisplay();
    }

    reset() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        this.pieceFactory = new PieceFactory();
        this.lockTimer = 0;
        this.gravityTimer = 0;
        this.autoLockExtensions = 0;
        this.pieceHistory = [];
        scoreManager.resetCombo();
        this.initialize();
    }

    update(deltaTime) {
        if (!gameState.isPlaying()) return;
        
        this.updateGravity(deltaTime);
        this.updateLockTimer(deltaTime);
        this.updateGravityInterval();
        
        if (this.checkGameOver()) {
            this.gameOver();
        }
    }

    updateGravity(deltaTime) {
        if (!this.currentPiece) return;
        
        this.gravityTimer += deltaTime;
        
        if (this.gravityTimer >= this.gravityInterval) {
            this.gravityTimer = 0;
            
            if (this.currentPiece.moveDown()) {
                this.resetLockTimer();
            }
        }
    }

    updateGravityInterval() {
        // Gravity gets faster as level increases
        const baseInterval = GAME_CONFIG.GRAVITY_INTERVAL;
        const levelMultiplier = Math.pow(0.8, gameState.level - 1);
        this.gravityInterval = Math.max(baseInterval * levelMultiplier, 50);
    }

    updateLockTimer(deltaTime) {
        if (!this.currentPiece) return;
        
        const canMoveDown = gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1);
        
        if (!canMoveDown) {
            this.lockTimer += deltaTime;
            
            if (this.lockTimer >= this.lockDelay) {
                this.lockPiece();
            }
        } else {
            this.resetLockTimer();
        }
    }

    resetLockTimer() {
        this.lockTimer = 0;
        this.autoLockExtensions = 0;
    }

    extendLockTimer() {
        if (this.autoLockExtensions < this.maxLockExtensions) {
            this.lockTimer = 0;
            this.autoLockExtensions++;
            return true;
        }
        return false;
    }

    spawnNextPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.pieceFactory.getNextPiece();
        this.canHold = true;
        this.resetLockTimer();
        
        // Add to piece history for statistics
        this.pieceHistory.push({
            type: this.currentPiece.type,
            spawnTime: Date.now(),
            spawnLevel: gameState.level
        });
        
        // Keep only last 100 pieces in history
        if (this.pieceHistory.length > 100) {
            this.pieceHistory.shift();
        }
        
        gameState.incrementStatistic('piecesSpawned');
        
        if (!gameBoard.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }

    lockPiece() {
        if (!this.currentPiece) return;
        
        const lockStartTime = Date.now();
        gameBoard.placePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        
        // Record piece placement stats
        const currentHistory = this.pieceHistory[this.pieceHistory.length - 1];
        if (currentHistory) {
            currentHistory.lockTime = lockStartTime;
            currentHistory.lifetime = lockStartTime - currentHistory.spawnTime;
            currentHistory.finalY = this.currentPiece.y;
        }
        
        // Check for special placements
        this.checkSpecialPlacements();
        
        const linesCleared = lineClearer.checkAndClearLines();
        if (linesCleared > 0) {
            const points = scoreManager.calculateScore('LINE_CLEAR', linesCleared, gameState.level);
            scoreManager.addScore(points);
            gameState.incrementStatistic('totalLineClears');
        } else {
            // Reset combo if no lines cleared
            scoreManager.resetCombo();
        }
        
        this.spawnNextPiece();
        this.checkLevelUp();
    }

    checkSpecialPlacements() {
        if (!this.currentPiece) return;
        
        const pieceType = this.currentPiece.type;
        const finalY = this.currentPiece.y;
        
        // Check for perfect placement (piece placed at very bottom)
        if (finalY >= GAME_CONFIG.BOARD_HEIGHT - 2) {
            gameState.incrementStatistic('perfectPlacements');
            this.showPlacementFeedback('perfect');
        }
        
        // Check for T-piece placement (potential T-spin setup)
        if (pieceType === 'T' && this.currentPiece.currentRotation !== 0) {
            gameState.incrementStatistic('tSpinSetups');
            this.showPlacementFeedback('t-spin');
        }
        
        // Check for edge placement
        if (this.currentPiece.x <= 1 || this.currentPiece.x >= GAME_CONFIG.BOARD_WIDTH - 2) {
            gameState.incrementStatistic('edgePlacements');
        }
    }

    showPlacementFeedback(type) {
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) return;
        
        switch(type) {
            case 'perfect':
                gameBoard.style.filter = 'brightness(1.2) saturate(1.3)';
                setTimeout(() => gameBoard.style.filter = 'brightness(1) saturate(1)', 200);
                break;
            case 't-spin':
                gameBoard.style.filter = 'hue-rotate(90deg)';
                setTimeout(() => gameBoard.style.filter = 'hue-rotate(0deg)', 300);
                break;
        }
    }

    checkLevelUp() {
        const requiredLines = gameState.level * 10;
        if (gameState.lines >= requiredLines) {
            gameState.levelUp();
            this.updateGravityInterval();
            this.showLevelUpFeedback();
        }
    }

    showLevelUpFeedback() {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.style.filter = 'brightness(1.5) contrast(1.3)';
            gameBoard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                gameBoard.style.filter = 'brightness(1) contrast(1)';
                gameBoard.style.transform = 'scale(1)';
            }, 500);
        }
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

    // Enhanced movement methods
    movePieceLeft() {
        if (this.currentPiece && gameState.canMove()) {
            const moved = this.currentPiece.moveLeft();
            if (moved) {
                this.extendLockTimer();
                this.lastMoveTime = Date.now();
                gameState.incrementStatistic('totalMoves');
                return true;
            }
        }
        return false;
    }

    movePieceRight() {
        if (this.currentPiece && gameState.canMove()) {
            const moved = this.currentPiece.moveRight();
            if (moved) {
                this.extendLockTimer();
                this.lastMoveTime = Date.now();
                gameState.incrementStatistic('totalMoves');
                return true;
            }
        }
        return false;
    }

    movePieceDown() {
        if (this.currentPiece && gameState.canMove()) {
            const moved = this.currentPiece.moveDown();
            if (moved) {
                const points = scoreManager.calculateScore('SOFT_DROP', 0, gameState.level);
                scoreManager.addScore(points);
                this.extendLockTimer();
                this.lastMoveTime = Date.now();
                gameState.incrementStatistic('softDrops');
                return true;
            }
        }
        return false;
    }

    rotatePiece() {
        if (this.currentPiece && gameState.canMove()) {
            const oldRotation = this.currentPiece.currentRotation;
            this.currentPiece.rotate();
            
            if (oldRotation !== this.currentPiece.currentRotation) {
                this.extendLockTimer();
                this.lastMoveTime = Date.now();
                gameState.incrementStatistic('totalRotations');
                return true;
            }
        }
        return false;
    }

    hardDrop() {
        if (this.currentPiece && gameState.canMove()) {
            const dropDistance = this.currentPiece.hardDrop();
            const points = scoreManager.calculateScore('HARD_DROP', 0, gameState.level, dropDistance);
            scoreManager.addScore(points);
            gameState.incrementStatistic('hardDrops');
            this.showHardDropFeedback(dropDistance);
            this.lockPiece();
            return dropDistance;
        }
        return 0;
    }

    holdPiece() {
        if (!this.canHold || !this.currentPiece) return false;
        
        this.canHold = false;
        gameState.incrementStatistic('piecesHeld');
        
        if (this.heldPiece) {
            // Swap current piece with held piece
            const temp = this.currentPiece;
            this.currentPiece = this.heldPiece;
            this.heldPiece = temp;
            
            // Reset current piece position
            this.currentPiece.x = Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - 1;
            this.currentPiece.y = 0;
            this.currentPiece.currentRotation = 0;
        } else {
            // Hold current piece and spawn next
            this.heldPiece = this.currentPiece;
            this.spawnNextPiece();
        }
        
        this.resetLockTimer();
        this.showHoldFeedback();
        return true;
    }

    showHoldFeedback() {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => gameBoard.style.filter = 'hue-rotate(0deg)', 200);
        }
    }

    showHardDropFeedback(dropDistance) {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.style.filter = 'brightness(1.4) contrast(1.3)';
            gameBoard.style.transform = 'scale(1.03)';
            setTimeout(() => {
                gameBoard.style.filter = 'brightness(1) contrast(1)';
                gameBoard.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Show drop distance feedback
        if (dropDistance > 0) {
            this.showDropDistanceFeedback(dropDistance);
        }
    }

    showDropDistanceFeedback(distance) {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard && distance > 0) {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.style.cssText = `
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translateX(-50%);
                color: #fff;
                font-size: 20px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                z-index: 1000;
                pointer-events: none;
                animation: fadeUpOut 0.8s ease-out forwards;
            `;
            feedbackDiv.textContent = `+${distance}`;
            gameBoard.parentElement.appendChild(feedbackDiv);
            
            setTimeout(() => {
                if (feedbackDiv.parentNode) {
                    feedbackDiv.parentNode.removeChild(feedbackDiv);
                }
            }, 800);
        }
    }

    // Enhanced getters with more detailed information
    getCurrentPieceInfo() {
        if (!this.currentPiece) return null;
        
        return {
            type: this.currentPiece.type,
            x: this.currentPiece.x,
            y: this.currentPiece.y,
            rotation: this.currentPiece.currentRotation,
            ghostY: this.currentPiece.getGhostPosition(),
            lockTimer: this.lockTimer,
            lockDelay: this.lockDelay,
            lockProgress: this.lockTimer / this.lockDelay,
            canHold: this.canHold,
            lockExtensions: this.autoLockExtensions
        };
    }

    getNextPieceInfo() {
        return this.nextPiece ? {
            type: this.nextPiece.type,
            shape: this.nextPiece.getCurrentShape()
        } : null;
    }

    getHoldPieceInfo() {
        return this.heldPiece ? {
            type: this.heldPiece.type,
            shape: this.heldPiece.getCurrentShape()
        } : null;
    }

    getPieceStatistics() {
        const stats = {};
        this.pieceHistory.forEach(piece => {
            if (!stats[piece.type]) {
                stats[piece.type] = {
                    count: 0,
                    avgLifetime: 0,
                    avgFinalY: 0
                };
            }
            stats[piece.type].count++;
            if (piece.lifetime) {
                stats[piece.type].avgLifetime += piece.lifetime;
            }
            if (piece.finalY !== undefined) {
                stats[piece.type].avgFinalY += piece.finalY;
            }
        });
        
        // Calculate averages
        Object.keys(stats).forEach(type => {
            if (stats[type].count > 0) {
                stats[type].avgLifetime /= stats[type].count;
                stats[type].avgFinalY /= stats[type].count;
            }
        });
        
        return stats;
    }

    getGamePerformance() {
        const now = Date.now();
        const recentPieces = this.pieceHistory.filter(piece => 
            now - piece.spawnTime < 60000 // Last minute
        );
        
        return {
            piecesPerMinute: recentPieces.length,
            averageLifetime: recentPieces.reduce((sum, piece) => 
                sum + (piece.lifetime || 0), 0) / recentPieces.length || 0,
            efficiency: this.calculateEfficiency(),
            consistency: this.calculateConsistency()
        };
    }

    calculateEfficiency() {
        const totalMoves = gameState.statistics.totalMoves || 0;
        const totalPieces = gameState.statistics.piecesSpawned || 1;
        return totalMoves / totalPieces;
    }

    calculateConsistency() {
        if (this.pieceHistory.length < 10) return 0;
        
        const lifetimes = this.pieceHistory
            .slice(-10)
            .map(piece => piece.lifetime || 0)
            .filter(lifetime => lifetime > 0);
        
        if (lifetimes.length < 2) return 0;
        
        const avg = lifetimes.reduce((sum, time) => sum + time, 0) / lifetimes.length;
        const variance = lifetimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / lifetimes.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, 100 - (stdDev / avg) * 100);
    }
}

window.gameManager = new GameManager();
