// Hedge Cop - Game Script

// Game Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const gameState = {
    isRunning: false,
    lastTime: 0,
    deltaTime: 0,
    fps: 60,
    frameCount: 0,
    currentState: 'title', // 'title', 'playing', 'paused', 'gameOver'
    titleClickReady: true
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
    click: false
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
const enemySpawner = {
    lastSpawnTime: 0,
    spawnInterval: 5.0, // seconds between spawns
    maxEnemies: 4,
    spawnLocations: [
        { x: 600, type: 'car' },
        { x: 900, type: 'motorcycle' },
        { x: 1200, type: 'car' },
        { x: 1500, type: 'motorcycle' }
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
const collectibleSpawner = {
    lastSpawnTime: 0,
    spawnInterval: 8.0, // seconds between spawns
    maxCollectibles: 3,
    spawnLocations: [
        { x: 300, type: 'dumpling' },
        { x: 500, type: 'noodle_soup' },
        { x: 700, type: 'dumpling' },
        { x: 1000, type: 'noodle_soup' },
        { x: 1300, type: 'dumpling' }
    ],
    currentSpawnIndex: 0
};

// Game Settings
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    DEBUG_MODE: true,
    GRAVITY: 800,
    GROUND_Y: 550
};

// Initialize the game
function initGame() {
    console.log('Initializing Hedge Cop game...');
    
    // Set canvas size
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    // Initialize player position
    player.y = GAME_CONFIG.GROUND_Y - player.height;
    
    // Initialize enemy spawner
    enemySpawner.lastSpawnTime = 0;
    enemySpawner.currentSpawnIndex = 0;
    
    // Initialize collectible spawner
    collectibleSpawner.lastSpawnTime = 0;
    collectibleSpawner.currentSpawnIndex = 0;
    
    // Start in title screen mode
    gameState.currentState = 'title';
    gameState.titleClickReady = true;
    
    // Set initial game state
    gameState.isRunning = true;
    gameState.lastTime = performance.now();
    
    // Set up input listeners
    setupInputListeners();
    
    console.log('Game initialized successfully! Starting at title screen.');
    
    // Start the game loop
    gameLoop(gameState.lastTime);
}

// Main game loop
function gameLoop(currentTime) {
    if (!gameState.isRunning) return;
    
    // Calculate delta time
    gameState.deltaTime = (currentTime - gameState.lastTime) / 1000;
    gameState.lastTime = currentTime;
    gameState.frameCount++;
    
    // Update based on current game state
    switch (gameState.currentState) {
        case 'title':
            updateTitleScreen();
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
    }
    
    // Render the game
    render();
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Update game logic
function update(deltaTime) {
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
    
    // Check collisions
    checkCollisions();
    
    // Debug: Display FPS every second
    if (GAME_CONFIG.DEBUG_MODE && gameState.frameCount % 60 === 0) {
        const fps = Math.round(1 / deltaTime);
        console.log(`FPS: ${fps}`);
    }
}

// Update title screen
function updateTitleScreen() {
    // Handle click to start
    if (input.click && gameState.titleClickReady) {
        startGame();
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

// Start the game from title screen
function startGame() {
    gameState.currentState = 'playing';
    gameState.titleClickReady = false;
    
    // Reset game state
    resetGameState();
    
    console.log('Game started!');
}

// Restart the game from game over
function restartGame() {
    gameState.currentState = 'title';
    gameState.titleClickReady = true;
    
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

// Update player movement and physics
function updatePlayer(deltaTime) {
    // Handle respawn timer
    if (player.isDead) {
        player.respawnTimer -= deltaTime;
        if (player.respawnTimer <= 0) {
            respawnPlayer();
        }
        return; // Skip all other updates while dead
    }
    
    // Update invulnerability timer
    if (player.invulnerabilityTimer > 0) {
        player.invulnerabilityTimer -= deltaTime;
    }
    
    // Update attack timers
    if (player.attackTimer > 0) {
        player.attackTimer -= deltaTime;
        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }
    
    if (player.attackCooldownTimer > 0) {
        player.attackCooldownTimer -= deltaTime;
    }
    
    // Handle weapon switching
    if (input.weaponSwitch && player.attackCooldownTimer <= 0) {
        player.currentWeapon = player.currentWeapon === 'punch' ? 'gun' : 'punch';
        player.attackCooldownTimer = 0.2; // Small cooldown to prevent rapid switching
        input.weaponSwitch = false; // Reset input to prevent continuous switching
    }
    
    // Handle attacking
    if (input.attack && !player.isAttacking && player.attackCooldownTimer <= 0) {
        startAttack();
    }
    
    // Don't allow movement during punch attack
    if (player.isAttacking && player.currentWeapon === 'punch') {
        player.velocityX = 0;
    } else {
        // Handle horizontal movement
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
    }
    
    // Apply gravity
    if (!player.isOnGround) {
        player.velocityY += GAME_CONFIG.GRAVITY * deltaTime;
        if (player.velocityY > 0 && player.animationState === 'jumping') {
            player.animationState = 'falling';
        }
    }
    
    // Update position
    player.x += player.velocityX * deltaTime;
    player.y += player.velocityY * deltaTime;
    
    // Keep player within canvas bounds (horizontal)
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    
    // Ground collision
    if (player.y + player.height >= GAME_CONFIG.GROUND_Y) {
        player.y = GAME_CONFIG.GROUND_Y - player.height;
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
    }
    
    // Update animation
    updatePlayerAnimation(deltaTime);
}

// Start an attack based on current weapon
function startAttack() {
    player.isAttacking = true;
    player.attackTimer = player.attackDuration;
    player.attackCooldownTimer = player.attackCooldown;
    
    if (player.currentWeapon === 'punch') {
        player.animationState = 'punching';
        // Punch attack logic will be added when we have enemies
    } else if (player.currentWeapon === 'gun') {
        player.animationState = 'shooting';
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
            const newCollectible = createCollectible(spawnData.type, spawnData.x, GAME_CONFIG.GROUND_Y - 50);
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
    
    // Draw buildings with slight parallax offset
    const parallaxOffset = (player.x * 0.1) % canvas.width;
    
    for (const building of buildings) {
        const buildingX = (building.x - parallaxOffset) % (canvas.width + 200) - 100;
        const buildingY = canvas.height - building.height;
        
        // Building silhouette
        ctx.fillStyle = '#001122';
        ctx.fillRect(buildingX, buildingY, building.width, building.height);
        
        // Random lit windows
        ctx.fillStyle = '#ffff99';
        for (let floor = 0; floor < Math.floor(building.height / 20); floor++) {
            for (let window = 0; window < Math.floor(building.width / 15); window++) {
                if (Math.random() < 0.3) { // 30% chance of lit window
                    const windowX = buildingX + 5 + window * 15;
                    const windowY = buildingY + 10 + floor * 20;
                    ctx.fillRect(windowX, windowY, 8, 12);
                }
            }
        }
        
        // Neon signs on some buildings
        if (Math.random() < 0.4) {
            ctx.fillStyle = '#ff00ff';
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 8;
            ctx.fillRect(buildingX + building.width * 0.2, buildingY + building.height * 0.3, building.width * 0.6, 8);
            ctx.shadowBlur = 0;
        }
    }
    
    // Add some distant neon lights
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 8; i++) {
        const neonX = (i * 100 - parallaxOffset * 0.5) % canvas.width;
        const neonY = canvas.height - 250 + Math.sin(i) * 30;
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
    }
    
    // Always draw debug info if enabled
    if (GAME_CONFIG.DEBUG_MODE) {
        drawDebugInfo();
    }
}

// Render gameplay elements
function renderGameplay() {
    // Draw ground
    drawGround();
    
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
    ctx.fillText('HEDGEHOG', canvas.width / 2 - 200, canvas.height / 2 - 80);
    
    ctx.font = 'bold 64px Courier New';
    ctx.fillStyle = '#ff6600';
    ctx.fillText('DETECTIVE', canvas.width / 2 - 220, canvas.height / 2 - 20);
    
    // Subtitle
    ctx.font = 'bold 24px Courier New';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('Hong Kong Nights', canvas.width / 2 - 110, canvas.height / 2 + 20);
    
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

// Draw the ground
function drawGround() {
    ctx.fillStyle = '#ffd60a';
    ctx.fillRect(0, GAME_CONFIG.GROUND_Y, canvas.width, canvas.height - GAME_CONFIG.GROUND_Y);
    
    // Add some texture to the ground
    ctx.fillStyle = '#ffba08';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, GAME_CONFIG.GROUND_Y, 10, 5);
    }
}

// Draw the player character
function drawPlayer() {
    // Skip drawing if dead
    if (player.isDead) {
        return;
    }
    
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
        ctx.translate(-player.x - player.width, 0);
    } else {
        ctx.translate(player.x, 0);
    }
    
    // Draw player body (hedgehog detective)
    drawPlayerSprite(0, player.y);
    
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
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
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
    ctx.save();
    
    // Apply stun effect
    if (enemy.stunTimer > 0) {
        ctx.globalAlpha = 0.7;
        // Flash red when stunned
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
    }
    
    // Flip horizontally based on facing direction
    if (!enemy.facingRight) {
        ctx.scale(-1, 1);
        ctx.translate(-enemy.x - enemy.width, 0);
    } else {
        ctx.translate(enemy.x, 0);
    }
    
    if (enemy.type === 'car') {
        drawCarEnemy(0, enemy.y, enemy);
    } else if (enemy.type === 'motorcycle') {
        drawMotorcycleEnemy(0, enemy.y, enemy);
    }
    
    ctx.restore();
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
    ctx.save();
    
    // Calculate floating offset
    const floatY = Math.sin(collectible.bobOffset) * 5;
    
    ctx.translate(collectible.x, collectible.y + floatY);
    
    if (collectible.type === 'dumpling') {
        drawDumpling(0, 0, collectible);
    } else if (collectible.type === 'noodle_soup') {
        drawNoodleSoup(0, 0, collectible);
    }
    
    ctx.restore();
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
    ctx.font = '24px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText('HEDGE COP', canvas.width / 2 - 80, 50);
    ctx.shadowBlur = 0;
}

// Draw debug information
function drawDebugInfo() {
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#00ff00';
    
    // FPS counter
    const fps = Math.round(1 / gameState.deltaTime);
    ctx.fillText(`FPS: ${fps}`, 10, 20);
    
    // Frame count
    ctx.fillText(`Frame: ${gameState.frameCount}`, 10, 35);
    
    // Player position
    ctx.fillText(`Player: (${Math.round(player.x)}, ${Math.round(player.y)})`, 10, 50);
    
    // Player velocity
    ctx.fillText(`Velocity: (${Math.round(player.velocityX)}, ${Math.round(player.velocityY)})`, 10, 65);
    
    // Player state
    ctx.fillText(`State: ${player.animationState}`, 10, 80);
    ctx.fillText(`On Ground: ${player.isOnGround}`, 10, 95);
    ctx.fillText(`Facing: ${player.facingRight ? 'Right' : 'Left'}`, 10, 110);
    
    // Combat state
    ctx.fillText(`Weapon: ${player.currentWeapon}`, 10, 125);
    ctx.fillText(`Attacking: ${player.isAttacking}`, 10, 140);
    ctx.fillText(`Projectiles: ${projectiles.length}`, 10, 155);
    
    // Health & Lives system
    ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, 10, 170);
    ctx.fillText(`Lives: ${player.lives}`, 10, 185);
    ctx.fillText(`Invulnerable: ${player.invulnerabilityTimer > 0 ? 'YES' : 'NO'}`, 10, 200);
    ctx.fillText(`Dead: ${player.isDead ? 'YES' : 'NO'}`, 10, 215);
    
    // Game stats
    ctx.fillText(`Score: ${gameStats.score}`, 10, 230);
    ctx.fillText(`Enemies Defeated: ${gameStats.enemiesDefeated}`, 10, 245);
    ctx.fillText(`Game Over: ${gameStats.isGameOver ? 'YES' : 'NO'}`, 10, 260);
    
    // Enemy system
    ctx.fillText(`Enemies: ${enemies.length}/${enemySpawner.maxEnemies}`, 10, 275);
    ctx.fillText(`Enemy Spawn Timer: ${(enemySpawner.spawnInterval - enemySpawner.lastSpawnTime).toFixed(1)}s`, 10, 290);
    
    // Collectible system
    ctx.fillText(`Collectibles: ${collectibles.length}/${collectibleSpawner.maxCollectibles}`, 10, 305);
    ctx.fillText(`Food Spawn Timer: ${(collectibleSpawner.spawnInterval - collectibleSpawner.lastSpawnTime).toFixed(1)}s`, 10, 320);
    
    // Enemy details
    let yOffset = 335;
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

console.log('Hedge Cop script loaded successfully!');
