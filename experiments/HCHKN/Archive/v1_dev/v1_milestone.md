# Development Milestones
## Hedge Cop: Hong Kong Nights

### Overview
This document breaks down the development of the hedgehog detective platformer into manageable milestones. Each milestone represents a key development phase with specific deliverables and acceptance criteria.

**📝 Progress Tracking Instructions:**
After completing each milestone, update the `Progress.md` file with:
- Milestone status (Not started, Complete, Problems)
- Completion date
- Notes about implementation or issues encountered
- Next steps or blockers

**📁 File Archiving Instructions:**
Before starting each milestone (except Milestone 1), archive the current working files:
1. Create an `Archive` folder in the project root if it doesn't exist
2. Create a subfolder named `Milestone-X` (where X is the previous milestone number)
3. Copy the current `index.html`, `style.css`, and `script.js` files into the milestone subfolder
4. Continue development with the files in the root directory

**Example Archive Structure:**
```
/game
├── Archive/
│   ├── Milestone-1/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── Milestone-2/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── ...
├── index.html (current working version)
├── style.css (current working version)
└── script.js (current working version)
```

---

## Milestone 1: Project Foundation & Basic Structure
**Priority**: Critical  
**Estimated Effort**: 1-2 hours  
**Dependencies**: None  

### Deliverables
- [ ] Create `index.html` with basic HTML5 structure
- [ ] Set up HTML5 Canvas element for game rendering
- [ ] Create `style.css` with initial styling and canvas setup
- [ ] Create `script.js` with basic game initialization
- [ ] Implement basic game loop (update/render cycle)
- [ ] Test canvas rendering with simple shapes

### Acceptance Criteria
- All three files created and properly linked
- Canvas displays and can render basic shapes
- Game loop runs at consistent frame rate
- No console errors in browser
- File structure adheres to 3-file constraint

**➡️ Update Progress.md upon completion**

---

## Milestone 2: Player Character & Core Movement
**Priority**: Critical  
**Estimated Effort**: 3-4 hours  
**Dependencies**: Milestone 1  

### Deliverables
- [ ] **Archive Milestone 1 files** in `Archive/Milestone-1/` folder
- [ ] Implement player character object/class
- [ ] Create basic hedgehog detective sprite (placeholder rectangle initially)
- [ ] Implement arrow key input handling
- [ ] Add left/right movement with physics
- [ ] Implement spacebar jump with gravity
- [ ] Add ground collision detection
- [ ] Create basic animation system for movement states

### Acceptance Criteria
- Player character moves left/right with arrow keys
- Spacebar jumping works with realistic gravity
- Character cannot move through ground/platforms
- Basic movement animations play correctly
- Controls are responsive with minimal lag

**➡️ Update Progress.md upon completion**

---

## Milestone 3: Combat System & Weapon Switching
**Priority**: High  
**Estimated Effort**: 2-3 hours  
**Dependencies**: Milestone 2  

### Deliverables
- [ ] **Archive Milestone 2 files** in `Archive/Milestone-2/` folder
- [ ] Implement Z key attack functionality
- [ ] Create punch attack with melee range
- [ ] Create gun attack with projectile system
- [ ] Implement X key weapon switching
- [ ] Add attack animations for both weapons
- [ ] Create projectile physics for gun shots
- [ ] Add visual feedback for current weapon

### Acceptance Criteria
- Z key triggers attack based on current weapon
- X key successfully switches between punch and gun
- Punch attack has short-range melee collision
- Gun attack fires projectiles across screen
- Attack animations play smoothly
- Current weapon is visually indicated

**➡️ Update Progress.md upon completion**

---

## Milestone 4: Enemy System & AI
**Priority**: High  
**Estimated Effort**: 4-5 hours  
**Dependencies**: Milestone 3  

### Deliverables
- [ ] **Archive Milestone 3 files** in `Archive/Milestone-3/` folder
- [ ] Create enemy object system
- [ ] Implement Triad gangster car enemies
- [ ] Implement Triad gangster motorcycle enemies
- [ ] Add basic AI movement patterns
- [ ] Implement enemy-player collision detection
- [ ] Add enemy defeat mechanics
- [ ] Create enemy spawn system

### Acceptance Criteria
- Car and motorcycle enemies spawn and move
- Enemies follow basic patrol/attack patterns
- Player can defeat enemies with both weapon types
- Enemy collisions damage player appropriately
- Defeated enemies are removed from game
- Multiple enemies can exist simultaneously

**➡️ Update Progress.md upon completion**

---

## Milestone 5: Health & Lives System
**Priority**: High  
**Estimated Effort**: 2-3 hours  
**Dependencies**: Milestone 4  

### Deliverables
- [ ] **Archive Milestone 4 files** in `Archive/Milestone-4/` folder
- [ ] Implement player health point (HP) system
- [ ] Create lives counter system
- [ ] Add dumpling collectibles (small health restoration)
- [ ] Add noodle soup collectibles (large health restoration)
- [ ] Implement player death and respawn mechanics
- [ ] Create game over state when lives depleted

### Acceptance Criteria
- Player takes damage from enemy collisions
- Health decreases appropriately with damage
- Dumplings restore small amount of health
- Noodle soup restores larger amount of health
- Player loses life when health reaches zero
- Game over occurs when all lives lost

**➡️ Update Progress.md upon completion**

---

## Milestone 6: User Interface & HUD
**Priority**: Medium  
**Estimated Effort**: 2-3 hours  
**Dependencies**: Milestone 5  

### Deliverables
- [ ] **Archive Milestone 5 files** in `Archive/Milestone-5/` folder
- [ ] Create title screen with "Click to start" message
- [ ] Implement in-game HUD display
- [ ] Add lives counter visualization
- [ ] Add health bar/points display
- [ ] Add current weapon indicator
- [ ] Implement game state management (title → game → game over)
- [ ] Add basic pause functionality (optional)

### Acceptance Criteria
- Title screen displays correctly with proper styling
- Clicking title screen starts the game
- HUD shows current lives, health, and weapon
- HUD updates in real-time during gameplay
- Game states transition smoothly
- UI elements don't interfere with gameplay

**➡️ Update Progress.md upon completion**

---

## Milestone 7: Visual Design & 16-bit Art Style
**Priority**: Medium  
**Estimated Effort**: 4-6 hours  
**Dependencies**: Milestone 6  

### Deliverables
- [ ] **Archive Milestone 6 files** in `Archive/Milestone-6/` folder
- [ ] Replace placeholder sprites with pixel art hedgehog detective
- [ ] Create 16-bit style enemy vehicle sprites
- [ ] Design Hong Kong 1990s background environment
- [ ] Implement scrolling background system
- [ ] Create pixel art food collectibles (dumplings, noodle soup)
- [ ] Add neon-influenced color palette
- [ ] Implement sprite animation frames

### Acceptance Criteria
- All game elements use consistent 16-bit pixel art style
- Hedgehog detective character is visually distinctive
- Enemy vehicles look like Hong Kong 1990s style
- Background scrolls smoothly with player movement
- Food items are clearly recognizable
- Overall aesthetic matches Hong Kong 1990s theme

**➡️ Update Progress.md upon completion**

---

## Milestone 8: Level Design & Platform System
**Priority**: Medium  
**Estimated Effort**: 3-4 hours  
**Dependencies**: Milestone 7  

### Deliverables
- [ ] **Archive Milestone 7 files** in `Archive/Milestone-7/` folder
- [ ] Create platform collision system
- [ ] Design level layout with multiple platform heights
- [ ] Implement side-scrolling camera system
- [ ] Add environmental obstacles and decorations
- [ ] Place enemies strategically throughout level
- [ ] Position health collectibles appropriately
- [ ] Create level boundaries and end conditions

### Acceptance Criteria
- Player can jump between platforms of different heights
- Camera follows player smoothly during side-scrolling
- Level has interesting and challenging layout
- Enemy placement creates engaging gameplay
- Collectibles are positioned to reward exploration
- Level has clear progression from start to end

**➡️ Update Progress.md upon completion**

---

## Milestone 9: Audio Integration (Optional)
**Priority**: Low  
**Estimated Effort**: 2-3 hours  
**Dependencies**: Milestone 8  

### Deliverables
- [ ] **Archive Milestone 8 files** in `Archive/Milestone-8/` folder
- [ ] Source Hong Kong 1990s inspired background music from CDN
- [ ] Add jump sound effects
- [ ] Add attack sound effects (punch and gun)
- [ ] Add enemy defeat sound effects
- [ ] Add health pickup sound effects
- [ ] Implement audio management system
- [ ] Add audio on/off toggle

### Acceptance Criteria
- Background music plays and loops appropriately
- Sound effects trigger at correct moments
- Audio enhances gameplay without being intrusive
- All audio loads from CDN sources only
- Audio toggle works for user preference
- No audio-related performance issues

**➡️ Update Progress.md upon completion**

---

## Milestone 10: Testing, Optimization & Polish
**Priority**: High  
**Estimated Effort**: 2-4 hours  
**Dependencies**: All previous milestones  

### Deliverables
- [ ] **Archive Milestone 9 files** in `Archive/Milestone-9/` folder

- [ ] Performance optimization and frame rate consistency
- [ ] Bug fixes and edge case handling
- [ ] Code cleanup and organization
- [ ] Final balance adjustments (difficulty, health, etc.)
- [ ] Documentation cleanup
- [ ] Final quality assurance testing

### Acceptance Criteria

- No critical bugs or game-breaking issues
- All controls work consistently across browsers
- Game difficulty is balanced and fair
- Code is clean and well-organized
- All PRD requirements are fully implemented

**➡️ Update Progress.md upon completion**

---

## Development Notes

### Critical Path
Milestones 1-6 represent the critical path for a minimum viable game. Milestones 7-10 add polish and completeness.

### Risk Mitigation
- Test frequently after each milestone
- Keep three-file constraint in mind during all development
- Prioritize core gameplay over visual polish initially
- Use CDN resources to avoid dependency issues

### Success Metrics
- All milestone acceptance criteria met
- Game meets all PRD requirements
- Smooth, enjoyable gameplay experience
- Consistent 16-bit pixel art aesthetic
- No critical performance or compatibility issues
