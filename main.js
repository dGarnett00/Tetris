// Main Entry Point
class TetrisGame {
    constructor() {
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
        window.addEventListener('blur', () => gameState.isPlaying() && gameState.setState(GAME_STATES.PAUSED));
        document.addEventListener('visibilitychange', () => 
            document.hidden && gameState.isPlaying() && gameState.setState(GAME_STATES.PAUSED));
        window.addEventListener('resize', () => gameRenderer?.setupCanvas());
    }

    showWelcomeMessage() {
        const overlay = document.getElementById('gameOverlay');
        const message = document.getElementById('gameMessage');
        overlay.classList.add('visible');
        message.innerHTML = '<h2>Welcome to Tetris!</h2><p>Use arrow keys to move and rotate</p><p>Press SPACE to start</p>';
        gameState.setState(GAME_STATES.MENU);
    }

    startGame() {
        const startHandler = (e) => {
            if (e.key === ' ' && gameState.currentState === GAME_STATES.MENU) {
                document.removeEventListener('keydown', startHandler);
                gameState.setState(GAME_STATES.PLAYING);
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
}

new TetrisGame();
