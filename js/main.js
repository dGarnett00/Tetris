// Main Entry Point
class TetrisGame {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        try {
            // Initialize game systems
            this.initializeGameSystems();
            
            // Show initial game state
            this.showWelcomeMessage();
            
            // Start the game
            this.startGame();
            
            console.log('Tetris game initialized successfully!');
            this.initialized = true;
            
        } catch (error) {
            console.error('Error initializing Tetris game:', error);
            this.showErrorMessage(error.message);
        }
    }

    initializeGameSystems() {
        // Validate that all systems are loaded
        const requiredSystems = [
            'gameState', 'gameBoard', 'gameManager', 'gameRenderer', 
            'gameLoop', 'inputHandler', 'scoreManager', 'lineClearer',
            'collisionDetector'
        ];

        const missingSystems = requiredSystems.filter(system => !window[system]);
        
        if (missingSystems.length > 0) {
            throw new Error(`Missing game systems: ${missingSystems.join(', ')}`);
        }

        // Initialize display
        gameState.updateDisplay();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle window focus/blur for auto-pause
        window.addEventListener('blur', () => {
            if (gameState.isPlaying()) {
                gameState.setState(GAME_STATES.PAUSED);
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && gameState.isPlaying()) {
                gameState.setState(GAME_STATES.PAUSED);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    showWelcomeMessage() {
        const overlay = document.getElementById('gameOverlay');
        const message = document.getElementById('gameMessage');
        
        overlay.classList.add('visible');
        message.innerHTML = `
            <h2>Welcome to Tetris!</h2>
            <p>Use arrow keys to move and rotate</p>
            <p>Press SPACE to start</p>
        `;
        
        gameState.setState(GAME_STATES.MENU);
    }

    startGame() {
        // Wait for space key to start
        const startGameHandler = (event) => {
            if (event.key === ' ' && gameState.currentState === GAME_STATES.MENU) {
                document.removeEventListener('keydown', startGameHandler);
                gameState.setState(GAME_STATES.PLAYING);
                gameLoop.start();
            }
        };
        
        document.addEventListener('keydown', startGameHandler);
    }

    handleResize() {
        // Handle responsive design if needed
        if (gameRenderer) {
            gameRenderer.setupCanvas();
        }
    }

    showErrorMessage(message) {
        const overlay = document.getElementById('gameOverlay');
        const messageElement = document.getElementById('gameMessage');
        
        overlay.classList.add('visible');
        messageElement.innerHTML = `
            <h2>Error</h2>
            <p>${message}</p>
            <p>Please refresh the page to try again</p>
        `;
        
        overlay.style.background = 'rgba(255, 0, 0, 0.8)';
    }

    // Game control methods
    pauseGame() {
        if (gameState.isPlaying()) {
            gameState.setState(GAME_STATES.PAUSED);
        }
    }

    resumeGame() {
        if (gameState.currentState === GAME_STATES.PAUSED) {
            gameState.setState(GAME_STATES.PLAYING);
        }
    }

    restartGame() {
        if (gameManager) {
            gameManager.restart();
        }
    }

    // Debug methods
    getGameInfo() {
        return {
            initialized: this.initialized,
            gameState: gameState.currentState,
            score: gameState.score,
            lines: gameState.lines,
            level: gameState.level,
            currentPiece: gameManager.getCurrentPieceInfo(),
            nextPiece: gameManager.getNextPieceInfo(),
            performance: gameLoop.getGameStats()
        };
    }

    // Utility methods
    exportGameState() {
        return {
            board: gameBoard.grid,
            score: gameState.score,
            lines: gameState.lines,
            level: gameState.level,
            timestamp: Date.now()
        };
    }
}

// Initialize the game when script loads
const tetrisGame = new TetrisGame();

// Export for console debugging
window.tetrisGame = tetrisGame;
