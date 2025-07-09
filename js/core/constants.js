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
    I: '#00f0f0', // Cyan
    O: '#f0f000', // Yellow
    T: '#a000f0', // Purple
    S: '#00f000', // Green
    Z: '#f00000', // Red
    J: '#0000f0', // Blue
    L: '#f0a000', // Orange
    GHOST: 'rgba(255, 255, 255, 0.3)',
    BORDER: '#ffffff',
    EMPTY: '#000000'
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
