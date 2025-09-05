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

// Player Object
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

// Audio system
const audioSystem = {
    enabled: true,
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    backgroundMusic: null,
    sounds: {}
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
            platforms: [],
            enemySpawns: [],
            collectibleSpawns: [],
            exitPosition: { x: 3000, y: 650 },
            victoryCondition: 'reach_exit'
        },
        3: {
            name: "Harbor District", 
            theme: "harbor",
            backgroundColor: "#1a2332",
            platforms: [],
            enemySpawns: [],
            collectibleSpawns: [],
            exitPosition: { x: 3000, y: 650 },
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
        initAudioSystem();
    } catch (error) {
        console.warn('Audio initialization failed, continuing without audio:', error);
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
    console.log('Navigated to level selection');
}

// Navigate back to title screen
function goToTitleScreen() {
    gameState.currentState = 'title';
    gameState.titleClickReady = true;
    console.log('Navigated to title screen');
}

// Start a specific level
function startLevel(levelNumber) {
    // Initialize audio context on user interaction
    if (audioSystem.enabled && !window.audioContext) {
        try {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Resume audio context if suspended
            if (window.audioContext.state === 'suspended') {
                window.audioContext.resume();
            }
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
        }
    }
    
    // Load the specified level
    if (levelManager.loadLevel(levelNumber)) {
        gameState.currentState = 'playing';
        gameState.titleClickReady = false;
        
        // Initialize audio system
        initAudioSystem();
        
        // Start background music
        startBackgroundMusic();
        
        console.log(`Started Level ${levelNumber}: ${levelManager.levelData[levelNumber].name}`);
    } else {
        console.error(`Failed to load level ${levelNumber}`);
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
    
    // Stop background music
    stopBackgroundMusic();
    
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
            input.weaponSwitch = false; // Reset input to prevent continuous switching
        } catch (error) {
            console.error('Error in weapon switching:', error);
            player.currentWeapon = 'punch'; // Fallback to safe default
        }
    }
    
    // Handle attacking with error handling
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
        playSound('jump'); // Add jump sound effect
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

// Audio system functions
function initAudioSystem() {
    if (!audioSystem.enabled) return;
    
    try {
        // Create simple audio context for generating sound effects
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // For now, we'll use placeholder background music
        // In a full implementation, this would load from a CDN
        audioSystem.backgroundMusic = {
            play: () => console.log('Background music would play here'),
            pause: () => console.log('Background music would pause here'),
            loop: true,
            volume: audioSystem.musicVolume * audioSystem.masterVolume
        };
        
        // Simple sound generation functions will be created on demand
        audioSystem.sounds = {
            jump: () => playTone(440, 0.1),      // A4 note for jump
            attack: () => playTone(220, 0.15),   // A3 note for attack
            enemyHit: () => playTone(330, 0.1),  // E4 note for enemy hit
            collectItem: () => playTone(660, 0.2), // E5 note for collect
            playerHurt: () => playTone(110, 0.3)   // A2 note for hurt
        };
        
        console.log('Audio system initialized successfully');
    } catch (error) {
        console.warn('Audio initialization failed:', error);
        audioSystem.enabled = false;
    }
}

// Generate simple tone using Web Audio API
function playTone(frequency, duration) {
    if (!audioSystem.enabled || !window.audioContext) return;
    
    try {
        const oscillator = window.audioContext.createOscillator();
        const gainNode = window.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(window.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square'; // 8-bit style square wave
        
        gainNode.gain.setValueAtTime(audioSystem.sfxVolume * audioSystem.masterVolume * 0.1, window.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioContext.currentTime + duration);
        
        oscillator.start(window.audioContext.currentTime);
        oscillator.stop(window.audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Error playing tone:', error);
    }
}

// Create simple audio from data URL (simplified for now)
function createAudioFromDataURL(dataUrl) {
    // This function is no longer needed with our tone generation approach
    return null;
}

// Play sound effect
function playSound(soundName) {
    if (!audioSystem.enabled || !audioSystem.sounds[soundName]) return;
    
    try {
        if (typeof audioSystem.sounds[soundName] === 'function') {
            audioSystem.sounds[soundName]();
        }
    } catch (error) {
        console.warn('Error playing sound:', error);
    }
}

// Start background music
function startBackgroundMusic() {
    if (!audioSystem.enabled || !audioSystem.backgroundMusic) return;
    
    try {
        audioSystem.backgroundMusic.play();
        console.log('Background music started');
    } catch (error) {
        console.warn('Background music play failed:', error);
    }
}

// Stop background music
function stopBackgroundMusic() {
    if (!audioSystem.enabled || !audioSystem.backgroundMusic) return;
    
    try {
        audioSystem.backgroundMusic.pause();
        console.log('Background music stopped');
    } catch (error) {
        console.warn('Error stopping background music:', error);
    }
}

// Toggle audio on/off
function toggleAudio() {
    audioSystem.enabled = !audioSystem.enabled;
    
    if (!audioSystem.enabled) {
        stopBackgroundMusic();
    } else if (gameState.currentState === 'playing') {
        startBackgroundMusic();
    }
}

// Start an attack based on current weapon
function startAttack() {
    player.isAttacking = true;
    player.attackTimer = player.attackDuration;
    player.attackCooldownTimer = player.attackCooldown;
    
    if (player.currentWeapon === 'punch') {
        player.animationState = 'punching';
        playSound('attack'); // Add punch sound effect
        // Punch attack logic will be added when we have enemies
    } else if (player.currentWeapon === 'gun') {
        player.animationState = 'shooting';
        playSound('attack'); // Add gun sound effect
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
            enemy.x += chaseDirection * enemy.speed * deltaTime;
            
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
    playSound('playerHurt'); // Add player hurt sound effect
    
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
    player.health = Math.min(player.health + amount, player.maxHealth);
    gameStats.score += amount * 10; // Bonus points for collecting food
}

// Game over function
function gameOver() {
    gameStats.isGameOver = true;
    gameState.currentState = 'gameOver';
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
            playSound('collectItem'); // Add collectible pickup sound effect
            
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

// Update player animation
function updatePlayerAnimation(deltaTime) {
    player.animationTimer += deltaTime;
    
    if (player.animationTimer >= player.animationSpeed) {
        player.animationTimer = 0;
        
        switch (player.animationState) {
            case 'idle':
                player.animationFrame = (player.animationFrame + 1) % 4;
                break;
            case 'walking':
                player.animationFrame = (player.animationFrame + 1) % 6;
                break;
            case 'jumping':
            case 'falling':
                player.animationFrame = 0; // Static frame for jumping/falling
                break;
            case 'punching':
                player.animationFrame = Math.min(player.animationFrame + 1, 3);
                break;
            case 'shooting':
                player.animationFrame = Math.min(player.animationFrame + 1, 2);
                break;
        }
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
    
    // Controls instructions
    ctx.shadowBlur = 5;
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('CONTROLS:', canvas.width / 2 - 50, canvas.height / 2 + 140);
    ctx.fillText('Arrow Keys: Move', canvas.width / 2 - 70, canvas.height / 2 + 160);
    ctx.fillText('Spacebar: Jump', canvas.width / 2 - 65, canvas.height / 2 + 180);
    ctx.fillText('Z: Attack', canvas.width / 2 - 40, canvas.height / 2 + 200);
    ctx.fillText('X: Switch Weapon', canvas.width / 2 - 75, canvas.height / 2 + 220);
    ctx.fillText('P: Pause', canvas.width / 2 - 35, canvas.height / 2 + 240);
    ctx.fillText('M: Toggle Audio', canvas.width / 2 - 70, canvas.height / 2 + 260);
    
    // Version/credit
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#666666';
    ctx.fillText('v1.0 - Hong Kong Detective Platformer', 10, canvas.height - 10);
    
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
    ctx.fillText('PAUSED', canvas.width / 2 - 100, canvas.height / 2 - 20);
    
    // Instructions
    ctx.font = '24px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Press P to Resume', canvas.width / 2 - 120, canvas.height / 2 + 30);
    
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
            
            if (platform.type === 'ground') {
                // Ground platforms (thicker, different color)
                ctx.fillStyle = '#ffd60a';
                ctx.fillRect(screenX, screenY, platform.width, platform.height);
                
                // Add texture to ground
                ctx.fillStyle = '#ffba08';
                for (let i = 0; i < platform.width; i += 20) {
                    ctx.fillRect(screenX + i, screenY, 10, 5);
                }
            } else {
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
            }
        }
    }
    
    // Draw level end marker
    const levelEndScreenX = GAME_CONFIG.LEVEL_END_X - camera.x;
    if (levelEndScreenX > -50 && levelEndScreenX < canvas.width + 50) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(levelEndScreenX, 0, 4, canvas.height);
        
        // End marker text
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#00ff00';
        ctx.fillText('LEVEL END', levelEndScreenX - 40, 50);
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

// Draw player sprite with basic animation
function drawPlayerSprite(x, y) {
    // 16-bit pixel art hedgehog detective with Hong Kong style
    
    // Detective coat (noir style with lapels and belt)
    ctx.fillStyle = '#4a3729'; // Dark brown detective coat
    ctx.fillRect(x + 14, y + 38, 36, 58);
    
    // Coat lapels
    ctx.fillStyle = '#6b4a35';
    ctx.fillRect(x + 14, y + 38, 8, 16);
    ctx.fillRect(x + 42, y + 38, 8, 16);
    
    // Coat belt
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(x + 12, y + 60, 40, 6);
    
    // Belt buckle
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 30, y + 61, 4, 4);
    
    // Hedgehog head (more detailed)
    ctx.fillStyle = '#d4a574'; // Base fur color
    ctx.fillRect(x + 10, y + 6, 44, 42);
    
    // Snout
    ctx.fillStyle = '#e6c098';
    ctx.fillRect(x + 38, y + 28, 12, 14);
    
    // Nose
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(x + 42, y + 32, 4, 4);
    
    // Hedgehog spikes (more detailed pattern)
    ctx.fillStyle = '#8b4513';
    const spikePattern = [
        { x: 6, y: -2, w: 8, h: 18 },
        { x: 16, y: -4, w: 8, h: 20 },
        { x: 26, y: -2, w: 8, h: 18 },
        { x: 36, y: -4, w: 8, h: 20 },
        { x: 46, y: -2, w: 8, h: 18 }
    ];
    for (const spike of spikePattern) {
        ctx.fillRect(x + spike.x, y + spike.y, spike.w, spike.h);
    }
    
    // Spike highlights (16-bit style)
    ctx.fillStyle = '#a0522d';
    for (const spike of spikePattern) {
        ctx.fillRect(x + spike.x, y + spike.y, 2, spike.h);
    }
    
    // Eyes (more expressive)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 18, y + 14, 8, 8);
    ctx.fillRect(x + 32, y + 14, 8, 8);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 20, y + 16, 4, 4);
    ctx.fillRect(x + 34, y + 16, 4, 4);
    
    // Eye reflections (16-bit shine)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 21, y + 17, 2, 2);
    ctx.fillRect(x + 35, y + 17, 2, 2);
    
    // Detective hat (fedora style)
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(x + 4, y + 2, 56, 16); // Hat brim
    ctx.fillRect(x + 12, y - 6, 40, 12); // Hat crown
    
    // Hat band
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(x + 12, y + 6, 40, 4);
    
    // Hat shadow
    ctx.fillStyle = '#0d0704';
    ctx.fillRect(x + 4, y + 14, 56, 4);
    
    // Arms with more detail
    ctx.fillStyle = '#d4a574';
    let armOffset = Math.sin(player.animationFrame * 0.5) * 4;
    
    if (player.animationState === 'punching') {
        // Enhanced punch animation
        if (player.facingRight) {
            // Left arm (static)
            ctx.fillRect(x + 2, y + 42, 14, 26);
            // Right arm (punching)
            const punchExtend = Math.min(player.animationFrame * 12, 24);
            ctx.fillRect(x + 50 + punchExtend, y + 38, 16, 26);
            // Fist
            ctx.fillStyle = '#c49464';
            ctx.fillRect(x + 62 + punchExtend, y + 42, 8, 12);
        } else {
            // Right arm (static)
            ctx.fillRect(x + 48, y + 42, 14, 26);
            // Left arm (punching)
            const punchExtend = Math.min(player.animationFrame * 12, 24);
            ctx.fillRect(x - 2 - punchExtend, y + 38, 16, 26);
            // Fist
            ctx.fillStyle = '#c49464';
            ctx.fillRect(x - 6 - punchExtend, y + 42, 8, 12);
        }
    } else if (player.animationState === 'shooting') {
        // Enhanced shooting animation with gun detail
        if (player.facingRight) {
            ctx.fillRect(x + 2, y + 42, 14, 26);
            ctx.fillRect(x + 50, y + 40, 18, 24);
            // Gun detail
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(x + 66, y + 46, 16, 8);
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(x + 76, y + 48, 6, 4);
        } else {
            ctx.fillRect(x + 48, y + 42, 14, 26);
            ctx.fillRect(x - 4, y + 40, 18, 24);
            // Gun detail
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(x - 18, y + 46, 16, 8);
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(x - 18, y + 48, 6, 4);
        }
    } else if (player.animationState === 'walking') {
        ctx.fillRect(x + 2, y + 42 + armOffset, 14, 26);
        ctx.fillRect(x + 48, y + 42 - armOffset, 14, 26);
    } else {
        ctx.fillRect(x + 2, y + 42, 14, 26);
        ctx.fillRect(x + 48, y + 42, 14, 26);
    }
    
    // Legs with detective shoes
    ctx.fillStyle = '#2c1810'; // Pants
    let legOffset = 0;
    if (player.animationState === 'walking') {
        legOffset = Math.sin(player.animationFrame * 0.8) * 6;
    }
    ctx.fillRect(x + 18, y + 70 + legOffset, 10, 26);
    ctx.fillRect(x + 36, y + 70 - legOffset, 10, 26);
    
    // Detective shoes
    ctx.fillStyle = '#0d0704';
    ctx.fillRect(x + 16, y + 90 + legOffset, 14, 8);
    ctx.fillRect(x + 34, y + 90 - legOffset, 14, 8);
    
    // Enhanced weapon effects
    if (player.animationState === 'punching') {
        // Stylized punch impact with particle effect
        ctx.fillStyle = '#00ffff';
        const punchX = player.facingRight ? x + 70 + player.animationFrame * 12 : x - 18 - player.animationFrame * 12;
        // Impact star pattern
        ctx.fillRect(punchX, y + 48, 12, 4);
        ctx.fillRect(punchX + 4, y + 44, 4, 12);
        ctx.fillRect(punchX + 2, y + 46, 8, 8);
        
        // Neon glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.fillRect(punchX + 3, y + 49, 6, 2);
        ctx.shadowBlur = 0;
    } else if (player.animationState === 'shooting') {
        // Enhanced muzzle flash
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 6;
        const gunX = player.facingRight ? x + 82 : x - 18;
        // Muzzle flash pattern
        ctx.fillRect(gunX, y + 49, 8, 2);
        ctx.fillRect(gunX + 2, y + 47, 4, 6);
        ctx.fillRect(gunX + 8, y + 48, 6, 4);
        ctx.shadowBlur = 0;
    }
    
    // Enhanced animation effects
    if (player.animationState === 'jumping') {
        // Neon motion lines with Hong Kong style
        ctx.strokeStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 4;
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 12, y + 25 + i * 8);
            ctx.lineTo(x - 2, y + 25 + i * 8);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
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
    
    // Audio system
    ctx.fillText(`🔊 AUDIO SYSTEM`, 10, 375);
    ctx.fillText(`Audio: ${audioSystem.enabled ? 'ON' : 'OFF'} (M to toggle)`, 10, 365);
    
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
    switch (event.code) {
        case 'ArrowLeft':
            input.left = true;
            break;
        case 'ArrowRight':
            input.right = true;
            break;
        case 'ArrowUp':
            input.up = true;
            break;
        case 'ArrowDown':
            input.down = true;
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
            break;
        case 'KeyM':
            input.audioToggle = true;
            break;
        case 'KeyD':
            toggleDebugMode();
            break;
        case 'Escape':
            input.escape = true;
            break;
        case 'Enter':
            input.enter = true;
            break;
        case 'Digit1':
            input.key1 = true;
            break;
        case 'Digit2':
            input.key2 = true;
            break;
        case 'Digit3':
            input.key3 = true;
            break;
        case 'Digit4':
            input.key4 = true;
            break;
        case 'Digit5':
            input.key5 = true;
            break;
        case 'Digit6':
            input.key6 = true;
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
    input.click = true;
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
