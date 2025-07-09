// Line Clearing System
class LineClearer {
    constructor() {
        this.board = gameBoard;
        this.animationDuration = 300;
    }

    checkAndClearLines() {
        const fullLines = this.findFullLines();
        
        if (fullLines.length > 0) {
            this.animateLineClear(fullLines);
            setTimeout(() => {
                this.clearLines(fullLines);
                this.updateScore(fullLines.length);
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

    animateLineClear(lines) {
        // Simple visual feedback - could be expanded
        lines.forEach(lineIndex => {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                // Mark for animation (visual effect handled by renderer)
                this.board.setCell(x, lineIndex, 'clearing');
            }
        });
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
