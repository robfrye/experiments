/* Rendering Engine - Handles all drawing operations */
class RenderingEngine {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.camera = {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        };
        
        // Set up canvas properties
        this.setupCanvas();
    }

    setupCanvas() {
        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // Set default text properties
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.font = '16px Arial';
    }

    // Clear the entire canvas
    clear() {
        this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw a rectangle (for debugging and simple shapes)
    drawRect(x, y, width, height, color = '#ffffff', filled = true) {
        // Apply camera offset
        const screenX = x - this.camera.x;
        const screenY = y - this.camera.y;
        
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        
        if (filled) {
            this.ctx.fillRect(screenX, screenY, width, height);
        } else {
            this.ctx.strokeRect(screenX, screenY, width, height);
        }
    }

    // Draw a circle (for debugging collision bounds)
    drawCircle(x, y, radius, color = '#ffffff', filled = true) {
        const screenX = x - this.camera.x;
        const screenY = y - this.camera.y;
        
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        
        if (filled) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }

    // Draw text
    drawText(text, x, y, color = '#ffffff', font = '16px Arial') {
        const screenX = x - this.camera.x;
        const screenY = y - this.camera.y;
        
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, screenX, screenY);
    }

    // Draw an image/sprite
    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!image || !image.complete) return;
        
        const screenX = dx - this.camera.x;
        const screenY = dy - this.camera.y;
        
        try {
            if (arguments.length === 9) {
                // Draw with source and destination rectangles
                this.ctx.drawImage(image, sx, sy, sw, sh, screenX, screenY, dw, dh);
            } else if (arguments.length === 5) {
                // Draw with destination position and size
                this.ctx.drawImage(image, screenX, screenY, sx, sy);
            } else if (arguments.length === 3) {
                // Draw at position with original size
                this.ctx.drawImage(image, screenX, screenY);
            }
        } catch (error) {
            console.warn('Error drawing image:', error);
        }
    }

    // Draw a sprite from a sprite sheet
    drawSprite(spriteSheet, frameX, frameY, frameWidth, frameHeight, x, y, width = frameWidth, height = frameHeight) {
        if (!spriteSheet || !spriteSheet.complete) return;
        
        this.drawImage(
            spriteSheet,
            frameX, frameY, frameWidth, frameHeight,
            x, y, width, height
        );
    }

    // Update camera position
    updateCamera(targetX, targetY) {
        // Simple camera following with some smoothing
        const smoothing = 0.1;
        const targetCameraX = targetX - this.camera.width / 2;
        const targetCameraY = targetY - this.camera.height / 2;
        
        this.camera.x += (targetCameraX - this.camera.x) * smoothing;
        this.camera.y += (targetCameraY - this.camera.y) * smoothing;
        
        // Keep camera within bounds (will be updated when levels are implemented)
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.y = Math.max(0, this.camera.y);
    }

    // Set camera position directly
    setCameraPosition(x, y) {
        this.camera.x = x;
        this.camera.y = y;
    }

    // Get camera bounds for culling
    getCameraBounds() {
        return {
            left: this.camera.x,
            right: this.camera.x + this.camera.width,
            top: this.camera.y,
            bottom: this.camera.y + this.camera.height
        };
    }

    // Check if an object is visible in the camera view
    isInView(x, y, width, height) {
        const bounds = this.getCameraBounds();
        return !(x + width < bounds.left || 
                x > bounds.right || 
                y + height < bounds.top || 
                y > bounds.bottom);
    }

    // Save and restore context state
    saveState() {
        this.ctx.save();
    }

    restoreState() {
        this.ctx.restore();
    }

    // Set global alpha for transparency effects
    setGlobalAlpha(alpha) {
        this.ctx.globalAlpha = alpha;
    }

    // Reset global alpha
    resetGlobalAlpha() {
        this.ctx.globalAlpha = 1.0;
    }

    // Draw debug information
    drawDebugInfo(debugData) {
        if (!CONFIG.GAME_LOOP.ENABLE_DEBUG) return;
        
        this.saveState();
        this.setCameraPosition(0, 0); // Draw debug info in screen space
        
        let y = 10;
        const lineHeight = 20;
        
        // Draw background for debug text
        this.drawRect(5, 5, 200, Object.keys(debugData).length * lineHeight + 10, 'rgba(0, 0, 0, 0.7)');
        
        for (const [key, value] of Object.entries(debugData)) {
            this.drawText(`${key}: ${value}`, 10, y, '#00ff00', '14px monospace');
            y += lineHeight;
        }
        
        this.restoreState();
    }
}

// Global rendering engine instance
let renderer;
