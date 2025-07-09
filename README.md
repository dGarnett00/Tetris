# Tetris Game

A fully functional, professional Tetris game built with HTML5, CSS3, and JavaScript. Features a modular architecture designed for easy expansion and maintenance.

## 🎮 Features

- **Complete Tetris gameplay** with all 7 standard pieces (I, O, T, S, Z, J, L)
- **Ghost piece preview** showing where the current piece will land
- **Next piece preview** in the side panel
- **Progressive difficulty** with increasing speed and levels
- **Score system** with bonuses for line clears and combos
- **Responsive design** that works on different screen sizes
- **Professional animations** and visual effects
- **Keyboard controls** with proper key repeat handling
- **Pause/Resume functionality**
- **Game over detection** and restart capability

## 🚀 How to Play

1. Open `index.html` in a web browser
2. Press **SPACE** to start the game
3. Use the **arrow keys** to control pieces:
   - **←/→**: Move left/right
   - **↑**: Rotate piece
   - **↓**: Soft drop (faster fall)
   - **SPACE**: Hard drop (instant drop)
   - **P**: Pause/Resume game

## 📁 Project Structure

```
Tetris/
├── index.html                 # Main HTML file
├── styles/                    # CSS Stylesheets
│   ├── main.css              # Main layout and base styles
│   ├── game-board.css        # Game board specific styles
│   ├── ui.css                # UI components styles
│   └── animations.css        # Animation styles
├── js/                       # JavaScript modules
│   ├── core/                 # Core game systems
│   │   ├── constants.js      # Game constants and configuration
│   │   └── game-state.js     # Game state management
│   ├── components/           # Game components
│   │   ├── board.js          # Game board logic
│   │   ├── piece.js          # Tetris piece logic
│   │   └── shapes.js         # Piece shape definitions
│   ├── systems/              # Game systems
│   │   ├── input-handler.js  # Input handling system
│   │   ├── collision-detector.js # Collision detection
│   │   ├── line-clearer.js   # Line clearing logic
│   │   └── score-manager.js  # Score calculation and management
│   ├── game/                 # Main game logic
│   │   ├── game-loop.js      # Game loop and timing
│   │   ├── game-renderer.js  # Rendering system
│   │   └── game-manager.js   # Main game controller
│   └── main.js               # Entry point and initialization
└── README.md                 # This file
```

## 🏗️ Architecture

### Modular Design
The game is built with a highly modular architecture where each component has a specific responsibility:

- **Core**: Fundamental game systems and state management
- **Components**: Individual game objects (board, pieces, shapes)
- **Systems**: Specialized game mechanics (input, collision, scoring)
- **Game**: High-level game logic and rendering

### Key Design Patterns
- **Factory Pattern**: Used for piece generation
- **State Pattern**: Game state management
- **Observer Pattern**: Event handling and updates
- **Module Pattern**: Organized code separation

## 🔧 Customization

### Adding New Features
The modular structure makes it easy to add new features:

1. **New Piece Types**: Add shapes to `shapes.js`
2. **Special Effects**: Extend the renderer in `game-renderer.js`
3. **New Game Modes**: Modify game logic in `game-manager.js`
4. **UI Enhancements**: Add styles to the CSS modules
5. **Audio**: Add sound system in a new `audio/` folder

### Configuration
Game settings can be modified in `js/core/constants.js`:
- Board dimensions
- Piece colors
- Scoring values
- Game speeds
- Key bindings

### Styling
Visual appearance can be customized in the CSS files:
- `main.css`: Overall layout and typography
- `game-board.css`: Game board appearance
- `ui.css`: Interface elements
- `animations.css`: Visual effects

## 🎯 Future Expansion Ideas

The architecture supports easy addition of:
- **Multiplayer functionality**
- **Different game modes** (Sprint, Marathon, etc.)
- **Power-ups and special pieces**
- **Save/Load game state**
- **Statistics tracking**
- **Themes and customization**
- **Mobile touch controls**
- **Sound effects and music**
- **Particle effects**
- **AI opponent**

## 🛠️ Development

### File Organization
Each file has a single responsibility:
- Easy to locate specific functionality
- Simple to modify individual features
- Clear separation of concerns
- Minimal file dependencies

### Code Standards
- **ES6+ JavaScript** with modern features
- **Consistent naming conventions**
- **Comprehensive comments**
- **Modular exports/imports**
- **Error handling**

### Testing
The modular structure makes it easy to:
- Unit test individual components
- Mock dependencies for testing
- Test game logic separately from rendering
- Validate game rules and mechanics

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

The modular architecture makes contributing easy:
1. Identify the relevant module for your feature
2. Make changes in isolated files
3. Test your changes independently
4. Submit pull requests with clear descriptions

---

**Enjoy playing Tetris!** 🎮
