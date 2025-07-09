// Enhanced Game Configuration
const GAME_CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    CELL_SIZE: 30,
    INITIAL_FALL_SPEED: 2000,
    SPEED_INCREASE_RATE: 0.92,
    LINES_PER_LEVEL: 10,
    MAX_LEVEL: 29,
    LOCK_DELAY: 500,
    GRAVITY_INTERVAL: 1000,
    MAX_LOCK_EXTENSIONS: 15,
    SOFT_DROP_MULTIPLIER: 1,
    HARD_DROP_MULTIPLIER: 2,
    COMBO_MULTIPLIER: 1.5,
    PERFECT_CLEAR_BONUS: 3500
};

const COLORS = {
    I: '#00f5f5', O: '#f5f500', T: '#b000f5', S: '#00f500',
    Z: '#f50000', J: '#0050f5', L: '#f5a500',
    GHOST: 'rgba(255, 255, 255, 0.3)',
    GHOST_OUTLINE: 'rgba(255, 255, 255, 0.8)',
    BORDER: '#ffffff', EMPTY: '#000000',
    CLEARING: 'rgba(255, 255, 255, 0.9)',
    SHADOW: 'rgba(0, 0, 0, 0.5)',
    HIGHLIGHT: 'rgba(255, 255, 255, 0.4)',
    HARD_DROP_FEEDBACK: '#ffd700'
};

const KEYS = {
    LEFT: 'ArrowLeft', RIGHT: 'ArrowRight', DOWN: 'ArrowDown',
    UP: 'ArrowUp', SPACE: ' ', PAUSE: 'p'
};

const GAME_STATES = {
    MENU: 'menu', PLAYING: 'playing', 
    PAUSED: 'paused', GAME_OVER: 'gameOver'
};

// Enhanced scoring system
const SCORING = {
    SOFT_DROP: 1,
    HARD_DROP: 2,
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    PERFECT_CLEAR: 3500,
    COMBO_BASE: 50,
    T_SPIN_SINGLE: 800,
    T_SPIN_DOUBLE: 1200,
    T_SPIN_TRIPLE: 1600
};

// Visual effects configuration
const EFFECTS = {
    SCREEN_SHAKE_DURATION: 100,
    FLASH_DURATION: 80,
    PIECE_LOCK_FLASH: 150,
    LINE_CLEAR_DELAY: 120,
    LEVEL_UP_DURATION: 1500,
    COMBO_DISPLAY_TIME: 800,
    GHOST_PULSE_SPEED: 2000
};

// Input timing configuration
const INPUT_CONFIG = {
    KEY_REPEAT_DELAY: 150,
    KEY_REPEAT_RATE: 40,
    BUFFER_TIME_WINDOW: 100,
    DAS_DELAY: 167,
    DAS_REPEAT_RATE: 33,
    BUFFER_WINDOW: 50,
    MIN_INPUT_INTERVAL: 16,
    REPEAT_DELAY: 120,
    REPEAT_RATE: 30,
    SOFT_DROP_RATE: 50,
    LOCK_RESET_LIMIT: 15
};

// Export globals
Object.assign(window, { GAME_CONFIG, COLORS, KEYS, GAME_STATES, SCORING, EFFECTS, INPUT_CONFIG });
