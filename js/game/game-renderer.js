// Enhanced Game Renderer System
class GameRenderer {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        this.setupCanvas();
        this.initializeEffects();
    }

    setupCanvas() {
        this.canvas.width = GAME_CONFIG.BOARD_WIDTH * this.cellSize;
        this.canvas.height = GAME_CONFIG.BOARD_HEIGHT * this.cellSize;
        this.ctx.imageSmoothingEnabled = false;
        this.nextCtx.imageSmoothingEnabled = false;
    }

    initializeEffects() {
        this.particleSystem = [];
        this.screenShakeIntensity = 0;
        this.flashEffect = { active: false, color: '#fff', intensity: 0 };
        this.ghostPulseTimer = 0;
        this.pieceTrails = [];
    }

    render() {
        this.clearCanvas();
        this.applyScreenShake();
        this.renderBoard();
        this.renderParticles();
        
        if (gameManager.currentPiece) {
            this.renderGhostPiece();
            this.renderPiece(gameManager.currentPiece);
            this.renderPieceTrail(gameManager.currentPiece);
        }
        
        this.renderNextPiece();
        this.applyFlashEffect();
        this.updateEffects();
    }

    clearCanvas() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    applyScreenShake() {
        if (this.screenShakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
            this.ctx.translate(shakeX, shakeY);
            this.screenShakeIntensity *= 0.9;
            if (this.screenShakeIntensity < 0.1) this.screenShakeIntensity = 0;
        }
    }

    renderBoard() {
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                const cell = gameBoard.getCell(x, y);
                if (cell !== 0) {
                    this.drawEnhancedCell(x, y, this.getCellColor(cell), cell === 'clearing');
                }
            }
        }
    }

    renderPiece(piece) {
        const shape = piece.getCurrentShape();
        const color = COLORS[piece.type];
        const glowIntensity = gameState.level * 0.1;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] && piece.y + row >= 0) {
                    this.drawEnhancedCell(piece.x + col, piece.y + row, color, false, glowIntensity);
                }
            }
        }
    }

    renderGhostPiece() {
        const piece = gameManager.currentPiece;
        const ghostY = piece.getGhostPosition();
        const shape = piece.getCurrentShape();
        
        // Animate ghost opacity
        this.ghostPulseTimer += 0.02;
        const opacity = 0.2 + Math.sin(this.ghostPulseTimer) * 0.1;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] && ghostY + row >= 0 && ghostY + row !== piece.y + row) {
                    this.drawGhostCell(piece.x + col, ghostY + row, opacity);
                }
            }
        }
    }

    renderPieceTrail(piece) {
        // Add current piece position to trail
        if (piece && this.pieceTrails.length < 5) {
            this.pieceTrails.push({
                x: piece.x,
                y: piece.y,
                shape: piece.getCurrentShape(),
                color: COLORS[piece.type],
                opacity: 0.3,
                timestamp: Date.now()
            });
        }
        
        // Render and fade trail
        this.pieceTrails = this.pieceTrails.filter(trail => {
            const age = Date.now() - trail.timestamp;
            if (age > 500) return false;
            
            const opacity = Math.max(0, 0.3 - (age / 500) * 0.3);
            this.renderTrailPiece(trail, opacity);
            return true;
        });
    }

    renderTrailPiece(trail, opacity) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        
        for (let row = 0; row < trail.shape.length; row++) {
            for (let col = 0; col < trail.shape[row].length; col++) {
                if (trail.shape[row][col] && trail.y + row >= 0) {
                    const pixelX = (trail.x + col) * this.cellSize;
                    const pixelY = (trail.y + row) * this.cellSize;
                    this.ctx.fillStyle = trail.color;
                    this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                }
            }
        }
        
        this.ctx.restore();
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
        
        // Add subtle glow effect
        this.nextCtx.shadowColor = color;
        this.nextCtx.shadowBlur = 5;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = offsetX + col * cellSize;
                    const y = offsetY + row * cellSize;
                    
                    this.nextCtx.fillStyle = color;
                    this.nextCtx.fillRect(x, y, cellSize, cellSize);
                    
                    // Add 3D effect
                    const gradient = this.nextCtx.createLinearGradient(x, y, x + cellSize, y + cellSize);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
                    this.nextCtx.fillStyle = gradient;
                    this.nextCtx.fillRect(x, y, cellSize, cellSize);
                    
                    this.nextCtx.strokeStyle = COLORS.BORDER;
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(x, y, cellSize, cellSize);
                }
            }
        }
        
        this.nextCtx.shadowBlur = 0;
    }

    drawEnhancedCell(x, y, color, isClearing = false, glowIntensity = 0) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        
        this.ctx.save();
        
        // Add glow effect for active pieces
        if (glowIntensity > 0) {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = glowIntensity * 10;
        }
        
        // Base cell color
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
        
        if (!isClearing) {
            // Enhanced 3D gradient effect
            const gradient = this.ctx.createLinearGradient(pixelX, pixelY, pixelX + this.cellSize, pixelY + this.cellSize);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
            
            // Enhanced highlights and shadows
            this.ctx.fillStyle = COLORS.HIGHLIGHT;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, 3);
            this.ctx.fillRect(pixelX, pixelY, 3, this.cellSize);
            
            this.ctx.fillStyle = COLORS.SHADOW;
            this.ctx.fillRect(pixelX + this.cellSize - 3, pixelY + 3, 3, this.cellSize - 3);
            this.ctx.fillRect(pixelX + 3, pixelY + this.cellSize - 3, this.cellSize - 3, 3);
        } else {
            // Clearing animation effect
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(Date.now() * 0.01) * 0.2})`;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
        }
        
        // Border
        this.ctx.strokeStyle = COLORS.BORDER;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
        
        this.ctx.restore();
    }

    drawGhostCell(x, y, opacity) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        
        // Ghost cell with dotted border effect
        this.ctx.strokeStyle = COLORS.GHOST_OUTLINE;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([4, 4]);
        this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
        
        // Inner glow
        this.ctx.fillStyle = COLORS.GHOST;
        this.ctx.fillRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
        
        this.ctx.restore();
    }

    renderParticles() {
        this.particleSystem.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
            this.ctx.restore();
        });
    }

    updateEffects() {
        // Update particles
        this.particleSystem = this.particleSystem.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.opacity -= 0.02;
            return particle.opacity > 0;
        });
        
        // Update flash effect
        if (this.flashEffect.active) {
            this.flashEffect.intensity -= 0.05;
            if (this.flashEffect.intensity <= 0) {
                this.flashEffect.active = false;
            }
        }
    }

    applyFlashEffect() {
        if (this.flashEffect.active) {
            this.ctx.save();
            this.ctx.globalAlpha = this.flashEffect.intensity;
            this.ctx.fillStyle = this.flashEffect.color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    getCellColor(cellValue) {
        return cellValue === 'clearing' ? COLORS.CLEARING : COLORS[cellValue] || COLORS.EMPTY;
    }

    // Effect triggers
    triggerScreenShake(intensity = 5) {
        this.screenShakeIntensity = intensity;
    }

    triggerFlash(color = '#ffffff', intensity = 0.3) {
        this.flashEffect = { active: true, color, intensity };
    }

    createParticleExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particleSystem.push({
                x: x * this.cellSize + this.cellSize / 2,
                y: y * this.cellSize + this.cellSize / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: color,
                opacity: 1
            });
        }
    }

    createLineClearEffect(lineY) {
        // Create particles along the cleared line
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            this.createParticleExplosion(x, lineY, '#ffffff', 5);
        }
        
        // Screen shake for line clear
        this.triggerScreenShake(3);
        
        // Flash effect
        this.triggerFlash('#ffffff', 0.2);
    }

    drawPiecePreview(ctx, pieceInfo, canvasWidth, canvasHeight) {
        if (!pieceInfo || !pieceInfo.shape) return;
        
        const shape = pieceInfo.shape;
        const cellSize = Math.min(canvasWidth / shape[0].length, canvasHeight / shape.length) * 0.8;
        
        // Center the piece in the canvas
        const offsetX = (canvasWidth - (shape[0].length * cellSize)) / 2;
        const offsetY = (canvasHeight - (shape.length * cellSize)) / 2;
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = offsetX + col * cellSize;
                    const y = offsetY + row * cellSize;
                    
                    // Draw the piece cell
                    ctx.fillStyle = COLORS[pieceInfo.type] || COLORS.I;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    
                    // Draw border
                    ctx.strokeStyle = COLORS.BORDER;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, cellSize, cellSize);
                }
            }
        }
    }
}

window.gameRenderer = new GameRenderer();
