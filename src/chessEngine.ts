import { Chess, ChessInstance, ShortMove, Move, Square, PieceType } from 'chess.js';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'advanced';

export interface BotSettings {
  name: string;
  depth: number;
  randomness: number;
  usePST: boolean;
  quiescence: boolean;
  timeDelay: number;
  description: string;
}

export const botSettings: Record<Difficulty, BotSettings> = {
  easy: {
    name: 'Easy Level',
    depth: 1,
    randomness: 0.45,
    usePST: false,
    quiescence: false,
    timeDelay: 400,
    description: 'Casual play with occasional tactical oversights. Great for learning.',
  },
  medium: {
    name: 'Medium Level',
    depth: 2,
    randomness: 0.18,
    usePST: true,
    quiescence: false,
    timeDelay: 550,
    description: 'Balanced tactical awareness, controls center and protects pieces.',
  },
  hard: {
    name: 'Hard Level',
    depth: 3,
    randomness: 0.05,
    usePST: true,
    quiescence: true,
    timeDelay: 700,
    description: 'Deep positional calculation, aggressive attacks, punishes blunders.',
  },
  advanced: {
    name: 'Advanced Level',
    depth: 4,
    randomness: 0.0,
    usePST: true,
    quiescence: true,
    timeDelay: 850,
    description: 'Near-optimal master strength with deep tactical search and piece-square mastery.',
  },
};

export const pieceValues: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White's perspective; inverted for Black)
const pawnTable = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const knightTable = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const bishopTable = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const rookTable = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const queenTable = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const kingTableMid = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

export function getPieceSquareScore(type: PieceType, color: 'w' | 'b', row: number, col: number): number {
  const index = color === 'w' ? row * 8 + col : (7 - row) * 8 + col;
  switch (type) {
    case 'p': return pawnTable[index] || 0;
    case 'n': return knightTable[index] || 0;
    case 'b': return bishopTable[index] || 0;
    case 'r': return rookTable[index] || 0;
    case 'q': return queenTable[index] || 0;
    case 'k': return kingTableMid[index] || 0;
    default: return 0;
  }
}

export function evaluate(position: ChessInstance, usePST: boolean = true): number {
  if (position.in_checkmate()) {
    return position.turn() === 'w' ? -100000 : 100000;
  }

  if (position.in_draw()) {
    return 0;
  }

  let score = 0;
  const board = position.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = pieceValues[piece.type] || 0;
      const pstVal = usePST ? getPieceSquareScore(piece.type, piece.color, r, c) : 0;
      const totalVal = baseVal + pstVal;

      if (piece.color === 'b') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  return score;
}

// Quiescence search to avoid horizon effect on captures
function quiescence(position: ChessInstance, alpha: number, beta: number, maximizing: boolean, depth: number = 2): number {
  const standPat = evaluate(position, true);

  if (depth <= 0) return standPat;

  if (maximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const captureMoves = position.moves({ verbose: true }).filter(m => m.captured);
    for (const move of captureMoves) {
      position.move(move);
      const score = quiescence(position, alpha, beta, false, depth - 1);
      position.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    const captureMoves = position.moves({ verbose: true }).filter(m => m.captured);
    for (const move of captureMoves) {
      position.move(move);
      const score = quiescence(position, alpha, beta, true, depth - 1);
      position.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

export function minimax(
  position: ChessInstance,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  usePST: boolean,
  useQuiescence: boolean
): number {
  if (depth <= 0 || position.game_over()) {
    if (useQuiescence && depth <= 0 && !position.game_over()) {
      return quiescence(position, alpha, beta, maximizing, 2);
    }
    return evaluate(position, usePST);
  }

  const moves = position.moves({ verbose: true });
  // Move ordering: Prioritize captures first for alpha-beta efficiency
  moves.sort((a, b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      position.move(move);
      const score = minimax(position, depth - 1, alpha, beta, false, usePST, useQuiescence);
      position.undo();

      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      position.move(move);
      const score = minimax(position, depth - 1, alpha, beta, true, usePST, useQuiescence);
      position.undo();

      best = Math.min(best, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function chooseBotMove(
  game: ChessInstance,
  difficulty: Difficulty
): ShortMove | null {
  const settings = botSettings[difficulty];
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) {
    return null;
  }

  // Easy mode: Sometimes plays safe non-optimal moves
  if (difficulty === 'easy' && Math.random() < 0.35) {
    const sensibleMoves = moves.filter(m => !m.san.includes('??'));
    if (sensibleMoves.length > 0) {
      return sensibleMoves[Math.floor(Math.random() * sensibleMoves.length)];
    }
  }

  let bestScore = -Infinity;
  let bestMoves: ShortMove[] = [];

  for (const move of moves) {
    game.move(move);
    // Evaluating from Black's perspective (maximizing = false for White's turn)
    const score = -minimax(
      game,
      settings.depth - 1,
      -Infinity,
      Infinity,
      false,
      settings.usePST,
      settings.quiescence
    );
    game.undo();

    const randomnessMargin = (Math.random() - 0.5) * settings.randomness * 120;
    const adjustedScore = score + randomnessMargin;

    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMoves = [move];
    } else if (Math.abs(adjustedScore - bestScore) < 15) {
      bestMoves.push(move);
    }
  }

  if (bestMoves.length === 0) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

export interface HintResult {
  from: Square;
  to: Square;
  san: string;
  explanation: string;
}

export function getHintMove(game: ChessInstance): HintResult | null {
  if (game.game_over() || game.turn() !== 'w') return null;

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove: Move | null = null;

  for (const move of moves) {
    game.move(move);
    // White's perspective
    const score = -minimax(game, 2, -Infinity, Infinity, false, true, true);
    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  const selected = bestMove || moves[0];
  let explanation = `Moves ${selected.from.toUpperCase()} to ${selected.to.toUpperCase()}`;

  if (selected.san.includes('#')) {
    explanation = 'Delivers checkmate!';
  } else if (selected.san.includes('+')) {
    explanation = 'Puts the enemy King in check';
  } else if (selected.captured) {
    explanation = `Captures opponent's ${pieceValues[selected.captured] ? selected.captured.toUpperCase() : 'piece'}`;
  } else if (selected.san.startsWith('O-O')) {
    explanation = 'Castles for King safety and Rook activation';
  } else if (['d4', 'e4', 'd5', 'e5'].includes(selected.to)) {
    explanation = 'Controls critical center squares';
  } else {
    explanation = 'Improves tactical piece activity';
  }

  return {
    from: selected.from as Square,
    to: selected.to as Square,
    san: selected.san,
    explanation,
  };
}

export function getCapturedPieces(game: ChessInstance) {
  const initialCounts: Record<PieceType, number> = {
    p: 8, n: 2, b: 2, r: 2, q: 1, k: 1,
  };

  const whiteRemaining: Record<PieceType, number> = { ...initialCounts };
  const blackRemaining: Record<PieceType, number> = { ...initialCounts };

  const board = game.board();
  for (const row of board) {
    for (const square of row) {
      if (!square) continue;
      if (square.color === 'w') {
        whiteRemaining[square.type] = Math.max(0, whiteRemaining[square.type] - 1);
      } else {
        blackRemaining[square.type] = Math.max(0, blackRemaining[square.type] - 1);
      }
    }
  }

  // Pieces captured from White
  const whiteCaptured: PieceType[] = [];
  // Pieces captured from Black
  const blackCaptured: PieceType[] = [];

  (['q', 'r', 'b', 'n', 'p'] as PieceType[]).forEach((type) => {
    for (let i = 0; i < whiteRemaining[type]; i++) {
      whiteCaptured.push(type);
    }
    for (let i = 0; i < blackRemaining[type]; i++) {
      blackCaptured.push(type);
    }
  });

  // Calculate material difference
  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (const row of board) {
    for (const sq of row) {
      if (!sq || sq.type === 'k') continue;
      if (sq.color === 'w') whiteMaterial += pieceValues[sq.type];
      else blackMaterial += pieceValues[sq.type];
    }
  }

  const whiteDiff = Math.max(0, Math.floor((whiteMaterial - blackMaterial) / 100));
  const blackDiff = Math.max(0, Math.floor((blackMaterial - whiteMaterial) / 100));

  return {
    whiteCaptured, // pieces lost by White (held by Black)
    blackCaptured, // pieces lost by Black (held by White)
    whiteDiff,
    blackDiff,
  };
}

export { Chess };
export type { ChessInstance, Square, ShortMove };
