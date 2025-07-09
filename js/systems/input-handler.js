// Input Handler System
class InputHandler {
    constructor() {
        this.keys = {};
        this.keyRepeatDelay = 150;
        this.keyRepeatRate = 40;
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
        
        if (this.keys[key] && currentTime - this.lastKeyTime[key] < this.keyRepeatRate) return;
        if (!this.keys[key] && currentTime - (this.lastKeyTime[key] || 0) < this.keyRepeatDelay) return;
        
        this.keys[key] = true;
        this.lastKeyTime[key] = currentTime;
        this.processInput(key);
    }

    handleKeyUp(event) {
        this.keys[event.key] = false;
    }

    processInput(key) {
        // Non-game inputs
        if (!gameState.canMove()) {
            switch(key) {
                case KEYS.SPACE:
                    if (gameState.currentState === GAME_STATES.GAME_OVER) gameManager.restart();
                    break;
                case KEYS.PAUSE:
                case 'p':
                case 'P':
                    gameState.setState(gameState.currentState === GAME_STATES.PLAYING ? GAME_STATES.PAUSED : GAME_STATES.PLAYING);
                    break;
            }
            return;
        }

        // Game inputs
        switch(key) {
            case KEYS.LEFT:
                gameManager.currentPiece?.moveLeft();
                this.provideFeedback();
                break;
            case KEYS.RIGHT:
                gameManager.currentPiece?.moveRight();
                this.provideFeedback();
                break;
            case KEYS.DOWN:
                if (gameManager.currentPiece?.moveDown()) {
                    const points = scoreManager.calculateScore('SOFT_DROP', 0, gameState.level);
                    scoreManager.addScore(points);
                }
                break;
            case KEYS.UP:
                gameManager.currentPiece?.rotate();
                this.provideFeedback();
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

    provideFeedback() {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.style.filter = 'brightness(1.1)';
            setTimeout(() => gameBoard.style.filter = 'brightness(1)', 50);
        }
    }
}

window.inputHandler = new InputHandler();
