// Game Configuration
const GAME_CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    CELL_SIZE: 30,
    INITIAL_FALL_SPEED: 2000,
    SPEED_INCREASE_RATE: 0.95,
    LINES_PER_LEVEL: 10
};

const COLORS = {
    I: '#00f5f5', O: '#f5f500', T: '#b000f5', S: '#00f500',
    Z: '#f50000', J: '#0050f5', L: '#f5a500',
    GHOST: 'rgba(255, 255, 255, 0.4)',
    BORDER: '#ffffff', EMPTY: '#000000'
};

const KEYS = {
    LEFT: 'ArrowLeft', RIGHT: 'ArrowRight', DOWN: 'ArrowDown',
    UP: 'ArrowUp', SPACE: ' ', PAUSE: 'p'
};

const GAME_STATES = {
    MENU: 'menu', PLAYING: 'playing', 
    PAUSED: 'paused', GAME_OVER: 'gameOver'
};

// Export globals
Object.assign(window, { GAME_CONFIG, COLORS, KEYS, GAME_STATES });
