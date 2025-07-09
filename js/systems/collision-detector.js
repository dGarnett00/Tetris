// Collision Detection System
class CollisionDetector {
    constructor() {
        this.board = gameBoard;
    }

    checkPieceCollision(piece, x, y) {
        const shape = piece.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const checkX = x + col;
                    const checkY = y + row;
                    
                    // Check if collision occurs
                    if (this.isColliding(checkX, checkY)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isColliding(x, y) {
        // Check bounds
        if (x < 0 || x >= GAME_CONFIG.BOARD_WIDTH || y >= GAME_CONFIG.BOARD_HEIGHT) {
            return true;
        }
        
        // Check if position is occupied (y < 0 is allowed for spawning)
        if (y >= 0 && this.board.getCell(x, y) !== 0) {
            return true;
        }
        
        return false;
    }

    canPieceMove(piece, direction) {
        const newX = piece.x + direction.x;
        const newY = piece.y + direction.y;
        
        return !this.checkPieceCollision(piece, newX, newY);
    }

    canPieceRotate(piece) {
        const originalRotation = piece.currentRotation;
        const newRotation = (originalRotation + 1) % piece.shapes.length;
        
        // Temporarily change rotation to check collision
        piece.currentRotation = newRotation;
        const canRotate = !this.checkPieceCollision(piece, piece.x, piece.y);
        piece.currentRotation = originalRotation;
        
        return canRotate;
    }

    getWallKickPositions(piece) {
        // Simple wall kick - try moving left or right
        const positions = [
            { x: piece.x - 1, y: piece.y },
            { x: piece.x + 1, y: piece.y },
            { x: piece.x - 2, y: piece.y },
            { x: piece.x + 2, y: piece.y }
        ];
        
        return positions.filter(pos => 
            !this.checkPieceCollision(piece, pos.x, pos.y)
        );
    }

    isGameOver() {
        // Check if any block is above the playing field
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            if (this.board.getCell(x, 0) !== 0) {
                return true;
            }
        }
        return false;
    }

    findBottomPosition(piece, x, y) {
        let bottomY = y;
        while (!this.checkPieceCollision(piece, x, bottomY + 1)) {
            bottomY++;
        }
        return bottomY;
    }
}

// Create global collision detector
window.collisionDetector = new CollisionDetector();
