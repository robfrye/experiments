/* Collision Detection System */
class CollisionManager {
    constructor() {
        this.colliders = [];
    }

    // Rectangle collision detection
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Point in rectangle check
    static pointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }

    // Circle collision detection
    static checkCircleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    }

    // Rectangle vs Circle collision
    static checkRectCircleCollision(rect, circle) {
        // Find the closest point on the rectangle to the circle center
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        // Calculate distance between circle center and closest point
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < circle.radius;
    }

    // Get collision bounds for an entity
    static getBounds(entity) {
        return {
            x: entity.x,
            y: entity.y,
            width: entity.width,
            height: entity.height
        };
    }

    // Get collision bounds with offset
    static getBoundsWithOffset(entity, offsetX = 0, offsetY = 0) {
        return {
            x: entity.x + offsetX,
            y: entity.y + offsetY,
            width: entity.width,
            height: entity.height
        };
    }

    // Check collision between two entities
    static checkEntityCollision(entity1, entity2) {
        const bounds1 = this.getBounds(entity1);
        const bounds2 = this.getBounds(entity2);
        return this.checkRectCollision(bounds1, bounds2);
    }

    // Add a static collider (walls, platforms, etc.)
    addStaticCollider(x, y, width, height, type = 'solid') {
        this.colliders.push({
            x, y, width, height, type,
            isStatic: true
        });
    }

    // Remove all colliders
    clearColliders() {
        this.colliders = [];
    }

    // Check collision with all static colliders
    checkStaticCollisions(entity) {
        const entityBounds = CollisionManager.getBounds(entity);
        const collisions = [];

        for (const collider of this.colliders) {
            if (CollisionManager.checkRectCollision(entityBounds, collider)) {
                collisions.push({
                    collider,
                    overlap: this.getOverlap(entityBounds, collider)
                });
            }
        }

        return collisions;
    }

    // Calculate overlap between two rectangles
    getOverlap(rect1, rect2) {
        const overlapX = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - 
                        Math.max(rect1.x, rect2.x);
        const overlapY = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - 
                        Math.max(rect1.y, rect2.y);
        
        return { x: overlapX, y: overlapY };
    }

    // Check if entity will collide at a new position
    wouldCollideAt(entity, newX, newY) {
        const testBounds = {
            x: newX,
            y: newY,
            width: entity.width,
            height: entity.height
        };

        for (const collider of this.colliders) {
            if (CollisionManager.checkRectCollision(testBounds, collider)) {
                return true;
            }
        }

        return false;
    }

    // Resolve collision by moving entity out of collision
    resolveCollision(entity, collision) {
        const { collider, overlap } = collision;
        
        // Determine which direction to push the entity
        if (overlap.x < overlap.y) {
            // Horizontal collision - push left or right
            if (entity.x < collider.x) {
                entity.x = collider.x - entity.width; // Push left
            } else {
                entity.x = collider.x + collider.width; // Push right
            }
        } else {
            // Vertical collision - push up or down
            if (entity.y < collider.y) {
                entity.y = collider.y - entity.height; // Push up
            } else {
                entity.y = collider.y + collider.height; // Push down
            }
        }
    }

    // Check ground collision (for platforming)
    checkGroundCollision(entity, velocityY = 0) {
        const groundY = CONFIG.PHYSICS.GROUND_Y;
        const entityBottom = entity.y + entity.height;
        
        if (entityBottom >= groundY && velocityY >= 0) {
            entity.y = groundY - entity.height;
            return true;
        }
        
        return false;
    }

    // Debug: Draw all colliders
    drawDebugColliders(renderer) {
        if (!CONFIG.GAME_LOOP.ENABLE_DEBUG) return;
        
        for (const collider of this.colliders) {
            const color = collider.type === 'solid' ? '#ff0000' : '#00ff00';
            renderer.drawRect(collider.x, collider.y, collider.width, collider.height, color, false);
        }
    }

    // Get debug information
    getDebugInfo() {
        return {
            colliderCount: this.colliders.length
        };
    }
}

// Global collision manager instance
let collisionManager;
