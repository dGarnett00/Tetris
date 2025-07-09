// Game Board Management
class Board {
    constructor(width = GAME_CONFIG.BOARD_WIDTH, height = GAME_CONFIG.BOARD_HEIGHT) {
        this.width = width;
        this.height = height;
        this.grid = this.createEmptyGrid();
    }

    createEmptyGrid() {
        return Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    reset() {
        this.grid = this.createEmptyGrid();
    }

    isValidPosition(piece, x, y) {
        const shape = piece.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Check boundaries
                    if (newX < 0 || newX >= this.width || newY >= this.height) {
                        return false;
                    }
                    
                    // Check collision with existing blocks
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece(piece, x, y) {
        const shape = piece.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    if (boardY >= 0 && boardY < this.height && boardX >= 0 && boardX < this.width) {
                        this.grid[boardY][boardX] = piece.type;
                    }
                }
            }
        }
    }

    getFullLines() {
        const fullLines = [];
        for (let row = 0; row < this.height; row++) {
            if (this.grid[row].every(cell => cell !== 0)) {
                fullLines.push(row);
            }
        }
        return fullLines;
    }

    clearLines(lines) {
        // Remove full lines
        lines.forEach(lineIndex => {
            this.grid.splice(lineIndex, 1);
            this.grid.unshift(Array(this.width).fill(0));
        });
    }

    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 0;
        }
        return this.grid[y][x];
    }

    setCell(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = value;
        }
    }

    getDropPosition(piece, x, y) {
        let dropY = y;
        while (this.isValidPosition(piece, x, dropY + 1)) {
            dropY++;
        }
        return dropY;
    }
}

// Create global board instance
window.gameBoard = new Board();
