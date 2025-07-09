// Game State Management
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.currentState = GAME_STATES.MENU;
        this.isPaused = false;
        this.fallSpeed = GAME_CONFIG.INITIAL_FALL_SPEED;
        this.lastFallTime = 0;
        this.gameStartTime = 0;
    }

    updateScore(points) {
        this.score += points;
        this.updateDisplay();
    }

    updateLines(linesCleared) {
        this.lines += linesCleared;
        this.checkLevelUp();
        this.updateDisplay();
    }

    checkLevelUp() {
        const newLevel = Math.floor(this.lines / GAME_CONFIG.LINES_PER_LEVEL) + 1;
        if (newLevel > this.level) {
            const oldLevel = this.level;
            this.level = newLevel;
            this.fallSpeed = Math.max(50, this.fallSpeed * GAME_CONFIG.SPEED_INCREASE_RATE);
            
            // Enhanced level up animation
            this.animateLevelUp(oldLevel, newLevel);
        }
    }

    animateLevelUp(oldLevel, newLevel) {
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.classList.add('level-up-animation');
            
            // Show level up message
            const messageElement = document.createElement('div');
            messageElement.textContent = `Level ${newLevel}!`;
            messageElement.style.cssText = `
                position: fixed;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1.5em;
                font-weight: bold;
                color: #4ecdc4;
                z-index: 1000;
                animation: levelUp 1s ease-out;
                pointer-events: none;
            `;
            
            document.body.appendChild(messageElement);
            
            setTimeout(() => {
                levelElement.classList.remove('level-up-animation');
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 1000);
        }
    }

    updateDisplay() {
        const scoreElement = document.getElementById('score');
        const linesElement = document.getElementById('lines');
        const levelElement = document.getElementById('level');

        if (scoreElement) scoreElement.textContent = this.score;
        if (linesElement) linesElement.textContent = this.lines;
        if (levelElement) levelElement.textContent = this.level;
    }

    setState(newState) {
        this.currentState = newState;
        this.handleStateChange(newState);
    }

    handleStateChange(state) {
        const overlay = document.getElementById('gameOverlay');
        const message = document.getElementById('gameMessage');

        switch (state) {
            case GAME_STATES.PLAYING:
                overlay.classList.remove('visible');
                this.isPaused = false;
                break;
            case GAME_STATES.PAUSED:
                overlay.classList.add('visible');
                message.innerHTML = '<h2>Paused</h2><p>Press P to resume</p>';
                this.isPaused = true;
                break;
            case GAME_STATES.GAME_OVER:
                overlay.classList.add('visible');
                message.innerHTML = '<h2>Game Over</h2><p>Press SPACE to restart</p>';
                break;
        }
    }

    isPlaying() {
        return this.currentState === GAME_STATES.PLAYING;
    }

    canMove() {
        return this.isPlaying() && !this.isPaused;
    }
}

// Create global game state instance
window.gameState = new GameState();
