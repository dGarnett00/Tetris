// Game Loop System
class GameLoop {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.gameTickRate = 1000 / 60;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            gameState.gameStartTime = Date.now();
            this.loop();
        }
    }

    stop() {
        this.isRunning = false;
    }

    loop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;

        while (this.accumulator >= this.gameTickRate) {
            this.update(this.gameTickRate);
            this.accumulator -= this.gameTickRate;
        }

        this.render();
        requestAnimationFrame(() => this.loop());
    }

    update(deltaTime) {
        if (!gameState.isPlaying()) return;
        gameManager?.update(deltaTime);
        this.handlePieceFalling();
    }

    handlePieceFalling() {
        const currentTime = Date.now();
        if (currentTime - gameState.lastFallTime > gameState.fallSpeed) {
            if (gameManager.currentPiece && !gameManager.currentPiece.moveDown()) {
                gameManager.lockPiece();
            }
            gameState.lastFallTime = currentTime;
        }
    }

    render() {
        gameRenderer?.render();
    }

    restart() {
        this.stop();
        gameState.reset();
        gameBoard.reset();
        gameManager?.reset();
        this.start();
    }

    pause() {
        if (gameState.isPlaying()) gameState.setState(GAME_STATES.PAUSED);
    }

    resume() {
        if (gameState.currentState === GAME_STATES.PAUSED) {
            gameState.setState(GAME_STATES.PLAYING);
            this.lastTime = performance.now();
        }
    }
}

window.gameLoop = new GameLoop();
