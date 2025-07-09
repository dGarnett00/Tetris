// Tetris Piece Class
class Piece {
    constructor(type) {
        this.type = type;
        this.shapes = SHAPES[type];
        this.currentRotation = 0;
        this.x = Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - 1;
        this.y = 0;
    }

    getCurrentShape() {
        return this.shapes[this.currentRotation];
    }

    rotate() {
        const newRotation = (this.currentRotation + 1) % this.shapes.length;
        const originalRotation = this.currentRotation;
        this.currentRotation = newRotation;

        // Check if rotation is valid
        if (!gameBoard.isValidPosition(this, this.x, this.y)) {
            // Try wall kick (move left or right)
            if (gameBoard.isValidPosition(this, this.x - 1, this.y)) {
                this.x--;
            } else if (gameBoard.isValidPosition(this, this.x + 1, this.y)) {
                this.x++;
            } else {
                // Rotation not possible, revert
                this.currentRotation = originalRotation;
                return false;
            }
        }
        return true;
    }

    moveLeft() {
        if (gameBoard.isValidPosition(this, this.x - 1, this.y)) {
            this.x--;
            return true;
        }
        return false;
    }

    moveRight() {
        if (gameBoard.isValidPosition(this, this.x + 1, this.y)) {
            this.x++;
            return true;
        }
        return false;
    }

    moveDown() {
        if (gameBoard.isValidPosition(this, this.x, this.y + 1)) {
            this.y++;
            return true;
        }
        return false;
    }

    hardDrop() {
        let dropDistance = 0;
        while (this.moveDown()) {
            dropDistance++;
        }
        return dropDistance; // Return distance for scoring
    }

    getGhostPosition() {
        return gameBoard.getDropPosition(this, this.x, this.y);
    }

    // Enhanced ghost piece with better positioning
    getGhostPiece() {
        const ghost = this.clone();
        ghost.y = this.getGhostPosition();
        return ghost;
    }

    clone() {
        const clonedPiece = new Piece(this.type);
        clonedPiece.currentRotation = this.currentRotation;
        clonedPiece.x = this.x;
        clonedPiece.y = this.y;
        return clonedPiece;
    }
}

// Piece Factory
class PieceFactory {
    constructor() {
        this.pieceTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        this.bag = [];
        this.fillBag();
    }

    fillBag() {
        this.bag = [...this.pieceTypes];
        this.shuffleBag();
    }

    shuffleBag() {
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    getNextPiece() {
        if (this.bag.length === 0) {
            this.fillBag();
        }
        const pieceType = this.bag.pop();
        return new Piece(pieceType);
    }
}

// Export classes
window.Piece = Piece;
window.PieceFactory = PieceFactory;
