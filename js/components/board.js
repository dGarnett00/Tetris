// Game Board Management
class Board {
    constructor() {
        this.width = GAME_CONFIG.BOARD_WIDTH;
        this.height = GAME_CONFIG.BOARD_HEIGHT;
        this.cellHistory = [];
        this.placementHistory = [];
        this.reset();
    }

    reset() {
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
        this.cellHistory = [];
        this.placementHistory = [];
        this.lastClearTime = 0;
        this.clearEffects = [];
    }

    isValidPosition(piece, x, y) {
        const shape = piece.getCurrentShape();
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Check boundaries
                    if (newX < 0 || newX >= this.width || newY >= this.height) {
                        return false;
                    }
                    
                    // Check collision with existing pieces
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece(piece, x, y) {
        const shape = piece.getCurrentShape();
        const placementInfo = {
            type: piece.type,
            x: x,
            y: y,
            rotation: piece.currentRotation,
            timestamp: Date.now(),
            cells: []
        };

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    if (this.isValidCell(boardX, boardY)) {
                        this.grid[boardY][boardX] = piece.type;
                        
                        // Record cell placement
                        const cellInfo = {
                            x: boardX,
                            y: boardY,
                            type: piece.type,
                            timestamp: Date.now()
                        };
                        
                        this.cellHistory.push(cellInfo);
                        placementInfo.cells.push(cellInfo);
                    }
                }
            }
        }

        this.placementHistory.push(placementInfo);
        
        // Keep history manageable
        if (this.cellHistory.length > 1000) {
            this.cellHistory = this.cellHistory.slice(-800);
        }
        if (this.placementHistory.length > 100) {
            this.placementHistory = this.placementHistory.slice(-80);
        }
    }

    isValidCell(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getFullLines() {
        const fullLines = [];
        for (let y = 0; y < this.height; y++) {
            if (this.grid[y].every(cell => cell !== 0)) {
                fullLines.push(y);
            }
        }
        return fullLines;
    }

    clearLines(lines) {
        if (lines.length === 0) return;
        
        this.lastClearTime = Date.now();
        
        // Sort lines from bottom to top for proper clearing
        const sortedLines = [...lines].sort((a, b) => b - a);
        
        // Record the clear effect
        this.clearEffects.push({
            lines: [...sortedLines],
            timestamp: this.lastClearTime,
            type: this.determineClearType(sortedLines)
        });
        
        // Clear the lines
        sortedLines.forEach(line => {
            this.grid.splice(line, 1);
            this.grid.unshift(Array(this.width).fill(0));
        });
        
        // Clean old clear effects
        this.clearEffects = this.clearEffects.filter(
            effect => this.lastClearTime - effect.timestamp < 5000
        );
    }

    determineClearType(lines) {
        const count = lines.length;
        const isConsecutive = this.areConsecutive(lines);
        
        if (count === 1) return 'SINGLE';
        if (count === 2) return isConsecutive ? 'DOUBLE' : 'DOUBLE_SPLIT';
        if (count === 3) return isConsecutive ? 'TRIPLE' : 'TRIPLE_SPLIT';
        if (count === 4) return isConsecutive ? 'TETRIS' : 'TETRIS_SPLIT';
        return 'MULTI';
    }

    areConsecutive(lines) {
        if (lines.length <= 1) return true;
        
        const sorted = [...lines].sort((a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i-1] !== 1) {
                return false;
            }
        }
        return true;
    }

    getCell(x, y) { 
        return this.isValidCell(x, y) ? this.grid[y][x] : 0; 
    }
    
    setCell(x, y, value) { 
        if (this.isValidCell(x, y)) {
            this.grid[y][x] = value;
            
            // Record cell change
            this.cellHistory.push({
                x: x,
                y: y,
                type: value,
                timestamp: Date.now(),
                action: 'SET'
            });
        }
    }

    getDropPosition(piece, x, y) {
        while (this.isValidPosition(piece, x, y + 1)) {
            y++;
        }
        return y;
    }

    // Advanced board analysis methods
    getColumnHeights() {
        const heights = new Array(this.width).fill(0);
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.grid[y][x] !== 0) {
                    heights[x] = this.height - y;
                    break;
                }
            }
        }
        
        return heights;
    }

    getHoles() {
        const holes = [];
        
        for (let x = 0; x < this.width; x++) {
            let foundBlock = false;
            for (let y = 0; y < this.height; y++) {
                if (this.grid[y][x] !== 0) {
                    foundBlock = true;
                } else if (foundBlock) {
                    holes.push({ x, y });
                }
            }
        }
        
        return holes;
    }

    getBumpiness() {
        const heights = this.getColumnHeights();
        let bumpiness = 0;
        
        for (let i = 0; i < heights.length - 1; i++) {
            bumpiness += Math.abs(heights[i] - heights[i + 1]);
        }
        
        return bumpiness;
    }

    getMaxHeight() {
        return Math.max(...this.getColumnHeights());
    }

    getAverageHeight() {
        const heights = this.getColumnHeights();
        return heights.reduce((sum, height) => sum + height, 0) / heights.length;
    }

    getFilledCells() {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== 0) count++;
            }
        }
        return count;
    }

    getEmptyCells() {
        return (this.width * this.height) - this.getFilledCells();
    }

    getBoardAnalysis() {
        const heights = this.getColumnHeights();
        const holes = this.getHoles();
        
        return {
            heights: heights,
            maxHeight: this.getMaxHeight(),
            averageHeight: this.getAverageHeight(),
            bumpiness: this.getBumpiness(),
            holes: holes.length,
            filledCells: this.getFilledCells(),
            emptyCells: this.getEmptyCells(),
            stability: this.calculateStability(),
            dangerLevel: this.calculateDangerLevel()
        };
    }

    calculateStability() {
        const heights = this.getColumnHeights();
        const maxHeight = Math.max(...heights);
        const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
        
        // Higher stability = more even heights
        return maxHeight > 0 ? (avgHeight / maxHeight) * 100 : 100;
    }

    calculateDangerLevel() {
        const maxHeight = this.getMaxHeight();
        const dangerZone = this.height * 0.8; // Top 20% of board
        
        if (maxHeight > dangerZone) {
            return ((maxHeight - dangerZone) / (this.height - dangerZone)) * 100;
        }
        return 0;
    }

    getRecentPlacements(timeWindow = 5000) {
        const now = Date.now();
        return this.placementHistory.filter(
            placement => now - placement.timestamp <= timeWindow
        );
    }

    getPlacementStatistics() {
        const stats = {};
        
        this.placementHistory.forEach(placement => {
            const type = placement.type;
            if (!stats[type]) {
                stats[type] = {
                    count: 0,
                    avgX: 0,
                    avgY: 0,
                    rotations: {}
                };
            }
            
            stats[type].count++;
            stats[type].avgX += placement.x;
            stats[type].avgY += placement.y;
            
            const rotation = placement.rotation;
            stats[type].rotations[rotation] = (stats[type].rotations[rotation] || 0) + 1;
        });
        
        // Calculate averages
        Object.keys(stats).forEach(type => {
            if (stats[type].count > 0) {
                stats[type].avgX /= stats[type].count;
                stats[type].avgY /= stats[type].count;
            }
        });
        
        return stats;
    }
}

window.gameBoard = new Board();
