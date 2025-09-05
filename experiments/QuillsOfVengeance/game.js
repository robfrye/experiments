/* Main Game Class - Handles game state, loop, and core systems */
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = CONFIG.GAME_STATES.LOADING;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsLastUpdate = 0;
        
        // Game entities
        this.player = null;
        this.enemies = [];
        
        // Performance tracking
        this.performanceData = {
            frameTime: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing Hedge Cop: Quills of Vengeance...');
        
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            console.error('Failed to initialize canvas!');
            return;
        }

        // Initialize all systems
        this.initializeSystems();
        
        // Load assets
        await this.loadAssets();
        
        // Create initial game objects
        this.createPlayer();
        this.setupLevel();
        
        // Start the game loop
        this.gameState = CONFIG.GAME_STATES.PLAYING;
        this.startGameLoop();
        
        console.log('Game initialized successfully!');
    }

    initializeSystems() {
        // Initialize global managers
        inputManager = new InputManager();
        renderer = new RenderingEngine(this.canvas, this.ctx);
        collisionManager = new CollisionManager();
        assetManager = new AssetManager();
        
        console.log('All systems initialized');
    }

    async loadAssets() {
        console.log('Loading assets...');
        await assetManager.loadAllAssets();
        console.log('Assets loaded');
    }

    createPlayer() {
        // Simple player object for now (will be expanded in later milestones)
        this.player = {
            x: CONFIG.PLAYER.START_X,
            y: CONFIG.PLAYER.START_Y,
            width: CONFIG.PLAYER.WIDTH,
            height: CONFIG.PLAYER.HEIGHT,
            velocityX: 0,
            velocityY: 0,
            health: CONFIG.PLAYER.HEALTH,
            isOnGround: false,
            isMoving: false,
            direction: 1, // 1 for right, -1 for left
            
            update: function(deltaTime) {
                const deltaSeconds = Utils.deltaTimeToSeconds(deltaTime);
                
                // Handle input
                const horizontalInput = inputManager.getHorizontalInput();
                
                // Update movement
                if (horizontalInput !== 0) {
                    this.velocityX = horizontalInput * CONFIG.PLAYER.SPEED;
                    this.direction = horizontalInput;
                    this.isMoving = true;
                } else {
                    this.velocityX = 0;
                    this.isMoving = false;
                }
                
                // Handle jumping
                if (inputManager.isKeyPressed('UP') && this.isOnGround) {
                    this.velocityY = -CONFIG.PLAYER.JUMP_SPEED;
                    this.isOnGround = false;
                }
                
                // Apply gravity
                if (!this.isOnGround) {
                    this.velocityY += CONFIG.PHYSICS.GRAVITY * deltaSeconds;
                    this.velocityY = Math.min(this.velocityY, CONFIG.PLAYER.MAX_FALL_SPEED);
                }
                
                // Update position
                this.x += this.velocityX * deltaSeconds;
                this.y += this.velocityY * deltaSeconds;
                
                // Ground collision
                this.isOnGround = collisionManager.checkGroundCollision(this, this.velocityY);
                if (this.isOnGround) {
                    this.velocityY = 0;
                }
                
                // Keep player in bounds
                this.x = Utils.clamp(this.x, 0, this.canvas?.width - this.width || 1024);
            },
            
            render: function(renderer) {
                // Use placeholder sprite or draw simple rectangle
                const sprite = assetManager.getImage('HEDGE_COP_PLACEHOLDER');
                if (sprite) {
                    renderer.drawImage(sprite, this.x, this.y);
                } else {
                    // Fallback rectangle
                    const color = this.isMoving ? '#4a9eff' : '#4a4a4a';
                    renderer.drawRect(this.x, this.y, this.width, this.height, color);
                    
                    // Simple face
                    renderer.drawRect(this.x + 8, this.y + 8, 4, 4, '#ffffff'); // Eyes
                    renderer.drawRect(this.x + 20, this.y + 8, 4, 4, '#ffffff');
                }
            }
        };
        
        console.log('Player created');
    }

    setupLevel() {
        // Add some basic collision for testing
        collisionManager.addStaticCollider(0, CONFIG.PHYSICS.GROUND_Y, this.canvas.width, 100, 'ground');
        
        // Add some test platforms
        collisionManager.addStaticCollider(200, 400, 100, 20, 'platform');
        collisionManager.addStaticCollider(400, 350, 100, 20, 'platform');
        collisionManager.addStaticCollider(600, 300, 100, 20, 'platform');
        
        console.log('Basic level setup complete');
    }

    startGameLoop() {
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        this.deltaTime = Math.min(this.deltaTime, CONFIG.GAME_LOOP.MAX_FRAME_TIME);
        
        // Update FPS counter
        this.updateFPS(currentTime);
        
        // Update performance tracking
        const updateStart = performance.now();
        this.update(this.deltaTime);
        this.performanceData.updateTime = performance.now() - updateStart;
        
        const renderStart = performance.now();
        this.render();
        this.performanceData.renderTime = performance.now() - renderStart;
        
        this.performanceData.frameTime = this.deltaTime;
        
        // Handle input cleanup
        inputManager.clearFrameInputs();
        
        // Continue the loop
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        if (this.gameState !== CONFIG.GAME_STATES.PLAYING) return;
        
        // Handle system inputs
        if (inputManager.isKeyPressed('PAUSE')) {
            this.togglePause();
        }
        
        if (inputManager.isKeyPressed('DEBUG')) {
            this.toggleDebug();
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update camera to follow player
        if (this.player && renderer) {
            renderer.updateCamera(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        }
        
        // Update enemies (placeholder for future implementation)
        this.enemies.forEach(enemy => {
            if (enemy.update) {
                enemy.update(deltaTime);
            }
        });
    }

    render() {
        // Clear the screen
        renderer.clear();
        
        // Render background (placeholder)
        this.renderBackground();
        
        // Render debug colliders
        if (CONFIG.GAME_LOOP.ENABLE_DEBUG) {
            collisionManager.drawDebugColliders(renderer);
        }
        
        // Render player
        if (this.player) {
            this.player.render(renderer);
        }
        
        // Render enemies
        this.enemies.forEach(enemy => {
            if (enemy.render) {
                enemy.render(renderer);
            }
        });
        
        // Render UI
        this.renderUI();
        
        // Render debug information
        if (CONFIG.GAME_LOOP.ENABLE_DEBUG) {
            this.renderDebugInfo();
        }
    }

    renderBackground() {
        // Simple gradient background for now
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#003366');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Simple ground line
        renderer.drawRect(0, CONFIG.PHYSICS.GROUND_Y, this.canvas.width, 2, '#666666');
    }

    renderUI() {
        // Update HUD elements
        if (this.player) {
            const healthPercent = Utils.formatHealth(this.player.health, CONFIG.PLAYER.HEALTH);
            Utils.setElementStyle('healthFill', 'width', healthPercent + '%');
            
            // Update score (placeholder)
            Utils.updateElementText('scoreDisplay', Utils.formatScore(0));
            
            // Update power-up bar (placeholder)
            Utils.setElementStyle('powerupFill', 'width', '0%');
        }
    }

    renderDebugInfo() {
        const debugData = {
            FPS: Math.round(this.fps),
            'Frame Time': this.performanceData.frameTime.toFixed(2) + 'ms',
            'Update Time': this.performanceData.updateTime.toFixed(2) + 'ms',
            'Render Time': this.performanceData.renderTime.toFixed(2) + 'ms',
            'Player X': this.player ? Math.round(this.player.x) : 0,
            'Player Y': this.player ? Math.round(this.player.y) : 0,
            'On Ground': this.player ? this.player.isOnGround : false,
            'Game State': this.gameState
        };
        
        renderer.drawDebugInfo(debugData);
        
        // Update HTML debug info
        Utils.updateElementText('fpsDisplay', Math.round(this.fps));
        Utils.updateElementText('frameTimeDisplay', this.performanceData.frameTime.toFixed(2) + 'ms');
        if (this.player) {
            Utils.updateElementText('playerPosDisplay', 
                `${Math.round(this.player.x)}, ${Math.round(this.player.y)}`);
        }
    }

    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.fpsLastUpdate >= CONFIG.PERFORMANCE.FPS_UPDATE_INTERVAL) {
            this.fps = this.frameCount * 1000 / (currentTime - this.fpsLastUpdate);
            this.frameCount = 0;
            this.fpsLastUpdate = currentTime;
        }
    }

    togglePause() {
        if (this.gameState === CONFIG.GAME_STATES.PLAYING) {
            this.gameState = CONFIG.GAME_STATES.PAUSED;
            console.log('Game paused');
        } else if (this.gameState === CONFIG.GAME_STATES.PAUSED) {
            this.gameState = CONFIG.GAME_STATES.PLAYING;
            console.log('Game resumed');
        }
    }

    toggleDebug() {
        CONFIG.GAME_LOOP.ENABLE_DEBUG = !CONFIG.GAME_LOOP.ENABLE_DEBUG;
        const debugElement = Utils.getElementById('debugInfo');
        if (debugElement) {
            if (CONFIG.GAME_LOOP.ENABLE_DEBUG) {
                debugElement.classList.remove('hidden');
            } else {
                debugElement.classList.add('hidden');
            }
        }
        console.log('Debug mode:', CONFIG.GAME_LOOP.ENABLE_DEBUG ? 'enabled' : 'disabled');
    }

    // Public methods for external control
    getGameState() {
        return this.gameState;
    }

    getPlayer() {
        return this.player;
    }

    getFPS() {
        return this.fps;
    }

    getPerformanceData() {
        return this.performanceData;
    }
}

// Global game instance
let game;
