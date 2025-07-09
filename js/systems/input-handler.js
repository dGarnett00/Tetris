// Input Handler System
class InputHandler {
    constructor() {
        this.keys = {};
        this.keyRepeatDelay = INPUT_CONFIG.KEY_REPEAT_DELAY;
        this.keyRepeatRate = INPUT_CONFIG.KEY_REPEAT_RATE;
        this.lastKeyTime = {};
        this.inputBuffer = [];
        this.bufferTimeWindow = INPUT_CONFIG.BUFFER_TIME_WINDOW;
        this.dasStartTime = {};
        this.dasActive = {};
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
        
        // Add to input buffer for frame-perfect inputs
        this.addToInputBuffer(key, currentTime);
        
        // DAS (Delayed Auto Shift) handling
        if (!this.keys[key]) {
            this.dasStartTime[key] = currentTime;
            this.dasActive[key] = false;
        }
        
        // Check if we should process this key
        if (this.shouldProcessKey(key, currentTime)) {
            this.keys[key] = true;
            this.lastKeyTime[key] = currentTime;
            this.processInput(key);
        }
    }

    shouldProcessKey(key, currentTime) {
        const timeSinceLastPress = currentTime - (this.lastKeyTime[key] || 0);
        
        // First press
        if (!this.keys[key]) {
            return timeSinceLastPress >= this.keyRepeatDelay;
        }
        
        // Check DAS activation
        if (!this.dasActive[key] && currentTime - this.dasStartTime[key] >= INPUT_CONFIG.DAS_DELAY) {
            this.dasActive[key] = true;
            return true;
        }
        
        // DAS active - use faster repeat rate
        if (this.dasActive[key]) {
            return timeSinceLastPress >= INPUT_CONFIG.DAS_REPEAT_RATE;
        }
        
        // Normal repeat rate
        return timeSinceLastPress >= this.keyRepeatRate;
    }

    addToInputBuffer(key, currentTime) {
        this.inputBuffer.push({ key, time: currentTime });
        
        // Clean old buffer entries
        this.inputBuffer = this.inputBuffer.filter(
            entry => currentTime - entry.time <= this.bufferTimeWindow
        );
    }

    processBufferedInputs() {
        const currentTime = Date.now();
        const validInputs = this.inputBuffer.filter(
            entry => currentTime - entry.time <= this.bufferTimeWindow
        );
        
        for (const input of validInputs) {
            if (this.shouldProcessBufferedInput(input.key, input.time)) {
                this.processInput(input.key);
            }
        }
        
        this.inputBuffer = [];
    }

    shouldProcessBufferedInput(key, inputTime) {
        const currentTime = Date.now();
        return currentTime - inputTime <= INPUT_CONFIG.BUFFER_WINDOW && 
               currentTime - (this.lastKeyTime[key] || 0) >= INPUT_CONFIG.MIN_INPUT_INTERVAL;
    }

    handleKeyUp(event) {
        const key = event.key;
        this.keys[key] = false;
        this.dasActive[key] = false;
        delete this.dasStartTime[key];
    }

    processInput(key) {
        // Non-game inputs
        if (!gameState.canMove()) {
            switch(key) {
                case KEYS.SPACE:
                    if (gameState.currentState === GAME_STATES.GAME_OVER) {
                        gameManager.restart();
                        this.showInputFeedback('restart');
                    }
                    break;
                case KEYS.PAUSE:
                case 'p':
                case 'P':
                    const newState = gameState.currentState === GAME_STATES.PLAYING ? 
                                   GAME_STATES.PAUSED : GAME_STATES.PLAYING;
                    gameState.setState(newState);
                    this.showInputFeedback('pause');
                    break;
                case 'r':
                case 'R':
                    if (gameState.currentState === GAME_STATES.GAME_OVER) {
                        gameManager.restart();
                        this.showInputFeedback('restart');
                    }
                    break;
            }
            return;
        }

        // Game inputs with enhanced feedback
        switch(key) {
            case KEYS.LEFT:
                if (gameManager.currentPiece?.moveLeft()) {
                    this.showInputFeedback('move', 'left');
                    gameState.incrementStatistic('totalMoves');
                }
                break;
            case KEYS.RIGHT:
                if (gameManager.currentPiece?.moveRight()) {
                    this.showInputFeedback('move', 'right');
                    gameState.incrementStatistic('totalMoves');
                }
                break;
            case KEYS.DOWN:
                if (gameManager.currentPiece?.moveDown()) {
                    const points = scoreManager.calculateScore('SOFT_DROP', 0, gameState.level);
                    scoreManager.addScore(points);
                    this.showInputFeedback('soft_drop');
                    gameState.incrementStatistic('softDrops');
                }
                break;
            case KEYS.UP:
                if (gameManager.currentPiece) {
                    const oldRotation = gameManager.currentPiece.currentRotation;
                    gameManager.currentPiece.rotate();
                    if (oldRotation !== gameManager.currentPiece.currentRotation) {
                        this.showInputFeedback('rotate');
                        gameState.incrementStatistic('totalRotations');
                    }
                }
                break;
            case KEYS.SPACE:
                if (gameManager.currentPiece) {
                    const dropDistance = gameManager.currentPiece.hardDrop();
                    const points = scoreManager.calculateScore('HARD_DROP', 0, gameState.level, dropDistance);
                    scoreManager.addScore(points);
                    this.showInputFeedback('hard_drop', null, dropDistance);
                    gameState.incrementStatistic('hardDrops');
                    gameManager.lockPiece();
                }
                break;
            case KEYS.PAUSE:
            case 'p':
            case 'P':
                gameState.setState(GAME_STATES.PAUSED);
                this.showInputFeedback('pause');
                break;
            case 'h':
            case 'H':
                if (gameManager && gameManager.holdPiece) {
                    gameManager.holdPiece();
                    this.showInputFeedback('hold');
                }
                break;
        }
    }

    showInputFeedback(type, direction = null, value = null) {
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) return;

        switch(type) {
            case 'move':
                gameBoard.style.transform = direction === 'left' ? 'translateX(-2px)' : 'translateX(2px)';
                setTimeout(() => gameBoard.style.transform = 'translateX(0)', 50);
                break;
            case 'rotate':
                gameBoard.style.transform = 'rotate(1deg)';
                setTimeout(() => gameBoard.style.transform = 'rotate(0deg)', 100);
                break;
            case 'soft_drop':
                gameBoard.style.filter = 'brightness(1.05)';
                setTimeout(() => gameBoard.style.filter = 'brightness(1)', 30);
                break;
            case 'hard_drop':
                gameBoard.style.filter = 'brightness(1.3) contrast(1.2)';
                gameBoard.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    gameBoard.style.filter = 'brightness(1) contrast(1)';
                    gameBoard.style.transform = 'scale(1)';
                }, 150);
                if (value > 0) {
                    this.showDropDistance(value);
                }
                break;
            case 'pause':
                gameBoard.style.filter = 'blur(1px)';
                setTimeout(() => gameBoard.style.filter = 'blur(0)', 200);
                break;
            case 'restart':
                gameBoard.style.filter = 'brightness(1.5)';
                setTimeout(() => gameBoard.style.filter = 'brightness(1)', 200);
                break;
            case 'hold':
                gameBoard.style.filter = 'hue-rotate(45deg)';
                setTimeout(() => gameBoard.style.filter = 'hue-rotate(0deg)', 200);
                break;
        }
    }

    showDropDistance(distance) {
        const feedbackElement = document.getElementById('gameMessage');
        if (feedbackElement && distance > 0) {
            const tempDiv = document.createElement('div');
            tempDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: ${COLORS.HARD_DROP_FEEDBACK};
                font-size: 24px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                z-index: 1000;
                pointer-events: none;
                animation: dropFeedback 0.6s ease-out forwards;
            `;
            tempDiv.textContent = `+${distance}`;
            feedbackElement.appendChild(tempDiv);
            
            setTimeout(() => {
                if (tempDiv.parentNode) {
                    tempDiv.parentNode.removeChild(tempDiv);
                }
            }, 600);
        }
    }

    // Advanced input pattern detection
    detectInputPattern() {
        const recentInputs = this.inputBuffer.slice(-5);
        const patterns = {
            'T-SPIN_SETUP': [KEYS.LEFT, KEYS.LEFT, KEYS.UP, KEYS.RIGHT],
            'PERFECT_CLEAR': [KEYS.LEFT, KEYS.UP, KEYS.RIGHT, KEYS.UP, KEYS.DOWN],
            'COMBO_SETUP': [KEYS.RIGHT, KEYS.RIGHT, KEYS.UP, KEYS.LEFT]
        };
        
        for (const [pattern, keys] of Object.entries(patterns)) {
            if (this.matchesPattern(recentInputs, keys)) {
                this.showPatternFeedback(pattern);
                return pattern;
            }
        }
        return null;
    }

    matchesPattern(inputs, pattern) {
        if (inputs.length < pattern.length) return false;
        
        const recentKeys = inputs.slice(-pattern.length).map(input => input.key);
        return pattern.every((key, index) => recentKeys[index] === key);
    }

    showPatternFeedback(pattern) {
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) return;

        switch(pattern) {
            case 'T-SPIN_SETUP':
                gameBoard.style.boxShadow = '0 0 20px #ff6b6b';
                break;
            case 'PERFECT_CLEAR':
                gameBoard.style.boxShadow = '0 0 20px #4ecdc4';
                break;
            case 'COMBO_SETUP':
                gameBoard.style.boxShadow = '0 0 20px #45b7d1';
                break;
        }
        
        setTimeout(() => {
            gameBoard.style.boxShadow = 'none';
        }, 500);
    }

    provideFeedback() {
        // Legacy method - kept for compatibility
        this.showInputFeedback('move');
    }
}

window.inputHandler = new InputHandler();
