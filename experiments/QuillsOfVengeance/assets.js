/* Asset Loading System */
class AssetManager {
    constructor() {
        this.images = new Map();
        this.audio = new Map();
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.loadingCallbacks = [];
    }

    // Load an image asset
    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(key, img);
                this.loadedAssets++;
                this.checkLoadingComplete();
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                // Create a placeholder image
                const placeholder = this.createPlaceholderImage(32, 32);
                this.images.set(key, placeholder);
                this.loadedAssets++;
                this.checkLoadingComplete();
                resolve(placeholder);
            };
            
            img.src = src;
            this.totalAssets++;
        });
    }

    // Load an audio asset
    loadAudio(key, src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                this.audio.set(key, audio);
                this.loadedAssets++;
                this.checkLoadingComplete();
                resolve(audio);
            };
            
            audio.onerror = () => {
                console.warn(`Failed to load audio: ${src}`);
                this.loadedAssets++;
                this.checkLoadingComplete();
                resolve(null);
            };
            
            audio.src = src;
            this.totalAssets++;
        });
    }

    // Create a placeholder image when actual image fails to load
    createPlaceholderImage(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple placeholder pattern
        ctx.fillStyle = '#ff00ff'; // Magenta background
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width / 2, height / 2);
        ctx.fillRect(width / 2, height / 2, width / 2, height / 2);
        
        return canvas;
    }

    // Get a loaded image
    getImage(key) {
        return this.images.get(key);
    }

    // Get a loaded audio
    getAudio(key) {
        return this.audio.get(key);
    }

    // Check if asset exists
    hasImage(key) {
        return this.images.has(key);
    }

    hasAudio(key) {
        return this.audio.has(key);
    }

    // Get loading progress (0 to 1)
    getLoadingProgress() {
        if (this.totalAssets === 0) return 1;
        return this.loadedAssets / this.totalAssets;
    }

    // Check if all assets are loaded
    isLoaded() {
        return this.loadedAssets >= this.totalAssets && this.totalAssets > 0;
    }

    // Add callback for when loading is complete
    onLoadingComplete(callback) {
        if (this.isLoaded()) {
            callback();
        } else {
            this.loadingCallbacks.push(callback);
        }
    }

    // Check and trigger loading complete callbacks
    checkLoadingComplete() {
        if (this.isLoaded()) {
            this.loadingCallbacks.forEach(callback => callback());
            this.loadingCallbacks = [];
        }
    }

    // Load all assets defined in CONFIG
    async loadAllAssets() {
        const imagePromises = [];
        const audioPromises = [];

        // Load all images from config
        for (const [key, src] of Object.entries(CONFIG.ASSETS.IMAGES)) {
            imagePromises.push(this.loadImage(key, src));
        }

        // Load all audio from config
        for (const [key, src] of Object.entries(CONFIG.ASSETS.AUDIO)) {
            audioPromises.push(this.loadAudio(key, src));
        }

        // Create some placeholder assets for development
        this.createDevelopmentAssets();

        try {
            await Promise.all([...imagePromises, ...audioPromises]);
            console.log('All assets loaded successfully');
        } catch (error) {
            console.warn('Some assets failed to load:', error);
        }
    }

    // Create placeholder assets for development
    createDevelopmentAssets() {
        // Create placeholder Hedge Cop sprite
        const hedgeCopSprite = this.createCharacterSprite(32, 48, '#4a4a4a', '#8b4513'); // Gray hedgehog with brown spikes
        this.images.set('HEDGE_COP_PLACEHOLDER', hedgeCopSprite);
        
        // Create placeholder enemy sprite
        const enemySprite = this.createCharacterSprite(32, 48, '#800000', '#000000'); // Dark red enemy
        this.images.set('ENEMY_PLACEHOLDER', enemySprite);
        
        this.totalAssets += 2;
        this.loadedAssets += 2;
    }

    // Create a simple character sprite
    createCharacterSprite(width, height, bodyColor, accentColor) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(8, 16, 16, 24); // Body
        ctx.fillRect(12, 8, 8, 16); // Head
        
        // Accent details
        ctx.fillStyle = accentColor;
        ctx.fillRect(6, 6, 4, 4); // Spikes/hair
        ctx.fillRect(22, 6, 4, 4);
        ctx.fillRect(14, 4, 4, 4);
        
        // Simple face
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, 10, 2, 2); // Eyes
        ctx.fillRect(17, 10, 2, 2);
        
        return canvas;
    }

    // Play audio with error handling
    playAudio(key, volume = 1.0, loop = false) {
        const audio = this.getAudio(key);
        if (audio) {
            try {
                audio.volume = volume;
                audio.loop = loop;
                audio.currentTime = 0;
                audio.play();
            } catch (error) {
                console.warn(`Error playing audio ${key}:`, error);
            }
        }
    }

    // Stop audio
    stopAudio(key) {
        const audio = this.getAudio(key);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // Get debug information
    getDebugInfo() {
        return {
            imagesLoaded: this.images.size,
            audioLoaded: this.audio.size,
            loadingProgress: Math.round(this.getLoadingProgress() * 100) + '%'
        };
    }
}

// Global asset manager instance
let assetManager;
