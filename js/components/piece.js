// Tetris Piece Class
class Piece {
    constructor(type) {
        this.type = type;
        this.shapes = SHAPES[type];
        this.currentRotation = 0;
        this.x = Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - 1;
        this.y = 0;
        this.spawnTime = Date.now();
        this.moveHistory = [];
        this.rotationHistory = [];
        this.lockDelay = GAME_CONFIG.LOCK_DELAY;
        this.lastMoveTime = 0;
        this.totalMoves = 0;
    }

    getCurrentShape() { 
        return this.shapes[this.currentRotation]; 
    }

    rotate() {
        const oldRotation = this.currentRotation;
        const newRotation = (this.currentRotation + 1) % this.shapes.length;
        this.currentRotation = newRotation;

        // Record rotation attempt
        this.rotationHistory.push({
            from: oldRotation,
            to: newRotation,
            timestamp: Date.now(),
            x: this.x,
            y: this.y
        });

        if (!gameBoard.isValidPosition(this, this.x, this.y)) {
            // Enhanced wall kick system
            const kickOffsets = this.getWallKickOffsets(oldRotation, newRotation);
            let kicked = false;

            for (const offset of kickOffsets) {
                const testX = this.x + offset.x;
                const testY = this.y + offset.y;
                
                if (gameBoard.isValidPosition(this, testX, testY)) {
                    this.x = testX;
                    this.y = testY;
                    kicked = true;
                    break;
                }
            }

            if (!kicked) {
                // Revert rotation
                this.currentRotation = oldRotation;
                this.rotationHistory[this.rotationHistory.length - 1].success = false;
                return false;
            } else {
                this.rotationHistory[this.rotationHistory.length - 1].success = true;
                this.rotationHistory[this.rotationHistory.length - 1].wallKick = true;
            }
        } else {
            this.rotationHistory[this.rotationHistory.length - 1].success = true;
        }

        this.lastMoveTime = Date.now();
        return true;
    }

    getWallKickOffsets(fromRotation, toRotation) {
        // Standard SRS (Super Rotation System) wall kicks
        const kicks = {
            'I': {
                '0->1': [[-2, 0], [1, 0], [-2, -1], [1, 2]],
                '1->0': [[2, 0], [-1, 0], [2, 1], [-1, -2]],
                '1->2': [[-1, 0], [2, 0], [-1, 2], [2, -1]],
                '2->1': [[1, 0], [-2, 0], [1, -2], [-2, 1]],
                '2->3': [[2, 0], [-1, 0], [2, 1], [-1, -2]],
                '3->2': [[-2, 0], [1, 0], [-2, -1], [1, 2]],
                '3->0': [[1, 0], [-2, 0], [1, -2], [-2, 1]],
                '0->3': [[-1, 0], [2, 0], [-1, 2], [2, -1]]
            },
            'default': {
                '0->1': [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
                '1->0': [[1, 0], [1, -1], [0, 2], [1, 2]],
                '1->2': [[1, 0], [1, -1], [0, 2], [1, 2]],
                '2->1': [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
                '2->3': [[1, 0], [1, 1], [0, -2], [1, -2]],
                '3->2': [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
                '3->0': [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
                '0->3': [[1, 0], [1, 1], [0, -2], [1, -2]]
            }
        };

        const key = `${fromRotation}->${toRotation}`;
        const kickData = kicks[this.type] || kicks['default'];
        return kickData[key] || [[0, 0]];
    }

    moveLeft() { 
        if (gameBoard.isValidPosition(this, this.x - 1, this.y)) { 
            this.x--; 
            this.recordMove('left');
            return true; 
        }
        return false;
    }
    
    moveRight() { 
        if (gameBoard.isValidPosition(this, this.x + 1, this.y)) { 
            this.x++; 
            this.recordMove('right');
            return true; 
        }
        return false;
    }
    
    moveDown() { 
        if (gameBoard.isValidPosition(this, this.x, this.y + 1)) { 
            this.y++; 
            this.recordMove('down');
            return true; 
        }
        return false;
    }

    recordMove(direction) {
        this.moveHistory.push({
            direction: direction,
            timestamp: Date.now(),
            x: this.x,
            y: this.y
        });
        this.totalMoves++;
        this.lastMoveTime = Date.now();
        
        // Keep move history manageable
        if (this.moveHistory.length > 100) {
            this.moveHistory = this.moveHistory.slice(-50);
        }
    }

    hardDrop() {
        let distance = 0;
        const startY = this.y;
        
        while (this.moveDown()) {
            distance++;
        }
        
        this.recordMove('hardDrop');
        
        // Record hard drop statistics
        this.moveHistory.push({
            direction: 'hardDrop',
            timestamp: Date.now(),
            x: this.x,
            y: this.y,
            distance: distance,
            startY: startY
        });
        
        return distance;
    }

    getGhostPosition() { 
        return gameBoard.getDropPosition(this, this.x, this.y); 
    }

    clone() {
        const clone = new Piece(this.type);
        clone.currentRotation = this.currentRotation;
        clone.x = this.x;
        clone.y = this.y;
        clone.spawnTime = this.spawnTime;
        clone.moveHistory = [...this.moveHistory];
        clone.rotationHistory = [...this.rotationHistory];
        clone.lastMoveTime = this.lastMoveTime;
        clone.totalMoves = this.totalMoves;
        return clone;
    }

    // Enhanced piece analysis methods
    getLifetime() {
        return Date.now() - this.spawnTime;
    }

    getMovementSpeed() {
        if (this.moveHistory.length < 2) return 0;
        
        const recentMoves = this.moveHistory.slice(-10);
        const timeDiff = recentMoves[recentMoves.length - 1].timestamp - recentMoves[0].timestamp;
        
        return timeDiff > 0 ? (recentMoves.length - 1) / timeDiff * 1000 : 0;
    }

    getMovementPattern() {
        const pattern = {
            left: 0,
            right: 0,
            down: 0,
            hardDrop: 0,
            rotations: 0
        };
        
        this.moveHistory.forEach(move => {
            if (pattern[move.direction] !== undefined) {
                pattern[move.direction]++;
            }
        });
        
        pattern.rotations = this.rotationHistory.length;
        
        return pattern;
    }

    getEfficiency() {
        const totalActions = this.totalMoves + this.rotationHistory.length;
        const lifetime = this.getLifetime();
        
        if (lifetime === 0) return 0;
        
        return (totalActions / lifetime) * 1000; // actions per second
    }

    getPredictedLockPosition() {
        const ghostY = this.getGhostPosition();
        const timeSinceLastMove = Date.now() - this.lastMoveTime;
        const hasRecentActivity = timeSinceLastMove < 1000;
        
        return {
            x: this.x,
            y: ghostY,
            confidence: hasRecentActivity ? 0.7 : 0.9,
            timeToLock: hasRecentActivity ? this.lockDelay : this.lockDelay * 0.5
        };
    }

    getRotationStatistics() {
        const successful = this.rotationHistory.filter(r => r.success).length;
        const withWallKick = this.rotationHistory.filter(r => r.wallKick).length;
        
        return {
            total: this.rotationHistory.length,
            successful: successful,
            failed: this.rotationHistory.length - successful,
            wallKicks: withWallKick,
            successRate: this.rotationHistory.length > 0 ? (successful / this.rotationHistory.length) * 100 : 0
        };
    }

    // Get shape information for advanced rendering
    getShapeInfo() {
        const shape = this.getCurrentShape();
        const bounds = this.getShapeBounds();
        
        return {
            shape: shape,
            bounds: bounds,
            center: this.getShapeCenter(bounds),
            rotationPoint: this.getRotationPoint()
        };
    }

    getShapeBounds() {
        const shape = this.getCurrentShape();
        let minX = shape[0].length, maxX = -1;
        let minY = shape.length, maxY = -1;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    minX = Math.min(minX, col);
                    maxX = Math.max(maxX, col);
                    minY = Math.min(minY, row);
                    maxY = Math.max(maxY, row);
                }
            }
        }
        
        return { minX, maxX, minY, maxY };
    }

    getShapeCenter(bounds) {
        return {
            x: (bounds.minX + bounds.maxX) / 2,
            y: (bounds.minY + bounds.maxY) / 2
        };
    }

    getRotationPoint() {
        // Standard SRS rotation points
        const rotationPoints = {
            'I': { x: 1.5, y: 1.5 },
            'O': { x: 0.5, y: 0.5 },
            'T': { x: 1, y: 1 },
            'S': { x: 1, y: 1 },
            'Z': { x: 1, y: 1 },
            'J': { x: 1, y: 1 },
            'L': { x: 1, y: 1 }
        };
        
        return rotationPoints[this.type] || { x: 1, y: 1 };
    }
}

// Enhanced Piece Factory with advanced bag system
class PieceFactory {
    constructor() {
        this.bag = [];
        this.nextBag = [];
        this.types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        this.history = [];
        this.droughtPrevention = true;
        this.statistics = {};
        this.initializeStatistics();
    }

    initializeStatistics() {
        this.types.forEach(type => {
            this.statistics[type] = {
                generated: 0,
                lastSeen: 0,
                averageInterval: 0,
                maxDrought: 0,
                currentDrought: 0
            };
        });
    }

    getNextPiece() {
        if (this.bag.length === 0) {
            this.fillBag();
        }
        
        const pieceType = this.bag.pop();
        const piece = new Piece(pieceType);
        
        this.updateStatistics(pieceType);
        this.recordHistory(pieceType);
        
        return piece;
    }

    fillBag() {
        // Standard 7-bag system with drought prevention
        this.bag = [...this.types];
        
        if (this.droughtPrevention) {
            this.applyDroughtPrevention();
        }
        
        this.shuffleBag();
        this.prepareNextBag();
    }

    applyDroughtPrevention() {
        // Prevent long droughts of specific pieces
        const droughtThreshold = 14; // 2 full bags
        
        this.types.forEach(type => {
            if (this.statistics[type].currentDrought >= droughtThreshold) {
                // Increase probability of drought piece
                this.bag.push(type);
            }
        });
    }

    shuffleBag() {
        // Fisher-Yates shuffle with bias prevention
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
        
        // Prevent same piece back-to-back across bags
        if (this.history.length > 0) {
            const lastPiece = this.history[this.history.length - 1];
            if (this.bag[this.bag.length - 1] === lastPiece) {
                // Swap with random position (not last)
                const swapIndex = Math.floor(Math.random() * (this.bag.length - 1));
                [this.bag[this.bag.length - 1], this.bag[swapIndex]] = 
                [this.bag[swapIndex], this.bag[this.bag.length - 1]];
            }
        }
    }

    prepareNextBag() {
        // Pre-generate next bag for preview
        this.nextBag = [...this.types];
        for (let i = this.nextBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.nextBag[i], this.nextBag[j]] = [this.nextBag[j], this.nextBag[i]];
        }
    }

    updateStatistics(pieceType) {
        const stat = this.statistics[pieceType];
        const currentTime = Date.now();
        
        stat.generated++;
        
        if (stat.lastSeen > 0) {
            const interval = currentTime - stat.lastSeen;
            stat.averageInterval = (stat.averageInterval + interval) / 2;
        }
        
        stat.lastSeen = currentTime;
        stat.currentDrought = 0;
        
        // Update drought for other pieces
        this.types.forEach(type => {
            if (type !== pieceType) {
                this.statistics[type].currentDrought++;
                this.statistics[type].maxDrought = Math.max(
                    this.statistics[type].maxDrought,
                    this.statistics[type].currentDrought
                );
            }
        });
    }

    recordHistory(pieceType) {
        this.history.push(pieceType);
        
        // Keep history manageable
        if (this.history.length > 200) {
            this.history = this.history.slice(-100);
        }
    }

    // Preview methods
    previewNext(count = 1) {
        const preview = [];
        const tempBag = [...this.bag];
        const tempNextBag = [...this.nextBag];
        
        for (let i = 0; i < count; i++) {
            if (tempBag.length === 0) {
                tempBag.push(...tempNextBag);
                tempNextBag.length = 0;
                tempNextBag.push(...this.types);
                // Simple shuffle for preview
                for (let j = tempNextBag.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [tempNextBag[j], tempNextBag[k]] = [tempNextBag[k], tempNextBag[j]];
                }
            }
            
            preview.push(tempBag.pop());
        }
        
        return preview;
    }

    getRemainingInBag() {
        return [...this.bag];
    }

    getStatistics() {
        return JSON.parse(JSON.stringify(this.statistics));
    }

    getDistributionAnalysis() {
        const total = this.types.reduce((sum, type) => sum + this.statistics[type].generated, 0);
        const distribution = {};
        
        this.types.forEach(type => {
            const stat = this.statistics[type];
            distribution[type] = {
                percentage: total > 0 ? (stat.generated / total) * 100 : 0,
                expectedPercentage: 100 / this.types.length,
                drought: stat.currentDrought,
                maxDrought: stat.maxDrought
            };
        });
        
        return distribution;
    }

    // Reset factory state
    reset() {
        this.bag = [];
        this.nextBag = [];
        this.history = [];
        this.initializeStatistics();
    }
}

window.Piece = Piece;
window.PieceFactory = PieceFactory;
