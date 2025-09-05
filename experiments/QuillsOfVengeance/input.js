/* Input Manager - Handles keyboard input and key bindings */
class InputManager {
    constructor() {
        this.keys = {};
        this.keyPressed = {};
        this.keyReleased = {};
        this.keyMap = this.createKeyMap();
        
        this.setupEventListeners();
    }

    createKeyMap() {
        const map = {};
        
        // Create reverse mapping from CONFIG.INPUT.KEYS
        for (const [action, keyCodes] of Object.entries(CONFIG.INPUT.KEYS)) {
            keyCodes.forEach(keyCode => {
                if (!map[keyCode]) {
                    map[keyCode] = [];
                }
                map[keyCode].push(action);
            });
        }
        
        return map;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });

        // Prevent default behavior for game keys
        document.addEventListener('keydown', (event) => {
            if (this.keyMap[event.code]) {
                event.preventDefault();
            }
        });
    }

    handleKeyDown(event) {
        const keyCode = event.code;
        const actions = this.keyMap[keyCode];
        
        if (actions) {
            actions.forEach(action => {
                if (!this.keys[action]) {
                    this.keyPressed[action] = true;
                }
                this.keys[action] = true;
            });
        }
    }

    handleKeyUp(event) {
        const keyCode = event.code;
        const actions = this.keyMap[keyCode];
        
        if (actions) {
            actions.forEach(action => {
                this.keys[action] = false;
                this.keyReleased[action] = true;
            });
        }
    }

    // Check if key is currently being held down
    isKeyDown(action) {
        return !!this.keys[action];
    }

    // Check if key was just pressed this frame
    isKeyPressed(action) {
        return !!this.keyPressed[action];
    }

    // Check if key was just released this frame
    isKeyReleased(action) {
        return !!this.keyReleased[action];
    }

    // Get horizontal movement input (-1, 0, or 1)
    getHorizontalInput() {
        let horizontal = 0;
        if (this.isKeyDown('LEFT')) horizontal -= 1;
        if (this.isKeyDown('RIGHT')) horizontal += 1;
        return horizontal;
    }

    // Get vertical movement input (-1, 0, or 1)
    getVerticalInput() {
        let vertical = 0;
        if (this.isKeyDown('UP')) vertical -= 1;
        if (this.isKeyDown('DOWN')) vertical += 1;
        return vertical;
    }

    // Clear frame-specific input states (call at end of each frame)
    clearFrameInputs() {
        this.keyPressed = {};
        this.keyReleased = {};
    }

    // Get all currently pressed action names
    getPressedActions() {
        return Object.keys(this.keys).filter(action => this.keys[action]);
    }

    // Debug: Get raw key states
    getDebugInfo() {
        return {
            activeKeys: this.getPressedActions(),
            horizontal: this.getHorizontalInput(),
            vertical: this.getVerticalInput()
        };
    }
}

// Create global input manager instance
let inputManager;
