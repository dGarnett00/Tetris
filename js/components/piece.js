// Tetris Piece Class
class Piece {
    constructor(type) {
        this.type = type;
        this.shapes = SHAPES[type];
        this.currentRotation = 0;
        this.x = Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - 1;
        this.y = 0;
    }

    getCurrentShape() { return this.shapes[this.currentRotation]; }

    rotate() {
        const newRotation = (this.currentRotation + 1) % this.shapes.length;
        const oldRotation = this.currentRotation;
        this.currentRotation = newRotation;

        if (!gameBoard.isValidPosition(this, this.x, this.y)) {
            // Try wall kick
            if (gameBoard.isValidPosition(this, this.x - 1, this.y)) this.x--;
            else if (gameBoard.isValidPosition(this, this.x + 1, this.y)) this.x++;
            else this.currentRotation = oldRotation;
        }
    }

    moveLeft() { 
        if (gameBoard.isValidPosition(this, this.x - 1, this.y)) { this.x--; return true; }
        return false;
    }
    
    moveRight() { 
        if (gameBoard.isValidPosition(this, this.x + 1, this.y)) { this.x++; return true; }
        return false;
    }
    
    moveDown() { 
        if (gameBoard.isValidPosition(this, this.x, this.y + 1)) { this.y++; return true; }
        return false;
    }

    hardDrop() {
        let distance = 0;
        while (this.moveDown()) distance++;
        return distance;
    }

    getGhostPosition() { return gameBoard.getDropPosition(this, this.x, this.y); }

    clone() {
        const clone = new Piece(this.type);
        clone.currentRotation = this.currentRotation;
        clone.x = this.x;
        clone.y = this.y;
        return clone;
    }
}

// Simplified Piece Factory
class PieceFactory {
    constructor() {
        this.bag = [];
        this.types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    }

    getNextPiece() {
        if (this.bag.length === 0) {
            this.bag = [...this.types].sort(() => Math.random() - 0.5);
        }
        return new Piece(this.bag.pop());
    }
}

window.Piece = Piece;
window.PieceFactory = PieceFactory;
