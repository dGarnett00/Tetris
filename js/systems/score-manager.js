// Enhanced Score Management System
class ScoreManager {
    constructor() {
        this.comboCount = 0;
        this.backToBackCount = 0;
        this.lastClearWasDifficult = false;
        this.perfectClearBonus = 0;
        this.streakMultiplier = 1;
        this.recentScores = [];
    }

    get combo() {
        return this.comboCount;
    }

    calculateScore(action, linesCleared = 0, level = 1, dropDistance = 0, isBackToBack = false) {
        let baseScore = 0;
        let multiplier = 1;
        
        switch(action) {
            case 'SOFT_DROP':
                baseScore = SCORING.SOFT_DROP;
                break;
            case 'HARD_DROP':
                baseScore = SCORING.HARD_DROP * dropDistance;
                break;
            case 'LINE_CLEAR':
                baseScore = this.getLineClearScore(linesCleared);
                multiplier = this.calculateMultiplier(linesCleared, isBackToBack);
                this.updateComboSystem(linesCleared);
                break;
            case 'PERFECT_CLEAR':
                baseScore = SCORING.PERFECT_CLEAR;
                this.perfectClearBonus++;
                this.showPerfectClearMessage();
                break;
        }
        
        const finalScore = Math.floor(baseScore * level * multiplier);
        this.recentScores.push({ action, score: finalScore, timestamp: Date.now() });
        
        // Keep only recent scores for analysis
        if (this.recentScores.length > 10) {
            this.recentScores.shift();
        }
        
        return finalScore;
    }

    getLineClearScore(linesCleared) {
        const scores = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS];
        return scores[linesCleared] || SCORING.TETRIS;
    }

    calculateMultiplier(linesCleared, isBackToBack) {
        let multiplier = 1;
        
        // Combo multiplier
        if (this.comboCount > 0) {
            multiplier += (this.comboCount * 0.5);
        }
        
        // Back-to-back multiplier
        if (isBackToBack && this.backToBackCount > 0) {
            multiplier += (this.backToBackCount * 0.5);
        }
        
        // Difficult line clear bonus
        if (linesCleared >= 3) {
            multiplier += 0.5;
        }
        
        // Perfect clear bonus
        if (this.isPerfectClear()) {
            multiplier += 2;
        }
        
        return Math.min(multiplier, 5); // Cap at 5x multiplier
    }

    updateComboSystem(linesCleared) {
        if (linesCleared > 0) {
            this.comboCount++;
            
            // Check for back-to-back
            const isDifficult = linesCleared >= 4;
            if (isDifficult && this.lastClearWasDifficult) {
                this.backToBackCount++;
                this.showBackToBackMessage();
            } else if (isDifficult) {
                this.backToBackCount = 1;
            } else {
                this.backToBackCount = 0;
            }
            
            this.lastClearWasDifficult = isDifficult;
            
            // Show combo message
            if (this.comboCount > 1) {
                this.showComboMessage(this.comboCount);
            }
        } else {
            this.comboCount = 0;
            this.backToBackCount = 0;
            this.lastClearWasDifficult = false;
        }
    }

    isPerfectClear() {
        // Check if board is completely empty
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                if (gameBoard.getCell(x, y) !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    addScore(points) {
        gameState.updateScore(points);
        this.animateScoreUpdate(points);
        
        // Update statistics
        gameState.piecesPlaced++;
        
        // Check for achievements
        this.checkAchievements(points);
    }

    checkAchievements(points) {
        // High score achievements
        if (points >= 1000) {
            this.showAchievement('Big Score!', `+${points.toLocaleString()}`, '#ffd700');
        }
        
        // Combo achievements
        if (this.comboCount >= 5) {
            this.showAchievement('Combo Master!', `${this.comboCount} combo`, '#ff6b6b');
        }
        
        // Back-to-back achievements
        if (this.backToBackCount >= 3) {
            this.showAchievement('Back-to-Back!', `${this.backToBackCount}x`, '#4ecdc4');
        }
    }

    animateScoreUpdate(points) {
        const scoreElement = document.getElementById('score');
        if (scoreElement && points > 0) {
            scoreElement.classList.add('score-increment-animation');
            
            // Enhanced score popup with more details
            const popup = document.createElement('div');
            const multiplier = this.comboCount > 0 ? ` (${this.comboCount + 1}x)` : '';
            popup.innerHTML = `
                <div style="font-size: 1.2em; color: #ffd700;">+${points.toLocaleString()}</div>
                ${multiplier ? `<div style="font-size: 0.8em; color: #4ecdc4;">${multiplier}</div>` : ''}
            `;
            popup.style.cssText = `
                position: absolute; text-align: center; font-weight: bold;
                animation: scoreFloat 1.2s ease-out forwards; z-index: 1000; pointer-events: none;
                background: rgba(0, 0, 0, 0.8); padding: 8px 12px; border-radius: 6px;
                border: 1px solid #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
            `;
            
            // Add enhanced score animation
            if (!document.getElementById('scoreFloatStyle')) {
                const style = document.createElement('style');
                style.id = 'scoreFloatStyle';
                style.textContent = `
                    @keyframes scoreFloat {
                        0% { transform: translateY(0) scale(1); opacity: 1; }
                        25% { transform: translateY(-15px) scale(1.1); opacity: 0.9; }
                        50% { transform: translateY(-25px) scale(1.2); opacity: 0.8; }
                        100% { transform: translateY(-40px) scale(0.9); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            scoreElement.parentNode.style.position = 'relative';
            scoreElement.parentNode.appendChild(popup);
            
            setTimeout(() => {
                scoreElement.classList.remove('score-increment-animation');
                popup.remove();
            }, 1200);
        }
    }

    showComboMessage(comboCount) {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="font-size: 1.5em; color: #ff6b6b;">COMBO!</div>
            <div style="font-size: 1.2em; color: #ffd700;">${comboCount}x</div>
        `;
        message.style.cssText = `
            position: fixed; top: 60%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; font-weight: bold; z-index: 1000;
            background: rgba(0, 0, 0, 0.9); padding: 15px; border-radius: 8px;
            border: 2px solid #ff6b6b; animation: comboFlash 0.8s ease-out;
            pointer-events: none; box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
        `;
        
        if (!document.getElementById('comboFlashStyle')) {
            const style = document.createElement('style');
            style.id = 'comboFlashStyle';
            style.textContent = `
                @keyframes comboFlash {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(message);
        
        // Screen shake effect
        gameState.flashScreen('#ff6b6b', 150);
        
        setTimeout(() => message.remove(), EFFECTS.COMBO_DISPLAY_TIME);
    }

    showBackToBackMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="font-size: 1.3em; color: #4ecdc4;">BACK-TO-BACK!</div>
            <div style="font-size: 1em; color: #ffd700;">Bonus x${this.backToBackCount}</div>
        `;
        message.style.cssText = `
            position: fixed; top: 70%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; font-weight: bold; z-index: 1000;
            background: rgba(0, 0, 0, 0.9); padding: 12px; border-radius: 8px;
            border: 2px solid #4ecdc4; animation: backToBackPulse 0.8s ease-out;
            pointer-events: none; box-shadow: 0 0 20px rgba(76, 205, 196, 0.5);
        `;
        
        if (!document.getElementById('backToBackStyle')) {
            const style = document.createElement('style');
            style.id = 'backToBackStyle';
            style.textContent = `
                @keyframes backToBackPulse {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), EFFECTS.COMBO_DISPLAY_TIME);
    }

    showPerfectClearMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="font-size: 1.8em; color: #ffd700;">PERFECT CLEAR!</div>
            <div style="font-size: 1.2em; color: #4ecdc4;">+${SCORING.PERFECT_CLEAR.toLocaleString()}</div>
        `;
        message.style.cssText = `
            position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; font-weight: bold; z-index: 1000;
            background: rgba(0, 0, 0, 0.95); padding: 20px; border-radius: 12px;
            border: 3px solid #ffd700; animation: perfectClearGlow 1.5s ease-out;
            pointer-events: none; box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
        `;
        
        if (!document.getElementById('perfectClearStyle')) {
            const style = document.createElement('style');
            style.id = 'perfectClearStyle';
            style.textContent = `
                @keyframes perfectClearGlow {
                    0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    40% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
                    60% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(message);
        
        // Multiple screen flashes for perfect clear
        gameState.flashScreen('#ffd700', 200);
        setTimeout(() => gameState.flashScreen('#4ecdc4', 200), 250);
        setTimeout(() => gameState.flashScreen('#ffd700', 200), 500);
        
        setTimeout(() => message.remove(), 1500);
    }

    showAchievement(title, description, color) {
        const achievement = document.createElement('div');
        achievement.innerHTML = `
            <div style="font-size: 1.2em; color: ${color};">${title}</div>
            <div style="font-size: 0.9em; color: #ffffff;">${description}</div>
        `;
        achievement.style.cssText = `
            position: fixed; top: 80%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; font-weight: bold; z-index: 1000;
            background: rgba(0, 0, 0, 0.9); padding: 10px 15px; border-radius: 6px;
            border: 1px solid ${color}; animation: achievementSlide 2s ease-out;
            pointer-events: none; box-shadow: 0 0 15px ${color}50;
        `;
        
        if (!document.getElementById('achievementStyle')) {
            const style = document.createElement('style');
            style.id = 'achievementStyle';
            style.textContent = `
                @keyframes achievementSlide {
                    0% { transform: translate(-50%, 100px); opacity: 0; }
                    15% { transform: translate(-50%, -50%); opacity: 1; }
                    85% { transform: translate(-50%, -50%); opacity: 1; }
                    100% { transform: translate(-50%, -100px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(achievement);
        setTimeout(() => achievement.remove(), 2000);
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
        this.comboCount = 0;
        this.backToBackCount = 0;
        this.lastClearWasDifficult = false;
        this.perfectClearBonus = 0;
        this.recentScores = [];
    }

    getScoreBreakdown() {
        return {
            combo: this.comboCount,
            backToBack: this.backToBackCount,
            perfectClears: this.perfectClearBonus,
            recentScores: this.recentScores
        };
    }
}

window.scoreManager = new ScoreManager();
