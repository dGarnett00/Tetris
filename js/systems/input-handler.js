// Input Handler System
class InputHandler {
    constructor() {
        this.keys = {};
        this.keyRepeatDelay = 150; // Reduced for better responsiveness
        this.keyRepeatRate = 40; // Faster repeat rate
        this.lastKeyTime = {};
        this.moveBuffer = {}; // Buffer for smooth movement
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        event.preventDefault();
        
        const key = event.key;
        const currentTime = Date.now();
        
        // Check if key is already pressed and handle repeat
        if (this.keys[key]) {
            if (currentTime - this.lastKeyTime[key] < this.keyRepeatRate) {
                return;
            }
        } else {
            this.keys[key] = true;
            if (currentTime - (this.lastKeyTime[key] || 0) < this.keyRepeatDelay) {
                return;
            }
        }
        
        this.lastKeyTime[key] = currentTime;
        this.processInput(key);
    }

    handleKeyUp(event) {
        const key = event.key;
        this.keys[key] = false;
    }

    processInput(key) {
        if (!gameState.canMove()) {
            // Handle non-game inputs
            switch(key) {
                case KEYS.SPACE:
                    if (gameState.currentState === GAME_STATES.GAME_OVER) {
                        gameManager.restart();
                    }
                    break;
                case KEYS.PAUSE:
                case 'p':
                case 'P':
                    if (gameState.currentState === GAME_STATES.PLAYING) {
                        gameState.setState(GAME_STATES.PAUSED);
                    } else if (gameState.currentState === GAME_STATES.PAUSED) {
                        gameState.setState(GAME_STATES.PLAYING);
                    }
                    break;
            }
            return;
        }

        // Handle game inputs with improved responsiveness
        switch(key) {
            case KEYS.LEFT:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.moveLeft();
                    this.provideTactileFeedback();
                }
                break;
            case KEYS.RIGHT:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.moveRight();
                    this.provideTactileFeedback();
                }
                break;
            case KEYS.DOWN:
                if (gameManager.currentPiece) {
                    if (gameManager.currentPiece.moveDown()) {
                        // Award soft drop points
                        const points = scoreManager.calculateScore('SOFT_DROP', 0, gameState.level);
                        scoreManager.addScore(points);
                    }
                }
                break;
            case KEYS.UP:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.rotate();
                    this.provideTactileFeedback();
                }
                break;
            case KEYS.SPACE:
                if (gameManager.currentPiece) {
                    const dropDistance = gameManager.currentPiece.hardDrop();
                    const points = scoreManager.calculateScore('HARD_DROP', 0, gameState.level, dropDistance);
                    scoreManager.addScore(points);
                    gameManager.lockPiece();
                }
                break;
            case KEYS.PAUSE:
            case 'p':
            case 'P':
                gameState.setState(GAME_STATES.PAUSED);
                break;
        }
    }

    // Enhanced tactile feedback
    provideTactileFeedback() {
        // Visual feedback for piece movement
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                gameBoard.style.filter = 'brightness(1)';
            }, 50);
        }
    }

    isKeyPressed(key) {
        return this.keys[key] || false;
    }
}

// Create global input handler
window.inputHandler = new InputHandler();
