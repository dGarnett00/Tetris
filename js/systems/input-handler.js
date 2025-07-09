// Input Handler System
class InputHandler {
    constructor() {
        this.keys = {};
        this.keyRepeatDelay = 200;
        this.keyRepeatRate = 50;
        this.lastKeyTime = {};
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

        // Handle game inputs
        switch(key) {
            case KEYS.LEFT:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.moveLeft();
                }
                break;
            case KEYS.RIGHT:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.moveRight();
                }
                break;
            case KEYS.DOWN:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.moveDown();
                }
                break;
            case KEYS.UP:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.rotate();
                }
                break;
            case KEYS.SPACE:
                if (gameManager.currentPiece) {
                    gameManager.currentPiece.hardDrop();
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

    isKeyPressed(key) {
        return this.keys[key] || false;
    }
}

// Create global input handler
window.inputHandler = new InputHandler();
