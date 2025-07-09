// Game Board Management
class Board {
    constructor() {
        this.width = GAME_CONFIG.BOARD_WIDTH;
        this.height = GAME_CONFIG.BOARD_HEIGHT;
        this.reset();
    }

    reset() {
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    isValidPosition(piece, x, y) {
        const shape = piece.getCurrentShape();
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col, newY = y + row;
                    if (newX < 0 || newX >= this.width || newY >= this.height ||
                        (newY >= 0 && this.grid[newY][newX])) return false;
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
                    const boardX = x + col, boardY = y + row;
                    if (boardY >= 0 && boardY < this.height && boardX >= 0 && boardX < this.width) {
                        this.grid[boardY][boardX] = piece.type;
                    }
                }
            }
        }
    }

    getFullLines() {
        return this.grid.map((row, index) => row.every(cell => cell !== 0) ? index : -1)
                       .filter(index => index !== -1);
    }

    clearLines(lines) {
        lines.sort((a, b) => b - a).forEach(line => {
            this.grid.splice(line, 1);
            this.grid.unshift(Array(this.width).fill(0));
        });
    }

    getCell(x, y) { 
        return (x >= 0 && x < this.width && y >= 0 && y < this.height) ? this.grid[y][x] : 0; 
    }
    
    setCell(x, y, value) { 
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) this.grid[y][x] = value; 
    }

    getDropPosition(piece, x, y) {
        while (this.isValidPosition(piece, x, y + 1)) y++;
        return y;
    }
}

window.gameBoard = new Board();
