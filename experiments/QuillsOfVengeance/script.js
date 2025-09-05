/* Main Script - Entry point and initialization */

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hedge Cop: Quills of Vengeance - Starting initialization...');
    
    // Create and start the game
    game = new Game();
    
    // Add global error handling
    window.addEventListener('error', function(event) {
        console.error('Game error:', event.error);
        
        // Display error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '10px';
        errorDiv.style.zIndex = '10000';
        errorDiv.style.fontFamily = 'Arial, sans-serif';
        errorDiv.innerHTML = `
            <h3>Game Error</h3>
            <p>An error occurred while running the game:</p>
            <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${event.error.message}</pre>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 10px; background: #fff; border: none; border-radius: 5px; cursor: pointer;">Reload Game</button>
        `;
        document.body.appendChild(errorDiv);
    });
    
    // Add visibility change handling for pause/resume
    document.addEventListener('visibilitychange', function() {
        if (game && game.getGameState() === CONFIG.GAME_STATES.PLAYING) {
            if (document.hidden) {
                game.togglePause();
                console.log('Game paused due to tab becoming hidden');
            }
        }
    });
    
    // Add resize handling
    window.addEventListener('resize', Utils.debounce(function() {
        if (game && game.canvas) {
            // Maintain aspect ratio if needed
            console.log('Window resized - game canvas size maintained');
        }
    }, 250));
    
    console.log('Game initialization complete!');
});

// Global utility functions for console debugging
window.debugGame = {
    getGameState: () => game ? game.getGameState() : 'Not initialized',
    getPlayer: () => game ? game.getPlayer() : null,
    getFPS: () => game ? game.getFPS() : 0,
    getPerformance: () => game ? game.getPerformanceData() : null,
    toggleDebug: () => game ? game.toggleDebug() : console.log('Game not initialized'),
    togglePause: () => game ? game.togglePause() : console.log('Game not initialized'),
    
    // Asset debugging
    getAssets: () => ({
        images: assetManager ? Array.from(assetManager.images.keys()) : [],
        audio: assetManager ? Array.from(assetManager.audio.keys()) : []
    }),
    
    // Input debugging
    getInputState: () => inputManager ? inputManager.getDebugInfo() : 'Input manager not initialized',
    
    // Collision debugging
    getCollisionInfo: () => collisionManager ? collisionManager.getDebugInfo() : 'Collision manager not initialized',
    
    // Performance testing
    testPerformance: (iterations = 1000) => {
        if (!game) {
            console.log('Game not initialized');
            return;
        }
        
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            // Simulate update cycle
            game.update(16.67); // 60 FPS frame time
        }
        const end = performance.now();
        
        console.log(`Performance test (${iterations} iterations): ${(end - start).toFixed(2)}ms`);
        console.log(`Average per frame: ${((end - start) / iterations).toFixed(4)}ms`);
    }
};

// Add instructions to console
console.log('%cHedge Cop: Quills of Vengeance - Debug Console', 'color: #4a9eff; font-size: 16px; font-weight: bold;');
console.log('%cUse window.debugGame to access debug functions:', 'color: #888;');
console.log('%c- debugGame.getGameState() - Get current game state', 'color: #888;');
console.log('%c- debugGame.getPlayer() - Get player object', 'color: #888;');
console.log('%c- debugGame.getFPS() - Get current FPS', 'color: #888;');
console.log('%c- debugGame.toggleDebug() - Toggle debug display', 'color: #888;');
console.log('%c- debugGame.togglePause() - Toggle pause', 'color: #888;');
console.log('%c- debugGame.getAssets() - List loaded assets', 'color: #888;');
console.log('%c- debugGame.testPerformance() - Run performance test', 'color: #888;');
console.log('%cPress F1 in-game to toggle debug overlay', 'color: #4a9eff;');
console.log('%cPress ESC or P to pause/unpause', 'color: #4a9eff;');

// Expose CONFIG for easy tweaking
window.CONFIG = CONFIG;
