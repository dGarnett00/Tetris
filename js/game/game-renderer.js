// Game Renderer System
class GameRenderer {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = GAME_CONFIG.BOARD_WIDTH * this.cellSize;
        this.canvas.height = GAME_CONFIG.BOARD_HEIGHT * this.cellSize;
        this.ctx.imageSmoothingEnabled = false;
        this.nextCtx.imageSmoothingEnabled = false;
    }

    render() {
        this.clearCanvas();
        this.renderBoard();
        if (gameManager.currentPiece) {
            this.renderGhostPiece();
            this.renderPiece(gameManager.currentPiece);
        }
        this.renderNextPiece();
    }

    clearCanvas() {
        this.ctx.fillStyle = COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderBoard() {
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
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
                if (shape[row][col] && piece.y + row >= 0) {
                    this.drawCell(piece.x + col, piece.y + row, color);
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
                if (shape[row][col] && ghostY + row >= 0 && ghostY + row !== piece.y + row) {
                    this.drawCell(piece.x + col, ghostY + row, COLORS.GHOST, true);
                }
            }
        }
    }

    renderNextPiece() {
        if (!gameManager.nextPiece) return;
        
        this.nextCtx.fillStyle = COLORS.EMPTY;
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const shape = gameManager.nextPiece.getCurrentShape();
        const color = COLORS[gameManager.nextPiece.type];
        const cellSize = this.cellSize * 0.6;
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
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
        
        if (!isGhost) {
            // Add 3D effect
            const gradient = this.ctx.createLinearGradient(pixelX, pixelY, pixelX + this.cellSize, pixelY + this.cellSize);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            
            // Highlight and shadow
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, 2);
            this.ctx.fillRect(pixelX, pixelY, 2, this.cellSize);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(pixelX + this.cellSize - 2, pixelY + 2, 2, this.cellSize - 2);
            this.ctx.fillRect(pixelX + 2, pixelY + this.cellSize - 2, this.cellSize - 2, 2);
        }
        
        this.ctx.strokeStyle = COLORS.BORDER;
        this.ctx.lineWidth = isGhost ? 2 : 1;
        this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
    }

    getCellColor(cellValue) {
        return cellValue === 'clearing' ? COLORS.CLEARING : COLORS[cellValue] || COLORS.EMPTY;
    }
}

window.gameRenderer = new GameRenderer();
