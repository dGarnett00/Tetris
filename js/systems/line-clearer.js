// Line Clearing System
class LineClearer {
    constructor() {
        this.animationDuration = 100;
    }

    checkAndClearLines() {
        const fullLines = this.findFullLines();
        
        if (fullLines.length > 0) {
            this.animateLineClear(fullLines);
            setTimeout(() => {
                this.clearLines(fullLines);
                this.updateScore(fullLines.length);
                this.showLineClearMessage(fullLines.length);
                this.cleanupClearingStates();
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
                for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                    gameBoard.setCell(x, lineIndex, 'clearing');
                }
            }, index * 25);
        });
    }

    showLineClearMessage(linesCleared) {
        const messages = ['', 'Single!', 'Double!', 'Triple!', 'TETRIS!'];
        const message = messages[linesCleared];
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                font-size: 2em; font-weight: bold; color: #ffd700; z-index: 1000;
                animation: levelUp 1s ease-out; pointer-events: none;
            `;
            document.body.appendChild(messageElement);
            setTimeout(() => messageElement.remove(), 1000);
        }
    }

    updateScore(linesCleared) {
        const baseScore = [0, 100, 300, 500, 800];
        const points = baseScore[linesCleared] || 800;
        gameState.updateScore(points * gameState.level);
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
}

window.lineClearer = new LineClearer();
