// Line Clearing System
class LineClearer {
    constructor() {
        this.board = gameBoard;
        this.animationDuration = 300;
    }

    checkAndClearLines() {
        const fullLines = this.findFullLines();
        
        if (fullLines.length > 0) {
            // Enhanced line clear animation
            this.animateLineClear(fullLines);
            
            // Stagger the clearing for better visual effect
            setTimeout(() => {
                this.clearLines(fullLines);
                this.updateScore(fullLines.length);
                this.showLineClearMessage(fullLines.length);
            }, this.animationDuration);
        }
        
        return fullLines.length;
    }

    findFullLines() {
        const fullLines = [];
        
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            let isFullLine = true;
            
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                if (this.board.getCell(x, y) === 0) {
                    isFullLine = false;
                    break;
                }
            }
            
            if (isFullLine) {
                fullLines.push(y);
            }
        }
        
        return fullLines;
    }

    clearLines(lines) {
        // Sort lines in descending order to avoid index shifting issues
        lines.sort((a, b) => b - a);
        
        // Remove each line and add empty line at top
        lines.forEach(lineIndex => {
            // Remove the line
            this.board.grid.splice(lineIndex, 1);
            // Add empty line at the top
            this.board.grid.unshift(new Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
        });
    }

    // Enhanced line clear animation
    animateLineClear(lines) {
        // Enhanced visual feedback with staggered animation
        lines.forEach((lineIndex, index) => {
            setTimeout(() => {
                for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                    // Mark for animation with enhanced effect
                    this.board.setCell(x, lineIndex, 'clearing');
                }
            }, index * 100); // Stagger animation
        });
    }

    showLineClearMessage(linesCleared) {
        const messages = {
            1: 'Single!',
            2: 'Double!',
            3: 'Triple!',
            4: 'TETRIS!'
        };
        
        const message = messages[linesCleared];
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2em;
                font-weight: bold;
                color: #ffd700;
                z-index: 1000;
                animation: levelUp 1s ease-out;
                pointer-events: none;
            `;
            
            document.body.appendChild(messageElement);
            
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 1000);
        }
    }

    updateScore(linesCleared) {
        // Score based on number of lines cleared simultaneously
        const baseScore = [0, 100, 300, 500, 800];
        const points = baseScore[linesCleared] || 800;
        const levelMultiplier = gameState.level;
        
        gameState.updateScore(points * levelMultiplier);
        gameState.updateLines(linesCleared);
    }

    getLineScore(linesCleared) {
        const scores = {
            1: 100,   // Single
            2: 300,   // Double
            3: 500,   // Triple
            4: 800    // Tetris
        };
        return scores[linesCleared] || 0;
    }

    // Check if a specific line is full
    isLineFull(lineIndex) {
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            if (this.board.getCell(x, lineIndex) === 0) {
                return false;
            }
        }
        return true;
    }

    // Get number of holes in the board (for AI or advanced scoring)
    getHoleCount() {
        let holes = 0;
        
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            let foundBlock = false;
            
            for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
                if (this.board.getCell(x, y) !== 0) {
                    foundBlock = true;
                } else if (foundBlock) {
                    holes++;
                }
            }
        }
        
        return holes;
    }
}

// Create global line clearer
window.lineClearer = new LineClearer();
