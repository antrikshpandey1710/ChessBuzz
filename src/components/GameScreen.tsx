import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Chess,
  ChessInstance,
  Square,
  Difficulty,
  botSettings,
  chooseBotMove,
  getHintMove,
  getCapturedPieces,
  HintResult,
} from '../chessEngine';
import { ChessPiece3D } from './ChessPiece3D';
import { PromotionModal } from './PromotionModal';
import { GameOverModal } from './GameOverModal';
import { SettingsModal, GameSettings } from './SettingsModal';
import { sounds } from '../utils/audio';
import {
  Home,
  RotateCcw,
  Sparkles,
  Settings,
  HelpCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface GameScreenProps {
  difficulty: Difficulty;
  gameMode: 'ai' | 'pass_play';
  onBackToMenu: () => void;
  onRecordGameResult: (result: 'win' | 'loss' | 'draw', difficulty: Difficulty) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  difficulty,
  gameMode,
  onBackToMenu,
  onRecordGameResult,
}) => {
  // Game instance
  const [game, setGame] = useState<ChessInstance>(() => new Chess());
  const [boardState, setBoardState] = useState<ReturnType<ChessInstance['board']>>(() => game.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [hint, setHint] = useState<HintResult | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [recordedGameOver, setRecordedGameOver] = useState(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('chessbuzz_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      soundEnabled: true,
      showLegalMoves: true,
      showCoordinates: true,
      autoQueen: false,
      flippedBoard: false,
    };
  });

  const botTimeoutRef = useRef<number | null>(null);

  const clearBotTimer = () => {
    if (botTimeoutRef.current !== null) {
      window.clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    localStorage.setItem('chessbuzz_settings', JSON.stringify(settings));
    sounds.enabled = settings.soundEnabled;
  }, [settings]);

  // Compute legal destination squares for the currently selected piece
  const legalMoves = useMemo(() => {
    if (!selectedSquare || !settings.showLegalMoves) return [];
    const moves = game.moves({ square: selectedSquare, verbose: true });
    return moves.map((m) => ({
      to: m.to as Square,
      captured: !!m.captured,
    }));
  }, [game, selectedSquare, settings.showLegalMoves]);

  // Find King square under check
  const checkSquare = useMemo<Square | null>(() => {
    if (!game.in_check()) return null;
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          return (String.fromCharCode(97 + c) + (8 - r)) as Square;
        }
      }
    }
    return null;
  }, [game, boardState]);

  // Captured pieces & material delta
  const capturedInfo = useMemo(() => {
    return getCapturedPieces(game);
  }, [game, boardState]);

  // Check Game Over and trigger modal / stats record
  useEffect(() => {
    if (game.game_over() && !recordedGameOver) {
      setRecordedGameOver(true);
      const isMate = game.in_checkmate();
      const isDraw = game.in_draw();

      if (isMate) {
        const winner = game.turn() === 'w' ? 'b' : 'w';
        if (winner === 'w') {
          sounds.playVictory();
          onRecordGameResult('win', difficulty);
        } else {
          sounds.playDefeat();
          onRecordGameResult('loss', difficulty);
        }
      } else if (isDraw) {
        sounds.playClick();
        onRecordGameResult('draw', difficulty);
      }

      const timer = window.setTimeout(() => {
        setIsGameOverModalOpen(true);
      }, 700);

      return () => window.clearTimeout(timer);
    }
  }, [game, boardState, recordedGameOver, difficulty, onRecordGameResult]);

  // Execute Bot move
  const executeBotMove = useCallback((currentGame: ChessInstance) => {
    if (currentGame.game_over() || currentGame.turn() !== 'b') {
      setIsBotThinking(false);
      return;
    }

    const move = chooseBotMove(currentGame, difficulty);
    if (move) {
      const result = currentGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (result) {
        setLastMove({ from: move.from as Square, to: move.to as Square });
        if (result.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        if (currentGame.in_check()) {
          sounds.playCheck();
        }
      }
    }

    setBoardState([...currentGame.board()]);
    setIsBotThinking(false);
  }, [difficulty]);

  // Handle Square Selection and Move Execution
  const handleSquareClick = (square: Square) => {
    if (isBotThinking || game.game_over()) return;

    // Clear active hint on any user click
    if (hint) setHint(null);

    const piece = game.get(square);
    const playerTurn = game.turn();

    // In AI mode, player plays White
    if (gameMode === 'ai' && playerTurn !== 'w') return;

    if (!selectedSquare) {
      if (!piece || piece.color !== playerTurn) return;
      sounds.playClick();
      setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // Check if move is pawn promotion
    const movingPiece = game.get(selectedSquare);
    const isPawnPromotion =
      movingPiece?.type === 'p' &&
      ((movingPiece.color === 'w' && square[1] === '8') ||
        (movingPiece.color === 'b' && square[1] === '1'));

    if (isPawnPromotion) {
      // Validate if legal move
      const legal = game
        .moves({ square: selectedSquare, verbose: true })
        .some((m) => m.to === square);

      if (legal) {
        if (settings.autoQueen) {
          finalizeMove(selectedSquare, square, 'q');
        } else {
          setPendingPromotion({ from: selectedSquare, to: square });
        }
        return;
      }
    }

    // Standard Move Attempt
    const success = finalizeMove(selectedSquare, square);
    if (!success) {
      if (piece && piece.color === playerTurn) {
        sounds.playClick();
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  };

  const finalizeMove = (from: Square, to: Square, promotionPiece: 'q' | 'r' | 'b' | 'n' = 'q'): boolean => {
    const move = game.move({
      from,
      to,
      promotion: promotionPiece,
    });

    if (move === null) {
      return false;
    }

    setSelectedSquare(null);
    setLastMove({ from, to });
    setBoardState([...game.board()]);

    if (move.captured) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    if (game.in_check()) {
      sounds.playCheck();
    }

    if (!game.game_over() && gameMode === 'ai' && game.turn() === 'b') {
      setIsBotThinking(true);
      const delay = botSettings[difficulty].timeDelay;
      botTimeoutRef.current = window.setTimeout(() => {
        executeBotMove(game);
      }, delay);
    }

    return true;
  };

  // Undo Move
  const handleUndo = () => {
    if (isBotThinking || game.history().length === 0) return;
    clearBotTimer();

    sounds.playClick();
    if (gameMode === 'ai') {
      // Undo bot move then player move to return to White's turn
      game.undo();
      if (game.history().length > 0) {
        game.undo();
      }
    } else {
      game.undo();
    }

    const history = game.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from as Square, to: last.to as Square });
    } else {
      setLastMove(null);
    }

    setSelectedSquare(null);
    setHint(null);
    setRecordedGameOver(false);
    setIsGameOverModalOpen(false);
    setBoardState([...game.board()]);
  };

  // Hint Generator
  const handleHint = () => {
    if (isBotThinking || game.game_over()) return;
    sounds.playClick();
    const result = getHintMove(game);
    if (result) {
      setHint(result);
      setSelectedSquare(result.from);
    }
  };

  // Restart / Rematch
  const handleRestart = () => {
    clearBotTimer();
    sounds.playClick();
    const newGame = new Chess();
    setGame(newGame);
    setBoardState([...newGame.board()]);
    setSelectedSquare(null);
    setLastMove(null);
    setHint(null);
    setIsBotThinking(false);
    setRecordedGameOver(false);
    setIsGameOverModalOpen(false);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearBotTimer();
  }, []);

  // Board indexing based on orientation
  const files = useMemo(() => (settings.flippedBoard ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']), [settings.flippedBoard]);
  const ranks = useMemo(() => (settings.flippedBoard ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]), [settings.flippedBoard]);

  // Turn description
  const turnColor = game.turn();
  const currentMoveNum = Math.floor(game.history().length / 2) + 1;

  let turnText = turnColor === 'w' ? "White's move" : "Black's move";
  if (isBotThinking) {
    turnText = 'Bot is thinking...';
  } else if (game.in_checkmate()) {
    turnText = 'Checkmate!';
  } else if (game.in_draw()) {
    turnText = 'Draw!';
  } else if (game.in_check()) {
    turnText = `Check! ${turnColor === 'w' ? 'White' : 'Black'}'s move`;
  }

  return (
    <div className="relative w-full h-full min-h-screen wood-tabletop flex flex-col justify-between p-2 sm:p-3 overflow-hidden select-none">
      {/* Subtle Top Status Pill (Minimal, Non-intrusive) */}
      <div className="w-full flex items-center justify-between px-2 py-1 max-w-5xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#1e110a] border border-[#cfa858]/30 text-[11px] font-bold text-[#cfa858] tracking-wider uppercase shadow-inner">
            {botSettings[difficulty].name}
          </span>
          <span className="text-[11px] font-semibold text-stone-400">
            Move {currentMoveNum}
          </span>
        </div>

        {hint && (
          <div className="px-3 py-0.5 rounded-full bg-sky-950/80 border border-sky-400/50 text-[11px] font-medium text-sky-200 flex items-center gap-1.5 shadow-lg animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Hint: {hint.explanation}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className={`px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all shadow-sm flex items-center gap-1.5 ${
            isBotThinking
              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
              : game.in_check()
              ? 'bg-rose-950/90 text-rose-300 border border-rose-600/60'
              : 'bg-[#22130b] text-stone-300 border border-stone-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              turnColor === 'w' ? 'bg-[#fdfaf3] ring-1 ring-stone-400' : 'bg-[#15171b] ring-1 ring-[#cfa858]'
            } ${isBotThinking ? 'animate-ping' : ''}`} />
            <span>{turnText}</span>
          </div>
        </div>
      </div>

      {/* Main Game Arena (Centered Chessboard with Flanking Tactile Controls in Landscape) */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-row items-center justify-center gap-3 sm:gap-6 my-auto z-10">
        {/* Left Side Tactile Controls */}
        <div className="flex flex-col gap-3 z-20">
          <button
            onClick={() => {
              sounds.playClick();
              onBackToMenu();
            }}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl tactile-btn text-[#cfa858] cursor-pointer group"
            title="Main Menu"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
          </button>

          <button
            onClick={handleRestart}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl tactile-btn text-[#cfa858] cursor-pointer group"
            title="Restart Game"
          >
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-180 duration-300" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSettings((prev) => ({ ...prev, flippedBoard: !prev.flippedBoard }));
            }}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl tactile-btn text-[#cfa858] cursor-pointer group"
            title="Flip Board"
          >
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* 3D Chessboard Container */}
        <div className="flex flex-col items-center">
          <div className="chess-board-frame">
            {/* The 8x8 Board Grid */}
            <div
              className="chess-board-inner grid grid-cols-8 grid-rows-8"
              style={{
                width: 'min(76vh, 80vw, 540px)',
                height: 'min(76vh, 80vw, 540px)',
              }}
            >
              {ranks.map((rank, rankIdx) =>
                files.map((file, fileIdx) => {
                  const squareName = `${file}${rank}` as Square;
                  const piece = game.get(squareName);
                  const isLight = (fileIdx + rankIdx) % 2 === 0;

                  const isSelected = selectedSquare === squareName;
                  const isLastMoveSquare =
                    lastMove && (lastMove.from === squareName || lastMove.to === squareName);
                  const isCheckSquare = checkSquare === squareName;
                  const isHintSquare = hint && (hint.from === squareName || hint.to === squareName);

                  const isLegalDest = legalMoves.find((m) => m.to === squareName);

                  return (
                    <div
                      key={squareName}
                      onClick={() => handleSquareClick(squareName)}
                      className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-colors duration-75 ${
                        isLight ? 'square-light' : 'square-dark'
                      } ${isSelected ? 'square-selected' : ''} ${
                        isLastMoveSquare ? 'square-last-move' : ''
                      } ${isCheckSquare ? 'square-check' : ''} ${
                        isHintSquare ? 'square-hint' : ''
                      }`}
                    >
                      {/* Rank / File Coordinate Labels (Crisp Gold Inlay) */}
                      {settings.showCoordinates && (
                        <>
                          {fileIdx === 0 && (
                            <span
                              className={`absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-black pointer-events-none select-none opacity-80 ${
                                isLight ? 'text-[#3b6845]' : 'text-[#eae5cb]'
                              }`}
                            >
                              {rank}
                            </span>
                          )}
                          {rankIdx === 7 && (
                            <span
                              className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-black pointer-events-none select-none opacity-80 ${
                                isLight ? 'text-[#3b6845]' : 'text-[#eae5cb]'
                              }`}
                            >
                              {file}
                            </span>
                          )}
                        </>
                      )}

                      {/* 3D Realistic Chess Piece */}
                      {piece && (
                        <div className="w-full h-full flex items-center justify-center piece-container z-10">
                          <ChessPiece3D type={piece.type} color={piece.color} />
                        </div>
                      )}

                      {/* Legal Move Dot Marker */}
                      {isLegalDest && !isLegalDest.captured && (
                        <div className="legal-move-dot" />
                      )}

                      {/* Legal Move Capture Ring */}
                      {isLegalDest && isLegalDest.captured && (
                        <div className="legal-capture-ring" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side Tactile Controls */}
        <div className="flex flex-col gap-3 z-20">
          <button
            onClick={handleUndo}
            disabled={isBotThinking || game.history().length === 0}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl tactile-btn text-[#cfa858] cursor-pointer group ${
              game.history().length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            title="Undo Move"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-rotate-90 duration-200" />
          </button>

          <button
            onClick={handleHint}
            disabled={isBotThinking || game.game_over()}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl tactile-btn text-[#cfa858] cursor-pointer group"
            title="Strategic Hint"
          >
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setIsSettingsOpen(true);
            }}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl tactile-btn text-[#cfa858] cursor-pointer group"
            title="Game Settings"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-90 duration-300" />
          </button>
        </div>
      </div>

      {/* Bottom Compact Information Plate (Captured Pieces & Material Advantage) */}
      <div className="w-full max-w-2xl mx-auto info-plate px-3 py-1.5 flex items-center justify-between z-10">
        {/* White (Player) Captured Shelf */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#f5eedc]/90 border border-stone-400 flex items-center justify-center p-0.5 shadow-sm">
            <ChessPiece3D type="k" color="w" />
          </div>
          <div className="flex items-center gap-1 min-w-[60px]">
            {capturedInfo.blackCaptured.slice(0, 7).map((type, i) => (
              <div key={i} className="w-4 h-4 -ml-1.5 first:ml-0 opacity-90" title={type.toUpperCase()}>
                <ChessPiece3D type={type} color="b" />
              </div>
            ))}
            {capturedInfo.whiteDiff > 0 && (
              <span className="text-[10px] font-black text-emerald-400 ml-1">
                +{capturedInfo.whiteDiff}
              </span>
            )}
          </div>
        </div>

        {/* Center Match Status */}
        <div className="text-center">
          <span className="text-[10px] font-bold tracking-widest text-[#cfa858]/80 uppercase">
            {gameMode === 'ai' ? 'Vs Computer' : '2-Player Pass'}
          </span>
        </div>

        {/* Black (AI/Opponent) Captured Shelf */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 justify-end min-w-[60px]">
            {capturedInfo.blackDiff > 0 && (
              <span className="text-[10px] font-black text-rose-400 mr-1">
                +{capturedInfo.blackDiff}
              </span>
            )}
            {capturedInfo.whiteCaptured.slice(0, 7).map((type, i) => (
              <div key={i} className="w-4 h-4 -mr-1.5 last:mr-0 opacity-90" title={type.toUpperCase()}>
                <ChessPiece3D type={type} color="w" />
              </div>
            ))}
          </div>
          <div className="w-5 h-5 rounded-md bg-[#181a1f] border border-[#cfa858]/40 flex items-center justify-center p-0.5 shadow-sm">
            <ChessPiece3D type="k" color="b" />
          </div>
        </div>
      </div>

      {/* Promotion Dialog Modal */}
      <PromotionModal
        isOpen={pendingPromotion !== null}
        color={game.turn()}
        onSelect={(pieceType) => {
          if (pendingPromotion) {
            finalizeMove(pendingPromotion.from, pendingPromotion.to, pieceType);
            setPendingPromotion(null);
          }
        }}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        isCheckmate={game.in_checkmate()}
        isDraw={game.in_draw()}
        winner={game.in_checkmate() ? (game.turn() === 'w' ? 'b' : 'w') : null}
        mode={gameMode}
        onRematch={handleRestart}
        onHome={onBackToMenu}
        onClose={() => setIsGameOverModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
      />
    </div>
  );
};
