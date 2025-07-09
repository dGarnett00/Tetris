// Enhanced Line Clearing System
class LineClearer {
    constructor() {
        this.animationDuration = EFFECTS.LINE_CLEAR_DELAY;
        this.currentClearing = false;
    }

    checkAndClearLines() {
        if (this.currentClearing) return 0;
        
        const fullLines = this.findFullLines();
        
        if (fullLines.length > 0) {
            this.currentClearing = true;
            this.animateLineClear(fullLines);
            
            setTimeout(() => {
                this.clearLines(fullLines);
                this.updateScore(fullLines.length);
                this.showLineClearMessage(fullLines.length);
                this.triggerVisualEffects(fullLines);
                this.cleanupClearingStates();
                this.currentClearing = false;
            }, this.animationDuration);
        }
        
        return fullLines.length;
    }

    findFullLines() {
        const fullLines = [];
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            let isFullLine = true;
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                if (gameBoard.getCell(x, y) === 0) {
                    isFullLine = false;
                    break;
                }
            }
            if (isFullLine) fullLines.push(y);
        }
        return fullLines;
    }

    clearLines(lines) {
        lines.sort((a, b) => b - a);
        lines.forEach(lineIndex => gameBoard.grid.splice(lineIndex, 1));
        for (let i = 0; i < lines.length; i++) {
            gameBoard.grid.unshift(new Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
        }
        this.applyGravity();
    }

    applyGravity() {
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            const column = [];
            for (let y = GAME_CONFIG.BOARD_HEIGHT - 1; y >= 0; y--) {
                const cell = gameBoard.getCell(x, y);
                if (cell !== 0 && cell !== 'clearing') {
                    column.push(cell);
                }
            }
            
            for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
                gameBoard.setCell(x, y, 0);
            }
            
            for (let i = 0; i < column.length; i++) {
                const y = GAME_CONFIG.BOARD_HEIGHT - 1 - i;
                gameBoard.setCell(x, y, column[i]);
            }
        }
    }

    animateLineClear(lines) {
        lines.forEach((lineIndex, index) => {
            setTimeout(() => {
                // Mark cells for clearing animation
                for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                    gameBoard.setCell(x, lineIndex, 'clearing');
                }
                
                // Create enhanced visual effects
                if (gameRenderer && gameRenderer.createLineClearEffect) {
                    gameRenderer.createLineClearEffect(lineIndex);
                }
            }, index * 25);
        });
    }

    triggerVisualEffects(lines) {
        const lineCount = lines.length;
        
        // Different effects based on line count
        switch (lineCount) {
            case 1:
                this.createSingleLineEffect(lines[0]);
                break;
            case 2:
                this.createDoubleLineEffect(lines);
                break;
            case 3:
                this.createTripleLineEffect(lines);
                break;
            case 4:
                this.createTetrisEffect(lines);
                break;
        }
        
        // General screen effects
        this.triggerScreenEffects(lineCount);
    }

    createSingleLineEffect(lineY) {
        // Subtle particle effect
        if (gameRenderer && gameRenderer.createParticleExplosion) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                gameRenderer.createParticleExplosion(x, lineY, '#ffffff', 3);
            }
        }
    }

    createDoubleLineEffect(lines) {
        // More intense particles
        if (gameRenderer && gameRenderer.createParticleExplosion) {
            lines.forEach(lineY => {
                for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                    gameRenderer.createParticleExplosion(x, lineY, '#4ecdc4', 5);
                }
            });
        }
    }

    createTripleLineEffect(lines) {
        // Even more intense with different colors
        if (gameRenderer && gameRenderer.createParticleExplosion) {
            lines.forEach(lineY => {
                for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                    gameRenderer.createParticleExplosion(x, lineY, '#ff6b6b', 7);
                }
            });
        }
    }

    createTetrisEffect(lines) {
        // Maximum intensity gold particles
        if (gameRenderer && gameRenderer.createParticleExplosion) {
            lines.forEach(lineY => {
                for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                    gameRenderer.createParticleExplosion(x, lineY, '#ffd700', 10);
                }
            });
        }
        
        // Additional screen shake for Tetris
        if (gameRenderer && gameRenderer.triggerScreenShake) {
            gameRenderer.triggerScreenShake(8);
        }
    }

    triggerScreenEffects(lineCount) {
        // Screen shake intensity based on lines cleared
        const shakeIntensity = Math.min(lineCount * 2, 8);
        if (gameRenderer && gameRenderer.triggerScreenShake) {
            gameRenderer.triggerScreenShake(shakeIntensity);
        }
        
        // Flash effect with different colors
        const flashColors = ['#ffffff', '#4ecdc4', '#ff6b6b', '#ffd700'];
        const flashColor = flashColors[Math.min(lineCount - 1, 3)];
        if (gameRenderer && gameRenderer.triggerFlash) {
            gameRenderer.triggerFlash(flashColor, 0.3);
        }
        
        // Game state flash effect
        if (gameState && gameState.flashScreen) {
            gameState.flashScreen(flashColor, EFFECTS.FLASH_DURATION + lineCount * 20);
        }
    }

    showLineClearMessage(linesCleared) {
        const messages = ['', 'Single!', 'Double!', 'Triple!', 'TETRIS!'];
        const colors = ['', '#ffffff', '#4ecdc4', '#ff6b6b', '#ffd700'];
        const message = messages[linesCleared];
        const color = colors[linesCleared];
        
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `
                <div style="font-size: 2em; color: ${color}; text-shadow: 0 0 10px ${color};">${message}</div>
                <div style="font-size: 1.2em; color: #ffffff; margin-top: 5px;">
                    ${this.getScoreForLines(linesCleared).toLocaleString()} pts
                </div>
            `;
            messageElement.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                text-align: center; font-weight: bold; z-index: 1000;
                background: rgba(0, 0, 0, 0.9); padding: 20px; border-radius: 10px;
                border: 2px solid ${color}; animation: lineClearMessage 1s ease-out;
                pointer-events: none; box-shadow: 0 0 20px ${color}80;
            `;
            
            // Add enhanced animation
            if (!document.getElementById('lineClearMessageStyle')) {
                const style = document.createElement('style');
                style.id = 'lineClearMessageStyle';
                style.textContent = `
                    @keyframes lineClearMessage {
                        0% { transform: translate(-50%, -50%) scale(0.5) rotate(-10deg); opacity: 0; }
                        20% { transform: translate(-50%, -50%) scale(1.2) rotate(5deg); opacity: 1; }
                        40% { transform: translate(-50%, -50%) scale(1.1) rotate(-2deg); opacity: 1; }
                        60% { transform: translate(-50%, -50%) scale(1.05) rotate(1deg); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(messageElement);
            setTimeout(() => messageElement.remove(), 1000);
        }
    }

    getScoreForLines(linesCleared) {
        const baseScores = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS];
        return (baseScores[linesCleared] || SCORING.TETRIS) * gameState.level;
    }

    updateScore(linesCleared) {
        const baseScore = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS];
        const points = baseScore[linesCleared] || SCORING.TETRIS;
        
        // Check for perfect clear bonus
        if (scoreManager.isPerfectClear()) {
            const perfectScore = scoreManager.calculateScore('PERFECT_CLEAR', 0, gameState.level);
            scoreManager.addScore(perfectScore);
        }
        
        // Regular line clear score
        const lineScore = scoreManager.calculateScore('LINE_CLEAR', linesCleared, gameState.level);
        scoreManager.addScore(lineScore);
        
        // Update game state
        gameState.updateLines(linesCleared);
    }

    cleanupClearingStates() {
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                if (gameBoard.getCell(x, y) === 'clearing') {
                    gameBoard.setCell(x, y, 0);
                }
            }
        }
    }

    // Enhanced combo detection
    checkForSpecialClears() {
        const isEmpty = this.isPerfectClear();
        if (isEmpty) {
            this.triggerPerfectClear();
        }
    }

    isPerfectClear() {
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                if (gameBoard.getCell(x, y) !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    triggerPerfectClear() {
        // Ultimate visual effects for perfect clear
        if (gameRenderer) {
            // Multiple screen shakes
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    gameRenderer.triggerScreenShake(10);
                    gameRenderer.triggerFlash('#ffd700', 0.5);
                }, i * 200);
            }
            
            // Particle explosion across entire board
            for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
                for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                    gameRenderer.createParticleExplosion(x, y, '#ffd700', 3);
                }
            }
        }
    }

    getCurrentClearingState() {
        return {
            isClearing: this.currentClearing,
            animationDuration: this.animationDuration
        };
    }
}

window.lineClearer = new LineClearer();
