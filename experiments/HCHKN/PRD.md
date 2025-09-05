# Product Requirements Document (PRD)
## Hedge Cop: Hong Kong Nights

### Project Overview
A classic side-scrolling platformer game featuring a detective with a hedgehog head and human body, set in 1990s Hong Kong. The game will be built using only HTML, CSS, and JavaScript with a 16-bit pixel art aesthetic.

### Technical Requirements
- **Platform**: Web-based HTML application
- **File Structure**: Modular JavaScript architecture
  - `index.html` - Main HTML structure
  - `style.css` - All styling and visual presentation
  - `script.js` folder containing modular JavaScript files:

- **Dependencies**: Only CDN-based libraries allowed (no local dependencies)
- **Browser Compatibility**: Modern browsers with HTML5 Canvas support

### Game Concept
**Genre**: Side-scrolling platformer  
**Setting**: Hong Kong, 1990s  
**Art Style**: 16-bit pixel art  
**Main Character**: Detective with hedgehog head and human body  

### Core Gameplay Mechanics

#### Player Controls
- **Movement**: Arrow keys or WASD (left/right for horizontal movement, up/W for jump)
- **Jump**: Spacebar or W key (with double jump capability)
- **Attack**: X key, J key, or Enter (police baton melee combat)
- **Pause**: ESC or P key
- **Restart**: R key (when game over)
- **Debug Controls**: F3 (toggle debug info), F4 (god mode), F5 (next level) - only in debug mode

#### Combat System
- **Police Baton Attack**: Melee combat with medium range and police-themed animation
- **Attack Combo System**: Timing-based attacks for increased damage
- **Projectile System**: Player bullets for ranged combat (if weapon pickups are implemented)
- **Screen Shake Effects**: Visual feedback for impacts and explosions
- **Hit Markers**: Damage number display for combat feedback

#### Health & Lives System
- **Hit Points (HP)**: Numeric health system
- **Lives**: Multiple life system with respawn mechanics
- **Health Recovery**: 
  - Dumplings: Small health restoration
  - Noodle soup: Larger health restoration

#### Enemy System
- **Triad Gangsters**: Primary enemy type
- **Vehicle-based enemies**:
  - Car-driving gangsters
  - Motorcycle-riding gangsters
- **Enemy AI**: Basic patrol and attack patterns
- **Collision detection**: Player-enemy interaction system

### User Interface Requirements

#### Title Screen
- **Main Message**: "Click to start" prominently displayed
- **Visual Theme**: Hong Kong 1990s aesthetic with pixel art styling
- **Navigation**: Single click to begin game

#### In-Game HUD
- **Lives Counter**: Visual representation of remaining lives
- **Health Bar/Points**: Current HP display
- **Weapon Indicator**: Show current weapon (punch/gun)
- **Score Display**: Optional scoring system

### Visual Design Specifications

#### Art Style Guidelines
- **Resolution**: 16-bit inspired pixel art
- **Color Palette**: Hong Kong 1990s neon-influenced colors
- **Character Design**:
  - Hedgehog head with spiky features
  - Human body in detective attire (coat, hat, etc.)
  - Pixel art sprite animations for movement and combat

#### Environment Design
- **Background**: Hong Kong cityscape with 1990s architecture
- **Platforms**: Urban environment elements (buildings, fire escapes, rooftops)
- **Atmospheric Elements**: Neon signs, street lights, urban decay

#### Animation Requirements
- **Player Character**:
  - Idle animation
  - Walking/running cycle
  - Jumping animation
  - Punch attack animation
  - Gun firing animation
- **Enemies**:
  - Vehicle movement animations
  - Attack animations
  - Death/defeat animations
- **Environment**:
  - Scrolling background
  - Interactive elements (food items, collectibles)

### Game Flow & Structure

#### Game States
1. **Title Screen**: Initial landing page
2. **Game Play**: Main platformer experience
3. **Game Over**: End state with restart option
4. **Pause State**: Optional pause functionality

#### Level Design
- **Side-scrolling progression**: Left-to-right movement through level
- **Platform variety**: Different height platforms and obstacles
- **Enemy placement**: Strategic positioning of gangster vehicles
- **Collectible placement**: Dumplings and noodle soup distribution

### Technical Implementation Guidelines

#### Performance Requirements
- **Frame Rate**: Smooth 60fps gameplay
- **Responsive Controls**: Minimal input lag
- **Memory Management**: Efficient sprite and audio handling
- **Loading Time**: Quick initialization and asset loading

#### Browser Compatibility
- **Canvas Support**: HTML5 Canvas for game rendering
- **Audio Support**: Web Audio API or HTML5 audio elements
- **Input Handling**: Keyboard event listeners
- **Responsive Design**: Adaptable to different screen sizes

#### Code Organization
- **Modular Architecture**: Organized into functional JavaScript modules
- **Event-driven Systems**: Clean separation of concerns between game systems
- **Asset Management**: Efficient loading and caching of sprites/audio
- **Component-based Design**: Reusable game object components
- **State Management**: Centralized game state with screen transitions
- **Performance Monitoring**: Built-in FPS counter and performance utilities

### Audio Requirements
- **Procedural Audio Generation**: Web Audio API-based sound synthesis
- **Background Music**: Dynamic music system with level-specific themes
- **Sound Effects**:
  - Jump sounds (normal and double jump)
  - Police baton attack sounds
  - Enemy defeat sounds
  - Health pickup sounds
  - Menu navigation sounds
  - Game state transition sounds
- **Audio Management**: Volume controls and mute functionality

### Success Criteria
- **Playability**: Complete game loop from title to game over
- **Controls**: All specified controls working correctly
- **Visual Appeal**: Consistent 16-bit pixel art style
- **Performance**: Smooth gameplay experience
- **Theme Consistency**: Strong Hong Kong 1990s detective atmosphere

### Future Enhancement Considerations
- **Multiple Levels**: Expandable level system
- **Power-ups**: Additional gameplay mechanics
- **Boss Battles**: Special enemy encounters
- **Score System**: Competitive gameplay elements
- **Local Storage**: Save progress and high scores

### Development Priorities
1. **Core Movement & Controls**: Player character movement and jumping
2. **Basic Combat**: Punch and gun attack implementation
3. **Enemy System**: Triad gangster vehicles and collision
4. **Health System**: HP, lives, and food collection
5. **Visual Polish**: Pixel art implementation and animations
6. **UI/UX**: Title screen and in-game interface
7. **Audio Integration**: Sound effects and music
8. **Testing & Optimization**: Cross-browser compatibility and performance

---

**Target Completion**: Fully functional multi-level platformer game with modular JavaScript architecture, featuring 6 levels, procedural audio, and enhanced game mechanics.

---

## Hedge Cop: Hong Kong Nights v2

### Overview
Building upon the successful v1 foundation, v2 will expand the game into a full-featured platformer experience with multiple levels, enhanced audio, expanded enemy roster, and improved character design to better emphasize the unique hedgehog-human hybrid protagonist.

### v2 Core Features

#### Level Progression System
- **Multiple Levels**: Minimum of 4-6 distinct levels with unique themes
  - **Level 1**: Street Level - Urban Hong Kong streets and alleys
  - **Level 2**: Rooftops - High-rise building traversal
  - **Level 3**: Harbor District - Docks and waterfront areas
  - **Level 4**: Neon District - Dense commercial area with bright signage
  - **Level 5**: Triad Hideout - Industrial complex (boss level)
  - **Level 6**: Final Showdown - Skyscraper penthouse finale

- **Level Progression Mechanics**:
  - Clear victory conditions for each level
  - Seamless transition between levels
  - Progressive difficulty scaling
  - Unlockable level system with save progress
  - Level selection screen with completion status

- **Level Design Variety**:
  - Unique platform layouts per level
  - Environment-specific obstacles and challenges
  - Distinct visual themes while maintaining Hong Kong aesthetic
  - Hidden areas and secret collectibles
  - Environmental storytelling through level design

#### Background Music System
- **Dynamic Audio Experience**:
  - Unique background music track for each level
  - Title screen theme music
  - Victory/completion fanfares
  - Game over music

- **Music Style Requirements**:
  - 1990s Hong Kong action movie inspired soundtrack
  - Synthesizer-heavy compositions matching the neon aesthetic
  - Looping tracks that don't become repetitive
  - Smooth transitions between game states

- **Audio Implementation**:
  - Web Audio API integration for better performance
  - Volume controls and audio toggle functionality
  - Compressed audio files for fast loading
  - Fallback audio support for older browsers

#### Expanded Enemy Roster
- **Enhanced Vehicle Enemies**:
  - **Sports Cars**: Fast-moving with erratic patterns
  - **Delivery Trucks**: Slow but heavily armored
  - **Police Cars**: Sirens and pursuit behavior
  - **Motorcycles**: Quick, agile enemies with jump capabilities

- **On-Foot Gangster Units**:
  - **Knife Thugs**: Melee enemies with lunge attacks
  - **Gun Thugs**: Ranged enemies with cover-seeking AI
  - **Heavy Gangsters**: Armored enemies requiring multiple hits
  - **Boss Characters**: Unique enemies with special attack patterns

- **Enemy Behavior Systems**:
  - Advanced AI with different aggression levels
  - Coordinated group attacks
  - Environmental interaction (using cover, obstacles)
  - Varied attack patterns per enemy type
  - Dynamic enemy spawning based on player progress

#### Character Design Improvements
- **Enhanced Hedgehog Features**:
  - More pronounced spiky hedgehog characteristics
  - Detailed facial expressions with hedgehog snout
  - Hedgehog-like ears and eye design
  - Spiky hair/quills that react to movement and combat

- **Human Body Refinements**:
  - More detailed detective attire (trench coat, fedora, tie)
  - Professional stance and animations
  - Human proportions with hedgehog head integration
  - Improved walking and running animations

- **Animation Enhancements**:
  - Smoother sprite transitions
  - More frames per animation cycle
  - Hedgehog-specific idle animations (quill rustling)
  - Combat animations that emphasize both hedgehog and human traits
  - Emotional expressions during gameplay events

- **Character Customization** (Stretch Goal):
  - Unlockable detective outfit variations
  - Different hedgehog color schemes
  - Accessory options (sunglasses, different hats)

### v2 Technical Requirements

#### v2 Technical Requirements

#### Enhanced Performance
- **Optimized Rendering**: Improved sprite batching and culling with modular rendering system
- **Memory Management**: Better asset loading and garbage collection with object pooling
- **Scalable Architecture**: Modular JavaScript file structure with clear separation of concerns
- **Save System**: Local storage for progress and settings via utility modules

#### Advanced Game Mechanics
- **Power-up System**: Temporary abilities and weapon upgrades
- **Score System**: Points for enemies defeated, items collected, level completion
- **Achievement System**: Unlockable rewards for specific accomplishments
- **Difficulty Settings**: Easy, Normal, Hard modes with adjusted enemy behavior
- **Visual Effects System**: Screen shake, particle effects, and hit markers
- **Level Management**: Dynamic level loading with camera system and platform management

#### User Interface Enhancements
- **Level Selection Menu**: Visual level progression with unlock status
- **Settings Screen**: Audio, controls, and gameplay options
- **Pause Menu**: Enhanced pause functionality with resume/restart options
- **Loading Screens**: Smooth transitions between levels with tips/lore

### v2 Development Phases

#### Phase 1: Foundation Expansion
- Multi-level architecture implementation
- Basic level transition system
- Enhanced character sprite design

#### Phase 2: Audio Integration
- Background music system implementation
- Sound effect library expansion
- Audio settings and controls

#### Phase 3: Enemy Expansion
- New enemy types and behaviors
- Advanced AI implementation
- Boss battle mechanics

#### Phase 4: Polish & Enhancement
- Character design refinements
- UI/UX improvements
- Performance optimization
- Testing and bug fixes

### v2 Success Criteria
- **Complete Level Progression**: All levels playable from start to finish
- **Audio Excellence**: Immersive soundtrack enhancing gameplay experience
- **Enemy Variety**: Engaging combat with diverse enemy encounters
- **Character Identity**: Clear hedgehog-human hybrid visual identity
- **Performance**: Smooth gameplay across all levels and features
- **User Experience**: Intuitive navigation and progression systems

### v2 Future Considerations
- **Multiplayer Co-op**: Local two-player support
- **Level Editor**: User-generated content capabilities
- **Mobile Adaptation**: Touch control implementation
- **Expanded Storyline**: Cutscenes and narrative elements
- **Merchandise Potential**: Character design suitable for broader media

---

**v2 Target Completion**: Full-featured multi-level platformer with enhanced audio, expanded gameplay, distinctive character design, and modular JavaScript architecture for maintainability and extensibility.
