// Hedge Cop: Hong Kong Nights - Game Script

// Game Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State with Performance Monitoring
const gameState = {
    isRunning: false,
    lastTime: 0,
    deltaTime: 0,
    fps: 60,
    frameCount: 0,
    currentState: 'title', // 'title', 'levelSelect', 'playing', 'paused', 'gameOver', 'levelComplete'
    titleClickReady: true,
    // Performance monitoring
    performanceStats: {
        avgFps: 60,
        minFps: 60,
        maxFps: 60,
        frameTimeHistory: [],
        frameDrops: 0,
        lastFrameTime: 0
    }
};

// Input State
const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    weaponSwitch: false,
    pause: false,
    click: false,
    audioToggle: false,
    escape: false,
    enter: false,
    key1: false,
    key2: false,
    key3: false,
    key4: false,
    key5: false,
    key6: false
};

// Player Object - Enhanced for Milestone 2
const player = {
    x: 100,
    y: 400,
    width: 64,
    height: 96,
    velocityX: 0,
    velocityY: 0,
    speed: 200,
    jumpPower: 400,
    isOnGround: false,
    isJumping: false,
    facingRight: true,
    animationState: 'idle', // idle, walking, jumping, falling, punching, shooting
    animationFrame: 0,
    animationTimer: 0,
    animationSpeed: 0.15,
    
    // Enhanced animation properties for Milestone 2
    quillShakeTimer: 0,
    emotionalState: 'neutral', // neutral, determined, worried, focused
    lastEmotionChange: 0,
    
    // Combat properties
    currentWeapon: 'punch', // 'punch' or 'gun'
    isAttacking: false,
    attackTimer: 0,
    attackDuration: 0.3,
    attackCooldown: 0.1,
    attackCooldownTimer: 0,
    
    // Health & Lives System
    maxHealth: 10,
    health: 10,
    lives: 3,
    invulnerabilityTimer: 0,
    invulnerabilityDuration: 1.5,
    isDead: false,
    respawnTimer: 0,
    respawnDuration: 2.0
};

// Projectiles array
const projectiles = [];

// Enemies array
const enemies = [];

// Collectibles array
const collectibles = [];

// Game stats
const gameStats = {
    isGameOver: false,
    score: 0,
    enemiesDefeated: 0
};

// Audio system - Milestone 4 Enhanced Implementation
const audioSystem = {
    enabled: true,
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    
    // Web Audio API components
    audioContext: null,
    masterGainNode: null,
    musicGainNode: null,
    sfxGainNode: null,
    
    // Background music system
    backgroundMusic: {
        current: null,
        tracks: {},
        currentTrack: null,
        fadeInDuration: 2.0,
        fadeOutDuration: 1.5,
        crossfadeDuration: 3.0,
        looping: true,
        loopScheduleId: null
    },
    
    // Sound effects library
    sounds: {},
    soundBuffers: {},
    
    // Audio settings
    settings: {
        musicEnabled: true,
        sfxEnabled: true,
        ambientEnabled: true,
        uiSoundsEnabled: true
    },
    
    // Level-specific audio data
    levelAudio: {
        1: { // Street Level
            musicKey: 'street_theme',
            ambientSounds: ['city_traffic', 'distant_sirens', 'street_chatter'],
            musicTempo: 120
        },
        2: { // Rooftops
            musicKey: 'rooftop_theme', 
            ambientSounds: ['wind_gusts', 'helicopter_distant', 'building_creaks'],
            musicTempo: 140
        },
        3: { // Harbor District
            musicKey: 'harbor_theme',
            ambientSounds: ['water_waves', 'ship_horns', 'seagulls', 'dock_creaks'],
            musicTempo: 110
        },
        4: { // Neon District
            musicKey: 'neon_theme',
            ambientSounds: ['neon_buzz', 'crowds', 'traffic_heavy'],
            musicTempo: 135
        },
        5: { // Triad Hideout
            musicKey: 'boss_theme',
            ambientSounds: ['industrial_hum', 'machinery', 'tension_drones'],
            musicTempo: 150
        },
        6: { // Final Showdown
            musicKey: 'final_boss_theme',
            ambientSounds: ['storm_wind', 'thunder_distant', 'city_below'],
            musicTempo: 160
        }
    },
    
    // Audio loading and initialization
    initialized: false,
    loadingPromises: [],
    
    // Performance optimization
    maxSimultaneousSounds: 10,
    activeSounds: [],
    soundPool: new Map()
};

// Camera system for side-scrolling
const camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    smoothing: 0.1,
    offsetX: 400, // Keep player this distance from left edge (increased for larger canvas)
    offsetY: 0
};

// Platform definitions for level design
const platforms = [
    // Ground level platforms (adjusted for new ground level at y=750)
    { x: 0, y: 750, width: 800, height: 50, type: 'ground' },
    { x: 800, y: 750, width: 400, height: 50, type: 'ground' },
    { x: 1400, y: 750, width: 600, height: 50, type: 'ground' },
    { x: 2200, y: 750, width: 400, height: 50, type: 'ground' },
    { x: 2800, y: 750, width: 400, height: 50, type: 'ground' },
    
    // Mid-level platforms (adjusted proportionally for larger canvas)
    { x: 600, y: 650, width: 200, height: 20, type: 'platform' },
    { x: 1000, y: 600, width: 300, height: 20, type: 'platform' },
    { x: 1600, y: 550, width: 200, height: 20, type: 'platform' },
    { x: 2000, y: 600, width: 250, height: 20, type: 'platform' },
    { x: 2500, y: 500, width: 200, height: 20, type: 'platform' },
    
    // Upper platforms (more vertical space for better gameplay)
    { x: 800, y: 450, width: 150, height: 20, type: 'platform' },
    { x: 1200, y: 400, width: 180, height: 20, type: 'platform' },
    { x: 1800, y: 400, width: 150, height: 20, type: 'platform' },
    { x: 2300, y: 350, width: 200, height: 20, type: 'platform' },
    
    // New upper platforms for extra vertical space
    { x: 900, y: 300, width: 120, height: 20, type: 'platform' },
    { x: 1400, y: 250, width: 160, height: 20, type: 'platform' },
    { x: 2100, y: 200, width: 140, height: 20, type: 'platform' }
];

// Projectile object constructor
function createProjectile(x, y, direction) {
    return {
        x: x,
        y: y,
        width: 8,
        height: 4,
        velocityX: direction * 500, // pixels per second
        velocityY: 0,
        lifetime: 2.0, // seconds
        active: true
    };
}

// Enemy object constructor
function createEnemy(type, x, y) {
    const baseEnemy = {
        x: x,
        y: y,
        active: true,
        health: 2,
        facingRight: false,
        animationFrame: 0,
        animationTimer: 0,
        animationSpeed: 0.2,
        lastPlayerX: 0,
        aggroRange: 300,
        attackRange: 50,
        attackTimer: 0,
        attackCooldown: 1.0,
        stunTimer: 0,
        stunDuration: 0.5
    };

    if (type === 'car') {
        return {
            ...baseEnemy,
            type: 'car',
            width: 120,
            height: 60,
            speed: 80,
            y: GAME_CONFIG.GROUND_Y - 60,
            patrolDistance: 200,
            originalX: x,
            patrolDirection: 1,
            aiState: 'patrol' // patrol, chase, attack
        };
    } else if (type === 'motorcycle') {
        return {
            ...baseEnemy,
            type: 'motorcycle',
            width: 80,
            height: 50,
            speed: 120,
            y: GAME_CONFIG.GROUND_Y - 50,
            patrolDistance: 150,
            originalX: x,
            patrolDirection: 1,
            aiState: 'patrol' // patrol, chase, attack
        };
    } else if (type === 'helicopter') {
        return {
            ...baseEnemy,
            type: 'helicopter',
            width: 100,
            height: 60,
            speed: 60,
            y: 200, // Flies high above the ground
            patrolDistance: 250,
            originalX: x,
            patrolDirection: 1,
            aiState: 'patrol', // patrol, chase, attack
            verticalBob: 0, // For bobbing motion
            bobSpeed: 0.05,
            health: 3 // Helicopters are tougher
        };
    } else if (type === 'boat') {
        return {
            ...baseEnemy,
            type: 'boat',
            width: 110,
            height: 70,
            speed: 70,
            y: 740, // Water level
            patrolDistance: 180,
            originalX: x,
            patrolDirection: 1,
            aiState: 'patrol', // patrol, chase, attack
            waveMotion: 0, // For wave bobbing
            waveSpeed: 0.04,
            health: 3 // Boats are sturdy
        };
    }
}

// Enemy spawn system
// Enemy Management System with Balanced Configuration
const enemySpawner = {
    lastSpawnTime: 0,
    spawnInterval: 8.0, // Balanced spawn timing (8 seconds)
    maxEnemies: 6, // Performance-limited max enemies
    spawnLocations: [
        { x: 600, type: 'car' },
        { x: 1100, type: 'motorcycle' },
        { x: 1500, type: 'car' },
        { x: 1900, type: 'motorcycle' },
        { x: 2300, type: 'car' },
        { x: 2700, type: 'motorcycle' },
        { x: 3000, type: 'car' }
    ],
    currentSpawnIndex: 0
};

// Collectible object constructor
function createCollectible(type, x, y) {
    return {
        type: type, // 'dumpling' or 'noodle_soup'
        x: x,
        y: y,
        width: 32,
        height: 32,
        active: true,
        animationFrame: 0,
        animationTimer: 0,
        animationSpeed: 0.3,
        healthValue: type === 'dumpling' ? 2 : 5,
        bobOffset: Math.random() * Math.PI * 2 // For floating animation
    };
}

// Collectible spawn system
// Collectible Management System with Balanced Configuration
const collectibleSpawner = {
    lastSpawnTime: 0,
    spawnInterval: 6.0, // Balanced spawn timing (6 seconds)
    maxCollectibles: 5, // Strategic placement for larger level
    spawnLocations: [
        { x: 700, y: 630, type: 'dumpling' },    // On mid-level platform
        { x: 1150, y: 580, type: 'noodle_soup' }, // On mid-level platform  
        { x: 1700, y: 530, type: 'dumpling' },   // On upper platform
        { x: 2125, y: 580, type: 'noodle_soup' }, // On mid-level platform
        { x: 2600, y: 480, type: 'dumpling' },   // On upper platform
        { x: 875, y: 430, type: 'noodle_soup' }, // On high platform
        { x: 1300, y: 380, type: 'dumpling' },   // On highest platform
        { x: 2400, y: 330, type: 'noodle_soup' }, // On highest platform
        { x: 950, y: 280, type: 'dumpling' },    // On new upper platform
        { x: 1450, y: 230, type: 'noodle_soup' }, // On new highest platform
    ],
    currentSpawnIndex: 0
};

// Game Settings with Performance Optimization
const GAME_CONFIG = {
    CANVAS_WIDTH: 1200, // Expanded from 800 for better viewing
    CANVAS_HEIGHT: 800, // Expanded from 600 for more vertical space
    TARGET_FPS: 60,
    DEBUG_MODE: false,
    GRAVITY: 800,
    GROUND_Y: 750, // Adjusted for new height (800 - 50 for ground)
    WORLD_WIDTH: 3200, // Extended world for side-scrolling
    WORLD_HEIGHT: 800, // Adjusted for new canvas height
    LEVEL_END_X: 3000,
    // Performance optimization settings
    OPTIMIZATION: {
        CULLING_ENABLED: true,
        PARTICLE_LIMIT: 50,
        ENEMY_LIMIT: 6,
        PROJECTILE_LIMIT: 20,
        FRAME_SKIP_THRESHOLD: 16.67, // Skip frame if previous took longer than 16.67ms
        PERFORMANCE_MONITORING: true,
        MAX_DELTA_TIME: 0.033, // Cap delta time to prevent large jumps
        GARBAGE_COLLECTION_INTERVAL: 300 // Clean up arrays every 5 seconds
    },
    // Rendering optimizations
    RENDERING: {
        USE_REQUEST_ANIMATION_FRAME: true,
        VSYNC_ENABLED: true,
        BUFFER_CANVAS: false, // Could be enabled for complex scenes
        CULL_DISTANCE: 200 // Objects this far off-screen won't be rendered
    },
    // Balanced gameplay settings
    BALANCE: {
        PLAYER_DAMAGE_FROM_ENEMIES: 2, // Damage taken from enemy collision
        ENEMY_HEALTH: 2, // Health points for enemies
        DUMPLING_HEALTH_RESTORE: 2, // HP restored by dumplings
        NOODLE_SOUP_HEALTH_RESTORE: 5, // HP restored by noodle soup
        INVULNERABILITY_DURATION: 1.5, // Seconds of invulnerability after damage
        RESPAWN_DURATION: 2.0, // Seconds before respawn
        ENEMY_SPAWN_INTERVAL: 8.0, // Seconds between enemy spawns
        COLLECTIBLE_SPAWN_INTERVAL: 6.0, // Seconds between collectible spawns
        SCORE_ENEMY_DEFEAT: 100, // Points for defeating an enemy
        SCORE_COLLECTIBLE_DUMPLING: 50, // Points for collecting dumpling
        SCORE_COLLECTIBLE_NOODLE: 100 // Points for collecting noodle soup
    }
};

// Level Management System - Milestone 1 Implementation
const levelManager = {
    currentLevel: 1,
    totalLevels: 6,
    levelProgress: {
        1: { unlocked: true, completed: false, bestScore: 0 },
        2: { unlocked: false, completed: false, bestScore: 0 },
        3: { unlocked: false, completed: false, bestScore: 0 },
        4: { unlocked: false, completed: false, bestScore: 0 },
        5: { unlocked: false, completed: false, bestScore: 0 },
        6: { unlocked: false, completed: false, bestScore: 0 }
    },
    levelData: {
        1: {
            name: "Street Level",
            theme: "hong_kong_streets",
            backgroundColor: "#1a1a2e",
            platforms: [
                // Ground level platforms
                { x: 0, y: 750, width: 800, height: 50, type: 'ground' },
                { x: 800, y: 750, width: 400, height: 50, type: 'ground' },
                { x: 1400, y: 750, width: 600, height: 50, type: 'ground' },
                { x: 2200, y: 750, width: 400, height: 50, type: 'ground' },
                { x: 2800, y: 750, width: 400, height: 50, type: 'ground' },
                
                // Mid-level platforms
                { x: 600, y: 650, width: 200, height: 20, type: 'platform' },
                { x: 1000, y: 600, width: 300, height: 20, type: 'platform' },
                { x: 1600, y: 550, width: 200, height: 20, type: 'platform' },
                { x: 2000, y: 600, width: 250, height: 20, type: 'platform' },
                { x: 2500, y: 500, width: 200, height: 20, type: 'platform' },
                
                // Upper platforms
                { x: 800, y: 450, width: 150, height: 20, type: 'platform' },
                { x: 1200, y: 400, width: 180, height: 20, type: 'platform' },
                { x: 1800, y: 400, width: 150, height: 20, type: 'platform' },
                { x: 2300, y: 350, width: 200, height: 20, type: 'platform' },
                
                // Top platforms
                { x: 900, y: 300, width: 120, height: 20, type: 'platform' },
                { x: 1400, y: 250, width: 160, height: 20, type: 'platform' },
                { x: 2100, y: 200, width: 140, height: 20, type: 'platform' }
            ],
            enemySpawns: [
                { x: 600, type: 'car' },
                { x: 1100, type: 'motorcycle' },
                { x: 1500, type: 'car' },
                { x: 1900, type: 'motorcycle' },
                { x: 2300, type: 'car' },
                { x: 2700, type: 'motorcycle' }
            ],
            collectibleSpawns: [
                { x: 300, y: 200, type: 'dumpling' },
                { x: 750, y: 150, type: 'noodle_soup' },
                { x: 1350, y: 180, type: 'dumpling' },
                { x: 1750, y: 120, type: 'noodle_soup' },
                { x: 2150, y: 160, type: 'dumpling' },
                { x: 2550, y: 140, type: 'noodle_soup' }
            ],
            exitPosition: { x: 3000, y: 650 },
            victoryCondition: 'reach_exit'
        },
        2: {
            name: "Rooftops",
            theme: "rooftops",
            backgroundColor: "#0f0f23",
            platforms: [
                // Building foundations - varied heights
                { x: 0, y: 600, width: 300, height: 200, type: 'building' },
                { x: 400, y: 500, width: 350, height: 300, type: 'building' },
                { x: 850, y: 650, width: 250, height: 150, type: 'building' },
                { x: 1200, y: 450, width: 400, height: 350, type: 'building' },
                { x: 1700, y: 550, width: 300, height: 250, type: 'building' },
                { x: 2100, y: 400, width: 350, height: 400, type: 'building' },
                { x: 2550, y: 500, width: 300, height: 300, type: 'building' },
                
                // Rooftop platforms - accessible surfaces
                { x: 0, y: 580, width: 300, height: 20, type: 'rooftop' },
                { x: 400, y: 480, width: 350, height: 20, type: 'rooftop' },
                { x: 850, y: 630, width: 250, height: 20, type: 'rooftop' },
                { x: 1200, y: 430, width: 400, height: 20, type: 'rooftop' },
                { x: 1700, y: 530, width: 300, height: 20, type: 'rooftop' },
                { x: 2100, y: 380, width: 350, height: 20, type: 'rooftop' },
                { x: 2550, y: 480, width: 300, height: 20, type: 'rooftop' },
                
                // Connecting platforms - fire escapes and walkways
                { x: 320, y: 530, width: 60, height: 15, type: 'walkway' },
                { x: 770, y: 580, width: 60, height: 15, type: 'walkway' },
                { x: 1120, y: 480, width: 60, height: 15, type: 'walkway' },
                { x: 1620, y: 430, width: 60, height: 15, type: 'walkway' },
                { x: 2020, y: 480, width: 60, height: 15, type: 'walkway' },
                
                // Air conditioning units and obstacles
                { x: 150, y: 560, width: 40, height: 20, type: 'obstacle' },
                { x: 550, y: 460, width: 50, height: 20, type: 'obstacle' },
                { x: 950, y: 610, width: 45, height: 20, type: 'obstacle' },
                { x: 1350, y: 410, width: 60, height: 20, type: 'obstacle' },
                { x: 1850, y: 510, width: 40, height: 20, type: 'obstacle' },
                { x: 2250, y: 360, width: 55, height: 20, type: 'obstacle' },
                
                // Upper platforms - crane and antenna access
                { x: 500, y: 330, width: 120, height: 15, type: 'platform' },
                { x: 1300, y: 280, width: 140, height: 15, type: 'platform' },
                { x: 2200, y: 230, width: 130, height: 15, type: 'platform' },
                
                // Highest platforms - challenging jumps
                { x: 800, y: 200, width: 100, height: 15, type: 'platform' },
                { x: 1650, y: 180, width: 120, height: 15, type: 'platform' },
                { x: 2800, y: 350, width: 200, height: 20, type: 'rooftop' }
            ],
            enemySpawns: [
                { x: 200, type: 'motorcycle' },
                { x: 600, type: 'helicopter' },
                { x: 1000, type: 'car' },
                { x: 1400, type: 'helicopter' },
                { x: 1800, type: 'motorcycle' },
                { x: 2300, type: 'helicopter' },
                { x: 2700, type: 'car' }
            ],
            collectibleSpawns: [
                { x: 250, y: 500, type: 'dumpling' },
                { x: 600, y: 250, type: 'noodle_soup' },
                { x: 950, y: 550, type: 'dumpling' },
                { x: 1500, y: 100, type: 'noodle_soup' },
                { x: 1950, y: 450, type: 'dumpling' },
                { x: 2400, y: 150, type: 'noodle_soup' },
                { x: 2750, y: 280, type: 'dumpling' }
            ],
            exitPosition: { x: 2900, y: 330 },
            victoryCondition: 'reach_exit'
        },
        3: {
            name: "Harbor District", 
            theme: "harbor",
            backgroundColor: "#1a2332",
            platforms: [
                // Dock foundations and piers
                { x: 0, y: 700, width: 400, height: 100, type: 'dock' },
                { x: 500, y: 720, width: 300, height: 80, type: 'dock' },
                { x: 900, y: 680, width: 350, height: 120, type: 'dock' },
                { x: 1350, y: 710, width: 400, height: 90, type: 'dock' },
                { x: 1850, y: 690, width: 300, height: 110, type: 'dock' },
                { x: 2250, y: 720, width: 350, height: 80, type: 'dock' },
                { x: 2700, y: 700, width: 300, height: 100, type: 'dock' },
                
                // Walkable dock surfaces
                { x: 0, y: 680, width: 400, height: 20, type: 'platform' },
                { x: 500, y: 700, width: 300, height: 20, type: 'platform' },
                { x: 900, y: 660, width: 350, height: 20, type: 'platform' },
                { x: 1350, y: 690, width: 400, height: 20, type: 'platform' },
                { x: 1850, y: 670, width: 300, height: 20, type: 'platform' },
                { x: 2250, y: 700, width: 350, height: 20, type: 'platform' },
                { x: 2700, y: 680, width: 300, height: 20, type: 'platform' },
                
                // Shipping containers - stacked platforms
                { x: 300, y: 600, width: 80, height: 80, type: 'container' },
                { x: 300, y: 520, width: 80, height: 80, type: 'container' },
                { x: 650, y: 620, width: 80, height: 80, type: 'container' },
                { x: 730, y: 620, width: 80, height: 80, type: 'container' },
                { x: 730, y: 540, width: 80, height: 80, type: 'container' },
                { x: 1100, y: 580, width: 80, height: 80, type: 'container' },
                { x: 1180, y: 580, width: 80, height: 80, type: 'container' },
                { x: 1180, y: 500, width: 80, height: 80, type: 'container' },
                { x: 1600, y: 610, width: 80, height: 80, type: 'container' },
                { x: 1980, y: 590, width: 80, height: 80, type: 'container' },
                { x: 1980, y: 510, width: 80, height: 80, type: 'container' },
                { x: 2060, y: 510, width: 80, height: 80, type: 'container' },
                { x: 2400, y: 620, width: 80, height: 80, type: 'container' },
                { x: 2480, y: 620, width: 80, height: 80, type: 'container' },
                { x: 2480, y: 540, width: 80, height: 80, type: 'container' },
                
                // Container top platforms
                { x: 300, y: 500, width: 80, height: 20, type: 'platform' },
                { x: 730, y: 520, width: 80, height: 20, type: 'platform' },
                { x: 1180, y: 480, width: 80, height: 20, type: 'platform' },
                { x: 2060, y: 490, width: 80, height: 20, type: 'platform' },
                { x: 2480, y: 520, width: 80, height: 20, type: 'platform' },
                
                // Crane platforms and structures
                { x: 1000, y: 400, width: 60, height: 15, type: 'platform' },
                { x: 1000, y: 350, width: 60, height: 15, type: 'platform' },
                { x: 1000, y: 300, width: 60, height: 15, type: 'platform' },
                { x: 2200, y: 450, width: 80, height: 15, type: 'platform' },
                { x: 2200, y: 380, width: 80, height: 15, type: 'platform' },
                { x: 2200, y: 310, width: 80, height: 15, type: 'platform' },
                
                // Connecting walkways between container stacks
                { x: 420, y: 600, width: 60, height: 15, type: 'walkway' },
                { x: 850, y: 580, width: 70, height: 15, type: 'walkway' },
                { x: 1300, y: 590, width: 60, height: 15, type: 'walkway' },
                { x: 2150, y: 580, width: 70, height: 15, type: 'walkway' },
                
                // Water level platforms (floating docks)
                { x: 450, y: 750, width: 100, height: 10, type: 'floating' },
                { x: 1200, y: 760, width: 120, height: 10, type: 'floating' },
                { x: 2000, y: 750, width: 100, height: 10, type: 'floating' }
            ],
            enemySpawns: [
                { x: 250, type: 'car' },
                { x: 600, type: 'boat' },
                { x: 1000, type: 'motorcycle' },
                { x: 1400, type: 'boat' },
                { x: 1750, type: 'car' },
                { x: 2100, type: 'boat' },
                { x: 2500, type: 'motorcycle' },
                { x: 2800, type: 'car' }
            ],
            collectibleSpawns: [
                { x: 350, y: 420, type: 'dumpling' },
                { x: 780, y: 440, type: 'noodle_soup' },
                { x: 1230, y: 400, type: 'dumpling' },
                { x: 1650, y: 530, type: 'noodle_soup' },
                { x: 2110, y: 410, type: 'dumpling' },
                { x: 2530, y: 440, type: 'noodle_soup' },
                { x: 2750, y: 600, type: 'dumpling' }
            ],
            exitPosition: { x: 2950, y: 660 },
            victoryCondition: 'reach_exit'
        },
        4: {
            name: "Neon District",
            theme: "neon",
            backgroundColor: "#2a1a3a",
            platforms: [],
            enemySpawns: [],
            collectibleSpawns: [],
            exitPosition: { x: 3000, y: 650 },
            victoryCondition: 'reach_exit'
        },
        5: {
            name: "Triad Hideout",
            theme: "industrial",
            backgroundColor: "#1a1a1a",
            platforms: [],
            enemySpawns: [],
            collectibleSpawns: [],
            exitPosition: { x: 3000, y: 650 },
            victoryCondition: 'defeat_boss'
        },
        6: {
            name: "Final Showdown",
            theme: "penthouse",
            backgroundColor: "#3a2a1a",
            platforms: [],
            enemySpawns: [],
            collectibleSpawns: [],
            exitPosition: { x: 3000, y: 650 },
            victoryCondition: 'defeat_final_boss'
        }
    },
    
    // Load level data from localStorage
    loadProgress() {
        const saved = localStorage.getItem('hedgeCopLevelProgress');
        if (saved) {
            this.levelProgress = { ...this.levelProgress, ...JSON.parse(saved) };
        }
    },
    
    // Save level progress to localStorage
    saveProgress() {
        localStorage.setItem('hedgeCopLevelProgress', JSON.stringify(this.levelProgress));
    },
    
    // Load a specific level
    loadLevel(levelNumber) {
        if (levelNumber < 1 || levelNumber > this.totalLevels) {
            console.warn(`Invalid level number: ${levelNumber}`);
            return false;
        }
        
        if (!this.levelProgress[levelNumber].unlocked) {
            console.warn(`Level ${levelNumber} is not unlocked yet`);
            return false;
        }
        
        this.currentLevel = levelNumber;
        const levelData = this.levelData[levelNumber];
        
        // Clear existing game objects
        enemies.length = 0;
        projectiles.length = 0;
        collectibles.length = 0;
        
        // Load level platforms
        platforms.length = 0;
        platforms.push(...levelData.platforms);
        
        // Reset player position
        player.x = 100;
        player.y = 400;
        player.health = player.maxHealth;
        player.isDead = false;
        
        // Reset camera
        camera.x = 0;
        camera.y = 0;
        
        // Spawn initial enemies for the level
        this.spawnLevelEnemies();
        
        // Spawn initial collectibles for the level
        this.spawnLevelCollectibles();
        
        // Reset game stats
        gameStats.score = 0;
        gameStats.enemiesDefeated = 0;
        gameStats.isGameOver = false;
        
        console.log(`Loaded Level ${levelNumber}: ${levelData.name}`);
        return true;
    },
    
    // Spawn enemies for current level
    spawnLevelEnemies() {
        const levelData = this.levelData[this.currentLevel];
        levelData.enemySpawns.forEach(spawn => {
            enemies.push(createEnemy(spawn.type, spawn.x, 0));
        });
    },
    
    // Spawn collectibles for current level
    spawnLevelCollectibles() {
        const levelData = this.levelData[this.currentLevel];
        levelData.collectibleSpawns.forEach(spawn => {
            collectibles.push(createCollectible(spawn.type, spawn.x, spawn.y));
        });
    },
    
    // Complete current level
    completeLevel() {
        const levelNum = this.currentLevel;
        this.levelProgress[levelNum].completed = true;
        
        // Update best score
        if (gameStats.score > this.levelProgress[levelNum].bestScore) {
            this.levelProgress[levelNum].bestScore = gameStats.score;
        }
        
        // Unlock next level
        if (levelNum < this.totalLevels) {
            this.levelProgress[levelNum + 1].unlocked = true;
        }
        
        this.saveProgress();
        console.log(`Level ${levelNum} completed! Score: ${gameStats.score}`);
    },
    
    // Check if level is completed
    checkLevelCompletion() {
        const levelData = this.levelData[this.currentLevel];
        
        switch (levelData.victoryCondition) {
            case 'reach_exit':
                return player.x >= levelData.exitPosition.x && 
                       Math.abs(player.y - levelData.exitPosition.y) < 100;
            case 'defeat_boss':
                // TODO: Implement boss defeat check in later milestones
                return false;
            case 'defeat_final_boss':
                // TODO: Implement final boss defeat check in later milestones
                return false;
            default:
                return false;
        }
    }
};

// Initialize the game
function initGame() {
    if (GAME_CONFIG.DEBUG_MODE) {
        console.log('🎮 Initializing Hedge Cop: Hong Kong Nights game...');
    }
    
    // Set canvas size with validation
    try {
        canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    } catch (error) {
        console.error('Failed to set canvas size:', error);
        return false;
    }
    
    // Initialize player position with bounds checking
    player.y = Math.max(0, GAME_CONFIG.GROUND_Y - player.height);
    
    // Initialize audio system with error handling
    try {
        // Note: Full audio initialization happens on first user interaction
        // due to browser autoplay policies
        console.log('Audio system prepared for initialization on user interaction');
    } catch (error) {
        console.warn('Audio preparation failed, continuing without audio:', error);
        audioSystem.enabled = false;
    }
    
    // Initialize spawners with validation
    try {
        enemySpawner.lastSpawnTime = 0;
        enemySpawner.currentSpawnIndex = 0;
        collectibleSpawner.lastSpawnTime = 0;
        collectibleSpawner.currentSpawnIndex = 0;
    } catch (error) {
        console.error('Failed to initialize spawners:', error);
    }
    
    // Initialize level manager - Milestone 1
    try {
        levelManager.loadProgress();
        console.log('✅ Level manager initialized with saved progress');
    } catch (error) {
        console.warn('Failed to load level progress, using defaults:', error);
    }
    
    // Start in title screen mode
    gameState.currentState = 'title';
    gameState.titleClickReady = true;
    
    // Set initial game state
    gameState.isRunning = true;
    gameState.lastTime = performance.now();
    
    // Set up input listeners with error handling
    try {
        setupInputListeners();
    } catch (error) {
        console.error('Failed to setup input listeners:', error);
        return false;
    }
    
    // Set up debug toggle button
    setupDebugToggle();
    
    if (GAME_CONFIG.DEBUG_MODE) {
        console.log('✅ Game initialized successfully! Starting at title screen.');
    }
    
    // Start the game loop
    gameLoop(gameState.lastTime);
    
    return true; // Successful initialization
}

// Main game loop
function gameLoop(currentTime) {
    if (!gameState.isRunning) return;
    
    // Performance monitoring start
    const frameStartTime = performance.now();
    
    // Calculate delta time with capping to prevent large jumps
    gameState.deltaTime = Math.min((currentTime - gameState.lastTime) / 1000, GAME_CONFIG.OPTIMIZATION.MAX_DELTA_TIME);
    gameState.lastTime = currentTime;
    gameState.frameCount++;
    
    // Performance tracking
    if (GAME_CONFIG.OPTIMIZATION.PERFORMANCE_MONITORING) {
        trackPerformance(frameStartTime);
    }
    
    // Skip frame if previous frame took too long (frame limiting)
    if (gameState.performanceStats.lastFrameTime > GAME_CONFIG.OPTIMIZATION.FRAME_SKIP_THRESHOLD) {
        gameState.performanceStats.frameDrops++;
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update based on current game state
    switch (gameState.currentState) {
        case 'title':
            updateTitleScreen();
            break;
        case 'levelSelect':
            updateLevelSelectScreen();
            break;
        case 'playing':
            update(gameState.deltaTime);
            break;
        case 'paused':
            updatePauseScreen();
            break;
        case 'gameOver':
            updateGameOverScreen();
            break;
        case 'levelComplete':
            updateLevelCompleteScreen();
            break;
    }
    
    // Render the game
    render();
    
    // Cleanup arrays periodically for garbage collection
    if (gameState.frameCount % (GAME_CONFIG.TARGET_FPS * GAME_CONFIG.OPTIMIZATION.GARBAGE_COLLECTION_INTERVAL) === 0) {
        optimizeArrays();
    }
    
    // Performance monitoring end
    gameState.performanceStats.lastFrameTime = performance.now() - frameStartTime;
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Update game logic
function update(deltaTime) {
    // Process global inputs first
    processGlobalInputs();
    
    // Check for game over
    if (gameStats.isGameOver) {
        gameState.currentState = 'gameOver';
        return;
    }
    
    // Check for pause input
    if (input.pause) {
        gameState.currentState = 'paused';
        input.pause = false; // Reset input
        return;
    }
    
    // Update player
    updatePlayer(deltaTime);
    
    // Update projectiles
    updateProjectiles(deltaTime);
    
    // Update enemies
    updateEnemies(deltaTime);
    
    // Update collectibles
    updateCollectibles(deltaTime);
    
    // Handle enemy spawning
    updateEnemySpawner(deltaTime);
    
    // Handle collectible spawning
    updateCollectibleSpawner(deltaTime);
    
    // Update camera to follow player
    updateCamera();
    
    // Check for level completion
    if (levelManager.checkLevelCompletion()) {
        levelManager.completeLevel();
        gameState.currentState = 'levelComplete';
        
        // Stop current music and play victory theme
        stopBackgroundMusic();
        setTimeout(() => {
            startBackgroundMusic('victory_theme');
        }, 500);
        
        playSound('levelComplete');
        console.log(`Level ${levelManager.currentLevel} completed!`);
    }
    
    // Check collisions
    checkCollisions();
    
    // Performance optimized FPS monitoring
    if (GAME_CONFIG.DEBUG_MODE && gameState.frameCount % 60 === 0) {
        const fps = Math.round(1 / deltaTime);
        updateFpsStats(fps);
    }
}

// Performance tracking function with error handling
function trackPerformance(frameStartTime) {
    try {
        const currentFps = 1000 / (frameStartTime - (gameState.performanceStats.lastFrameTime || frameStartTime));
        
        // Validate FPS value
        if (!isNaN(currentFps) && isFinite(currentFps) && currentFps > 0) {
            // Update FPS statistics
            gameState.performanceStats.frameTimeHistory.push(currentFps);
            if (gameState.performanceStats.frameTimeHistory.length > 60) {
                gameState.performanceStats.frameTimeHistory.shift(); // Keep only last 60 frames
            }
            
            // Calculate average FPS with validation
            if (gameState.performanceStats.frameTimeHistory.length > 0) {
                const validFrames = gameState.performanceStats.frameTimeHistory.filter(fps => !isNaN(fps) && isFinite(fps));
                if (validFrames.length > 0) {
                    gameState.performanceStats.avgFps = validFrames.reduce((a, b) => a + b) / validFrames.length;
                    gameState.performanceStats.minFps = Math.min(...validFrames);
                    gameState.performanceStats.maxFps = Math.max(...validFrames);
                }
            }
        }
    } catch (error) {
        console.error('Error in performance tracking:', error);
    }
}

// Update FPS statistics
function updateFpsStats(currentFps) {
    gameState.performanceStats.avgFps = currentFps;
    if (GAME_CONFIG.DEBUG_MODE) {
        console.log(`FPS: ${currentFps} | Avg: ${Math.round(gameState.performanceStats.avgFps)} | Min: ${Math.round(gameState.performanceStats.minFps)} | Max: ${Math.round(gameState.performanceStats.maxFps)} | Drops: ${gameState.performanceStats.frameDrops}`);
    }
}

// Array optimization for garbage collection
function optimizeArrays() {
    // Remove dead projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        if (projectiles[i].shouldRemove) {
            projectiles.splice(i, 1);
        }
    }
    
    // Remove dead enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].shouldRemove) {
            enemies.splice(i, 1);
        }
    }
    
    // Remove collected collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        if (collectibles[i].shouldRemove) {
            collectibles.splice(i, 1);
        }
    }
    
    // Limit array sizes to prevent memory bloat
    if (projectiles.length > GAME_CONFIG.OPTIMIZATION.PROJECTILE_LIMIT) {
        projectiles.splice(0, projectiles.length - GAME_CONFIG.OPTIMIZATION.PROJECTILE_LIMIT);
    }
    
    if (enemies.length > GAME_CONFIG.OPTIMIZATION.ENEMY_LIMIT) {
        enemies.splice(0, enemies.length - GAME_CONFIG.OPTIMIZATION.ENEMY_LIMIT);
    }
    
    if (GAME_CONFIG.DEBUG_MODE) {
        console.log('Arrays optimized - Projectiles:', projectiles.length, 'Enemies:', enemies.length, 'Collectibles:', collectibles.length);
    }
}

// Update title screen
function updateTitleScreen() {
    // Handle click to go to level selection
    if (input.click && gameState.titleClickReady) {
        goToLevelSelection();
        input.click = false;
    }
}

// Level Selection Screen Update Function
function updateLevelSelectScreen() {
    // Handle level selection via number keys
    for (let i = 1; i <= levelManager.totalLevels; i++) {
        if (input[`key${i}`] && levelManager.levelProgress[i].unlocked) {
            startLevel(i);
            input[`key${i}`] = false;
            break;
        }
    }
    
    // Handle ESC to go back to title
    if (input.escape) {
        goToTitleScreen();
        input.escape = false;
    }
    
    // Handle mouse clicks for level selection (basic implementation)
    if (input.click) {
        // For now, just start level 1 on any click
        if (levelManager.levelProgress[1].unlocked) {
            startLevel(1);
        }
        input.click = false;
    }
}

// Level Complete Screen Update Function  
function updateLevelCompleteScreen() {
    // Handle ESC to go to level selection
    if (input.escape) {
        goToLevelSelection();
        input.escape = false;
        return;
    }
    
    // Handle ENTER to continue to next level
    if (input.enter) {
        if (levelManager.currentLevel < levelManager.totalLevels && 
            levelManager.levelProgress[levelManager.currentLevel + 1].unlocked) {
            startLevel(levelManager.currentLevel + 1);
        } else {
            goToLevelSelection();
        }
        input.enter = false;
        return;
    }
    
    // Handle number keys to jump to specific levels
    for (let i = 1; i <= levelManager.totalLevels; i++) {
        if (input[`key${i}`] && levelManager.levelProgress[i].unlocked) {
            startLevel(i);
            input[`key${i}`] = false;
            return;
        }
    }
    
    // Handle click to continue (legacy support)
    if (input.click) {
        if (levelManager.currentLevel < levelManager.totalLevels && 
            levelManager.levelProgress[levelManager.currentLevel + 1].unlocked) {
            startLevel(levelManager.currentLevel + 1);
        } else {
            goToLevelSelection();
        }
        input.click = false;
    }
}

// Update pause screen
function updatePauseScreen() {
    // Handle unpause
    if (input.pause) {
        gameState.currentState = 'playing';
        input.pause = false;
    }
}

// Update game over screen
function updateGameOverScreen() {
    // Handle click to restart
    if (input.click) {
        restartGame();
        input.click = false;
    }
}

// Navigate to level selection screen
function goToLevelSelection() {
    gameState.currentState = 'levelSelect';
    gameState.titleClickReady = false;
    
    // Initialize audio if not already done
    if (audioSystem.enabled && !audioSystem.initialized) {
        initAudioSystem();
    }
    
    console.log('Navigated to level selection');
}

// Navigate back to title screen
function goToTitleScreen() {
    gameState.currentState = 'title';
    gameState.titleClickReady = true;
    
    // Start title music
    setTimeout(() => {
        startBackgroundMusic('title_theme');
    }, 100);
    
    console.log('Navigated to title screen');
}

// Start a specific level
function startLevel(levelNumber) {
    // Initialize and resume audio context on user interaction
    if (audioSystem.enabled && !audioSystem.audioContext) {
        initAudioSystem().then(() => {
            console.log('Audio system ready for level', levelNumber);
        });
    } else if (audioSystem.audioContext) {
        resumeAudioContext();
    }
    
    // Load the specified level
    if (levelManager.loadLevel(levelNumber)) {
        gameState.currentState = 'playing';
        gameState.titleClickReady = false;
        
        // Start level-specific background music
        setTimeout(() => {
            startBackgroundMusic();
        }, 100); // Small delay to ensure audio context is ready
        
        // Play level start sound
        playSound('menuConfirm');
        
        console.log(`Started Level ${levelNumber}: ${levelManager.levelData[levelNumber].name}`);
    } else {
        console.error(`Failed to load level ${levelNumber}`);
        playSound('menuBack');
        goToLevelSelection();
    }
}

// Start the game from title screen (legacy function - now goes to level selection)
function startGame() {
    goToLevelSelection();
}

// Restart the game from game over
function restartGame() {
    gameState.currentState = 'title';
    gameState.titleClickReady = true;
    
    // Stop background music and return to title
    stopBackgroundMusic();
    setTimeout(() => {
        startBackgroundMusic('title_theme');
    }, 500);
    
    // Reset everything
    resetGameState();
    
    console.log('Game restarted!');
}

// Reset all game state
function resetGameState() {
    // Reset player
    player.health = player.maxHealth;
    player.lives = 3;
    player.x = 100;
    player.y = GAME_CONFIG.GROUND_Y - player.height;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isDead = false;
    player.invulnerabilityTimer = 0;
    player.animationState = 'idle';
    player.currentWeapon = 'punch';
    player.isAttacking = false;
    player.attackTimer = 0;
    player.attackCooldownTimer = 0;
    
    // Reset game stats
    gameStats.isGameOver = false;
    gameStats.score = 0;
    gameStats.enemiesDefeated = 0;
    
    // Clear arrays
    enemies.length = 0;
    projectiles.length = 0;
    collectibles.length = 0;
    
    // Reset spawners
    enemySpawner.lastSpawnTime = 0;
    enemySpawner.currentSpawnIndex = 0;
    collectibleSpawner.lastSpawnTime = 0;
    collectibleSpawner.currentSpawnIndex = 0;
    
    // Add initial content if starting game
    if (gameState.currentState === 'playing') {
        // Spawn initial enemies
        enemies.push(createEnemy('car', 600, 0));
        enemies.push(createEnemy('motorcycle', 900, 0));
        
        // Spawn initial collectibles
        collectibles.push(createCollectible('dumpling', 400, GAME_CONFIG.GROUND_Y - 50));
        collectibles.push(createCollectible('noodle_soup', 800, GAME_CONFIG.GROUND_Y - 50));
    }
}

// Process global inputs (available in all game states)
function processGlobalInputs() {
    // Handle audio toggle
    if (input.audioToggle) {
        toggleAudio();
        input.audioToggle = false;
        console.log(`Audio ${audioSystem.enabled ? 'enabled' : 'disabled'}`);
    }
}

// Update player movement and physics
function updatePlayer(deltaTime) {
    // Input validation and error handling
    if (!deltaTime || deltaTime <= 0 || isNaN(deltaTime)) {
        console.warn('Invalid deltaTime in updatePlayer:', deltaTime);
        return;
    }
    
    // Clamp deltaTime to prevent large jumps
    deltaTime = Math.min(deltaTime, 0.033); // Max 33ms
    
    // Handle respawn timer
    if (player.isDead) {
        player.respawnTimer = Math.max(0, player.respawnTimer - deltaTime);
        if (player.respawnTimer <= 0) {
            respawnPlayer();
        }
        return; // Skip all other updates while dead
    }
    
    // Update invulnerability timer with bounds checking
    if (player.invulnerabilityTimer > 0) {
        player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - deltaTime);
    }
    
    // Update attack timers with bounds checking
    if (player.attackTimer > 0) {
        player.attackTimer = Math.max(0, player.attackTimer - deltaTime);
        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }
    
    if (player.attackCooldownTimer > 0) {
        player.attackCooldownTimer = Math.max(0, player.attackCooldownTimer - deltaTime);
    }
    
        // Handle weapon switching with validation
        if (input.weaponSwitch && player.attackCooldownTimer <= 0) {
            try {
                player.currentWeapon = player.currentWeapon === 'punch' ? 'gun' : 'punch';
                player.attackCooldownTimer = 0.2; // Small cooldown to prevent rapid switching
                playSound('weaponSwitch'); // Enhanced weapon switch sound
                input.weaponSwitch = false; // Reset input to prevent continuous switching
            } catch (error) {
                console.error('Error in weapon switching:', error);
                player.currentWeapon = 'punch'; // Fallback to safe default
            }
        }    // Handle attacking with error handling
    if (input.attack && !player.isAttacking && player.attackCooldownTimer <= 0) {
        try {
            startAttack();
        } catch (error) {
            console.error('Error starting attack:', error);
        }
    }
    
    // Don't allow movement during punch attack
    if (player.isAttacking && player.currentWeapon === 'punch') {
        player.velocityX = 0;
    } else {
        // Handle horizontal movement with bounds checking
        if (input.left && !input.right) {
            player.velocityX = -player.speed;
            player.facingRight = false;
            if (player.isOnGround && !player.isAttacking) {
                player.animationState = 'walking';
            }
        } else if (input.right && !input.left) {
            player.velocityX = player.speed;
            player.facingRight = true;
            if (player.isOnGround && !player.isAttacking) {
                player.animationState = 'walking';
            }
        } else {
            player.velocityX = 0;
            if (player.isOnGround && !player.isAttacking) {
                player.animationState = 'idle';
            }
        }
    }
    
    // Handle jumping
    if (input.jump && player.isOnGround && !player.isJumping && !player.isAttacking) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
        player.isOnGround = false;
        player.animationState = 'jumping';
        playSound('jump'); // Enhanced jump sound effect
    }
    
    // Apply gravity
    if (!player.isOnGround) {
        player.velocityY += GAME_CONFIG.GRAVITY * deltaTime;
        if (player.velocityY > 0 && player.animationState === 'jumping') {
            player.animationState = 'falling';
        }
    }
    
    // Update position with validation
    const newX = player.x + player.velocityX * deltaTime;
    const newY = player.y + player.velocityY * deltaTime;
    
    // Validate position values
    if (!isNaN(newX) && isFinite(newX)) {
        player.x = newX;
    } else {
        console.warn('Invalid player.x calculated:', newX);
        player.velocityX = 0; // Stop movement if invalid
    }
    
    if (!isNaN(newY) && isFinite(newY)) {
        player.y = newY;
    } else {
        console.warn('Invalid player.y calculated:', newY);
        player.velocityY = 0; // Stop movement if invalid
    }
    
    // Keep player within world bounds (horizontal) with enhanced checks
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = Math.max(0, player.velocityX); // Prevent moving further left
    } else if (player.x + player.width > GAME_CONFIG.WORLD_WIDTH) {
        player.x = GAME_CONFIG.WORLD_WIDTH - player.width;
        player.velocityX = Math.min(0, player.velocityX); // Prevent moving further right
    }
    
    // Prevent player from falling through the world
    if (player.y > GAME_CONFIG.WORLD_HEIGHT) {
        console.warn('Player fell through world, respawning');
        player.health = 0; // Trigger death/respawn
    }
    
    // Update emotional state based on game conditions - Milestone 2 enhancement
    player.lastEmotionChange += deltaTime;
    if (player.lastEmotionChange > 1.0) { // Check every second
        const previousState = player.emotionalState;
        
        if (player.health <= player.maxHealth * 0.3) {
            player.emotionalState = 'worried';
        } else if (player.isAttacking) {
            player.emotionalState = 'determined';
        } else if (enemies.length > 3) {
            player.emotionalState = 'focused';
        } else {
            player.emotionalState = 'neutral';
        }
        
        // Reset timer if state changed
        if (previousState !== player.emotionalState) {
            player.lastEmotionChange = 0;
        }
    }
    
    // Update enhanced animation timers
    if (player.quillShakeTimer > 0) {
        player.quillShakeTimer = Math.max(0, player.quillShakeTimer - deltaTime);
    }
    
    // Platform collision detection with error handling
    try {
        checkPlayerPlatformCollision();
    } catch (error) {
        console.error('Error in platform collision:', error);
        // Fallback: place player on ground
        if (player.y > GAME_CONFIG.GROUND_Y - player.height) {
            player.y = GAME_CONFIG.GROUND_Y - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
            player.isJumping = false;
        }
    }
    
    // Update animation with error handling
    try {
        updatePlayerAnimation(deltaTime);
    } catch (error) {
        console.error('Error updating player animation:', error);
        player.animationState = 'idle'; // Fallback to safe state
    }
}

// Check collision between player and platforms
function checkPlayerPlatformCollision() {
    let wasOnGround = player.isOnGround;
    player.isOnGround = false;
    
    for (let platform of platforms) {
        // Check if player is overlapping with platform
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Landing on top of platform (falling down)
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isOnGround = true;
                player.isJumping = false;
                
                // Play landing sound if falling with significant velocity
                if (wasOnGround === false && player.velocityY > 200) {
                    playSound('land');
                }
                
                if (!player.isAttacking) {
                    if (player.velocityX === 0) {
                        player.animationState = 'idle';
                    } else {
                        player.animationState = 'walking';
                    }
                }
                break;
            }
            // Hitting platform from below (jumping up)
            else if (player.velocityY < 0 && player.y > platform.y) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
                break;
            }
            // Hitting platform from the side (horizontal collision)
            else if (Math.abs(player.velocityX) > 0) {
                if (player.x < platform.x) {
                    // Hitting from left
                    player.x = platform.x - player.width;
                } else {
                    // Hitting from right
                    player.x = platform.x + platform.width;
                }
                player.velocityX = 0;
                break;
            }
        }
    }
}

// Update camera to follow player
function updateCamera() {
    // Target camera position based on player position
    camera.targetX = player.x - camera.offsetX;
    camera.targetY = player.y - camera.offsetY;
    
    // Keep camera within world bounds
    if (camera.targetX < 0) {
        camera.targetX = 0;
    } else if (camera.targetX > GAME_CONFIG.WORLD_WIDTH - GAME_CONFIG.CANVAS_WIDTH) {
        camera.targetX = GAME_CONFIG.WORLD_WIDTH - GAME_CONFIG.CANVAS_WIDTH;
    }
    
    if (camera.targetY < 0) {
        camera.targetY = 0;
    } else if (camera.targetY > GAME_CONFIG.WORLD_HEIGHT - GAME_CONFIG.CANVAS_HEIGHT) {
        camera.targetY = GAME_CONFIG.WORLD_HEIGHT - GAME_CONFIG.CANVAS_HEIGHT;
    }
    
    // Smooth camera movement
    camera.x += (camera.targetX - camera.x) * camera.smoothing;
    camera.y += (camera.targetY - camera.y) * camera.smoothing;
}

// Enhanced Audio System Functions - Milestone 4

// Initialize comprehensive audio system with Web Audio API
function initAudioSystem() {
    if (!audioSystem.enabled) {
        console.log('Audio system disabled');
        return Promise.resolve();
    }
    
    try {
        // Initialize Web Audio API context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn('Web Audio API not supported');
            audioSystem.enabled = false;
            return Promise.resolve();
        }
        
        audioSystem.audioContext = new AudioContext();
        console.log('Audio context created, state:', audioSystem.audioContext.state);
        
        // Create master gain node for overall volume control
        audioSystem.masterGainNode = audioSystem.audioContext.createGain();
        audioSystem.masterGainNode.gain.value = audioSystem.masterVolume;
        audioSystem.masterGainNode.connect(audioSystem.audioContext.destination);
        
        // Create separate gain nodes for music and sound effects
        audioSystem.musicGainNode = audioSystem.audioContext.createGain();
        audioSystem.musicGainNode.gain.value = audioSystem.musicVolume;
        audioSystem.musicGainNode.connect(audioSystem.masterGainNode);
        
        audioSystem.sfxGainNode = audioSystem.audioContext.createGain();
        audioSystem.sfxGainNode.gain.value = audioSystem.sfxVolume;
        audioSystem.sfxGainNode.connect(audioSystem.masterGainNode);
        
        // Resume audio context if suspended (required for Chrome autoplay policy)
        if (audioSystem.audioContext.state === 'suspended') {
            return audioSystem.audioContext.resume().then(() => {
                console.log('Audio context resumed');
                return initializeAudioAssets();
            });
        } else {
            return initializeAudioAssets();
        }
        
    } catch (error) {
        console.error('Failed to initialize audio system:', error);
        audioSystem.enabled = false;
        return Promise.resolve();
    }
}

// Initialize audio assets and sound library
function initializeAudioAssets() {
    console.log('Initializing audio assets...');
    
    // Create procedural sound effects using Web Audio API
    createProceduralSounds();
    
    // Create background music tracks
    createBackgroundMusicTracks();
    
    // Load additional audio assets if available
    loadExternalAudioAssets();
    
    audioSystem.initialized = true;
    console.log('Audio system initialized successfully');
    return Promise.resolve();
}

// Create procedural sound effects for immediate use
function createProceduralSounds() {
    audioSystem.sounds = {
        // Player action sounds
        jump: () => playProceduralSound('jump'),
        land: () => playProceduralSound('land'),
        punch: () => playProceduralSound('punch'),
        gunshot: () => playProceduralSound('gunshot'),
        footstep: () => playProceduralSound('footstep'),
        weaponSwitch: () => playProceduralSound('weaponSwitch'),
        
        // Combat sounds
        enemyHit: () => playProceduralSound('enemyHit'),
        enemyDestroy: () => playProceduralSound('enemyDestroy'),
        playerHurt: () => playProceduralSound('playerHurt'),
        playerDeath: () => playProceduralSound('playerDeath'),
        
        // Collectible sounds
        collectFood: () => playProceduralSound('collectFood'),
        collectSpecial: () => playProceduralSound('collectSpecial'),
        healthRestore: () => playProceduralSound('healthRestore'),
        
        // UI sounds
        menuSelect: () => playProceduralSound('menuSelect'),
        menuConfirm: () => playProceduralSound('menuConfirm'),
        menuBack: () => playProceduralSound('menuBack'),
        levelComplete: () => playProceduralSound('levelComplete'),
        gameOver: () => playProceduralSound('gameOver'),
        
        // Environment sounds
        carEngine: () => playProceduralSound('carEngine'),
        motorcycleEngine: () => playProceduralSound('motorcycleEngine'),
        helicopterRotor: () => playProceduralSound('helicopterRotor'),
        boatEngine: () => playProceduralSound('boatEngine'),
        
        // Level-specific ambient sounds
        cityTraffic: () => playAmbientSound('cityTraffic'),
        windGusts: () => playAmbientSound('windGusts'),
        waterWaves: () => playAmbientSound('waterWaves'),
        neonBuzz: () => playAmbientSound('neonBuzz')
    };
    
    console.log('Procedural sound library created');
}

// Create background music tracks using procedural generation
function createBackgroundMusicTracks() {
    if (!audioSystem.audioContext) return;
    
    audioSystem.backgroundMusic.tracks = {
        title_theme: createTitleTheme(),
        street_theme: createStreetTheme(),
        rooftop_theme: createRooftopTheme(),
        harbor_theme: createHarborTheme(),
        neon_theme: createNeonTheme(),
        boss_theme: createBossTheme(),
        final_boss_theme: createFinalBossTheme(),
        victory_theme: createVictoryTheme(),
        game_over_theme: createGameOverTheme()
    };
    
    console.log('Background music tracks created');
}

// Play procedural sound effect
function playProceduralSound(soundType) {
    if (!audioSystem.enabled || !audioSystem.sfxGainNode || !audioSystem.settings.sfxEnabled) {
        return;
    }
    
    try {
        const now = audioSystem.audioContext.currentTime;
        let oscillator, gainNode, filterNode;
        
        switch (soundType) {
            case 'jump':
                oscillator = audioSystem.audioContext.createOscillator();
                gainNode = audioSystem.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
                
            case 'land':
                oscillator = audioSystem.audioContext.createOscillator();
                gainNode = audioSystem.audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
                
            case 'punch':
                // Create punch impact sound with noise
                const bufferSize = audioSystem.audioContext.sampleRate * 0.1;
                const buffer = audioSystem.audioContext.createBuffer(1, bufferSize, audioSystem.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / bufferSize), 2);
                }
                
                const bufferSource = audioSystem.audioContext.createBufferSource();
                bufferSource.buffer = buffer;
                
                gainNode = audioSystem.audioContext.createGain();
                gainNode.gain.setValueAtTime(0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                
                filterNode = audioSystem.audioContext.createBiquadFilter();
                filterNode.type = 'lowpass';
                filterNode.frequency.value = 800;
                
                bufferSource.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                bufferSource.start(now);
                break;
                
            case 'gunshot':
                // Create realistic gunshot with noise burst
                const shotBufferSize = audioSystem.audioContext.sampleRate * 0.15;
                const shotBuffer = audioSystem.audioContext.createBuffer(1, shotBufferSize, audioSystem.audioContext.sampleRate);
                const shotData = shotBuffer.getChannelData(0);
                
                for (let i = 0; i < shotBufferSize; i++) {
                    const decay = Math.pow(1 - (i / shotBufferSize), 3);
                    shotData[i] = (Math.random() * 2 - 1) * decay;
                }
                
                const shotSource = audioSystem.audioContext.createBufferSource();
                shotSource.buffer = shotBuffer;
                
                gainNode = audioSystem.audioContext.createGain();
                gainNode.gain.setValueAtTime(0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                
                filterNode = audioSystem.audioContext.createBiquadFilter();
                filterNode.type = 'highpass';
                filterNode.frequency.value = 300;
                
                shotSource.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                shotSource.start(now);
                break;
                
            case 'enemyHit':
                oscillator = audioSystem.audioContext.createOscillator();
                gainNode = audioSystem.audioContext.createGain();
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.linearRampToValueAtTime(80, now + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                oscillator.start(now);
                oscillator.stop(now + 0.12);
                break;
                
            case 'collectFood':
                oscillator = audioSystem.audioContext.createOscillator();
                gainNode = audioSystem.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(660, now);
                oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
                
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                oscillator.start(now);
                oscillator.stop(now + 0.25);
                break;
                
            case 'menuSelect':
                oscillator = audioSystem.audioContext.createOscillator();
                gainNode = audioSystem.audioContext.createGain();
                
                oscillator.type = 'triangle';
                oscillator.frequency.value = 800;
                
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case 'levelComplete':
                // Victory chord progression
                const frequencies = [523, 659, 784, 1047]; // C, E, G, C octave
                frequencies.forEach((freq, index) => {
                    oscillator = audioSystem.audioContext.createOscillator();
                    gainNode = audioSystem.audioContext.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.value = freq;
                    
                    gainNode.gain.setValueAtTime(0.15, now + index * 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + index * 0.1);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioSystem.sfxGainNode);
                    
                    oscillator.start(now + index * 0.1);
                    oscillator.stop(now + 0.8 + index * 0.1);
                });
                break;
                
            default:
                // Generic beep sound
                oscillator = audioSystem.audioContext.createOscillator();
                gainNode = audioSystem.audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.frequency.value = 440;
                
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
        }
    } catch (error) {
        console.warn('Error playing procedural sound:', error);
    }
}

// Play ambient sound for atmosphere
function playAmbientSound(soundType) {
    if (!audioSystem.enabled || !audioSystem.settings.ambientEnabled) {
        return;
    }
    
    // Ambient sounds would be longer, looped sounds
    // For now, create subtle background tones
    try {
        const now = audioSystem.audioContext.currentTime;
        let oscillator, gainNode, filterNode;
        
        switch (soundType) {
            case 'cityTraffic':
                // Low frequency rumble
                oscillator = audioSystem.audioContext.createOscillator();
                gainNode = audioSystem.audioContext.createGain();
                filterNode = audioSystem.audioContext.createBiquadFilter();
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 60 + Math.random() * 40;
                
                filterNode.type = 'lowpass';
                filterNode.frequency.value = 200;
                
                gainNode.gain.setValueAtTime(0.05, now);
                
                oscillator.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                oscillator.start(now);
                oscillator.stop(now + 2.0 + Math.random() * 3.0);
                break;
                
            case 'windGusts':
                // Create wind sound with filtered noise
                const windBufferSize = audioSystem.audioContext.sampleRate * 3;
                const windBuffer = audioSystem.audioContext.createBuffer(1, windBufferSize, audioSystem.audioContext.sampleRate);
                const windData = windBuffer.getChannelData(0);
                
                for (let i = 0; i < windBufferSize; i++) {
                    windData[i] = (Math.random() * 2 - 1) * 0.1;
                }
                
                const windSource = audioSystem.audioContext.createBufferSource();
                windSource.buffer = windBuffer;
                
                gainNode = audioSystem.audioContext.createGain();
                gainNode.gain.setValueAtTime(0.03, now);
                gainNode.gain.setValueAtTime(0.08, now + 1.5);
                gainNode.gain.setValueAtTime(0.03, now + 3.0);
                
                filterNode = audioSystem.audioContext.createBiquadFilter();
                filterNode.type = 'bandpass';
                filterNode.frequency.value = 400;
                filterNode.Q.value = 0.5;
                
                windSource.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(audioSystem.sfxGainNode);
                
                windSource.start(now);
                break;
                
            default:
                console.log(`Ambient sound '${soundType}' not implemented yet`);
                break;
        }
    } catch (error) {
        console.warn('Error playing ambient sound:', error);
    }
}

// Create title screen theme
function createTitleTheme() {
    return {
        name: 'Hong Kong Nights',
        duration: 60, // seconds
        tempo: 90,
        play: function() {
            playBackgroundMelody('title', this.tempo);
        }
    };
}

// Create street level theme
function createStreetTheme() {
    return {
        name: 'Streets of Hong Kong',
        duration: 120,
        tempo: 120,
        play: function() {
            playBackgroundMelody('street', this.tempo);
        }
    };
}

// Create rooftop level theme
function createRooftopTheme() {
    return {
        name: 'Above the City',
        duration: 150,
        tempo: 140,
        play: function() {
            playBackgroundMelody('rooftop', this.tempo);
        }
    };
}

// Create harbor level theme
function createHarborTheme() {
    return {
        name: 'Harbor Nights',
        duration: 135,
        tempo: 110,
        play: function() {
            playBackgroundMelody('harbor', this.tempo);
        }
    };
}

// Create neon district theme
function createNeonTheme() {
    return {
        name: 'Neon Dreams',
        duration: 140,
        tempo: 135,
        play: function() {
            playBackgroundMelody('neon', this.tempo);
        }
    };
}

// Create boss battle theme
function createBossTheme() {
    return {
        name: 'Triad Confrontation',
        duration: 180,
        tempo: 150,
        play: function() {
            playBackgroundMelody('boss', this.tempo);
        }
    };
}

// Create final boss theme
function createFinalBossTheme() {
    return {
        name: 'Final Showdown',
        duration: 200,
        tempo: 160,
        play: function() {
            playBackgroundMelody('final_boss', this.tempo);
        }
    };
}

// Create victory theme
function createVictoryTheme() {
    return {
        name: 'Victory',
        duration: 30,
        tempo: 120,
        play: function() {
            playBackgroundMelody('victory', this.tempo);
        }
    };
}

// Create game over theme
function createGameOverTheme() {
    return {
        name: 'Game Over',
        duration: 20,
        tempo: 60,
        play: function() {
            playBackgroundMelody('game_over', this.tempo);
        }
    };
}

// Play background melody based on theme
function playBackgroundMelody(theme, tempo) {
    if (!audioSystem.enabled || !audioSystem.musicGainNode || !audioSystem.settings.musicEnabled) {
        return;
    }
    
    console.log(`Playing background melody: ${theme} at tempo ${tempo}`);
    
    // For Milestone 4, create simple procedural background music
    // In a production game, these would be actual music files
    try {
        const now = audioSystem.audioContext.currentTime;
        const beatDuration = 60 / tempo; // Duration of one beat in seconds
        
        // Create a simple chord progression based on the theme
        let chordProgression, bassLine, melody;
        
        switch (theme) {
            case 'title':
                chordProgression = [261, 329, 392, 261]; // C, E, G, C - welcoming
                bassLine = [130, 164, 196, 130]; // One octave lower
                melody = [523, 659, 784, 523]; // One octave higher
                break;
                
            case 'street':
                chordProgression = [220, 277, 330, 220]; // A, C#, E, A - urban energy
                bassLine = [110, 138, 165, 110];
                melody = [440, 554, 660, 440];
                break;
                
            case 'rooftop':
                chordProgression = [247, 311, 370, 247]; // B, D#, F#, B - elevated tension
                bassLine = [123, 155, 185, 123];
                melody = [494, 622, 740, 494];
                break;
                
            case 'harbor':
                chordProgression = [196, 247, 294, 196]; // G, B, D, G - flowing like water
                bassLine = [98, 123, 147, 98];
                melody = [392, 494, 588, 392];
                break;
                
            case 'boss':
                chordProgression = [233, 277, 349, 233]; // A#, C#, F, A# - menacing
                bassLine = [116, 138, 174, 116];
                melody = [466, 554, 698, 466];
                break;
                
            default:
                chordProgression = [261, 329, 392, 261]; // Default to C major
                bassLine = [130, 164, 196, 130];
                melody = [523, 659, 784, 523];
                break;
        }
        
        // Play the chord progression
        chordProgression.forEach((frequency, index) => {
            const startTime = now + index * beatDuration * 4; // 4 beats per chord
            
            // Chord (main harmony)
            const chordOsc = audioSystem.audioContext.createOscillator();
            const chordGain = audioSystem.audioContext.createGain();
            
            chordOsc.type = 'triangle';
            chordOsc.frequency.value = frequency;
            
            chordGain.gain.setValueAtTime(0.08, startTime);
            chordGain.gain.setValueAtTime(0.08, startTime + beatDuration * 3.5);
            chordGain.gain.exponentialRampToValueAtTime(0.001, startTime + beatDuration * 4);
            
            chordOsc.connect(chordGain);
            chordGain.connect(audioSystem.musicGainNode);
            
            chordOsc.start(startTime);
            chordOsc.stop(startTime + beatDuration * 4);
            
            // Bass line
            const bassOsc = audioSystem.audioContext.createOscillator();
            const bassGain = audioSystem.audioContext.createGain();
            
            bassOsc.type = 'sine';
            bassOsc.frequency.value = bassLine[index];
            
            bassGain.gain.setValueAtTime(0.12, startTime);
            bassGain.gain.setValueAtTime(0.12, startTime + beatDuration * 3.5);
            bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + beatDuration * 4);
            
            bassOsc.connect(bassGain);
            bassGain.connect(audioSystem.musicGainNode);
            
            bassOsc.start(startTime);
            bassOsc.stop(startTime + beatDuration * 4);
            
            // Melody (if not boss theme, keep it lighter)
            if (theme !== 'boss' && theme !== 'final_boss') {
                const melodyOsc = audioSystem.audioContext.createOscillator();
                const melodyGain = audioSystem.audioContext.createGain();
                
                melodyOsc.type = 'square';
                melodyOsc.frequency.value = melody[index];
                
                melodyGain.gain.setValueAtTime(0.06, startTime + beatDuration);
                melodyGain.gain.setValueAtTime(0.06, startTime + beatDuration * 3);
                melodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + beatDuration * 3.5);
                
                melodyOsc.connect(melodyGain);
                melodyGain.connect(audioSystem.musicGainNode);
                
                melodyOsc.start(startTime + beatDuration);
                melodyOsc.stop(startTime + beatDuration * 3.5);
            }
        });
        
        // Schedule the next loop more precisely for seamless looping
        const totalDuration = chordProgression.length * beatDuration * 4;
        
        // Clear any existing loop schedule
        if (audioSystem.backgroundMusic.loopScheduleId) {
            clearTimeout(audioSystem.backgroundMusic.loopScheduleId);
        }
        
        // Only schedule next loop if looping is enabled
        if (audioSystem.backgroundMusic.looping) {
            // Use a more precise scheduling approach for seamless looping
            const nextLoopTime = audioSystem.audioContext.currentTime + totalDuration;
            
            // Schedule the next loop immediately at the exact time the current one ends
            const scheduleNextLoop = () => {
                const timeToNext = (nextLoopTime - audioSystem.audioContext.currentTime) * 1000;
                if (timeToNext > 0) {
                    audioSystem.backgroundMusic.loopScheduleId = setTimeout(() => {
                        if (audioSystem.backgroundMusic.currentTrack === theme && audioSystem.backgroundMusic.looping) {
                            playBackgroundMelody(theme, tempo);
                        }
                    }, Math.max(0, timeToNext - 10)); // Start slightly early to ensure seamless transition
                }
            };
            
            scheduleNextLoop();
        }
        
    } catch (error) {
        console.warn('Error playing background melody:', error);
    }
}

// Load external audio assets (placeholder for future implementation)
function loadExternalAudioAssets() {
    // In a production game, this would load actual audio files
    // For now, we rely on procedural generation
    console.log('External audio assets loading not implemented (using procedural audio)');
    return Promise.resolve();
}

// Start background music for current level or state
function startBackgroundMusic(trackKey = null) {
    if (!audioSystem.enabled || !audioSystem.settings.musicEnabled) {
        console.log('Background music disabled');
        return;
    }
    
    if (!trackKey) {
        // Determine track based on current game state and level
        switch (gameState.currentState) {
            case 'title':
                trackKey = 'title_theme';
                break;
            case 'levelSelect':
                trackKey = 'title_theme';
                break;
            case 'playing':
                const currentLevel = levelManager.currentLevel;
                const levelAudio = audioSystem.levelAudio[currentLevel];
                trackKey = levelAudio ? levelAudio.musicKey : 'street_theme';
                break;
            case 'levelComplete':
                trackKey = 'victory_theme';
                break;
            case 'gameOver':
                trackKey = 'game_over_theme';
                break;
            default:
                trackKey = 'title_theme';
                break;
        }
    }
    
    const track = audioSystem.backgroundMusic.tracks[trackKey];
    if (!track) {
        console.warn(`Background music track '${trackKey}' not found`);
        return;
    }
    
    // Stop current track if playing
    stopBackgroundMusic();
    
    // Set new current track
    audioSystem.backgroundMusic.currentTrack = trackKey;
    
    console.log(`Starting background music: ${track.name}`);
    
    // Start playing the track
    track.play();
}

// Stop background music with fade out
function stopBackgroundMusic() {
    if (audioSystem.backgroundMusic.currentTrack) {
        console.log('Stopping background music');
        audioSystem.backgroundMusic.currentTrack = null;
        
        // Clear any pending loop schedules
        if (audioSystem.backgroundMusic.loopScheduleId) {
            clearTimeout(audioSystem.backgroundMusic.loopScheduleId);
            audioSystem.backgroundMusic.loopScheduleId = null;
        }
        
        // In a full implementation, we would fade out the current track
        // For now, we just stop scheduling new loops
    }
}

// Control background music looping
function setBackgroundMusicLooping(shouldLoop) {
    audioSystem.backgroundMusic.looping = shouldLoop;
    if (!shouldLoop && audioSystem.backgroundMusic.loopScheduleId) {
        clearTimeout(audioSystem.backgroundMusic.loopScheduleId);
        audioSystem.backgroundMusic.loopScheduleId = null;
        console.log('Background music looping disabled');
    } else if (shouldLoop) {
        console.log('Background music looping enabled');
    }
}

// Play sound effect wrapper function
function playSound(soundName) {
    if (!audioSystem.enabled || !audioSystem.settings.sfxEnabled) {
        return;
    }
    
    if (audioSystem.sounds[soundName]) {
        try {
            audioSystem.sounds[soundName]();
        } catch (error) {
            console.warn(`Error playing sound '${soundName}':`, error);
        }
    } else {
        console.warn(`Sound '${soundName}' not found in audio library`);
    }
}

// Update audio volume settings
function updateAudioVolume(type, value) {
    value = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
    
    switch (type) {
        case 'master':
            audioSystem.masterVolume = value;
            if (audioSystem.masterGainNode) {
                audioSystem.masterGainNode.gain.value = value;
            }
            break;
        case 'music':
            audioSystem.musicVolume = value;
            if (audioSystem.musicGainNode) {
                audioSystem.musicGainNode.gain.value = value;
            }
            break;
        case 'sfx':
            audioSystem.sfxVolume = value;
            if (audioSystem.sfxGainNode) {
                audioSystem.sfxGainNode.gain.value = value;
            }
            break;
    }
    
    console.log(`Updated ${type} volume to ${(value * 100).toFixed(0)}%`);
}

// Toggle audio settings
function toggleAudio() {
    audioSystem.enabled = !audioSystem.enabled;
    
    if (!audioSystem.enabled) {
        stopBackgroundMusic();
        if (audioSystem.audioContext && audioSystem.audioContext.state === 'running') {
            audioSystem.audioContext.suspend();
        }
    } else {
        if (audioSystem.audioContext && audioSystem.audioContext.state === 'suspended') {
            audioSystem.audioContext.resume();
        }
        startBackgroundMusic();
    }
    
    console.log(`Audio ${audioSystem.enabled ? 'enabled' : 'disabled'}`);
}

function toggleMusicEnabled() {
    audioSystem.settings.musicEnabled = !audioSystem.settings.musicEnabled;
    
    if (!audioSystem.settings.musicEnabled) {
        stopBackgroundMusic();
    } else if (gameState.currentState === 'playing') {
        startBackgroundMusic();
    }
    
    console.log(`Music ${audioSystem.settings.musicEnabled ? 'enabled' : 'disabled'}`);
}

function toggleSfxEnabled() {
    audioSystem.settings.sfxEnabled = !audioSystem.settings.sfxEnabled;
    console.log(`Sound effects ${audioSystem.settings.sfxEnabled ? 'enabled' : 'disabled'}`);
}

// Audio context resume function for user interaction requirements
function resumeAudioContext() {
    if (audioSystem.audioContext && audioSystem.audioContext.state === 'suspended') {
        audioSystem.audioContext.resume().then(() => {
            console.log('Audio context resumed after user interaction');
        });
    }
}

// Start an attack based on current weapon
function startAttack() {
    player.isAttacking = true;
    player.attackTimer = player.attackDuration;
    player.attackCooldownTimer = player.attackCooldown;
    
    if (player.currentWeapon === 'punch') {
        player.animationState = 'punching';
        playSound('punch'); // Enhanced punch sound effect
        // Punch attack logic will be added when we have enemies
    } else if (player.currentWeapon === 'gun') {
        player.animationState = 'shooting';
        playSound('gunshot'); // Enhanced gun sound effect
        // Create projectile
        const projectileX = player.facingRight ? player.x + player.width : player.x;
        const projectileY = player.y + player.height / 2;
        const direction = player.facingRight ? 1 : -1;
        projectiles.push(createProjectile(projectileX, projectileY, direction));
    }
}

// Update projectiles
function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        if (!projectile.active) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Update position
        projectile.x += projectile.velocityX * deltaTime;
        projectile.y += projectile.velocityY * deltaTime;
        
        // Update lifetime
        projectile.lifetime -= deltaTime;
        
        // Remove if off screen or lifetime expired
        if (projectile.x < -projectile.width || 
            projectile.x > canvas.width + 500 || // Allow projectiles to go off screen for extended range
            projectile.lifetime <= 0) {
            projectile.active = false;
        }
    }
}

// Update enemies
function updateEnemies(deltaTime) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (!enemy.active) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Update timers
        if (enemy.attackTimer > 0) {
            enemy.attackTimer -= deltaTime;
        }
        
        if (enemy.stunTimer > 0) {
            enemy.stunTimer -= deltaTime;
            continue; // Skip AI updates while stunned
        }
        
        // Update AI
        updateEnemyAI(enemy, deltaTime);
        
        // Update animation
        updateEnemyAnimation(enemy, deltaTime);
        
        // Keep enemy on ground
        enemy.y = enemy.type === 'car' ? GAME_CONFIG.GROUND_Y - 60 : GAME_CONFIG.GROUND_Y - 50;
        
        // Remove enemies that are too far off screen
        if (enemy.x < -200 || enemy.x > canvas.width + 200) {
            enemy.active = false;
        }
    }
}

// Update enemy AI behavior
function updateEnemyAI(enemy, deltaTime) {
    const distanceToPlayer = Math.abs(enemy.x - player.x);
    
    // Update facing direction based on player position
    enemy.facingRight = player.x > enemy.x;
    
    // Special movement patterns for different enemy types
    if (enemy.type === 'helicopter') {
        // Helicopter bobbing motion
        enemy.verticalBob += enemy.bobSpeed;
        enemy.y = 200 + Math.sin(enemy.verticalBob) * 15;
    } else if (enemy.type === 'boat') {
        // Boat wave motion
        enemy.waveMotion += enemy.waveSpeed;
        enemy.y = 740 + Math.sin(enemy.waveMotion) * 8;
    }
    
    switch (enemy.aiState) {
        case 'patrol':
            // Patrol behavior
            enemy.x += enemy.patrolDirection * enemy.speed * 0.5 * deltaTime;
            
            // Check if reached patrol boundary
            if (Math.abs(enemy.x - enemy.originalX) > enemy.patrolDistance) {
                enemy.patrolDirection *= -1;
            }
            
            // Switch to chase if player is within aggro range
            if (distanceToPlayer <= enemy.aggroRange) {
                enemy.aiState = 'chase';
            }
            break;
            
        case 'chase':
            // Chase the player
            const chaseDirection = player.x > enemy.x ? 1 : -1;
            let chaseSpeed = enemy.speed;
            
            // Helicopters move faster when chasing
            if (enemy.type === 'helicopter') {
                chaseSpeed *= 1.3;
            }
            
            enemy.x += chaseDirection * chaseSpeed * deltaTime;
            
            // Switch to attack if close enough
            if (distanceToPlayer <= enemy.attackRange) {
                enemy.aiState = 'attack';
                enemy.attackTimer = enemy.attackCooldown;
            }
            
            // Return to patrol if player is too far
            if (distanceToPlayer > enemy.aggroRange * 1.5) {
                enemy.aiState = 'patrol';
            }
            break;
            
        case 'attack':
            // Attack behavior - stay close and damage player
            if (enemy.attackTimer <= 0 && distanceToPlayer <= enemy.attackRange) {
                // Deal damage to player (will be implemented with health system)
                enemy.attackTimer = enemy.attackCooldown;
            }
            
            // Return to chase if player moves away
            if (distanceToPlayer > enemy.attackRange * 1.2) {
                enemy.aiState = 'chase';
            }
            break;
    }
}

// Update enemy animation
function updateEnemyAnimation(enemy, deltaTime) {
    enemy.animationTimer += deltaTime;
    
    if (enemy.animationTimer >= enemy.animationSpeed) {
        enemy.animationTimer = 0;
        enemy.animationFrame = (enemy.animationFrame + 1) % 4;
    }
}

// Update enemy spawner
function updateEnemySpawner(deltaTime) {
    enemySpawner.lastSpawnTime += deltaTime;
    
    // Check if it's time to spawn and we haven't reached max enemies
    if (enemySpawner.lastSpawnTime >= enemySpawner.spawnInterval && 
        enemies.length < enemySpawner.maxEnemies) {
        
        // Get next spawn location
        const spawnData = enemySpawner.spawnLocations[enemySpawner.currentSpawnIndex];
        
        // Only spawn if the spawn location is far enough from player
        if (Math.abs(spawnData.x - player.x) > 400) {
            const newEnemy = createEnemy(spawnData.type, spawnData.x, 0);
            enemies.push(newEnemy);
            
            enemySpawner.lastSpawnTime = 0;
            enemySpawner.currentSpawnIndex = (enemySpawner.currentSpawnIndex + 1) % enemySpawner.spawnLocations.length;
        }
    }
}

// Update collectibles
function updateCollectibles(deltaTime) {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        
        if (!collectible.active) {
            collectibles.splice(i, 1);
            continue;
        }
        
        // Update animation
        collectible.animationTimer += deltaTime;
        if (collectible.animationTimer >= collectible.animationSpeed) {
            collectible.animationTimer = 0;
            collectible.animationFrame = (collectible.animationFrame + 1) % 4;
        }
        
        // Update floating animation
        collectible.bobOffset += deltaTime * 2;
        
        // Remove collectibles that are too far off screen
        if (collectible.x < -100 || collectible.x > canvas.width + 100) {
            collectible.active = false;
        }
    }
}

// Update collectible spawner
function updateCollectibleSpawner(deltaTime) {
    collectibleSpawner.lastSpawnTime += deltaTime;
    
    // Check if it's time to spawn and we haven't reached max collectibles
    if (collectibleSpawner.lastSpawnTime >= collectibleSpawner.spawnInterval && 
        collectibles.length < collectibleSpawner.maxCollectibles) {
        
        // Get next spawn location
        const spawnData = collectibleSpawner.spawnLocations[collectibleSpawner.currentSpawnIndex];
        
        // Only spawn if the spawn location is not too close to player
        if (Math.abs(spawnData.x - player.x) > 200) {
            const spawnY = spawnData.y || GAME_CONFIG.GROUND_Y - 50; // Use specified Y or default
            const newCollectible = createCollectible(spawnData.type, spawnData.x, spawnY);
            collectibles.push(newCollectible);
            
            collectibleSpawner.lastSpawnTime = 0;
            collectibleSpawner.currentSpawnIndex = (collectibleSpawner.currentSpawnIndex + 1) % collectibleSpawner.spawnLocations.length;
        }
    }
}

// Damage player function
function damagePlayer(damage) {
    if (player.invulnerabilityTimer > 0 || player.isDead) {
        return; // Player is invulnerable or already dead
    }
    
    player.health -= damage;
    player.invulnerabilityTimer = player.invulnerabilityDuration;
    playSound('playerHurt'); // Enhanced player hurt sound effect
    
    if (player.health <= 0) {
        player.health = 0;
        killPlayer();
    }
}

// Kill player function
function killPlayer() {
    player.isDead = true;
    player.respawnTimer = player.respawnDuration;
    player.lives--;
    
    playSound('playerDeath'); // Add player death sound
    
    if (player.lives <= 0) {
        gameOver();
    }
}

// Respawn player function
function respawnPlayer() {
    player.isDead = false;
    player.health = player.maxHealth;
    player.x = 100; // Reset to starting position
    player.y = GAME_CONFIG.GROUND_Y - player.height;
    player.velocityX = 0;
    player.velocityY = 0;
    player.invulnerabilityTimer = player.invulnerabilityDuration;
    player.animationState = 'idle';
}

// Heal player function
function healPlayer(amount) {
    const oldHealth = player.health;
    player.health = Math.min(player.health + amount, player.maxHealth);
    
    if (player.health > oldHealth) {
        playSound('healthRestore'); // Enhanced healing sound
        gameStats.score += amount * 10; // Bonus points for collecting food
    }
}

// Game over function
function gameOver() {
    gameStats.isGameOver = true;
    gameState.currentState = 'gameOver';
    
    // Stop background music and play game over sound
    stopBackgroundMusic();
    setTimeout(() => {
        startBackgroundMusic('game_over_theme');
    }, 500);
    
    playSound('gameOver');
    console.log('GAME OVER! Final Score:', gameStats.score);
}

// Check all collision types
function checkCollisions() {
    // Check projectile-enemy collisions
    checkProjectileEnemyCollisions();
    
    // Check player-enemy collisions
    checkPlayerEnemyCollisions();
    
    // Check punch-enemy collisions
    checkPunchEnemyCollisions();
    
    // Check player-collectible collisions
    checkPlayerCollectibleCollisions();
}

// Check projectile vs enemy collisions
function checkProjectileEnemyCollisions() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        if (!projectile.active) continue;
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.active) continue;
            
            // Check collision
            if (isColliding(projectile, enemy)) {
                // Damage enemy
                enemy.health--;
                enemy.stunTimer = enemy.stunDuration;
                playSound('enemyHit'); // Add enemy hit sound effect
                
                // Remove projectile
                projectile.active = false;
                
                // Remove enemy if health reaches 0
                if (enemy.health <= 0) {
                    enemy.active = false;
                    gameStats.enemiesDefeated++;
                    gameStats.score += 100; // Points for defeating enemy with gun
                    playSound('enemyDestroy'); // Enhanced enemy destruction sound
                }
                
                break; // Projectile can only hit one enemy
            }
        }
    }
}

// Check player vs enemy collisions
function checkPlayerEnemyCollisions() {
    for (const enemy of enemies) {
        if (!enemy.active) continue;
        
        if (isColliding(player, enemy)) {
            // Player takes damage
            damagePlayer(2);
            
            // Push player away
            const pushDirection = player.x < enemy.x ? -1 : 1;
            player.x += pushDirection * 50;
            
            // Keep player in bounds
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        }
    }
}

// Check punch attack vs enemy collisions
function checkPunchEnemyCollisions() {
    if (player.isAttacking && player.currentWeapon === 'punch') {
        const punchRange = 80;
        const punchX = player.facingRight ? player.x + player.width : player.x - punchRange;
        const punchRect = {
            x: punchX,
            y: player.y + 20,
            width: punchRange,
            height: 60
        };
        
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            if (isColliding(punchRect, enemy)) {
                // Damage enemy
                enemy.health--;
                enemy.stunTimer = enemy.stunDuration;
                playSound('enemyHit'); // Add punch hit sound effect
                
                // Push enemy away
                const pushDirection = enemy.x < player.x ? -1 : 1;
                enemy.x += pushDirection * 30;
                
                // Remove enemy if health reaches 0
                if (enemy.health <= 0) {
                    enemy.active = false;
                    gameStats.enemiesDefeated++;
                    gameStats.score += 150; // Bonus points for melee kills
                    playSound('enemyDestroy'); // Enhanced enemy destruction sound
                }
            }
        }
    }
}

// Check player vs collectible collisions
function checkPlayerCollectibleCollisions() {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        if (!collectible.active) continue;
        
        if (isColliding(player, collectible)) {
            // Heal player
            healPlayer(collectible.healthValue);
            
            // Play appropriate collectible sound
            if (collectible.type === 'dumpling') {
                playSound('collectFood');
            } else if (collectible.type === 'noodle_soup') {
                playSound('collectSpecial');
            }
            
            // Remove collectible
            collectible.active = false;
            collectibles.splice(i, 1);
            
            console.log(`Collected ${collectible.type}! Restored ${collectible.healthValue} HP`);
        }
    }
}

// Collision detection helper function
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Enhanced player animation system - Milestone 2
function updatePlayerAnimation(deltaTime) {
    player.animationTimer += deltaTime;
    
    // Enhanced animation speeds for more fluid movement
    const animationSpeeds = {
        idle: 0.25,      // Slower, more relaxed breathing
        walking: 0.12,   // Faster for more energetic walking
        jumping: 0.1,    // Static frame but responsive
        falling: 0.1,    // Static frame but responsive
        punching: 0.08,  // Faster punch for more impact
        shooting: 0.1    // Quick shooting animation
    };
    
    const currentSpeed = animationSpeeds[player.animationState] || player.animationSpeed;
    
    if (player.animationTimer >= currentSpeed) {
        player.animationTimer = 0;
        
        switch (player.animationState) {
            case 'idle':
                // Enhanced idle animation with hedgehog-specific breathing and quill rustling
                player.animationFrame = (player.animationFrame + 1) % 8; // More frames for breathing
                break;
            case 'walking':
                // Enhanced walking animation with more natural gait
                player.animationFrame = (player.animationFrame + 1) % 8; // More frames for smoother walk
                break;
            case 'jumping':
                // Dynamic jumping frame based on velocity
                if (player.velocityY < -200) {
                    player.animationFrame = 0; // Launching upward
                } else if (player.velocityY > 200) {
                    player.animationFrame = 2; // Falling fast
                } else {
                    player.animationFrame = 1; // Mid-air
                }
                break;
            case 'falling':
                // Enhanced falling animation with hedgehog curl reference
                player.animationFrame = Math.min(player.animationFrame + 1, 3);
                break;
            case 'punching':
                // Enhanced punch animation with better timing
                if (player.animationFrame < 4) {
                    player.animationFrame++;
                }
                // Reset to idle after punch completes
                if (player.animationFrame >= 4 && !player.isAttacking) {
                    player.animationFrame = 0;
                    player.animationState = 'idle';
                }
                break;
            case 'shooting':
                // Enhanced shooting animation
                if (player.animationFrame < 3) {
                    player.animationFrame++;
                }
                // Reset to idle after shooting completes
                if (player.animationFrame >= 3 && !player.isAttacking) {
                    player.animationFrame = 0;
                    player.animationState = 'idle';
                }
                break;
        }
    }
    
    // Add special hedgehog-specific animation triggers
    if (player.animationState === 'idle' && Math.random() < 0.002) {
        // Random quill shake animation
        player.quillShakeTimer = 0.5;
    }
    
    if (player.quillShakeTimer > 0) {
        player.quillShakeTimer -= deltaTime;
    }
}

// Enhanced Hong Kong 1990s background with skyline
// Seeded random function for consistent background elements
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function drawHongKongBackground() {
    // Night sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(0, '#001d3d');
    skyGradient.addColorStop(0.4, '#003566');
    skyGradient.addColorStop(1, '#004080');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    
    // Lower atmosphere with city glow
    const glowGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
    glowGradient.addColorStop(0, '#004080');
    glowGradient.addColorStop(0.5, '#002040');
    glowGradient.addColorStop(1, '#000814');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
    
    // Hong Kong skyline silhouette (distant buildings)
    const buildings = [
        { x: 0, width: 80, height: 200 },
        { x: 70, width: 60, height: 180 },
        { x: 120, width: 90, height: 220 },
        { x: 200, width: 70, height: 190 },
        { x: 260, width: 100, height: 240 },
        { x: 350, width: 80, height: 200 },
        { x: 420, width: 120, height: 280 },
        { x: 530, width: 90, height: 210 },
        { x: 610, width: 70, height: 170 },
        { x: 670, width: 130, height: 260 }
    ];
    
    // Draw buildings with parallax scrolling
    const parallaxOffset = camera.x * 0.2; // Slower scrolling for depth effect
    
    for (let repeat = -1; repeat <= 2; repeat++) {
        for (let buildingIndex = 0; buildingIndex < buildings.length; buildingIndex++) {
            const building = buildings[buildingIndex];
            const buildingX = building.x - parallaxOffset + (repeat * 800);
            const buildingY = canvas.height - building.height;
            
            // Only draw if building is visible on screen
            if (buildingX + building.width > 0 && buildingX < canvas.width) {
                // Building silhouette
                ctx.fillStyle = '#001122';
                ctx.fillRect(buildingX, buildingY, building.width, building.height);
                
                // Consistent lit windows using seeded random
                ctx.fillStyle = '#ffff99';
                for (let floor = 0; floor < Math.floor(building.height / 20); floor++) {
                    for (let window = 0; window < Math.floor(building.width / 15); window++) {
                        const seed = buildingIndex * 1000 + repeat * 100 + floor * 10 + window;
                        if (seededRandom(seed) < 0.3) { // 30% chance of lit window
                            const windowX = buildingX + 5 + window * 15;
                            const windowY = buildingY + 10 + floor * 20;
                            ctx.fillRect(windowX, windowY, 8, 12);
                        }
                    }
                }
                
                // Consistent neon signs using seeded random
                const neonSeed = buildingIndex * 777 + repeat * 333;
                if (seededRandom(neonSeed) < 0.4) {
                    ctx.fillStyle = '#ff00ff';
                    ctx.shadowColor = '#ff00ff';
                    ctx.shadowBlur = 8;
                    ctx.fillRect(buildingX + building.width * 0.2, buildingY + building.height * 0.3, building.width * 0.6, 8);
                    ctx.shadowBlur = 0;
                }
            }
        }
    }
    
    // Add some distant neon lights (consistent positions)
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 12; i++) { // More lights for wider canvas
        const neonX = (i * 100 - parallaxOffset * 0.5) % canvas.width;
        const neonY = canvas.height - 350 + Math.sin(i) * 30; // Adjusted for taller canvas
        ctx.fillRect(neonX, neonY, 4, 4);
    }
    ctx.shadowBlur = 0;
    
    // Street level (where gameplay happens)
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Street markings
    ctx.fillStyle = '#ffff00';
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.fillRect(i, canvas.height - 35, 30, 4);
    }
    
    // Sidewalk
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Street lights
    ctx.fillStyle = '#c0c0c0';
    for (let i = 100; i < canvas.width; i += 150) {
        const lightX = (i - parallaxOffset * 0.3) % canvas.width;
        // Light pole
        ctx.fillRect(lightX, canvas.height - 120, 4, 60);
        // Light fixture
        ctx.fillStyle = '#ffff99';
        ctx.shadowColor = '#ffff99';
        ctx.shadowBlur = 15;
        ctx.fillRect(lightX - 8, canvas.height - 130, 20, 12);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#c0c0c0';
    }
}

// Render the game
function render() {
    // Clear the canvas
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw enhanced Hong Kong 1990s background
    drawHongKongBackground();
    
    // Render based on current game state
    switch (gameState.currentState) {
        case 'title':
            renderTitleScreen();
            break;
        case 'levelSelect':
            renderLevelSelectScreen();
            break;
        case 'playing':
            renderGameplay();
            break;
        case 'paused':
            renderGameplay();
            renderPauseOverlay();
            break;
        case 'gameOver':
            renderGameplay();
            renderGameOverOverlay();
            break;
        case 'levelComplete':
            renderGameplay();
            renderLevelCompleteOverlay();
            break;
    }
    
    // Always draw debug info if enabled
    if (GAME_CONFIG.DEBUG_MODE) {
        drawDebugInfo();
    }
}

// Render gameplay elements
function renderGameplay() {
    // Draw platforms
    drawPlatforms();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw enemies
    drawEnemies();
    
    // Draw collectibles
    drawCollectibles();
    
    // Draw player
    drawPlayer();
    
    // Draw UI
    drawUI();
    
    // Draw game title
    drawTitle();
}

// Render title screen
function renderTitleScreen() {
    // Title background with Hong Kong skyline silhouette
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple skyline silhouette
    ctx.fillStyle = '#000000';
    for (let i = 0; i < canvas.width; i += 40) {
        const buildingHeight = Math.random() * 200 + 100;
        ctx.fillRect(i, canvas.height - buildingHeight, 38, buildingHeight);
    }
    
    // Neon glow effect for title
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    
    // Main title
    ctx.font = 'bold 64px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('HEDGE COP', canvas.width / 2 - 160, canvas.height / 2 - 80);
    
    ctx.font = 'bold 32px Courier New';
    ctx.fillStyle = '#ff6600';
    ctx.fillText('HONG KONG NIGHTS', canvas.width / 2 - 160, canvas.height / 2 - 20);
    
    // Subtitle removed since it's now part of the main title
    
    // Click to start message (flashing)
    const flashTime = Math.sin(gameState.frameCount * 0.1);
    if (flashTime > 0) {
        ctx.font = 'bold 32px Courier New';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('CLICK TO START', canvas.width / 2 - 120, canvas.height / 2 + 80);
    }
    
    // Controls instructions - Enhanced with audio controls
    ctx.shadowBlur = 5;
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('CONTROLS:', canvas.width / 2 - 50, canvas.height / 2 + 140);
    ctx.fillText('Arrow Keys: Move', canvas.width / 2 - 70, canvas.height / 2 + 160);
    ctx.fillText('Spacebar: Jump', canvas.width / 2 - 65, canvas.height / 2 + 180);
    ctx.fillText('Z: Attack', canvas.width / 2 - 40, canvas.height / 2 + 200);
    ctx.fillText('X: Switch Weapon', canvas.width / 2 - 75, canvas.height / 2 + 220);
    ctx.fillText('P: Pause', canvas.width / 2 - 35, canvas.height / 2 + 240);
    
    // Audio controls
    ctx.fillStyle = '#ffff99';
    ctx.fillText('AUDIO:', canvas.width / 2 - 30, canvas.height / 2 + 270);
    ctx.fillStyle = '#cccccc';
    ctx.fillText('M: Toggle Audio', canvas.width / 2 - 70, canvas.height / 2 + 290);
    ctx.fillText('N: Toggle Music', canvas.width / 2 - 75, canvas.height / 2 + 310);
    ctx.fillText('B: Toggle SFX', canvas.width / 2 - 65, canvas.height / 2 + 330);
    ctx.fillText('-/+: Volume', canvas.width / 2 - 55, canvas.height / 2 + 350);
    
    // Version/credit
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#666666';
    ctx.fillText('v2.4 - Milestone 4: Enhanced Audio System', 10, canvas.height - 10);
    
    ctx.shadowBlur = 0;
}

// Render pause overlay
function renderPauseOverlay() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pause text
    ctx.font = 'bold 48px Courier New';
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillText('PAUSED', canvas.width / 2 - 100, canvas.height / 2 - 80);
    
    // Instructions
    ctx.font = '24px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Press P to Resume', canvas.width / 2 - 120, canvas.height / 2 - 30);
    
    // Audio controls
    ctx.font = '18px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('AUDIO CONTROLS:', canvas.width / 2 - 80, canvas.height / 2 + 20);
    
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Audio: ${audioSystem.enabled ? 'ON' : 'OFF'} (M)`, canvas.width / 2 - 60, canvas.height / 2 + 45);
    ctx.fillText(`Music: ${audioSystem.settings.musicEnabled ? 'ON' : 'OFF'} (N)`, canvas.width / 2 - 60, canvas.height / 2 + 65);
    ctx.fillText(`SFX: ${audioSystem.settings.sfxEnabled ? 'ON' : 'OFF'} (B)`, canvas.width / 2 - 60, canvas.height / 2 + 85);
    
    // Volume bars
    ctx.fillStyle = '#666666';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 105, 200, 8);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 105, 200 * audioSystem.masterVolume, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Courier New';
    ctx.fillText(`Master Volume: ${Math.round(audioSystem.masterVolume * 100)}%`, canvas.width / 2 - 90, canvas.height / 2 + 125);
    
    ctx.fillStyle = '#666666';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 135, 200, 8);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 135, 200 * audioSystem.musicVolume, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Music Volume: ${Math.round(audioSystem.musicVolume * 100)}%`, canvas.width / 2 - 90, canvas.height / 2 + 155);
    
    ctx.shadowBlur = 0;
}

// Render game over overlay
function renderGameOverOverlay() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game over text
    ctx.font = 'bold 48px Courier New';
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2 - 50);
    
    // Stats
    ctx.font = '24px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Final Score: ${gameStats.score}`, canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillText(`Enemies Defeated: ${gameStats.enemiesDefeated}`, canvas.width / 2 - 140, canvas.height / 2 + 30);
    
    // Restart instruction
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Click anywhere to return to title screen', canvas.width / 2 - 150, canvas.height / 2 + 80);
    
    ctx.shadowBlur = 0;
}

// Render level selection screen
function renderLevelSelectScreen() {
    // Background
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple skyline silhouette
    ctx.fillStyle = '#000000';
    for (let i = 0; i < canvas.width; i += 40) {
        const buildingHeight = Math.random() * 150 + 80;
        ctx.fillRect(i, canvas.height - buildingHeight, 38, buildingHeight);
    }
    
    // Title
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('SELECT LEVEL', canvas.width / 2 - 140, 100);
    
    // Level buttons
    const buttonWidth = 160;
    const buttonHeight = 80;
    const startX = (canvas.width - (3 * buttonWidth + 2 * 40)) / 2;
    
    for (let i = 1; i <= 6; i++) {
        const row = Math.floor((i - 1) / 3);
        const col = (i - 1) % 3;
        const x = startX + col * (buttonWidth + 40);
        const y = 200 + row * (buttonHeight + 30);
        
        const level = levelManager.levelProgress[i];
        
        // Button background
        if (level.unlocked) {
            ctx.fillStyle = level.completed ? '#004400' : '#440000';
        } else {
            ctx.fillStyle = '#222222';
        }
        
        ctx.fillRect(x, y, buttonWidth, buttonHeight);
        
        // Button border
        ctx.strokeStyle = level.unlocked ? '#00ff00' : '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, buttonWidth, buttonHeight);
        
        // Level number and name
        ctx.shadowBlur = 5;
        ctx.font = 'bold 24px Courier New';
        ctx.fillStyle = level.unlocked ? '#ffffff' : '#666666';
        ctx.fillText(`${i}`, x + buttonWidth / 2 - 10, y + 30);
        
        ctx.font = '14px Courier New';
        const levelName = levelManager.levelData[i].name;
        const textWidth = ctx.measureText(levelName).width;
        ctx.fillText(levelName, x + (buttonWidth - textWidth) / 2, y + 50);
        
        // Best score for completed levels
        if (level.completed && level.bestScore > 0) {
            ctx.font = '12px Courier New';
            ctx.fillStyle = '#ffff00';
            ctx.fillText(`Best: ${level.bestScore}`, x + 10, y + 70);
        }
        
        // Lock icon for locked levels
        if (!level.unlocked) {
            ctx.font = '20px Courier New';
            ctx.fillStyle = '#666666';
            ctx.fillText('🔒', x + buttonWidth / 2 - 10, y + 65);
        }
    }
    
    // Instructions
    ctx.shadowBlur = 5;
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Press 1-6 to select level, ESC to return to title', canvas.width / 2 - 200, canvas.height - 40);
    
    ctx.shadowBlur = 0;
}

// Render level complete overlay
function renderLevelCompleteOverlay() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Level complete text
    ctx.font = 'bold 48px Courier New';
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.fillText('LEVEL COMPLETE!', canvas.width / 2 - 200, canvas.height / 2 - 80);
    
    // Level info
    ctx.font = '24px Courier New';
    ctx.fillStyle = '#ffffff';
    const levelName = levelManager.levelData[levelManager.currentLevel].name;
    ctx.fillText(`${levelName} Completed`, canvas.width / 2 - 120, canvas.height / 2 - 30);
    
    // Stats
    ctx.fillText(`Score: ${gameStats.score}`, canvas.width / 2 - 80, canvas.height / 2 + 10);
    ctx.fillText(`Enemies Defeated: ${gameStats.enemiesDefeated}`, canvas.width / 2 - 120, canvas.height / 2 + 40);
    
    // Next level info
    if (levelManager.currentLevel < levelManager.totalLevels) {
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#00ffff';
        const nextLevelName = levelManager.levelData[levelManager.currentLevel + 1].name;
        ctx.fillText(`Next: ${nextLevelName} (Press ${levelManager.currentLevel + 1})`, canvas.width / 2 - 120, canvas.height / 2 + 80);
    } else {
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#ffff00';
        ctx.fillText('ALL LEVELS COMPLETE!', canvas.width / 2 - 100, canvas.height / 2 + 80);
    }
    
    // Instructions
    ctx.font = '14px Courier New';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Press ESC for level select, ENTER to continue', canvas.width / 2 - 150, canvas.height / 2 + 120);
    
    ctx.shadowBlur = 0;
}

// Draw all platforms in the level
function drawPlatforms() {
    for (const platform of platforms) {
        // Calculate screen position using camera offset
        const screenX = platform.x - camera.x;
        const screenY = platform.y - camera.y;
        
        // Only draw if platform is visible on screen
        if (screenX + platform.width > 0 && screenX < canvas.width &&
            screenY + platform.height > 0 && screenY < canvas.height) {
            
            // Draw platform based on type
            switch (platform.type) {
                case 'ground':
                    // Ground platforms (thicker, different color)
                    ctx.fillStyle = '#ffd60a';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Add texture to ground
                    ctx.fillStyle = '#ffba08';
                    for (let i = 0; i < platform.width; i += 20) {
                        ctx.fillRect(screenX + i, screenY, 10, 5);
                    }
                    break;
                    
                case 'platform':
                    // Regular platforms
                    ctx.fillStyle = '#8b5a3c';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Platform edge highlight
                    ctx.fillStyle = '#a0693d';
                    ctx.fillRect(screenX, screenY, platform.width, 4);
                    
                    // Platform supports/bolts
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(screenX + 5, screenY + 8, 4, platform.height - 8);
                    ctx.fillRect(screenX + platform.width - 9, screenY + 8, 4, platform.height - 8);
                    break;
                    
                case 'building':
                    // Building foundations (Level 2 - Rooftops)
                    ctx.fillStyle = '#2c2c3c';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Building windows
                    ctx.fillStyle = '#4a4a6a';
                    for (let i = 10; i < platform.width - 10; i += 25) {
                        for (let j = 20; j < platform.height - 20; j += 30) {
                            ctx.fillRect(screenX + i, screenY + j, 15, 20);
                        }
                    }
                    break;
                    
                case 'rooftop':
                    // Rooftop platforms
                    ctx.fillStyle = '#4a4a5a';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Rooftop texture
                    ctx.fillStyle = '#5a5a6a';
                    for (let i = 0; i < platform.width; i += 15) {
                        ctx.fillRect(screenX + i, screenY, 8, platform.height);
                    }
                    break;
                    
                case 'walkway':
                    // Fire escapes and walkways
                    ctx.fillStyle = '#888888';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Metal grating texture
                    ctx.fillStyle = '#999999';
                    for (let i = 0; i < platform.width; i += 5) {
                        ctx.fillRect(screenX + i, screenY, 2, platform.height);
                    }
                    break;
                    
                case 'obstacle':
                    // Air conditioning units and obstacles
                    ctx.fillStyle = '#666666';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // AC unit details
                    ctx.fillStyle = '#777777';
                    ctx.fillRect(screenX + 2, screenY + 2, platform.width - 4, 5);
                    ctx.fillStyle = '#555555';
                    for (let i = 5; i < platform.width - 5; i += 8) {
                        ctx.fillRect(screenX + i, screenY + 8, 3, platform.height - 10);
                    }
                    break;
                    
                case 'dock':
                    // Harbor dock foundations (Level 3)
                    ctx.fillStyle = '#3d2914';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Wood planking
                    ctx.fillStyle = '#5d3924';
                    for (let i = 0; i < platform.width; i += 12) {
                        ctx.fillRect(screenX + i, screenY, 8, platform.height);
                    }
                    
                    // Dock supports
                    ctx.fillStyle = '#2d1904';
                    for (let i = 20; i < platform.width - 20; i += 40) {
                        ctx.fillRect(screenX + i, screenY, 6, platform.height);
                    }
                    break;
                    
                case 'container':
                    // Shipping containers
                    ctx.fillStyle = '#cc6600';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Container ridges
                    ctx.fillStyle = '#aa5500';
                    for (let i = 0; i < platform.height; i += 8) {
                        ctx.fillRect(screenX, screenY + i, platform.width, 2);
                    }
                    
                    // Container door lines
                    ctx.fillStyle = '#884400';
                    ctx.fillRect(screenX + platform.width / 2 - 1, screenY, 2, platform.height);
                    
                    // Corner reinforcements
                    ctx.fillStyle = '#663300';
                    ctx.fillRect(screenX, screenY, 4, platform.height);
                    ctx.fillRect(screenX + platform.width - 4, screenY, 4, platform.height);
                    break;
                    
                case 'floating':
                    // Floating dock platforms
                    ctx.fillStyle = '#8b7355';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    
                    // Floating foam/bumpers
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(screenX - 2, screenY + platform.height - 2, platform.width + 4, 4);
                    
                    // Rope ties
                    ctx.fillStyle = '#654321';
                    for (let i = 10; i < platform.width - 10; i += 20) {
                        ctx.fillRect(screenX + i, screenY - 3, 3, platform.height + 6);
                    }
                    break;
                    
                default:
                    // Fallback to regular platform
                    ctx.fillStyle = '#8b5a3c';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    break;
            }
        }
    }
    
    // Draw level end marker
    const currentLevelData = levelManager.levelData[levelManager.currentLevel];
    const levelEndScreenX = currentLevelData.exitPosition.x - camera.x;
    const levelEndScreenY = currentLevelData.exitPosition.y - camera.y;
    
    if (levelEndScreenX > -50 && levelEndScreenX < canvas.width + 50) {
        // Exit portal/marker
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(levelEndScreenX - 10, levelEndScreenY - 40, 20, 40);
        
        // Animated exit effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#88ff88';
        ctx.fillRect(levelEndScreenX - 15, levelEndScreenY - 45, 30, 50);
        ctx.globalAlpha = 1.0;
        
        // End marker text
        ctx.font = '14px Courier New';
        ctx.fillStyle = '#00ff00';
        ctx.fillText('EXIT', levelEndScreenX - 15, levelEndScreenY - 50);
        ctx.shadowBlur = 0;
    }
}

// Draw the player character
function drawPlayer() {
    // Skip drawing if dead
    if (player.isDead) {
        return;
    }
    
    // Calculate screen position using camera offset
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;
    
    ctx.save();
    
    // Apply invulnerability effect (flashing)
    if (player.invulnerabilityTimer > 0) {
        const flashInterval = 0.1;
        const shouldShow = Math.floor(player.invulnerabilityTimer / flashInterval) % 2 === 0;
        if (!shouldShow) {
            ctx.restore();
            return;
        }
        ctx.globalAlpha = 0.7;
    }
    
    // Flip horizontally if facing left
    if (!player.facingRight) {
        ctx.scale(-1, 1);
        ctx.translate(-screenX - player.width, 0);
    } else {
        ctx.translate(screenX, 0);
    }
    
    // Draw player body (hedgehog detective)
    drawPlayerSprite(0, screenY);
    
    ctx.restore();
}

// Enhanced character sprite with improved hedgehog-human hybrid design - Milestone 2
function drawPlayerSprite(x, y) {
    // Enhanced 16-bit pixel art hedgehog detective with improved detail and animation
    
    // Base hedgehog body and posture adjustments
    const walkBob = player.animationState === 'walking' ? Math.sin(player.animationFrame * 0.8) * 2 : 0;
    const idleBreathe = player.animationState === 'idle' ? Math.sin(player.animationFrame * 0.3) * 1 : 0;
    const totalBob = walkBob + idleBreathe;
    
    // Enhanced detective trench coat with more detail
    ctx.fillStyle = '#3d2f1f'; // Darker, richer brown detective coat
    ctx.fillRect(x + 12, y + 38 + totalBob, 40, 60);
    
    // Coat texture and weathering
    ctx.fillStyle = '#2a1e12';
    ctx.fillRect(x + 14, y + 42 + totalBob, 36, 4); // Horizontal weathering lines
    ctx.fillRect(x + 14, y + 55 + totalBob, 36, 2);
    ctx.fillRect(x + 14, y + 75 + totalBob, 36, 2);
    
    // Enhanced coat lapels with more definition
    ctx.fillStyle = '#5a4430';
    ctx.fillRect(x + 12, y + 38 + totalBob, 10, 20);
    ctx.fillRect(x + 42, y + 38 + totalBob, 10, 20);
    
    // Lapel highlights
    ctx.fillStyle = '#6b5138';
    ctx.fillRect(x + 13, y + 39 + totalBob, 8, 2);
    ctx.fillRect(x + 43, y + 39 + totalBob, 8, 2);
    
    // Professional detective belt with buckle detail
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(x + 10, y + 62 + totalBob, 44, 8);
    
    // Enhanced belt buckle with metallic sheen
    ctx.fillStyle = '#silver';
    ctx.fillRect(x + 28, y + 63 + totalBob, 8, 6);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 29, y + 64 + totalBob, 6, 4);
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(x + 30, y + 64 + totalBob, 4, 2);
    
    // Enhanced hedgehog head with more pronounced features
    ctx.fillStyle = '#c7995b'; // Richer, more natural hedgehog fur color
    ctx.fillRect(x + 8, y + 4 + totalBob, 48, 44);
    
    // Detailed hedgehog snout with proper proportions
    ctx.fillStyle = '#d4ab75';
    ctx.fillRect(x + 38, y + 26 + totalBob, 16, 16);
    
    // Snout shading for depth
    ctx.fillStyle = '#bf9d69';
    ctx.fillRect(x + 38, y + 32 + totalBob, 16, 4);
    
    // More detailed nose
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 44, y + 30 + totalBob, 6, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 45, y + 31 + totalBob, 4, 4);
    
    // Nostril details
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 46, y + 32 + totalBob, 1, 2);
    ctx.fillRect(x + 48, y + 32 + totalBob, 1, 2);
    
    // Enhanced hedgehog spikes with dynamic movement
    const quillSway = player.animationState === 'walking' ? Math.sin(player.animationFrame * 0.6) * 1.5 : 0;
    const quillRustle = player.animationState === 'idle' ? Math.sin(player.animationFrame * 0.4 + Math.PI) * 0.8 : 0;
    
    // Detailed spike pattern with varied heights and movement
    ctx.fillStyle = '#8b4513';
    const enhancedSpikePattern = [
        { x: 4, y: -4, w: 6, h: 22, sway: quillSway * 0.8 },
        { x: 12, y: -6, w: 7, h: 26, sway: quillSway * 1.2 },
        { x: 21, y: -3, w: 6, h: 20, sway: quillSway * 0.6 },
        { x: 29, y: -7, w: 8, h: 28, sway: quillSway * 1.5 },
        { x: 39, y: -4, w: 6, h: 22, sway: quillSway * 0.9 },
        { x: 47, y: -5, w: 7, h: 24, sway: quillSway * 1.1 },
        { x: 56, y: -2, w: 5, h: 18, sway: quillSway * 0.5 }
    ];
    
    for (const spike of enhancedSpikePattern) {
        const spikeX = x + spike.x + spike.sway + quillRustle;
        const spikeY = y + spike.y + totalBob;
        ctx.fillRect(spikeX, spikeY, spike.w, spike.h);
    }
    
    // Enhanced spike highlights with depth
    ctx.fillStyle = '#a0522d';
    for (const spike of enhancedSpikePattern) {
        const spikeX = x + spike.x + spike.sway + quillRustle;
        const spikeY = y + spike.y + totalBob;
        ctx.fillRect(spikeX + 1, spikeY, 2, spike.h * 0.7);
    }
    
    // Individual spike tips for more detail
    ctx.fillStyle = '#654321';
    for (const spike of enhancedSpikePattern) {
        const spikeX = x + spike.x + spike.sway + quillRustle;
        const spikeY = y + spike.y + totalBob;
        ctx.fillRect(spikeX + 2, spikeY, 2, 6);
    }
    
    // Enhanced hedgehog ears with movement
    ctx.fillStyle = '#b8935a';
    const earTwitch = player.animationState === 'idle' ? Math.sin(player.animationFrame * 0.7) * 0.5 : 0;
    ctx.fillRect(x + 16 + earTwitch, y + 8 + totalBob, 6, 10);
    ctx.fillRect(x + 42 - earTwitch, y + 8 + totalBob, 6, 10);
    
    // Ear inner detail
    ctx.fillStyle = '#d4ab75';
    ctx.fillRect(x + 17 + earTwitch, y + 10 + totalBob, 4, 6);
    ctx.fillRect(x + 43 - earTwitch, y + 10 + totalBob, 4, 6);
    
    // More expressive eyes with emotional states
    ctx.fillStyle = '#ffffff';
    const eyeX1 = x + 16, eyeX2 = x + 34;
    const eyeY = y + 16 + totalBob;
    ctx.fillRect(eyeX1, eyeY, 10, 10);
    ctx.fillRect(eyeX2, eyeY, 10, 10);
    
    // Pupils with direction awareness
    ctx.fillStyle = '#000000';
    const pupilShift = player.facingRight ? 1 : -1;
    ctx.fillRect(eyeX1 + 3 + pupilShift, eyeY + 3, 4, 4);
    ctx.fillRect(eyeX2 + 3 + pupilShift, eyeY + 3, 4, 4);
    
    // Enhanced eye reflections
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX1 + 4 + pupilShift, eyeY + 4, 2, 2);
    ctx.fillRect(eyeX2 + 4 + pupilShift, eyeY + 4, 2, 2);
    
    // Eye highlights for more life
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(eyeX1 + 2, eyeY + 2, 6, 2);
    ctx.fillRect(eyeX2 + 2, eyeY + 2, 6, 2);
    
    // Enhanced detective fedora with authentic 1940s style
    ctx.fillStyle = '#0f0a05';
    ctx.fillRect(x + 2, y + 0 + totalBob, 60, 18); // Wider brim for authenticity
    ctx.fillRect(x + 10, y - 8 + totalBob, 44, 14); // Crown
    
    // Hat crown crease (center dent)
    ctx.fillStyle = '#050302';
    ctx.fillRect(x + 30, y - 6 + totalBob, 4, 12);
    
    // Enhanced hat band with texture
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(x + 10, y + 4 + totalBob, 44, 6);
    
    // Hat band buckle detail
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 28, y + 5 + totalBob, 8, 4);
    
    // Hat brim shadow and curve
    ctx.fillStyle = '#080604';
    ctx.fillRect(x + 2, y + 14 + totalBob, 60, 4);
    
    // Enhanced necktie with pattern
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(x + 28, y + 32 + totalBob, 8, 24);
    
    // Tie pattern (diagonal stripes)
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 29 + i * 2, y + 34 + i * 6 + totalBob, 6, 2);
    }
    
    // Tie knot
    ctx.fillStyle = '#5a0000';
    ctx.fillRect(x + 27, y + 30 + totalBob, 10, 6);
    
    // Enhanced arms with improved animation and clothing detail
    ctx.fillStyle = '#c7995b';
    
    if (player.animationState === 'punching') {
        // Dynamic punch animation with anticipation and follow-through
        const punchProgress = player.animationFrame / 3;
        const punchExtend = Math.sin(punchProgress * Math.PI) * 28;
        const shoulderLean = Math.sin(punchProgress * Math.PI) * 4;
        
        if (player.facingRight) {
            // Left arm (supporting stance)
            ctx.fillRect(x + 0 - shoulderLean, y + 44 + totalBob, 16, 28);
            // Right arm (punching with full extension)
            ctx.fillRect(x + 52 + punchExtend, y + 40 + totalBob, 18, 28);
            
            // Enhanced fist detail
            ctx.fillStyle = '#b8935a';
            ctx.fillRect(x + 66 + punchExtend, y + 44 + totalBob, 10, 14);
            
            // Knuckle detail
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(x + 67 + punchExtend, y + 46 + totalBob, 8, 3);
            ctx.fillRect(x + 67 + punchExtend, y + 52 + totalBob, 8, 3);
        } else {
            // Mirrored punch animation
            ctx.fillRect(x + 48 + shoulderLean, y + 44 + totalBob, 16, 28);
            ctx.fillRect(x - 6 - punchExtend, y + 40 + totalBob, 18, 28);
            
            ctx.fillStyle = '#b8935a';
            ctx.fillRect(x - 12 - punchExtend, y + 44 + totalBob, 10, 14);
            
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(x - 11 - punchExtend, y + 46 + totalBob, 8, 3);
            ctx.fillRect(x - 11 - punchExtend, y + 52 + totalBob, 8, 3);
        }
    } else if (player.animationState === 'shooting') {
        // Professional shooting stance
        if (player.facingRight) {
            // Both arms for two-handed grip
            ctx.fillRect(x + 0, y + 44 + totalBob, 16, 28);
            ctx.fillRect(x + 50, y + 42 + totalBob, 20, 28);
            
            // Enhanced gun detail with realistic proportions
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(x + 68, y + 48 + totalBob, 18, 10);
            
            // Gun barrel
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(x + 84, y + 50 + totalBob, 8, 6);
            
            // Gun details (sight, trigger guard)
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(x + 70, y + 48 + totalBob, 2, 4);
            ctx.fillRect(x + 76, y + 54 + totalBob, 6, 4);
        } else {
            // Mirrored shooting stance
            ctx.fillRect(x + 48, y + 44 + totalBob, 16, 28);
            ctx.fillRect(x - 6, y + 42 + totalBob, 20, 28);
            
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(x - 22, y + 48 + totalBob, 18, 10);
            
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(x - 28, y + 50 + totalBob, 8, 6);
            
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(x - 8, y + 48 + totalBob, 2, 4);
            ctx.fillRect(x - 18, y + 54 + totalBob, 6, 4);
        }
    } else if (player.animationState === 'walking') {
        // Enhanced walking animation with coat sway
        const armSwing = Math.sin(player.animationFrame * 0.8) * 6;
        const coatSway = Math.sin(player.animationFrame * 0.4) * 2;
        
        ctx.fillRect(x + 0 + coatSway, y + 44 + armSwing + totalBob, 16, 28);
        ctx.fillRect(x + 48 - coatSway, y + 44 - armSwing + totalBob, 16, 28);
        
        // Coat movement
        ctx.fillStyle = '#3d2f1f';
        ctx.fillRect(x + 12 + coatSway, y + 70 + totalBob, 40, 6);
    } else {
        // Idle pose with subtle movement
        const idleArm = Math.sin(player.animationFrame * 0.2) * 1;
        ctx.fillRect(x + 0, y + 44 + idleArm + totalBob, 16, 28);
        ctx.fillRect(x + 48, y + 44 - idleArm + totalBob, 16, 28);
    }
    
    // Enhanced legs with improved animation
    ctx.fillStyle = '#1a1a1a'; // Detective pants
    let legAnimation = 0;
    
    if (player.animationState === 'walking') {
        legAnimation = Math.sin(player.animationFrame * 1.2) * 8;
    }
    
    ctx.fillRect(x + 16, y + 72 + legAnimation + totalBob, 12, 28);
    ctx.fillRect(x + 36, y + 72 - legAnimation + totalBob, 12, 28);
    
    // Enhanced detective shoes with more detail
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 14, y + 94 + legAnimation + totalBob, 16, 10);
    ctx.fillRect(x + 34, y + 94 - legAnimation + totalBob, 16, 10);
    
    // Shoe highlights
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 15, y + 95 + legAnimation + totalBob, 14, 3);
    ctx.fillRect(x + 35, y + 95 - legAnimation + totalBob, 14, 3);
    
    // Shoe laces
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 20, y + 96 + legAnimation + totalBob, 2, 6);
    ctx.fillRect(x + 40, y + 96 - legAnimation + totalBob, 2, 6);
    
    // Enhanced weapon and combat effects
    if (player.animationState === 'punching') {
        // Dynamic punch impact with improved particle effects
        ctx.fillStyle = '#00ffff';
        const punchX = player.facingRight ? x + 76 + (player.animationFrame * 14) : x - 24 - (player.animationFrame * 14);
        const punchY = y + 50 + totalBob;
        
        // Impact burst pattern
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        
        // Central impact
        ctx.fillRect(punchX - 2, punchY - 2, 16, 8);
        ctx.fillRect(punchX + 2, punchY - 6, 8, 16);
        
        // Radiating impact lines
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const lineX = punchX + 6 + Math.cos(angle) * 12;
            const lineY = punchY + 4 + Math.sin(angle) * 12;
            ctx.fillRect(lineX, lineY, 4, 2);
        }
        
        ctx.shadowBlur = 0;
    } else if (player.animationState === 'shooting') {
        // Enhanced muzzle flash with realistic effect
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 8;
        
        const gunX = player.facingRight ? x + 92 : x - 28;
        const gunY = y + 53 + totalBob;
        
        // Multi-stage muzzle flash
        ctx.fillRect(gunX, gunY, 12, 4);
        ctx.fillRect(gunX + 4, gunY - 2, 8, 8);
        ctx.fillRect(gunX + 12, gunY + 1, 6, 2);
        
        // Flash particles
        ctx.fillStyle = '#ff8800';
        for (let i = 0; i < 4; i++) {
            const particleX = gunX + 8 + Math.random() * 8;
            const particleY = gunY + 2 + Math.random() * 4;
            ctx.fillRect(particleX, particleY, 2, 2);
        }
        
        ctx.shadowBlur = 0;
    }
    
    // Enhanced movement effects
    if (player.animationState === 'jumping') {
        // Improved motion lines with hedgehog-style spindash reference
        ctx.strokeStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2;
        
        // Curved motion lines following hedgehog's trajectory
        for (let i = 0; i < 5; i++) {
            const lineOffset = i * 8;
            ctx.beginPath();
            ctx.moveTo(x - 16, y + 30 + lineOffset + totalBob);
            ctx.lineTo(x - 4, y + 30 + lineOffset + totalBob);
            ctx.stroke();
        }
        
        // Quill motion blur
        ctx.strokeStyle = '#8b4513';
        ctx.shadowColor = '#8b4513';
        ctx.shadowBlur = 4;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 8 + i * 4, y + 8 + totalBob);
            ctx.lineTo(x + 4 + i * 4, y + 8 + totalBob);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
    }
    
    // Emotional expressions based on game state
    if (player.health <= player.maxHealth * 0.3) {
        // Worried expression - drooped ears, concerned eyes
        ctx.fillStyle = '#999999';
        ctx.fillRect(x + 16, y + 18 + totalBob, 2, 1); // Worried brow
        ctx.fillRect(x + 42, y + 18 + totalBob, 2, 1);
    } else if (player.isAttacking) {
        // Determined expression - focused eyes
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(x + 18, y + 18 + totalBob, 6, 1); // Determined brow
        ctx.fillRect(x + 36, y + 18 + totalBob, 6, 1);
    }
}

// Draw projectiles
function drawProjectiles() {
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 5;
    
    for (const projectile of projectiles) {
        if (projectile.active) {
            // Calculate screen position using camera offset
            const screenX = projectile.x - camera.x;
            const screenY = projectile.y - camera.y;
            
            // Only draw if projectile is visible on screen
            if (screenX + projectile.width > 0 && screenX < canvas.width &&
                screenY + projectile.height > 0 && screenY < canvas.height) {
                ctx.fillRect(screenX, screenY, projectile.width, projectile.height);
            }
        }
    }
    
    ctx.shadowBlur = 0;
}

// Draw all enemies
function drawEnemies() {
    for (const enemy of enemies) {
        if (enemy.active) {
            drawEnemy(enemy);
        }
    }
}

// Draw individual enemy
function drawEnemy(enemy) {
    // Calculate screen position using camera offset
    const screenX = enemy.x - camera.x;
    const screenY = enemy.y - camera.y;
    
    // Only draw if enemy is visible on screen
    if (screenX + enemy.width > 0 && screenX < canvas.width &&
        screenY + enemy.height > 0 && screenY < canvas.height) {
        
        ctx.save();
        
        // Apply stun effect
        if (enemy.stunTimer > 0) {
            ctx.globalAlpha = 0.7;
            // Flash red when stunned
            ctx.fillStyle = '#ff6666';
            ctx.fillRect(screenX - 5, screenY - 5, enemy.width + 10, enemy.height + 10);
        }
        
        // Flip horizontally based on facing direction
        if (!enemy.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-screenX - enemy.width, 0);
        } else {
            ctx.translate(screenX, 0);
        }
        
        if (enemy.type === 'car') {
            drawCarEnemy(0, screenY, enemy);
        } else if (enemy.type === 'motorcycle') {
            drawMotorcycleEnemy(0, screenY, enemy);
        } else if (enemy.type === 'helicopter') {
            drawHelicopterEnemy(0, screenY, enemy);
        } else if (enemy.type === 'boat') {
            drawBoatEnemy(0, screenY, enemy);
        }
        
        ctx.restore();
    }
}

// Draw car enemy sprite - Enhanced Hong Kong 1990s style
function drawCarEnemy(x, y, enemy) {
    // Car body (sleek sedan style)
    ctx.fillStyle = '#8b0000'; // Deep red
    ctx.fillRect(x + 8, y + 18, 104, 44);
    
    // Car body gradient for 16-bit effect
    ctx.fillStyle = '#a01010';
    ctx.fillRect(x + 8, y + 18, 104, 8);
    
    // Car roof (lower profile)
    ctx.fillStyle = '#660000';
    ctx.fillRect(x + 22, y + 8, 76, 22);
    
    // Roof highlight
    ctx.fillStyle = '#770000';
    ctx.fillRect(x + 22, y + 8, 76, 4);
    
    // Windshield (tinted)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 26, y + 10, 68, 18);
    
    // Windshield reflection
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 26, y + 10, 68, 6);
    
    // Side windows
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 12, y + 22, 14, 12);
    ctx.fillRect(x + 94, y + 22, 14, 12);
    
    // Wheels (more detailed)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 12, y + 52, 18, 18);
    ctx.fillRect(x + 90, y + 52, 18, 18);
    
    // Wheel rims (chrome style)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 15, y + 55, 12, 12);
    ctx.fillRect(x + 93, y + 55, 12, 12);
    
    // Rim spokes
    ctx.fillStyle = '#888888';
    ctx.fillRect(x + 19, y + 59, 4, 4);
    ctx.fillRect(x + 97, y + 59, 4, 4);
    
    // Headlights (more prominent)
    ctx.fillStyle = '#ffffcc';
    ctx.shadowColor = '#ffffcc';
    ctx.shadowBlur = 4;
    if (enemy.facingRight) {
        ctx.fillRect(x + 106, y + 24, 10, 12);
        ctx.fillRect(x + 106, y + 38, 10, 12);
    } else {
        ctx.fillRect(x - 4, y + 24, 10, 12);
        ctx.fillRect(x - 4, y + 38, 10, 12);
    }
    ctx.shadowBlur = 0;
    
    // Tail lights
    ctx.fillStyle = '#ff0000';
    if (enemy.facingRight) {
        ctx.fillRect(x + 4, y + 26, 6, 8);
        ctx.fillRect(x + 4, y + 36, 6, 8);
    } else {
        ctx.fillRect(x + 110, y + 26, 6, 8);
        ctx.fillRect(x + 110, y + 36, 6, 8);
    }
    
    // License plate area
    ctx.fillStyle = '#ffffff';
    if (enemy.facingRight) {
        ctx.fillRect(x + 96, y + 50, 16, 8);
    } else {
        ctx.fillRect(x + 8, y + 50, 16, 8);
    }
    
    // Driver (Triad gangster - more detailed)
    ctx.fillStyle = '#d4a574'; // Head
    ctx.fillRect(x + 38, y + 14, 14, 16);
    
    // Sunglasses (wraparound style)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 40, y + 17, 10, 6);
    
    // Hair (slicked back)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 38, y + 12, 14, 8);
    
    // Suit jacket (black)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 36, y + 26, 18, 24);
    
    // Tie
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(x + 42, y + 28, 6, 16);
    
    // Arms on steering wheel
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(x + 30, y + 32, 8, 4);
    ctx.fillRect(x + 54, y + 32, 8, 4);
    
    // Steering wheel
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x + 38, y + 30, 14, 8);
    
    // Car antenna
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 20, y + 6, 2, 12);
    
    // Side mirror
    ctx.fillStyle = '#c0c0c0';
    if (enemy.facingRight) {
        ctx.fillRect(x + 10, y + 20, 4, 6);
    } else {
        ctx.fillRect(x + 106, y + 20, 4, 6);
    }
    
    // Movement animation (enhanced bounce)
    if (enemy.aiState === 'chase' || enemy.aiState === 'patrol') {
        const bounce = Math.sin(enemy.animationFrame * 2.5) * 3;
        ctx.translate(0, bounce);
    }
    
    // Exhaust smoke effect when chasing
    if (enemy.aiState === 'chase') {
        ctx.fillStyle = '#666666';
        ctx.globalAlpha = 0.6;
        const smokeX = enemy.facingRight ? x - 8 : x + 120;
        for (let i = 0; i < 3; i++) {
            const smokeOffset = Math.sin(enemy.animationFrame + i) * 4;
            ctx.fillRect(smokeX + smokeOffset, y + 58 - i * 6, 4 + i * 2, 4);
        }
        ctx.globalAlpha = 1.0;
    }
    
    // AI state indicator (enhanced)
    if (GAME_CONFIG.DEBUG_MODE) {
        ctx.fillStyle = enemy.aiState === 'chase' ? '#ff0000' : enemy.aiState === 'attack' ? '#ff6600' : '#00ff00';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 4;
        ctx.fillRect(x + 45, y - 12, 30, 6);
        ctx.shadowBlur = 0;
    }
}

// Draw motorcycle enemy sprite - Enhanced Hong Kong style
function drawMotorcycleEnemy(x, y, enemy) {
    // Motorcycle body (sport bike style)
    ctx.fillStyle = '#2c2c2c'; // Dark gray base
    ctx.fillRect(x + 18, y + 22, 44, 18);
    
    // Fuel tank
    ctx.fillStyle = '#404040';
    ctx.fillRect(x + 20, y + 18, 30, 12);
    
    // Tank highlights
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + 20, y + 18, 30, 4);
    
    // Motorcycle seat
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 15, y + 18, 32, 8);
    
    // Handlebars (sport style)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 8, y + 16, 24, 3);
    
    // Handlebar grips
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6, y + 15, 4, 5);
    ctx.fillRect(x + 30, y + 15, 4, 5);
    
    // Front wheel (larger, more detailed)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 2, y + 32, 18, 18);
    
    // Rear wheel
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 60, y + 32, 18, 18);
    
    // Wheel rims (spoke pattern)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 5, y + 35, 12, 12);
    ctx.fillRect(x + 63, y + 35, 12, 12);
    
    // Spoke details
    ctx.fillStyle = '#888888';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 7 + i * 4, y + 37, 2, 8);
        ctx.fillRect(x + 65 + i * 4, y + 37, 2, 8);
    }
    
    // Headlight (sport bike style)
    ctx.fillStyle = '#ffffcc';
    ctx.shadowColor = '#ffffcc';
    ctx.shadowBlur = 3;
    if (enemy.facingRight) {
        ctx.fillRect(x - 2, y + 22, 8, 12);
    } else {
        ctx.fillRect(x + 74, y + 22, 8, 12);
    }
    ctx.shadowBlur = 0;
    
    // Tail light
    ctx.fillStyle = '#ff0000';
    if (enemy.facingRight) {
        ctx.fillRect(x + 76, y + 26, 4, 6);
    } else {
        ctx.fillRect(x + 0, y + 26, 4, 6);
    }
    
    // Exhaust pipe
    ctx.fillStyle = '#808080';
    if (enemy.facingRight) {
        ctx.fillRect(x + 70, y + 38, 12, 6);
    } else {
        ctx.fillRect(x - 2, y + 38, 12, 6);
    }
    
    // Rider (Triad gangster - more detailed)
    ctx.fillStyle = '#d4a574'; // Head
    ctx.fillRect(x + 22, y + 2, 16, 18);
    
    // Helmet (full face)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 20, y + 0, 20, 16);
    
    // Helmet visor
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 22, y + 4, 16, 10);
    
    // Visor reflection
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + 22, y + 4, 16, 3);
    
    // Rider's jacket (leather)
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x + 20, y + 14, 20, 26);
    
    // Jacket details (zippers)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 28, y + 16, 2, 20);
    
    // Arms (gripping handlebars)
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(x + 10, y + 18, 12, 8);
    ctx.fillRect(x + 36, y + 18, 12, 8);
    
    // Gloves
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 20, 8, 6);
    ctx.fillRect(x + 44, y + 20, 8, 6);
    
    // Rider's legs
    ctx.fillStyle = '#1a1a1a'; // Pants
    ctx.fillRect(x + 16, y + 36, 8, 14);
    ctx.fillRect(x + 36, y + 36, 8, 14);
    
    // Boots
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 14, y + 46, 12, 8);
    ctx.fillRect(x + 34, y + 46, 12, 8);
    
    // Movement animation (lean and bounce)
    if (enemy.aiState === 'chase' || enemy.aiState === 'patrol') {
        const bounce = Math.sin(enemy.animationFrame * 3) * 2;
        const lean = enemy.aiState === 'chase' ? Math.sin(enemy.animationFrame) * 1 : 0;
        ctx.translate(lean, bounce);
    }
    
    // Exhaust smoke when accelerating
    if (enemy.aiState === 'chase') {
        ctx.fillStyle = '#666666';
        ctx.globalAlpha = 0.5;
        const smokeX = enemy.facingRight ? x + 66 : x + 6;
        for (let i = 0; i < 2; i++) {
            const smokeOffset = Math.sin(enemy.animationFrame + i) * 3;
            ctx.fillRect(smokeX + smokeOffset, y + 42 - i * 4, 3 + i, 3);
        }
        ctx.globalAlpha = 1.0;
    }
    
    // Wheel spin effect
    if (enemy.velocityX !== 0) {
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        const spinOffset = (enemy.animationFrame * 4) % 8;
        ctx.beginPath();
        ctx.moveTo(x + 8 + spinOffset, y + 38);
        ctx.lineTo(x + 12 + spinOffset, y + 42);
        ctx.moveTo(x + 68 + spinOffset, y + 38);
        ctx.lineTo(x + 72 + spinOffset, y + 42);
        ctx.stroke();
    }
    
    // AI state indicator (enhanced)
    if (GAME_CONFIG.DEBUG_MODE) {
        ctx.fillStyle = enemy.aiState === 'chase' ? '#ff0000' : enemy.aiState === 'attack' ? '#ff6600' : '#00ff00';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 3;
        ctx.fillRect(x + 30, y - 10, 20, 5);
        ctx.shadowBlur = 0;
    }
}

// Draw helicopter enemy sprite - Level 2 rooftops theme
function drawHelicopterEnemy(x, y, enemy) {
    // Main fuselage
    ctx.fillStyle = '#2c2c2c'; // Dark metallic gray
    ctx.fillRect(x + 20, y + 20, 60, 25);
    
    // Cockpit window
    ctx.fillStyle = '#333366';
    ctx.fillRect(x + 15, y + 15, 30, 20);
    
    // Cockpit highlight
    ctx.fillStyle = '#4444aa';
    ctx.fillRect(x + 15, y + 15, 30, 8);
    
    // Tail boom
    ctx.fillStyle = '#404040';
    ctx.fillRect(x + 70, y + 28, 25, 12);
    
    // Landing skids
    ctx.fillStyle = '#808080';
    ctx.fillRect(x + 15, y + 45, 55, 3);
    ctx.fillRect(x + 12, y + 42, 8, 8);
    ctx.fillRect(x + 70, y + 42, 8, 8);
    
    // Main rotor (spinning effect)
    ctx.fillStyle = '#c0c0c0';
    const rotorAngle = enemy.animationFrame * 0.8;
    for (let i = 0; i < 4; i++) {
        const angle = rotorAngle + (i * Math.PI / 2);
        const rotorX = x + 50 + Math.cos(angle) * 45;
        const rotorY = y + 12 + Math.sin(angle) * 5;
        ctx.fillRect(rotorX - 2, rotorY - 1, 4, 2);
    }
    
    // Rotor hub
    ctx.fillStyle = '#606060';
    ctx.fillRect(x + 48, y + 10, 8, 8);
    
    // Tail rotor
    ctx.fillStyle = '#c0c0c0';
    const tailRotorAngle = enemy.animationFrame * 1.2;
    for (let i = 0; i < 3; i++) {
        const angle = tailRotorAngle + (i * 2 * Math.PI / 3);
        const tailX = x + 95 + Math.cos(angle) * 8;
        const tailY = y + 34 + Math.sin(angle) * 8;
        ctx.fillRect(tailX - 1, tailY - 1, 2, 2);
    }
    
    // Navigation lights
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 85, y + 30, 3, 3);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + 10, y + 30, 3, 3);
    
    // Pilot silhouette
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 25, y + 20, 8, 12);
    
    // Weapon mount (optional)
    ctx.fillStyle = '#505050';
    ctx.fillRect(x + 45, y + 40, 12, 4);
    
    // Exhaust smoke
    if (enemy.aiState === 'chase') {
        ctx.fillStyle = '#666666';
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 3; i++) {
            const smokeX = x + 85 + Math.sin(enemy.animationFrame + i) * 4;
            const smokeY = y + 35 + i * 3;
            ctx.fillRect(smokeX, smokeY, 2 + i, 2);
        }
        ctx.globalAlpha = 1.0;
    }
}

// Draw boat enemy sprite - Level 3 harbor theme
function drawBoatEnemy(x, y, enemy) {
    // Boat hull
    ctx.fillStyle = '#2a4d4d'; // Dark teal
    ctx.fillRect(x + 10, y + 30, 80, 25);
    
    // Hull sides (perspective)
    ctx.fillStyle = '#1a3333';
    ctx.fillRect(x + 8, y + 28, 84, 8);
    
    // Deck
    ctx.fillStyle = '#8b7355'; // Wood brown
    ctx.fillRect(x + 12, y + 20, 76, 12);
    
    // Deck planking lines
    ctx.fillStyle = '#6b5535';
    for (let i = 0; i < 7; i++) {
        ctx.fillRect(x + 15 + i * 10, y + 20, 1, 12);
    }
    
    // Cabin/Bridge
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x + 35, y + 8, 30, 15);
    
    // Bridge windows
    ctx.fillStyle = '#333366';
    ctx.fillRect(x + 38, y + 10, 24, 8);
    
    // Window reflections
    ctx.fillStyle = '#4444aa';
    ctx.fillRect(x + 38, y + 10, 24, 3);
    
    // Boat name/markings
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 20, y + 35, 20, 3);
    ctx.fillRect(x + 50, y + 35, 15, 3);
    
    // Bow (front)
    ctx.fillStyle = '#2a4d4d';
    ctx.fillRect(x + 5, y + 32, 8, 20);
    
    // Stern (back)
    ctx.fillStyle = '#2a4d4d';
    ctx.fillRect(x + 87, y + 32, 8, 20);
    
    // Propeller wake (if moving)
    if (Math.abs(enemy.velocityX) > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 4; i++) {
            const wakeX = enemy.facingRight ? x + 95 + i * 5 : x - 5 - i * 5;
            const wakeY = y + 45 + Math.sin(enemy.animationFrame + i) * 2;
            ctx.fillRect(wakeX, wakeY, 3, 2);
        }
        ctx.globalAlpha = 1.0;
    }
    
    // Crew silhouettes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 25, y + 12, 6, 10);
    ctx.fillRect(x + 55, y + 12, 6, 10);
    
    // Navigation lights
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 8, y + 35, 2, 2);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + 90, y + 35, 2, 2);
    
    // Water displacement waves
    ctx.fillStyle = '#87ceeb';
    ctx.globalAlpha = 0.5;
    const waveOffset = Math.sin(enemy.waveMotion) * 3;
    ctx.fillRect(x + 5, y + 55 + waveOffset, 90, 3);
    ctx.fillRect(x + 10, y + 58 + waveOffset * 0.5, 80, 2);
    ctx.globalAlpha = 1.0;
    
    // Mast (simple)
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x + 49, y - 5, 2, 28);
    
    // Flag
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(x + 52, y - 2, 8, 5);
}

// Draw all collectibles
function drawCollectibles() {
    for (const collectible of collectibles) {
        if (collectible.active) {
            drawCollectible(collectible);
        }
    }
}

// Draw individual collectible
function drawCollectible(collectible) {
    // Calculate screen position using camera offset
    const screenX = collectible.x - camera.x;
    const screenY = collectible.y - camera.y;
    
    // Only draw if collectible is visible on screen
    if (screenX + 32 > 0 && screenX < canvas.width &&
        screenY + 32 > 0 && screenY < canvas.height) {
        
        ctx.save();
        
        // Calculate floating offset
        const floatY = Math.sin(collectible.bobOffset) * 5;
        
        ctx.translate(screenX, screenY + floatY);
        
        if (collectible.type === 'dumpling') {
            drawDumpling(0, 0, collectible);
        } else if (collectible.type === 'noodle_soup') {
            drawNoodleSoup(0, 0, collectible);
        }
        
        ctx.restore();
    }
}

// Draw dumpling collectible - Enhanced 16-bit style
function drawDumpling(x, y, collectible) {
    // Dumpling base (rounded shape with shading)
    ctx.fillStyle = '#f5deb3'; // Light wheat color
    ctx.fillRect(x + 2, y + 6, 28, 20);
    
    // Dumpling wrapper shading
    ctx.fillStyle = '#deb887';
    ctx.fillRect(x + 4, y + 8, 24, 16);
    
    // Dumpling top highlight
    ctx.fillStyle = '#fff8dc';
    ctx.fillRect(x + 6, y + 8, 20, 4);
    
    // Dumpling pleats (more detailed)
    ctx.fillStyle = '#cd853f';
    const pleatPattern = [
        { x: 6, y: 6, w: 3, h: 10 },
        { x: 11, y: 4, w: 3, h: 12 },
        { x: 16, y: 6, w: 3, h: 10 },
        { x: 21, y: 4, w: 3, h: 12 },
        { x: 26, y: 6, w: 3, h: 10 }
    ];
    for (const pleat of pleatPattern) {
        ctx.fillRect(x + pleat.x, y + pleat.y, pleat.w, pleat.h);
    }
    
    // Dumpling filling (visible through pleats)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 8, y + 12, 16, 8);
    
    // Meat texture
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x + 10, y + 14, 4, 2);
    ctx.fillRect(x + 18, y + 16, 4, 2);
    
    // Enhanced steam effect with rising particles
    const steamOpacity = 0.3 + Math.sin(collectible.animationFrame * 0.5) * 0.2;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = steamOpacity;
    
    // Multiple steam wisps
    const steamWisps = [
        { x: 10, baseY: -8, height: 12, offset: 0 },
        { x: 16, baseY: -12, height: 16, offset: 1 },
        { x: 22, baseY: -6, height: 10, offset: 2 }
    ];
    
    for (const wisp of steamWisps) {
        const wispY = wisp.baseY + Math.sin(collectible.animationFrame * 0.3 + wisp.offset) * 3;
        ctx.fillRect(x + wisp.x, y + wispY, 2, wisp.height);
        // Steam particle effect
        ctx.fillRect(x + wisp.x + 1, y + wispY - 4, 1, 1);
    }
    ctx.globalAlpha = 1.0;
    
    // Collectible glow effect
    if (collectible.type === 'dumpling') {
        ctx.fillStyle = '#90EE90';
        ctx.shadowColor = '#90EE90';
        ctx.shadowBlur = 8;
        ctx.fillRect(x + 14, y + 2, 4, 2);
        ctx.shadowBlur = 0;
    }
    
    // Health indicator (debug)
    if (GAME_CONFIG.DEBUG_MODE) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x + 8, y - 18, 16, 6);
        ctx.fillStyle = '#000000';
        ctx.font = '10px Courier New';
        ctx.fillText('+2 HP', x + 6, y - 14);
    }
}

// Draw noodle soup collectible
// Draw noodle soup collectible - Enhanced 16-bit style
function drawNoodleSoup(x, y, collectible) {
    // Bowl base (ceramic with depth)
    ctx.fillStyle = '#f8f8ff'; // Ghost white
    ctx.fillRect(x + 0, y + 10, 32, 20);
    
    // Bowl (ceramic white with rim detail)
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(x + 2, y + 12, 28, 16);
    
    // Bowl rim with highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, y + 12, 28, 3);
    
    // Bowl shadow (inner)
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(x + 3, y + 25, 26, 3);
    
    // Soup broth (richer golden color)
    ctx.fillStyle = '#b8860b'; // Dark golden rod
    ctx.fillRect(x + 4, y + 14, 24, 12);
    
    // Broth surface ripples
    ctx.fillStyle = '#daa520';
    const rippleOffset = Math.sin(collectible.bobOffset) * 2;
    ctx.fillRect(x + 6 + rippleOffset, y + 15, 20, 2);
    
    // Noodles (more detailed strands)
    ctx.fillStyle = '#ffd700';
    const noodleStrands = [
        { x: 6, baseY: 16, length: 8, wiggle: 0 },
        { x: 10, baseY: 17, length: 7, wiggle: 1 },
        { x: 14, baseY: 16, length: 9, wiggle: 2 },
        { x: 18, baseY: 18, length: 6, wiggle: 3 },
        { x: 22, baseY: 16, length: 8, wiggle: 4 },
        { x: 26, baseY: 17, length: 7, wiggle: 5 }
    ];
    
    for (const noodle of noodleStrands) {
        const noodleOffset = Math.sin(collectible.bobOffset + noodle.wiggle) * 1.5;
        ctx.fillRect(x + noodle.x, y + noodle.baseY + noodleOffset, 2, noodle.length);
        // Noodle highlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(x + noodle.x, y + noodle.baseY + noodleOffset, 1, 2);
        ctx.fillStyle = '#ffd700';
    }
    
    // Vegetables (green onions and meat)
    ctx.fillStyle = '#228b22'; // Forest green (green onions)
    ctx.fillRect(x + 8, y + 16, 2, 3);
    ctx.fillRect(x + 20, y + 18, 2, 3);
    
    // Meat pieces
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 12, y + 17, 3, 2);
    ctx.fillRect(x + 18, y + 19, 3, 2);
    
    // Chopsticks (bamboo style)
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x + 22, y + 2, 2, 22);
    ctx.fillRect(x + 26, y + 4, 2, 20);
    
    // Chopstick tips
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x + 22, y + 22, 2, 2);
    ctx.fillRect(x + 26, y + 22, 2, 2);
    
    // Enhanced steam effect with multiple wisps
    const steamOpacity = 0.4 + Math.sin(collectible.animationFrame * 0.4) * 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = steamOpacity;
    
    const steamWisps = [
        { x: 6, baseY: -6, height: 14, phase: 0 },
        { x: 12, baseY: -10, height: 18, phase: 1.5 },
        { x: 18, baseY: -4, height: 12, phase: 3 },
        { x: 24, baseY: -8, height: 16, phase: 4.5 }
    ];
    
    for (const wisp of steamWisps) {
        const wispY = wisp.baseY + Math.sin(collectible.animationFrame * 0.25 + wisp.phase) * 4;
        ctx.fillRect(x + wisp.x, y + wispY, 2, wisp.height);
        // Steam particles
        if (collectible.animationFrame % 4 === 0) {
            ctx.fillRect(x + wisp.x + 1, y + wispY - 2, 1, 1);
        }
    }
    ctx.globalAlpha = 1.0;
    
    // Collectible glow effect
    ctx.fillStyle = '#FFB6C1'; // Light pink
    ctx.shadowColor = '#FFB6C1';
    ctx.shadowBlur = 10;
    ctx.fillRect(x + 14, y + 8, 4, 2);
    ctx.shadowBlur = 0;
    
    // Health indicator (debug)
    if (GAME_CONFIG.DEBUG_MODE) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x + 6, y - 18, 20, 6);
        ctx.fillStyle = '#000000';
        ctx.font = '10px Courier New';
        ctx.fillText('+5 HP', x + 4, y - 14);
    }
}

// Draw UI elements
function drawUI() {
    // Only show HUD during gameplay
    if (gameState.currentState !== 'playing' && gameState.currentState !== 'paused') {
        return;
    }
    
    // Health bar
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 5;
    
    // Health label
    ctx.fillText('Health:', 10, 30);
    
    // Health bar background
    ctx.fillStyle = '#333333';
    ctx.fillRect(80, 15, 200, 20);
    
    // Health bar fill
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : healthPercent > 0.3 ? '#ffff00' : '#ff0000';
    ctx.fillRect(82, 17, (200 - 4) * healthPercent, 16);
    
    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${player.health}/${player.maxHealth}`, 90, 30);
    
    // Lives indicator
    ctx.fillStyle = '#00ffff';
    ctx.fillText('Lives:', 10, 55);
    
    // Draw life icons
    for (let i = 0; i < player.lives; i++) {
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(70 + i * 25, 42, 20, 16);
        // Heart shape approximation
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(72 + i * 25, 44, 6, 6);
        ctx.fillRect(82 + i * 25, 44, 6, 6);
        ctx.fillRect(74 + i * 25, 50, 12, 6);
    }
    
    // Score
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`Score: ${gameStats.score}`, 10, 80);
    
    // Weapon indicator
    const weaponText = `Weapon: ${player.currentWeapon.toUpperCase()}`;
    ctx.fillText(weaponText, canvas.width - 200, 30);
    
    // Attack cooldown indicator
    if (player.attackCooldownTimer > 0) {
        ctx.fillStyle = '#ff6666';
        ctx.fillText('COOLDOWN', canvas.width - 200, 50);
    }
    
    // Invulnerability indicator
    if (player.invulnerabilityTimer > 0) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('INVULNERABLE', canvas.width - 200, 70);
    }
    
    // Game over screen
    if (gameStats.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '48px Courier New';
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2 - 50);
        
        ctx.font = '24px Courier New';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Final Score: ${gameStats.score}`, canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText(`Enemies Defeated: ${gameStats.enemiesDefeated}`, canvas.width / 2 - 140, canvas.height / 2 + 30);
        
        ctx.font = '16px Courier New';
        ctx.fillText('Refresh page to restart', canvas.width / 2 - 110, canvas.height / 2 + 80);
    }
    
    ctx.shadowBlur = 0;
}

// Draw the game title
function drawTitle() {
    ctx.font = '20px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText('HEDGE COP: HONG KONG NIGHTS', canvas.width / 2 - 140, 50);
    ctx.shadowBlur = 0;
}

// Draw debug information
// Enhanced Debug Information Display (Milestone 10)
function drawDebugInfo() {
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#00ff00';
    
    // Performance metrics
    const fps = Math.round(1 / gameState.deltaTime);
    ctx.fillText(`🚀 PERFORMANCE METRICS`, 10, 20);
    ctx.fillText(`FPS: ${fps} | Avg: ${Math.round(gameState.performanceStats.avgFps)} | Min: ${Math.round(gameState.performanceStats.minFps)} | Max: ${Math.round(gameState.performanceStats.maxFps)}`, 10, 35);
    ctx.fillText(`Frame Drops: ${gameState.performanceStats.frameDrops} | Last Frame: ${gameState.performanceStats.lastFrameTime.toFixed(2)}ms`, 10, 50);
    ctx.fillText(`Frame: ${gameState.frameCount} | Delta: ${(gameState.deltaTime * 1000).toFixed(2)}ms`, 10, 65);
    
    // Player state
    ctx.fillText(`🦔 PLAYER STATE`, 10, 90);
    ctx.fillText(`Position: (${Math.round(player.x)}, ${Math.round(player.y)})`, 10, 105);
    ctx.fillText(`Velocity: (${Math.round(player.velocityX)}, ${Math.round(player.velocityY)})`, 10, 120);
    ctx.fillText(`Animation: ${player.animationState} | On Ground: ${player.isOnGround} | Facing: ${player.facingRight ? 'Right' : 'Left'}`, 10, 135);
    
    // Combat state
    ctx.fillText(`⚔️ COMBAT STATE`, 10, 160);
    ctx.fillText(`Weapon: ${player.currentWeapon} | Attacking: ${player.isAttacking} | Projectiles: ${projectiles.length}/${GAME_CONFIG.OPTIMIZATION.PROJECTILE_LIMIT}`, 10, 175);
    
    // Health & Lives system
    ctx.fillText(`❤️ HEALTH & LIVES`, 10, 200);
    ctx.fillText(`Health: ${player.health}/${player.maxHealth} | Lives: ${player.lives} | Invulnerable: ${player.invulnerabilityTimer > 0 ? 'YES' : 'NO'} | Dead: ${player.isDead ? 'YES' : 'NO'}`, 10, 215);
    
    // Game progression
    ctx.fillText(`🎯 GAME STATS`, 10, 240);
    ctx.fillText(`Score: ${gameStats.score} | Enemies Defeated: ${gameStats.enemiesDefeated} | Game Over: ${gameStats.isGameOver ? 'YES' : 'NO'}`, 10, 255);
    
    // System status
    ctx.fillText(`🎮 SYSTEM STATUS`, 10, 280);
    ctx.fillText(`Enemies: ${enemies.length}/${enemySpawner.maxEnemies} | Enemy Spawn: ${(enemySpawner.spawnInterval - enemySpawner.lastSpawnTime).toFixed(1)}s`, 10, 295);
    ctx.fillText(`Collectibles: ${collectibles.length}/${collectibleSpawner.maxCollectibles} | Food Spawn: ${(collectibleSpawner.spawnInterval - collectibleSpawner.lastSpawnTime).toFixed(1)}s`, 10, 310);
    
    // World & Camera
    ctx.fillText(`🌍 WORLD & CAMERA`, 10, 335);
    ctx.fillText(`Camera: (${Math.round(camera.x)}, ${Math.round(camera.y)}) | Level Progress: ${Math.round((player.x / GAME_CONFIG.LEVEL_END_X) * 100)}%`, 10, 350);
    
    // Audio system status and controls
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`🔊 AUDIO SYSTEM`, 10, 365);
    ctx.fillText(`Audio: ${audioSystem.enabled ? 'ON' : 'OFF'} (M) | Music: ${audioSystem.settings.musicEnabled ? 'ON' : 'OFF'} (N) | SFX: ${audioSystem.settings.sfxEnabled ? 'ON' : 'OFF'} (B)`, 10, 380);
    ctx.fillText(`Master Vol: ${Math.round(audioSystem.masterVolume * 100)}% | Music Vol: ${Math.round(audioSystem.musicVolume * 100)}% | SFX Vol: ${Math.round(audioSystem.sfxVolume * 100)}%`, 10, 395);
    ctx.fillText(`Current Track: ${audioSystem.backgroundMusic.currentTrack || 'None'} | Looping: ${audioSystem.backgroundMusic.looping ? 'ON' : 'OFF'} | Audio Context: ${audioSystem.audioContext ? audioSystem.audioContext.state : 'Not Available'}`, 10, 410);
    
    // Volume controls help
    ctx.fillStyle = '#ffff99';
    ctx.fillText(`Volume Controls: -/+ for Master, Shift + -/+ for Music`, 10, 430);
    
    // Enemy details
    let yOffset = 380;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.active) {
            const distance = Math.round(Math.abs(enemy.x - player.x));
            ctx.fillText(`E${i}: ${enemy.type} ${enemy.aiState} HP:${enemy.health} D:${distance}`, 10, yOffset);
            yOffset += 15;
        }
    }
    
    // Input state
    ctx.fillText(`Input: L:${input.left} R:${input.right} J:${input.jump} A:${input.attack} W:${input.weaponSwitch}`, 10, yOffset + 15);
}

// Debug mode toggle functionality
function toggleDebugMode() {
    GAME_CONFIG.DEBUG_MODE = !GAME_CONFIG.DEBUG_MODE;
    updateDebugButton();
}

function updateDebugButton() {
    const debugButton = document.getElementById('debugToggle');
    if (debugButton) {
        if (GAME_CONFIG.DEBUG_MODE) {
            debugButton.classList.add('active');
            debugButton.textContent = 'Debug ON (D)';
        } else {
            debugButton.classList.remove('active');
            debugButton.textContent = 'Debug OFF (D)';
        }
    }
}

function setupDebugToggle() {
    const debugButton = document.getElementById('debugToggle');
    if (debugButton) {
        debugButton.addEventListener('click', toggleDebugMode);
        updateDebugButton(); // Set initial state
    }
}

// Setup input event listeners
function setupInputListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleMouseClick);
    document.addEventListener('click', handleMouseClick);
}

// Handle key down events
function handleKeyDown(event) {
    // Resume audio context on any key press (for Chrome autoplay policy)
    if (audioSystem.audioContext && audioSystem.audioContext.state === 'suspended') {
        resumeAudioContext();
    }
    
    switch (event.code) {
        case 'ArrowLeft':
            input.left = true;
            if (gameState.currentState === 'levelSelect' || gameState.currentState === 'title') {
                playSound('menuSelect');
            }
            break;
        case 'ArrowRight':
            input.right = true;
            if (gameState.currentState === 'levelSelect' || gameState.currentState === 'title') {
                playSound('menuSelect');
            }
            break;
        case 'ArrowUp':
            input.up = true;
            if (gameState.currentState === 'levelSelect' || gameState.currentState === 'title') {
                playSound('menuSelect');
            }
            break;
        case 'ArrowDown':
            input.down = true;
            if (gameState.currentState === 'levelSelect' || gameState.currentState === 'title') {
                playSound('menuSelect');
            }
            break;
        case 'Space':
            input.jump = true;
            event.preventDefault(); // Prevent page scrolling
            break;
        case 'KeyZ':
            input.attack = true;
            break;
        case 'KeyX':
            input.weaponSwitch = true;
            break;
        case 'KeyP':
            input.pause = true;
            if (gameState.currentState === 'playing') {
                playSound('menuSelect');
            }
            break;
        case 'KeyM':
            input.audioToggle = true;
            break;
        case 'KeyN': // Toggle music only
            toggleMusicEnabled();
            playSound('menuSelect');
            break;
        case 'KeyB': // Toggle sound effects only
            toggleSfxEnabled();
            playSound('menuSelect');
            break;
        case 'KeyD':
            toggleDebugMode();
            playSound('menuSelect');
            break;
        case 'Escape':
            input.escape = true;
            playSound('menuBack');
            break;
        case 'Enter':
            input.enter = true;
            playSound('menuConfirm');
            break;
        case 'Digit1':
            input.key1 = true;
            if (gameState.currentState === 'levelSelect') {
                playSound('menuSelect');
            }
            break;
        case 'Digit2':
            input.key2 = true;
            if (gameState.currentState === 'levelSelect') {
                playSound('menuSelect');
            }
            break;
        case 'Digit3':
            input.key3 = true;
            if (gameState.currentState === 'levelSelect') {
                playSound('menuSelect');
            }
            break;
        case 'Digit4':
            input.key4 = true;
            if (gameState.currentState === 'levelSelect') {
                playSound('menuSelect');
            }
            break;
        case 'Digit5':
            input.key5 = true;
            if (gameState.currentState === 'levelSelect') {
                playSound('menuSelect');
            }
            break;
        case 'Digit6':
            input.key6 = true;
            if (gameState.currentState === 'levelSelect') {
                playSound('menuSelect');
            }
            break;
        case 'Minus': // Volume down
            if (event.shiftKey) {
                updateAudioVolume('music', audioSystem.musicVolume - 0.1);
            } else {
                updateAudioVolume('master', audioSystem.masterVolume - 0.1);
            }
            playSound('menuSelect');
            break;
        case 'Equal': // Volume up (+ key)
            if (event.shiftKey) {
                updateAudioVolume('music', audioSystem.musicVolume + 0.1);
            } else {
                updateAudioVolume('master', audioSystem.masterVolume + 0.1);
            }
            playSound('menuSelect');
            break;
    }
}

// Handle key up events
function handleKeyUp(event) {
    switch (event.code) {
        case 'ArrowLeft':
            input.left = false;
            break;
        case 'ArrowRight':
            input.right = false;
            break;
        case 'ArrowUp':
            input.up = false;
            break;
        case 'ArrowDown':
            input.down = false;
            break;
        case 'Space':
            input.jump = false;
            break;
        case 'KeyZ':
            input.attack = false;
            break;
        case 'KeyX':
            input.weaponSwitch = false;
            break;
        case 'KeyP':
            input.pause = false;
            break;
        case 'KeyM':
            input.audioToggle = false;
            break;
        case 'Escape':
            input.escape = false;
            break;
        case 'Enter':
            input.enter = false;
            break;
        case 'Digit1':
            input.key1 = false;
            break;
        case 'Digit2':
            input.key2 = false;
            break;
        case 'Digit3':
            input.key3 = false;
            break;
        case 'Digit4':
            input.key4 = false;
            break;
        case 'Digit5':
            input.key5 = false;
            break;
        case 'Digit6':
            input.key6 = false;
            break;
    }
}

// Handle mouse click events
function handleMouseClick(event) {
    // Resume audio context on first user interaction
    if (audioSystem.audioContext && audioSystem.audioContext.state === 'suspended') {
        resumeAudioContext();
    }
    
    input.click = true;
    
    // Play appropriate UI sound based on current state
    switch (gameState.currentState) {
        case 'title':
            playSound('menuConfirm');
            break;
        case 'levelSelect':
            playSound('menuSelect');
            break;
        case 'levelComplete':
            playSound('menuConfirm');
            break;
        case 'gameOver':
            playSound('menuConfirm');
            break;
    }
    
    event.preventDefault();
}

// Handle window resize
function handleResize() {
    // Keep canvas at fixed size for consistent gameplay
    // This will be enhanced in later milestones for responsive design
    console.log('Window resized - maintaining fixed canvas size');
}

// Event listeners
window.addEventListener('resize', handleResize);

// Error handling
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
    gameState.isRunning = false;
});

// Start the game when the page loads
window.addEventListener('load', () => {
    console.log('Page loaded, starting game initialization...');
    initGame();
});

// Prevent context menu on canvas (for right-click events later)
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

console.log('Hedge Cop: Hong Kong Nights script loaded successfully!');
