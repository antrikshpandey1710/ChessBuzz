# ChessBuzz

Play Chess against bots of varying difficulty.

## Features

- **Difficulty Levels**:
  - 🟢 **Easy**: Low lookahead depth and casual play
  - 🟡 **Medium**: Moderate tactical depth
  - 🔴 **Hard**: Strong positional and material calculation
  - ⚫ **Advanced**: Tight evaluation with minimal variance
- **Interactive Chess Board**:
  - Highlights active selections and legal board interactions
  - High-contrast classic wood chess board aesthetics
  - Crisp Unicode chess pieces for mobile and desktop
- **Game Controls**:
  - Undo previous moves (reverts player and bot turns)
  - New game and rematch at the chosen difficulty
  - Return to menu to switch difficulty anytime
  - Live game status updates (turn indicators, checks, checkmates, and draws)

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Engine**: Chess.js with custom minimax AI evaluation
