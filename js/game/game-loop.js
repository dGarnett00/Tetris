// Game Loop System
class GameLoop {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.gameTickRate = 1000 / 60; // 60 game ticks per second
        this.lastGameTick = 0;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameStartTime = Date.now();
            gameState.gameStartTime = this.gameStartTime;
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

        // Fixed timestep for game logic
        while (this.accumulator >= this.gameTickRate) {
            this.update(this.gameTickRate);
            this.accumulator -= this.gameTickRate;
        }

        // Render at display refresh rate
        this.render();

        requestAnimationFrame(() => this.loop());
    }

    update(deltaTime) {
        if (!gameState.isPlaying()) {
            return;
        }

        // Update game manager
        if (gameManager) {
            gameManager.update(deltaTime);
        }

        // Handle piece falling
        this.handlePieceFalling(deltaTime);
    }

    handlePieceFalling(deltaTime) {
        const currentTime = Date.now();
        
        if (currentTime - gameState.lastFallTime > gameState.fallSpeed) {
            if (gameManager.currentPiece) {
                if (!gameManager.currentPiece.moveDown()) {
                    // Piece can't move down, lock it
                    gameManager.lockPiece();
                }
            }
            gameState.lastFallTime = currentTime;
        }
    }

    render() {
        if (gameRenderer) {
            gameRenderer.render();
        }
    }

    restart() {
        this.stop();
        gameState.reset();
        gameBoard.reset();
        if (gameManager) {
            gameManager.reset();
        }
        this.start();
    }

    pause() {
        if (gameState.isPlaying()) {
            gameState.setState(GAME_STATES.PAUSED);
        }
    }

    resume() {
        if (gameState.currentState === GAME_STATES.PAUSED) {
            gameState.setState(GAME_STATES.PLAYING);
            this.lastTime = performance.now();
        }
    }

    // Performance monitoring
    getFPS() {
        const now = performance.now();
        if (this.lastFrameTime) {
            return Math.round(1000 / (now - this.lastFrameTime));
        }
        this.lastFrameTime = now;
        return 60;
    }

    getGameStats() {
        return {
            fps: this.getFPS(),
            gameTime: Date.now() - this.gameStartTime,
            isRunning: this.isRunning,
            gameState: gameState.currentState
        };
    }
}

// Create global game loop
window.gameLoop = new GameLoop();
