// Enhanced Game State Management
class GameState {
    constructor() {
        this.reset();
        this.statistics = this.initializeStatistics();
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
        this.piecesPlaced = 0;
        this.totalLinesCleared = 0;
        this.comboCount = 0;
        this.backToBackCount = 0;
        this.perfectClearCount = 0;
        this.levelUpAnimationActive = false;
    }

    initializeStatistics() {
        return {
            piecesSpawned: 0,
            piecesPlaced: 0,
            totalTime: 0,
            totalMoves: 0,
            totalRotations: 0,
            softDrops: 0,
            hardDrops: 0,
            piecesHeld: 0,
            totalLineClears: 0,
            perfectPlacements: 0,
            tSpinSetups: 0,
            edgePlacements: 0,
            linesByType: { single: 0, double: 0, triple: 0, tetris: 0 },
            efficiency: 0,
            piecesPerMinute: 0,
            linesPerMinute: 0,
            scorePerLine: 0
        };
    }

    updateScore(points) {
        this.score += points;
        this.updateStatistics();
        this.updateDisplay();
        this.animateScoreChange(points);
    }

    updateLines(linesCleared) {
        this.lines += linesCleared;
        this.totalLinesCleared += linesCleared;
        this.updateLineStatistics(linesCleared);
        this.checkLevelUp();
        this.updateDisplay();
    }

    updateLineStatistics(linesCleared) {
        const types = ['', 'single', 'double', 'triple', 'tetris'];
        if (linesCleared > 0 && linesCleared <= 4) {
            this.statistics.linesByType[types[linesCleared]]++;
        }
    }

    checkLevelUp() {
        const targetLevel = Math.min(
            Math.floor(this.lines / GAME_CONFIG.LINES_PER_LEVEL) + 1,
            GAME_CONFIG.MAX_LEVEL
        );
        
        if (targetLevel > this.level) {
            const oldLevel = this.level;
            this.level = targetLevel;
            this.updateFallSpeed();
            this.animateLevelUp(oldLevel, targetLevel);
        }
    }

    updateFallSpeed() {
        // More sophisticated speed curve
        const baseSpeed = GAME_CONFIG.INITIAL_FALL_SPEED;
        const speedReduction = Math.pow(GAME_CONFIG.SPEED_INCREASE_RATE, this.level - 1);
        this.fallSpeed = Math.max(50, baseSpeed * speedReduction);
    }

    animateLevelUp(oldLevel, newLevel) {
        if (this.levelUpAnimationActive) return;
        
        this.levelUpAnimationActive = true;
        const levelElement = document.getElementById('level');
        
        if (levelElement) {
            levelElement.classList.add('level-up-animation');
            
            // Enhanced level up message with statistics
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `
                <div style="font-size: 1.8em; color: #4ecdc4; margin-bottom: 10px;">LEVEL ${newLevel}!</div>
                <div style="font-size: 1em; color: #ffd700;">Speed Increased!</div>
                <div style="font-size: 0.8em; color: #ffffff; margin-top: 5px;">
                    Lines: ${this.lines} | Score: ${this.score.toLocaleString()}
                </div>
            `;
            messageElement.style.cssText = `
                position: fixed; top: 35%; left: 50%; transform: translate(-50%, -50%);
                text-align: center; font-weight: bold; z-index: 1000;
                background: rgba(0, 0, 0, 0.9); padding: 20px; border-radius: 10px;
                border: 2px solid #4ecdc4; animation: levelUp 1.5s ease-out;
                pointer-events: none; box-shadow: 0 0 20px rgba(76, 205, 196, 0.5);
            `;
            
            document.body.appendChild(messageElement);
            
            // Screen flash effect
            this.flashScreen('#4ecdc4', 200);
            
            setTimeout(() => {
                levelElement.classList.remove('level-up-animation');
                messageElement.remove();
                this.levelUpAnimationActive = false;
            }, EFFECTS.LEVEL_UP_DURATION);
        }
    }

    animateScoreChange(points) {
        if (points <= 0) return;
        
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.classList.add('score-increment-animation');
            
            // Floating score animation
            const floatingScore = document.createElement('div');
            floatingScore.textContent = `+${points.toLocaleString()}`;
            floatingScore.style.cssText = `
                position: absolute; color: #ffd700; font-size: 1.2em; font-weight: bold;
                animation: floatUp 1s ease-out forwards; z-index: 1000; pointer-events: none;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            `;
            
            // Add CSS animation for floating effect
            if (!document.getElementById('floatingScoreStyle')) {
                const style = document.createElement('style');
                style.id = 'floatingScoreStyle';
                style.textContent = `
                    @keyframes floatUp {
                        0% { transform: translateY(0) scale(1); opacity: 1; }
                        50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
                        100% { transform: translateY(-40px) scale(0.8); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            scoreElement.parentNode.style.position = 'relative';
            scoreElement.parentNode.appendChild(floatingScore);
            
            setTimeout(() => {
                scoreElement.classList.remove('score-increment-animation');
                floatingScore.remove();
            }, 1000);
        }
    }

    updateStatistics() {
        const gameTime = (Date.now() - this.gameStartTime) / 1000 / 60; // minutes
        
        if (gameTime > 0) {
            this.statistics.totalTime = gameTime;
            this.statistics.piecesPerMinute = Math.round(this.piecesPlaced / gameTime);
            this.statistics.linesPerMinute = Math.round(this.totalLinesCleared / gameTime);
            this.statistics.scorePerLine = this.totalLinesCleared > 0 ? 
                Math.round(this.score / this.totalLinesCleared) : 0;
            this.statistics.efficiency = Math.round((this.score / (this.piecesPlaced || 1)) * 100) / 100;
        }
    }

    updateDisplay() {
        const elements = {
            score: document.getElementById('score'),
            lines: document.getElementById('lines'),
            level: document.getElementById('level')
        };
        
        if (elements.score) elements.score.textContent = this.score.toLocaleString();
        if (elements.lines) elements.lines.textContent = this.lines;
        if (elements.level) elements.level.textContent = this.level;
    }

    flashScreen(color = '#ffffff', duration = EFFECTS.FLASH_DURATION) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: ${color}; opacity: 0.3; z-index: 9999; pointer-events: none;
            animation: flashFade ${duration}ms ease-out forwards;
        `;
        
        // Add flash animation if not exists
        if (!document.getElementById('flashStyle')) {
            const style = document.createElement('style');
            style.id = 'flashStyle';
            style.textContent = `
                @keyframes flashFade {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), duration);
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
                const pauseTime = Math.round(this.statistics.totalTime * 60);
                message.innerHTML = `
                    <h2>Paused</h2>
                    <p>Press P to resume</p>
                    <div style="font-size: 0.9em; color: #ffd700; margin-top: 10px;">
                        Time: ${Math.floor(pauseTime / 60)}:${(pauseTime % 60).toString().padStart(2, '0')}<br>
                        PPM: ${this.statistics.piecesPerMinute} | LPM: ${this.statistics.linesPerMinute}
                    </div>
                `;
                this.isPaused = true;
                break;
            case GAME_STATES.GAME_OVER:
                overlay.classList.add('visible');
                message.innerHTML = `
                    <h2>Game Over</h2>
                    <p>Press SPACE to restart</p>
                    <div style="font-size: 0.9em; color: #ffd700; margin-top: 10px;">
                        Final Stats:<br>
                        Score: ${this.score.toLocaleString()}<br>
                        Lines: ${this.lines}<br>
                        Level: ${this.level}<br>
                        Efficiency: ${this.statistics.efficiency}
                    </div>
                `;
                break;
        }
    }

    isPlaying() {
        return this.currentState === GAME_STATES.PLAYING;
    }

    canMove() {
        return this.isPlaying() && !this.isPaused;
    }

    incrementStatistic(statName) {
        if (this.statistics.hasOwnProperty(statName)) {
            this.statistics[statName]++;
        }
    }

    levelUp() {
        const oldLevel = this.level;
        this.level++;
        this.updateFallSpeed();
        this.animateLevelUp(oldLevel, this.level);
    }

    getDetailedStats() {
        return {
            ...this.statistics,
            currentScore: this.score,
            currentLines: this.lines,
            currentLevel: this.level,
            gameTime: this.statistics.totalTime,
            averageScore: this.piecesPlaced > 0 ? Math.round(this.score / this.piecesPlaced) : 0
        };
    }
}

window.gameState = new GameState();
