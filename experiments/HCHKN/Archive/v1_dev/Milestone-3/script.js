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
    frameCount: 0
};

// Input State
const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    weaponSwitch: false
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
    attackCooldownTimer: 0
};

// Projectiles array
const projectiles = [];

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
    
    // Set initial game state
    gameState.isRunning = true;
    gameState.lastTime = performance.now();
    
    // Set up input listeners
    setupInputListeners();
    
    console.log('Game initialized successfully!');
    
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
    
    // Update game logic
    update(gameState.deltaTime);
    
    // Render the game
    render();
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Update game logic
function update(deltaTime) {
    // Update player
    updatePlayer(deltaTime);
    
    // Update projectiles
    updateProjectiles(deltaTime);
    
    // Debug: Display FPS every second
    if (GAME_CONFIG.DEBUG_MODE && gameState.frameCount % 60 === 0) {
        const fps = Math.round(1 / deltaTime);
        console.log(`FPS: ${fps}`);
    }
}

// Update player movement and physics
function updatePlayer(deltaTime) {
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
            projectile.x > canvas.width || 
            projectile.lifetime <= 0) {
            projectile.active = false;
        }
    }
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

// Render the game
function render() {
    // Clear the canvas
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient for Hong Kong nights atmosphere
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#001d3d');
    gradient.addColorStop(0.5, '#003566');
    gradient.addColorStop(1, '#000814');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    drawGround();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw player
    drawPlayer();
    
    // Draw UI
    drawUI();
    
    // Draw game title
    drawTitle();
    
    // Draw debug info if enabled
    if (GAME_CONFIG.DEBUG_MODE) {
        drawDebugInfo();
    }
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
    ctx.save();
    
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
    // Body (detective coat) - doubled size
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(x + 16, y + 40, 32, 56);
    
    // Head (hedgehog head) - doubled size
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(x + 12, y + 8, 40, 40);
    
    // Spikes (hedgehog spikes) - doubled size
    ctx.fillStyle = '#8b4513';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 8 + i * 10, y, 6, 16);
    }
    
    // Eyes - doubled size
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 20, y + 16, 4, 4);
    ctx.fillRect(x + 32, y + 16, 4, 4);
    
    // Detective hat - doubled size
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(x + 8, y + 4, 48, 12);
    ctx.fillRect(x + 16, y - 4, 32, 8);
    
    // Arms - doubled size with attack animations
    ctx.fillStyle = '#d4a574';
    let armOffset = Math.sin(player.animationFrame * 0.5) * 4;
    
    if (player.animationState === 'punching') {
        // Punch animation - extend arm forward
        if (player.facingRight) {
            ctx.fillRect(x + 4, y + 44, 12, 24);
            ctx.fillRect(x + 48 + player.animationFrame * 8, y + 40, 16, 24);
        } else {
            ctx.fillRect(x + 48, y + 44, 12, 24);
            ctx.fillRect(x - 4 - player.animationFrame * 8, y + 40, 16, 24);
        }
    } else if (player.animationState === 'shooting') {
        // Shooting animation - point gun forward
        if (player.facingRight) {
            ctx.fillRect(x + 4, y + 44, 12, 24);
            ctx.fillRect(x + 48, y + 42, 20, 20);
        } else {
            ctx.fillRect(x + 48, y + 44, 12, 24);
            ctx.fillRect(x - 8, y + 42, 20, 20);
        }
    } else if (player.animationState === 'walking') {
        ctx.fillRect(x + 4, y + 44 + armOffset, 12, 24);
        ctx.fillRect(x + 48, y + 44 - armOffset, 12, 24);
    } else {
        ctx.fillRect(x + 4, y + 44, 12, 24);
        ctx.fillRect(x + 48, y + 44, 12, 24);
    }
    
    // Legs - doubled size
    ctx.fillStyle = '#2c1810';
    let legOffset = 0;
    if (player.animationState === 'walking') {
        legOffset = Math.sin(player.animationFrame * 0.8) * 6;
    }
    ctx.fillRect(x + 20, y + 72 + legOffset, 8, 24);
    ctx.fillRect(x + 36, y + 72 - legOffset, 8, 24);
    
    // Weapon indicator/effect
    if (player.animationState === 'punching') {
        // Punch impact effect
        ctx.fillStyle = '#ffff00';
        const punchX = player.facingRight ? x + 64 + player.animationFrame * 8 : x - 16 - player.animationFrame * 8;
        ctx.fillRect(punchX, y + 45, 8, 8);
    } else if (player.animationState === 'shooting') {
        // Gun barrel flash
        ctx.fillStyle = '#ff4444';
        const gunX = player.facingRight ? x + 68 : x - 12;
        ctx.fillRect(gunX, y + 50, 6, 4);
    }
    
    // Animation effects
    if (player.animationState === 'jumping') {
        // Draw motion lines for jumping - doubled size
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 10, y + 30 + i * 10);
            ctx.lineTo(x, y + 30 + i * 10);
            ctx.stroke();
        }
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

// Draw UI elements
function drawUI() {
    // Weapon indicator
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 5;
    
    const weaponText = `Weapon: ${player.currentWeapon.toUpperCase()}`;
    ctx.fillText(weaponText, canvas.width - 200, 30);
    
    // Attack cooldown indicator
    if (player.attackCooldownTimer > 0) {
        ctx.fillStyle = '#ff6666';
        ctx.fillText('COOLDOWN', canvas.width - 200, 50);
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
    
    // Input state
    ctx.fillText(`Input: L:${input.left} R:${input.right} J:${input.jump} A:${input.attack} W:${input.weaponSwitch}`, 10, 170);
}

// Setup input event listeners
function setupInputListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
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
    }
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
