// Score Management System
class ScoreManager {
    constructor() {
        this.scoreMultipliers = {
            SOFT_DROP: 1, HARD_DROP: 2, SINGLE: 100, DOUBLE: 300, TRIPLE: 500, TETRIS: 800
        };
        this.comboMultiplier = 1;
        this.consecutiveLines = 0;
    }

    calculateScore(action, linesCleared = 0, level = 1, dropDistance = 0) {
        let baseScore = 0;
        
        switch(action) {
            case 'SOFT_DROP': baseScore = this.scoreMultipliers.SOFT_DROP; break;
            case 'HARD_DROP': baseScore = this.scoreMultipliers.HARD_DROP * dropDistance; break;
            case 'LINE_CLEAR':
                baseScore = this.getLineClearScore(linesCleared);
                this.updateCombo(linesCleared);
                if (this.consecutiveLines > 1) baseScore *= 1.5;
                break;
        }
        
        return Math.floor(baseScore * level * this.comboMultiplier);
    }

    getLineClearScore(linesCleared) {
        const scores = [0, this.scoreMultipliers.SINGLE, this.scoreMultipliers.DOUBLE, 
                      this.scoreMultipliers.TRIPLE, this.scoreMultipliers.TETRIS];
        return scores[linesCleared] || 0;
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
        const scoreElement = document.getElementById('score');
        if (scoreElement && points > 0) {
            scoreElement.classList.add('score-increment-animation');
            
            const pointsDisplay = document.createElement('span');
            pointsDisplay.textContent = `+${points}`;
            pointsDisplay.style.cssText = `
                position: absolute; color: #ffd700; font-size: 0.8em; font-weight: bold;
                animation: fadeIn 0.5s ease-out; z-index: 1000;
            `;
            
            scoreElement.parentNode.appendChild(pointsDisplay);
            
            setTimeout(() => {
                scoreElement.classList.remove('score-increment-animation');
                pointsDisplay.remove();
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
            return true;
        }
        return false;
    }

    resetCombo() {
        this.consecutiveLines = 0;
        this.comboMultiplier = 1;
    }
}

window.scoreManager = new ScoreManager();
