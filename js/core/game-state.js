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
            this.level = newLevel;
            this.fallSpeed = Math.max(50, this.fallSpeed * GAME_CONFIG.SPEED_INCREASE_RATE);
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
