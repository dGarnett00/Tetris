// Score Management System
class ScoreManager {
    constructor() {
        this.scoreMultipliers = {
            SOFT_DROP: 1,
            HARD_DROP: 2,
            SINGLE: 100,
            DOUBLE: 300,
            TRIPLE: 500,
            TETRIS: 800
        };
        this.comboMultiplier = 1;
        this.consecutiveLines = 0;
    }

    calculateScore(action, linesCleared = 0, level = 1, dropDistance = 0) {
        let baseScore = 0;
        
        switch(action) {
            case 'SOFT_DROP':
                baseScore = this.scoreMultipliers.SOFT_DROP;
                break;
            case 'HARD_DROP':
                baseScore = this.scoreMultipliers.HARD_DROP * dropDistance;
                break;
            case 'LINE_CLEAR':
                baseScore = this.getLineClearScore(linesCleared);
                this.updateCombo(linesCleared);
                // Bonus for back-to-back line clears
                if (this.consecutiveLines > 1) {
                    baseScore *= 1.5;
                }
                break;
            default:
                baseScore = 0;
        }
        
        return Math.floor(baseScore * level * this.comboMultiplier);
    }

    getLineClearScore(linesCleared) {
        switch(linesCleared) {
            case 1: return this.scoreMultipliers.SINGLE;
            case 2: return this.scoreMultipliers.DOUBLE;
            case 3: return this.scoreMultipliers.TRIPLE;
            case 4: return this.scoreMultipliers.TETRIS;
            default: return 0;
        }
    }

    updateCombo(linesCleared) {
        if (linesCleared > 0) {
            this.consecutiveLines++;
            this.comboMultiplier = Math.min(1 + (this.consecutiveLines * 0.1), 3);
        } else {
            this.consecutiveLines = 0;
            this.comboMultiplier = 1;
        }
    }

    addScore(points) {
        gameState.updateScore(points);
        this.animateScoreUpdate(points);
    }

    animateScoreUpdate(points) {
        // Enhanced visual feedback for score increase
        const scoreElement = document.getElementById('score');
        if (scoreElement && points > 0) {
            scoreElement.classList.add('score-increment-animation');
            
            // Show points gained temporarily
            const pointsDisplay = document.createElement('span');
            pointsDisplay.textContent = `+${points}`;
            pointsDisplay.style.cssText = `
                position: absolute;
                color: #ffd700;
                font-size: 0.8em;
                font-weight: bold;
                animation: fadeIn 0.5s ease-out;
                z-index: 1000;
            `;
            
            scoreElement.parentNode.appendChild(pointsDisplay);
            
            setTimeout(() => {
                scoreElement.classList.remove('score-increment-animation');
                if (pointsDisplay.parentNode) {
                    pointsDisplay.parentNode.removeChild(pointsDisplay);
                }
            }, 1000);
        }
    }

    getHighScore() {
        return localStorage.getItem('tetrisHighScore') || 0;
    }

    setHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem('tetrisHighScore', score);
            return true; // New high score
        }
        return false;
    }

    resetCombo() {
        this.consecutiveLines = 0;
        this.comboMultiplier = 1;
    }

    // Calculate performance stats
    getPerformanceStats() {
        const stats = {
            score: gameState.score,
            lines: gameState.lines,
            level: gameState.level,
            linesPerMinute: 0,
            scorePerMinute: 0,
            efficiency: 0
        };
        
        const gameTime = (Date.now() - gameState.gameStartTime) / 1000 / 60; // minutes
        
        if (gameTime > 0) {
            stats.linesPerMinute = Math.round(gameState.lines / gameTime);
            stats.scorePerMinute = Math.round(gameState.score / gameTime);
            stats.efficiency = Math.round((gameState.score / (gameState.lines || 1)) * 100) / 100;
        }
        
        return stats;
    }
}

// Create global score manager
window.scoreManager = new ScoreManager();
