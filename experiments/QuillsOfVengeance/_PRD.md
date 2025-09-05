# Hedge Cop: Quills of Vengeance
## Product Requirements Document (PRD)

**Version**: 2.0  
**Last Updated**: September 5, 2025  
**Status**: In Development  
**Important**: Reference `_Human.md` for collaboration guidelines and role division during development.

---

### Overview
A classic HTML5-based side-scrolling beat-em-up game featuring Hedge Cop, a police detective with a hedgehog head fighting the Triad in 1990s Hong Kong.

### Core Concept
**Genre**: Side-scrolling beat-em-up  
**Platform**: Web browser (HTML5/CSS/JavaScript)  
**Setting**: Hong Kong, 1990s  
**Art Style**: Pixel art sprites with parallax scrolling backgrounds  

### Main Character
- **Hedge Cop**: Police detective with human body and hedgehog head
- Customizable combat moves and combos
- Combat abilities: Carries a gun, can punch and kick, and can do a quill attack if he is powered up

### Game Structure

#### Levels
- **10 Main Levels**: Progressive difficulty through different Hong Kong locations
  - Level 1: Back alleys of Tsim Sha Tsui
  - Level 2: Neon-lit streets of Mong Kok
  - Level 3: Temple Street Night Market
  - Level 4: Harbor docks and warehouses
  - Level 5: Underground subway tunnels
  - Level 6: Rooftop chase sequence
  - Level 7: Crowded dim sum restaurant
  - Level 8: Abandoned factory district
  - Level 9: Luxury hotel and casino
  - Level 10: Triad headquarters finale

#### Boss Structure
- **2 Minibosses**: 
  - Miniboss 1: After Level 5 (Subway Lieutenant)
  - Miniboss 2: After Level 8 (Factory Overseer)
- **1 Final Boss**: Level 10 (Triad Dragon Head)

#### Story Sequences
- Opening cinematic introducing Hedge Cop and the conflict
- Pre-miniboss cutscenes (2 sequences)
- Pre-final boss dramatic confrontation
- Ending sequence and credits

### Enemy Types

#### Basic Enemies
1. **Street Thugs**: Basic melee attackers
2. **Knife Wielders**: Fast, low-health enemies with blade attacks
3. **Bat Swingers**: Medium-range attackers
4. **Chain Fighters**: Long-range chain whip attacks
5. **Martial Artists**: Combo-heavy enemies with special moves

#### Advanced Enemies
6. **Gunmen**: Ranged attackers requiring cover tactics
7. **Motorcycle Riders**: Mobile enemies that charge across screen
8. **Explosive Specialists**: Throw grenades and dynamite
9. **Heavy Bruisers**: High health, slow but powerful attacks
10. **Acrobats**: Jump and climb, attack from above

### Combat System

#### Basic Controls
- **Movement**: Arrow keys or WASD
- **Attack**: Spacebar or Z key
- **Jump**: Up arrow or W key
- **Special Move**: X key (limited uses)
- **Block/Dodge**: Down arrow or S key

#### Combat Features
- **Combo System**: Chain attacks for higher damage
- **Environmental Interactions**: Use objects as weapons
- **Special Hedgehog Abilities**:
  - Spin Dash: Rolling attack that breaks through groups
  - Spike Shield: Temporary defensive ability
  - Quill Shot: Ranged spike projectiles
- **Health System**: Health bar with pickup items for recovery
- **Score System**: Points for enemies defeated, combos, and level completion time

### Visual Design

#### Graphics Requirements
- **Sprite-based Art**: All characters and objects as 2D sprites
- **Parallax Scrolling**: Multi-layer backgrounds with depth
  - Background layer (distant buildings/sky)
  - Midground layer (street details, signs)
  - Foreground layer (interactive objects)
- **Animation Requirements**:
  - Hedge Cop: Walk, run, jump, attack combo, special moves, hurt, victory
  - Enemies: Walk, attack, hurt, death animations for each type
  - Bosses: Multiple attack patterns, phase transitions
- **UI Elements**: Health bars, score display, special move indicators

#### Art Assets Needed
- Hedge Cop sprite sheets (all animations)
- Enemy sprite sheets (10 types + 3 bosses)
- Background layers for all 10 levels
- UI elements and HUD graphics
- Story sequence illustrations
- Particle effects for hits, explosions, special moves

### Audio Design

#### Music
- **Background Tracks**: Unique music for each level matching Hong Kong atmosphere (provided as MP3 files)
- **Boss Music**: Intense tracks for miniboss and final boss fights (provided as MP3 files)
- **Story Music**: Cinematic tracks for cutscenes (provided as MP3 files)

#### Sound Effects
- Combat sounds (punches, kicks, weapon impacts)
- Hedgehog-specific sounds (rolling, spike attacks)
- Environmental sounds (city ambiance, market chatter)
- UI sounds (menu navigation, score notifications)

### Technical Requirements

#### Performance Targets
- **Frame Rate**: Smooth 60 FPS gameplay
- **Load Times**: Under 3 seconds between levels
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

#### Architectural requirements
- uses Canvas
- Javascript is broken up into functional units across several .js files (config.js, combat.js, rendering.js, levels.js, etc)


#### Technical Features
- **Save System**: Local storage for progress and high scores
- **Settings Menu**: Volume controls, key remapping, graphics quality
- **Pause Functionality**: Ability to pause during gameplay
- **Collision Detection**: Precise hit detection for combat and platforms
- **Physics System**: Realistic movement and object interactions

### User Interface

#### Main Menu
- Start Game
- Continue (if save exists)
- Settings
- Credits
- High Scores

#### In-Game HUD
- Health bar
- Power-up bar
- Total enemies killed display
- Special move availability
- Level progress indicator
- Lives


#### Story Sequences
- Full-screen illustrations
- Text overlay with character dialogue
- Skip option for repeat players
- Auto-advance with manual override

### Progression System

#### Level Progression
- Linear level unlock system

#### Special Moves
- Unlock one Quill Attack when the power-up bar is full.  Each enemy defeat charges the power-up bar. More powerful enemies charge it more than grunts.
- Upgrade existing moves by eating bowls of noodles or dumplings

### Quality Assurance

#### Testing Requirements
- **Gameplay Testing**: Combat feel, difficulty balance, control responsiveness
- **Performance Testing**: Frame rate consistency across different devices
- **Browser Testing**: Compatibility across all target browsers


### Development Phases

#### Phase 1: Core Foundation
- Basic character movement and combat
- Simple enemy AI and collision detection
- One playable level with basic graphics

#### Phase 2: Content Creation
- Implement all enemy types
- Create first 5 levels with parallax backgrounds
- Add story sequences and first miniboss

#### Phase 3: Advanced Features
- Special moves and combo system
- Remaining 5 levels and final boss
- Audio implementation and UI polish

#### Phase 4: Testing and Polish
- Comprehensive testing across platforms
- Performance optimization
- Bug fixes and final balance adjustments

### Risk Assessment

#### Technical Risks
- **Performance Issues**: Complex parallax scrolling may impact frame rate
- **Browser Compatibility**: Ensuring consistent experience across platforms
- **Asset Loading**: Large sprite sheets may cause loading delays

#### Mitigation Strategies
- Optimize graphics and use efficient sprite atlases
- Implement progressive loading for smoother experience
- Create fallback graphics options for lower-end devices

### Success Criteria
- Engaging combat that feels responsive and satisfying
- Authentic 1990s Hong Kong atmosphere through visuals and audio
- Smooth progression difficulty curve keeping players challenged but not frustrated
- Memorable character and story that encourages completion
- Technical stability across all target platforms
