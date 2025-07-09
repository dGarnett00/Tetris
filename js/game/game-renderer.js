// Game Renderer System
class GameRenderer {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        this.boardWidth = GAME_CONFIG.BOARD_WIDTH;
        this.boardHeight = GAME_CONFIG.BOARD_HEIGHT;
        
        this.setupCanvas();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = this.boardWidth * this.cellSize;
        this.canvas.height = this.boardHeight * this.cellSize;
        
        // Enable crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;
        this.nextCtx.imageSmoothingEnabled = false;
    }

    render() {
        // Clear canvas
        this.clearCanvas();
        
        // Render board
        this.renderBoard();
        
        // Render ghost piece
        if (gameManager.currentPiece) {
            this.renderGhostPiece();
        }
        
        // Render current piece
        if (gameManager.currentPiece) {
            this.renderPiece(gameManager.currentPiece);
        }
        
        // Render next piece
        this.renderNextPiece();
    }

    clearCanvas() {
        this.ctx.fillStyle = COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderBoard() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = gameBoard.getCell(x, y);
                if (cell !== 0) {
                    this.drawCell(x, y, this.getCellColor(cell));
                }
            }
        }
    }

    renderPiece(piece) {
        const shape = piece.getCurrentShape();
        const color = COLORS[piece.type];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = piece.x + col;
                    const y = piece.y + row;
                    
                    if (y >= 0) { // Don't render above the board
                        this.drawCell(x, y, color);
                    }
                }
            }
        }
    }

    renderGhostPiece() {
        const piece = gameManager.currentPiece;
        const ghostY = piece.getGhostPosition();
        const shape = piece.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = piece.x + col;
                    const y = ghostY + row;
                    
                    if (y >= 0 && y !== piece.y + row) {
                        this.drawCell(x, y, COLORS.GHOST, true);
                    }
                }
            }
        }
    }

    renderNextPiece() {
        if (!gameManager.nextPiece) return;
        
        // Clear next piece canvas
        this.nextCtx.fillStyle = COLORS.EMPTY;
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const shape = gameManager.nextPiece.getCurrentShape();
        const color = COLORS[gameManager.nextPiece.type];
        const scale = 0.6;
        const cellSize = this.cellSize * scale;
        
        // Center the piece
        const offsetX = (this.nextCanvas.width - (shape[0].length * cellSize)) / 2;
        const offsetY = (this.nextCanvas.height - (shape.length * cellSize)) / 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = offsetX + col * cellSize;
                    const y = offsetY + row * cellSize;
                    
                    this.nextCtx.fillStyle = color;
                    this.nextCtx.fillRect(x, y, cellSize, cellSize);
                    this.nextCtx.strokeStyle = COLORS.BORDER;
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(x, y, cellSize, cellSize);
                }
            }
        }
    }

    drawCell(x, y, color, isGhost = false) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        
        if (isGhost) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            this.ctx.strokeStyle = COLORS.BORDER;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
        } else {
            // Enhanced 3D effect for blocks
            this.ctx.fillStyle = color;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            
            // Add gradient effect
            const gradient = this.ctx.createLinearGradient(
                pixelX, pixelY, 
                pixelX + this.cellSize, pixelY + this.cellSize
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            
            // Draw border with better styling
            this.ctx.strokeStyle = COLORS.BORDER;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
            
            // Add highlight effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, 2);
            this.ctx.fillRect(pixelX, pixelY, 2, this.cellSize);
            
            // Add shadow effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(pixelX + this.cellSize - 2, pixelY + 2, 2, this.cellSize - 2);
            this.ctx.fillRect(pixelX + 2, pixelY + this.cellSize - 2, this.cellSize - 2, 2);
        }
    }

    getCellColor(cellValue) {
        if (cellValue === 'clearing') {
            return '#ffffff';
        }
        return COLORS[cellValue] || COLORS.EMPTY;
    }

    // Utility methods
    screenToBoard(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((screenX - rect.left) / this.cellSize);
        const y = Math.floor((screenY - rect.top) / this.cellSize);
        return { x, y };
    }

    boardToScreen(boardX, boardY) {
        return {
            x: boardX * this.cellSize,
            y: boardY * this.cellSize
        };
    }
}

// Create global game renderer
window.gameRenderer = new GameRenderer();
