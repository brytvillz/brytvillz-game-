# CodedBryt Mini Game — Save Your Money 💰

A browser-based canvas game built entirely through **AI-assisted prompt engineering** as a learning exercise in effective prompting techniques and web development.

![Game Status](https://img.shields.io/badge/status-active-success)
![Built With](https://img.shields.io/badge/built%20with-prompt%20engineering-blue)
![Tech Stack](https://img.shields.io/badge/tech-HTML%20%7C%20CSS%20%7C%20JavaScript-orange)

## 🎮 Game Overview

**Save Your Money** is an endless runner where players dodge money-eating obstacles (banks 🏛️, credit cards 💳, food 🍕, etc.) while collecting stars ⭐ to increase their score. The game features day/night mode switching and fully responsive mobile touch controls.

**Play it here:** [Live Demo](#) _(add your deployment link)_

---

## 🎯 Project Purpose: Learning Prompt Engineering

This project was created as an **internship learning exercise** with a primary focus on:

1. **Mastering AI prompt engineering** - Learning how to effectively communicate with AI to build software
2. **Understanding generated code** - Reading and comprehending JavaScript, HTML, and CSS
3. **Debugging skills** - Identifying issues and articulating problems clearly to fix them
4. **Iterative development** - Refining features through precise, incremental prompts

### Key Learning: The Prompting Journey

Throughout this project, I learned that **effective prompting requires:**

✅ **Specificity** - Instead of "fix the resize issue", say "when I expand and reduce the browser size, the canvas doesn't adjust properly but works after refresh"

✅ **Context provision** - Mentioning what I've already tried or what behavior I'm observing

✅ **Incremental requests** - Breaking large changes into smaller, testable modifications

✅ **Visual feedback loops** - Using phrases like "adjust more" for iterative UI positioning

✅ **Clear intent** - Stating whether I want an explanation, implementation, or debugging help

---

## 🛠️ Development Process

### Phase 1: Initial Game Creation

- **Prompt approach:** Described the game concept, desired mechanics, and visual style
- **Generated:** Core game loop, player movement, obstacle spawning, collision detection
- **Tech stack:** Vanilla JavaScript with HTML5 Canvas API

### Phase 2: Responsive Design Issues

**Problem discovered:** Canvas and overlay didn't resize properly when browser window changed dimensions

**My prompting evolution:**

1. ❌ First attempt: Vague description → Solution broke game initialization
2. ❌ Second attempt: Used undo, tried different explanation → Still had errors
3. ✅ **Final success:** Clearly explained _when_ the bug occurred (on resize) and _what_ the expected behavior was (should adjust without refresh)

**Solution implemented:**

- Modified `resizeCanvas()` function to reference parent container (`#game-wrap`)
- Set `canvas.style.width = "100%"` to let CSS handle responsive width
- Removed player position recalculation that was causing initialization errors

**Key lesson learned:** Debugging requires explaining the _exact sequence_ of actions that cause the problem.

### Phase 3: UI/UX Refinement

**Challenge:** Positioning the day/night toggle button in the top-right corner

**Iterative prompting approach:**

- Used clear directional requests: "I need my toggle section to be more at the top right"
- Followed up with simple feedback: "adjust more" (repeated 4 times)
- Confirmed final result: "better"

**Technical changes:**

- CSS positioning adjusted from `right: -60px` → `-45px` → `-30px` → `-15px`
- Applied changes across all responsive breakpoints
- Maintained visual consistency across mobile and desktop

**Key lesson learned:** For visual adjustments, iterative feedback with simple language works perfectly. The AI can understand incremental refinement requests.

### Phase 4: Mobile Optimization

**Discovery:** Game already had touch controls implemented!

**What I learned:**

- The canvas is split into left/right zones for touch input
- Tapping left half moves player left ⬅️, right half moves right ➡️
- `touch-action: manipulation` CSS improves mobile performance

**Better prompt I could have used:**

> "Can you explain how the mobile touch controls work in my game? I want to make sure phone users can play easily."

This would have clarified I wanted an _explanation_ rather than _implementation_.

---

## 📁 Project Structure

```
codedbryt-game/
├── index.html          # Game structure and layout
├── script.js           # Game logic (710 lines)
│   ├── Canvas management & responsive sizing
│   ├── Player movement (keyboard + touch controls)
│   ├── Obstacle spawning & collision detection
│   ├── Score tracking & game states
│   └── Day/night mode toggle logic
├── style.css          # Responsive styling (510 lines)
│   ├── CSS variables for theming
│   ├── Day/night mode styles
│   ├── Media queries (1200px, 768px, 480px, 360px)
│   └── Mobile-first touch optimizations
└── README.md          # This file
```

---

## 🎮 How to Play

### Desktop Controls

- **Arrow Keys** (← →) or **A/D keys** - Move left/right
- **Space** - Pause/Resume game
- **Click** - Start game or interact with UI

### Mobile/Touch Controls

- **Tap left half of screen** - Move left ⬅️
- **Tap right half of screen** - Move right ➡️
- **Lift finger** - Stop moving

### Game Objective

- Avoid obstacles (🏛️ banks, 💳 cards, 🍕 food, 🛒 shopping, 🎮 entertainment)
- Collect stars ⭐ to increase your score
- Survive as long as possible!

---

## 🐛 Debugging Experience

### Bug #1: Canvas Resize Issue

**Symptoms:**

- Game loaded correctly initially
- Resizing browser caused canvas/overlay misalignment
- Refreshing page fixed it temporarily

**Root cause:** Canvas dimensions weren't syncing with parent container on window resize

**My debugging process:**

1. Observed and clearly described the problem behavior
2. Mentioned what _did_ work (refresh fixes it)
3. Tried multiple solutions with AI guidance
4. Used undo feature when solutions broke the game
5. Finally identified the issue: reading canvas dimensions instead of container dimensions

**Fix applied:** Modified `resizeCanvas()` to reference `#game-wrap` parent container

### Bug #2: Toggle Button Positioning

**Challenge:** Needed precise positioning for aesthetic appeal

**My approach:**

- Started with clear directional request
- Used visual testing between each adjustment
- Provided simple feedback ("adjust more", "better")
- Confirmed when satisfied with result

**Outcome:** Learned that iterative refinement is valid for UI work!

---

## 💡 Prompt Engineering Lessons Learned

### What Worked Well ✅

1. **Descriptive problem statements**

   - Example: "when I expand and reduce the size, the box that contains the stars and write ups on both day and night mode doesn't adjust properly"
   - Why it worked: Included _when_, _what_, and _observed behavior_

2. **Iterative refinement**

   - Example: "adjust more" (repeated feedback)
   - Why it worked: Simple, clear direction for incremental changes

3. **Asking for explanations**
   - Example: "how will phone users play the game?"
   - Why it worked: Clarified my understanding rather than requesting new features

### What I Could Improve 🎯

1. **Being explicit about intent**
   - Could have specified: "Explain the existing mobile controls" vs "Implement mobile controls"
2. **Mentioning what I've tried**

   - Could have said: "I tried refreshing and it works, but I want it to work without refreshing"

3. **Asking for best practices**
   - Could have asked: "What's the best way to handle responsive canvas sizing?"

---

## 🚀 Running the Game

### Local Development

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. No build process or dependencies required!

### Deployment

This is a static site that can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Simply upload all files to your hosting provider.

---

## 🎨 Features

- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Touch Controls** - Native mobile support with touch gestures
- ✅ **Day/Night Mode** - Toggle between light and dark themes
- ✅ **Score Tracking** - Persistent high score using localStorage
- ✅ **Player Names** - Personalized gameplay experience
- ✅ **Smooth Animations** - Canvas-based rendering at 60 FPS
- ✅ **Pause Functionality** - Space bar to pause/resume
- ✅ **Accessible** - ARIA labels and keyboard navigation

---

## 📚 Technical Stack

- **HTML5** - Semantic markup and Canvas API
- **CSS3** - Flexbox, Grid, custom properties (CSS variables), media queries
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
  - `requestAnimationFrame` for game loop
  - Event listeners for controls
  - localStorage for persistence
  - Touch event handling for mobile

---

## 🎓 What I Learned

### Technical Skills

- HTML5 Canvas API and 2D rendering context
- Responsive web design with media queries
- Touch event handling for mobile browsers
- JavaScript game loop patterns
- CSS positioning and layout techniques

### Soft Skills

- **Effective communication** with AI assistants
- **Problem decomposition** - Breaking complex issues into smaller parts
- **Iterative development** - Making small, testable changes
- **Debugging methodology** - Observing, describing, and solving issues
- **Technical documentation** - Writing clear README files

### Prompt Engineering Principles

- Specificity beats vagueness
- Context accelerates solutions
- Incremental changes reduce errors
- Feedback loops enable refinement
- Clear intent prevents miscommunication

---

## 🤝 Contributing

This is a learning project, but suggestions and improvements are welcome!

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with clear description

---

## 📝 Future Improvements

Potential features to add (great prompting practice!):

- [ ] Power-ups (shields, magnets, speed boosts)
- [ ] Multiple difficulty levels
- [ ] Sound effects and background music
- [ ] Leaderboard integration
- [ ] Achievement system
- [ ] More obstacle types and animations
- [ ] Visual touch indicators for mobile
- [ ] Tutorial mode for first-time players

---

## 👨‍💻 About the Developer

**CodedBryt** - AI/ML and Web Development Intern

This game was created as part of my learning journey in:

- Artificial Intelligence and Machine Learning
- Web Development (HTML, CSS, JavaScript)
- **Prompt Engineering** (primary focus)
- Software debugging and problem-solving

**Connect with me:**

- GitHub: [@brytvillz](https://github.com/brytvillz)
- Project Goal: Master the art of communicating with AI to build software effectively

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🙏 Acknowledgments

- Built with assistance from **GitHub Copilot** through iterative prompt engineering
- Created as a learning exercise in AI-assisted development
- Special thanks to the concept of learning by building!

---

## 📊 Project Stats

- **Lines of Code:** ~1,220 (710 JS + 510 CSS)
- **Development Time:** Several iterations over multiple prompting sessions
- **Bugs Fixed:** 2 major (canvas resize, toggle positioning)
- **Prompting Iterations:** ~15-20 refinements
- **Learning Outcome:** Successfully understood and debugged AI-generated code

---

**Remember:** The goal isn't just to build the game—it's to learn how to effectively communicate with AI to build _anything_! 🚀
# brytvillz-game-
