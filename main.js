// Main Entry Point
class TetrisGame {
    constructor() {
        this.statisticsInterval = null;
        this.uiUpdateInterval = null;
        this.init();
    }

    init() {
        document.readyState === 'loading' 
            ? document.addEventListener('DOMContentLoaded', () => this.setup())
            : this.setup();
    }

    setup() {
        try {
            this.validateSystems();
            this.setupEventListeners();
            this.setupPeriodicUpdates();
            this.showWelcomeMessage();
            this.startGame();
        } catch (error) {
            console.error('Tetris initialization error:', error);
            this.showErrorMessage(error.message);
        }
    }

    validateSystems() {
        const required = ['gameState', 'gameBoard', 'gameManager', 'gameRenderer', 
                         'gameLoop', 'inputHandler', 'scoreManager', 'lineClearer'];
        const missing = required.filter(sys => !window[sys]);
        if (missing.length) throw new Error(`Missing: ${missing.join(', ')}`);
        gameState.updateDisplay();
    }

    setupEventListeners() {
        // Game state management
        window.addEventListener('blur', () => {
            if (gameState.isPlaying()) {
                gameState.setState(GAME_STATES.PAUSED);
            }
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && gameState.isPlaying()) {
                gameState.setState(GAME_STATES.PAUSED);
            }
        });
        
        // Responsive canvas
        window.addEventListener('resize', () => {
            gameRenderer?.setupCanvas();
            this.updateCanvasSize();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            if (e.key === 'Escape' && gameState.isPlaying()) {
                gameState.setState(GAME_STATES.PAUSED);
            }
        });
    }

    setupPeriodicUpdates() {
        // Update UI statistics every 500ms
        this.uiUpdateInterval = setInterval(() => {
            this.updateStatistics();
            this.updateGameTime();
        }, 500);
        
        // Update performance metrics every 100ms
        this.statisticsInterval = setInterval(() => {
            this.updatePerformanceMetrics();
        }, 100);
    }

    updateStatistics() {
        const ppsElement = document.getElementById('pps');
        const efficiencyElement = document.getElementById('efficiency');
        
        if (ppsElement && gameManager) {
            const performance = gameManager.getGamePerformance();
            ppsElement.textContent = (performance.piecesPerMinute / 60).toFixed(1);
        }
        
        if (efficiencyElement && gameManager) {
            const efficiency = gameManager.calculateEfficiency();
            efficiencyElement.textContent = Math.round(efficiency) + '%';
        }
    }

    updateGameTime() {
        const timeElement = document.getElementById('gameTime');
        if (timeElement && gameState.gameStartTime) {
            const elapsed = Date.now() - gameState.gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updatePerformanceMetrics() {
        if (gameState.isPlaying()) {
            // Update combo display
            const comboElement = document.getElementById('combo');
            if (comboElement && scoreManager) {
                comboElement.textContent = scoreManager.combo;
            }
            
            // Update hold piece display
            this.updateHoldPieceDisplay();
            
            // Update visual effects based on game state
            this.updateVisualEffects();
        }
    }

    updateHoldPieceDisplay() {
        const holdCanvas = document.getElementById('holdPiece');
        if (holdCanvas && gameRenderer && gameManager) {
            const holdPieceInfo = gameManager.getHoldPieceInfo();
            const ctx = holdCanvas.getContext('2d');
            
            ctx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
            
            if (holdPieceInfo) {
                gameRenderer.drawPiecePreview(ctx, holdPieceInfo, holdCanvas.width, holdCanvas.height);
            }
            
            // Visual feedback for hold availability
            holdCanvas.className = (gameManager.canHold !== false) ? '' : 'disabled';
        }
    }

    updateVisualEffects() {
        const gameBoard = document.getElementById('gameBoard');
        const container = document.querySelector('.game-board-container');
        
        if (gameBoard && container) {
            const boardAnalysis = window.gameBoard ? window.gameBoard.getBoardAnalysis() : null;
            const currentPiece = gameManager ? gameManager.getCurrentPieceInfo() : null;
            
            // Danger zone effect
            if (boardAnalysis && boardAnalysis.dangerLevel > 50) {
                container.classList.add('danger-zone');
            } else {
                container.classList.remove('danger-zone');
            }
            
            // Combo effect
            if (scoreManager && scoreManager.combo > 0) {
                container.classList.add('combo-active');
            } else {
                container.classList.remove('combo-active');
            }
            
            // Lock warning effect
            if (currentPiece && currentPiece.lockProgress > 0.7) {
                gameBoard.classList.add('lock-warning');
            } else {
                gameBoard.classList.remove('lock-warning');
            }
        }
    }

    updateCanvasSize() {
        const gameBoard = document.getElementById('gameBoard');
        const nextPiece = document.getElementById('nextPiece');
        const holdPiece = document.getElementById('holdPiece');
        
        if (window.innerWidth <= 768) {
            // Mobile optimizations
            if (gameBoard) {
                gameBoard.style.width = '280px';
                gameBoard.style.height = '560px';
            }
            if (nextPiece) {
                nextPiece.style.width = '70px';
                nextPiece.style.height = '70px';
            }
            if (holdPiece) {
                holdPiece.style.width = '70px';
                holdPiece.style.height = '70px';
            }
        } else {
            // Desktop sizes
            if (gameBoard) {
                gameBoard.style.width = '300px';
                gameBoard.style.height = '600px';
            }
            if (nextPiece) {
                nextPiece.style.width = '80px';
                nextPiece.style.height = '80px';
            }
            if (holdPiece) {
                holdPiece.style.width = '80px';
                holdPiece.style.height = '80px';
            }
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable full-screen:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    showWelcomeMessage() {
        const overlay = document.getElementById('gameOverlay');
        const message = document.getElementById('gameMessage');
        overlay.classList.add('visible');
        message.innerHTML = `
            <h2>Welcome to Enhanced Tetris!</h2>
            <p>Features: Hold pieces, Advanced scoring, Visual effects</p>
            <p>Use arrow keys to move, Space to hard drop</p>
            <p>Press H to hold pieces, P to pause</p>
            <p>Press SPACE to start</p>
        `;
        gameState.setState(GAME_STATES.MENU);
    }

    startGame() {
        const startHandler = (e) => {
            if (e.key === ' ' && gameState.currentState === GAME_STATES.MENU) {
                document.removeEventListener('keydown', startHandler);
                gameState.setState(GAME_STATES.PLAYING);
                gameState.gameStartTime = Date.now();
                gameLoop.start();
            }
        };
        document.addEventListener('keydown', startHandler);
    }

    showErrorMessage(message) {
        const overlay = document.getElementById('gameOverlay');
        const messageEl = document.getElementById('gameMessage');
        overlay.classList.add('visible');
        messageEl.innerHTML = `<h2>Error</h2><p>${message}</p><p>Refresh to try again</p>`;
        overlay.style.background = 'rgba(255, 0, 0, 0.8)';
    }

    // Cleanup method for when the game ends
    cleanup() {
        if (this.uiUpdateInterval) {
            clearInterval(this.uiUpdateInterval);
            this.uiUpdateInterval = null;
        }
        if (this.statisticsInterval) {
            clearInterval(this.statisticsInterval);
            this.statisticsInterval = null;
        }
    }
}

// Initialize the game
const tetrisGame = new TetrisGame();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    tetrisGame.cleanup();
});
