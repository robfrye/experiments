/* Game Configuration */
const CONFIG = {
    // Canvas and rendering settings
    CANVAS: {
        WIDTH: 1024,
        HEIGHT: 576,
        BACKGROUND_COLOR: '#1a1a2e'
    },

    // Game loop settings
    GAME_LOOP: {
        TARGET_FPS: 60,
        MAX_FRAME_TIME: 1000 / 30, // 30 FPS minimum
        ENABLE_DEBUG: true
    },

    // Player settings
    PLAYER: {
        WIDTH: 32,
        HEIGHT: 48,
        SPEED: 200, // pixels per second
        JUMP_SPEED: 400,
        GRAVITY: 1200,
        MAX_FALL_SPEED: 600,
        HEALTH: 100,
        START_X: 100,
        START_Y: 400
    },

    // Input settings
    INPUT: {
        KEYS: {
            // Movement
            LEFT: ['ArrowLeft', 'KeyA'],
            RIGHT: ['ArrowRight', 'KeyD'],
            UP: ['ArrowUp', 'KeyW'],
            DOWN: ['ArrowDown', 'KeyS'],
            
            // Combat
            ATTACK: ['Space', 'KeyZ'],
            SPECIAL: ['KeyX'],
            BLOCK: ['ShiftLeft', 'ShiftRight'],
            
            // System
            PAUSE: ['Escape', 'KeyP'],
            DEBUG: ['F1']
        },
        REPEAT_DELAY: 150 // milliseconds
    },

    // Physics and collision
    PHYSICS: {
        GRAVITY: 1200,
        FRICTION: 0.8,
        GROUND_Y: 480,
        COLLISION_TOLERANCE: 2
    },

    // Game states
    GAME_STATES: {
        LOADING: 'loading',
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over'
    },

    // Asset paths
    ASSETS: {
        IMAGES: {
            HEDGE_COP_IDLE: 'assets/images/hedge_cop_idle.png',
            HEDGE_COP_WALK: 'assets/images/hedge_cop_walk.png',
            HEDGE_COP_ATTACK: 'assets/images/hedge_cop_attack.png'
        },
        AUDIO: {
            BACKGROUND_MUSIC: 'assets/audio/background.mp3',
            PUNCH_SOUND: 'assets/audio/punch.wav',
            JUMP_SOUND: 'assets/audio/jump.wav'
        }
    },

    // Performance monitoring
    PERFORMANCE: {
        ENABLE_FPS_COUNTER: true,
        ENABLE_FRAME_TIME_TRACKING: true,
        FPS_UPDATE_INTERVAL: 500 // milliseconds
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
