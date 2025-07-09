// Game Constants
const GAME_CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    CELL_SIZE: 30,
    INITIAL_FALL_SPEED: 2000, // milliseconds - 2 seconds per cell fall (realistic speed)
    SPEED_INCREASE_RATE: 0.95, // multiply by this each level - very gradual speed increase
    LINES_PER_LEVEL: 10
};

const COLORS = {
    I: '#00f5f5', // Enhanced Cyan - brighter
    O: '#f5f500', // Enhanced Yellow - more vibrant
    T: '#b000f5', // Enhanced Purple - richer
    S: '#00f500', // Enhanced Green - more vibrant
    Z: '#f50000', // Enhanced Red - more intense
    J: '#0050f5', // Enhanced Blue - deeper
    L: '#f5a500', // Enhanced Orange - warmer
    GHOST: 'rgba(255, 255, 255, 0.4)', // More visible ghost
    BORDER: '#ffffff',
    EMPTY: '#000000',
    GRID: 'rgba(255, 255, 255, 0.1)', // Subtle grid lines
    CLEARING: '#ffffff' // Line clearing effect
};

const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown',
    UP: 'ArrowUp',
    SPACE: ' ',
    PAUSE: 'p',
    RESTART: 'r'
};

const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

const DIRECTIONS = {
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    DOWN: { x: 0, y: 1 },
    UP: { x: 0, y: -1 }
};

// Export for use in other modules
window.GAME_CONFIG = GAME_CONFIG;
window.COLORS = COLORS;
window.KEYS = KEYS;
window.GAME_STATES = GAME_STATES;
window.DIRECTIONS = DIRECTIONS;
