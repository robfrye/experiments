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

// Game Settings
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    DEBUG_MODE: true
};

// Initialize the game
function initGame() {
    console.log('Initializing Hedge Cop game...');
    
    // Set canvas size
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    // Set initial game state
    gameState.isRunning = true;
    gameState.lastTime = performance.now();
    
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
    // Basic update logic - will be expanded in future milestones
    
    // Debug: Display FPS every second
    if (GAME_CONFIG.DEBUG_MODE && gameState.frameCount % 60 === 0) {
        const fps = Math.round(1 / deltaTime);
        console.log(`FPS: ${fps}`);
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
    
    // Draw test shapes to verify canvas rendering
    drawTestShapes();
    
    // Draw debug info if enabled
    if (GAME_CONFIG.DEBUG_MODE) {
        drawDebugInfo();
    }
}

// Draw test shapes to verify rendering
function drawTestShapes() {
    // Test rectangle (will become ground later)
    ctx.fillStyle = '#ffd60a';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Test circle (placeholder for player)
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.arc(100, canvas.height - 100, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Test triangle (placeholder for enemy)
    ctx.fillStyle = '#8338ec';
    ctx.beginPath();
    ctx.moveTo(300, canvas.height - 50);
    ctx.lineTo(320, canvas.height - 80);
    ctx.lineTo(340, canvas.height - 50);
    ctx.closePath();
    ctx.fill();
    
    // Test neon text effect
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
    
    // Canvas dimensions
    ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 10, 50);
    
    // Game state
    ctx.fillText(`Running: ${gameState.isRunning}`, 10, 65);
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
