# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Havens Elementary 4th Grade Games is an educational web application featuring interactive learning games for 4th-grade students across multiple subject areas: Math, Reading/Language Arts, Science, and Logic/Problem-solving.

**Tech Stack:** React 19 + TypeScript + Vite

**Target Audience:** 4th-grade students (ages 9-10)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Run linter
npm run lint

# Type-check without building
npx tsc --noEmit
```

## Architecture Overview

### Directory Structure

```
src/
├── games/           # Game implementations by subject
│   ├── math/        # Math games (arithmetic, fractions, word problems)
│   ├── reading/     # Reading/language games (spelling, vocabulary, grammar)
│   ├── science/     # Science games (experiments, phenomena)
│   └── logic/       # Logic/problem-solving games (puzzles, patterns)
├── components/
│   ├── common/      # Reusable UI components (buttons, cards, modals)
│   └── game-framework/  # Shared game components (score displays, timers, progress bars)
├── hooks/           # Custom React hooks (useScore, useTimer, useGameState)
├── utils/           # Helper functions (scoring, data validation, randomization)
├── types/           # TypeScript type definitions and interfaces
└── assets/          # Static files (images, sounds)
```

### Game Architecture Pattern

Each game should follow this structure:

1. **Game Component** (`src/games/{subject}/{GameName}.tsx`)
   - Main game logic and state management
   - Uses game-framework components for UI consistency
   - Handles user interactions and scoring

2. **Game Types** (`src/types/games.ts`)
   - Define interfaces for game state, props, and configuration
   - Common interface: `Game { id, title, subject, difficulty, component }`

3. **Game Registration**
   - Games are registered in a central registry for navigation
   - Each game exports metadata (title, description, difficulty level)

### State Management

- **Local State:** Use React hooks (`useState`, `useReducer`) for game-specific state
- **Context:** Use React Context for shared game settings (sound on/off, difficulty)
- **Custom Hooks:** Extract reusable logic into hooks (e.g., `useTimer`, `useScore`)

### Styling Approach

- Primary method: CSS Modules (`.module.css` files)
- Component-specific styles co-located with components
- Global styles in `src/index.css` for theme variables and resets
- Design should be colorful, engaging, and age-appropriate for 4th graders

## Key Design Principles

### Educational Focus
- Games must have clear learning objectives aligned with 4th-grade standards
- Provide immediate feedback on correct/incorrect answers
- Include hints or help systems without giving away answers
- Track progress and celebrate achievements

### User Experience (4th Grade Level)
- Simple, intuitive interfaces with minimal text
- Large, touch-friendly buttons and interactive elements
- Visual feedback for all interactions (animations, sounds)
- Clear instructions with visual examples
- Appropriate reading level (4th grade = ~4.0-4.9 Lexile level)

### Accessibility
- Keyboard navigation support for all games
- High contrast colors and readable fonts
- Screen reader compatible (use semantic HTML and ARIA labels)
- Option to disable animations/sounds

### Performance
- Games should load quickly (<3 seconds on average connection)
- Smooth animations (60fps) even on older devices
- Lazy load games to reduce initial bundle size
- Optimize images and assets

## Common Patterns

### Creating a New Game

1. Create component in appropriate subject folder: `src/games/{subject}/NewGame.tsx`
2. Define game-specific types in `src/types/games.ts`
3. Implement game logic using shared hooks and utilities
4. Use game-framework components for consistent UI
5. Add game to registry with metadata
6. Create tests if modifying critical game logic

### Scoring System

Standard scoring approach across games:
- Points for correct answers (base points × difficulty multiplier)
- Time bonuses for quick responses (optional)
- Streak bonuses for consecutive correct answers
- Stars/badges for completing levels or reaching milestones

### Data Persistence

- Use localStorage for saving progress and high scores
- Key format: `he4g_{gameId}_{dataType}` (e.g., `he4g_mathquiz_highscore`)
- Implement graceful fallback if localStorage unavailable

## TypeScript Guidelines

- Enable strict mode (`tsconfig.json` has `strict: true`)
- Avoid `any` type; use `unknown` or proper types
- Define interfaces for all props and state objects
- Use type guards for runtime type checking when necessary

## Component Guidelines

- Prefer functional components with hooks
- Keep components small and focused (single responsibility)
- Extract complex logic into custom hooks
- Props should have explicit TypeScript interfaces
- Use meaningful prop names that describe the data, not the styling

## Testing Considerations

When implementing new game logic or utilities:
- Test edge cases (e.g., division by zero, negative numbers)
- Verify grade-appropriate content (difficulty, reading level)
- Ensure randomization produces fair, solvable problems
- Test keyboard and touch interactions

## Adding New Subject Areas

To add a new subject area:
1. Create directory: `src/games/{new-subject}/`
2. Update types with new subject enum value
3. Add subject to navigation/routing
4. Follow existing patterns for game implementation
5. Update this CLAUDE.md file with subject-specific guidelines
