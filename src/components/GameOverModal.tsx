import React from 'react';
import { Trophy, RotateCcw, Home, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  winner: 'w' | 'b' | null;
  mode: 'ai' | 'pass_play';
  onRematch: () => void;
  onHome: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isCheckmate,
  isDraw,
  winner,
  mode,
  onRematch,
  onHome,
  onClose,
}) => {
  if (!isOpen) return null;

  let title = 'Game Over';
  let subtitle = 'Match concluded';
  let isVictory = false;

  if (isCheckmate) {
    if (mode === 'ai') {
      if (winner === 'w') {
        title = 'Victory!';
        subtitle = 'Checkmate — You defeated the AI Master!';
        isVictory = true;
      } else {
        title = 'Defeat';
        subtitle = 'Checkmate — The AI outmaneuvered you.';
      }
    } else {
      title = `${winner === 'w' ? 'White' : 'Black'} Wins!`;
      subtitle = 'Checkmate delivered.';
      isVictory = true;
    }
  } else if (isDraw) {
    title = 'Draw';
    subtitle = 'Game drawn by stalemate, repetition, or insufficient material.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fadeIn">
      <div className="w-full max-w-sm promotion-card p-6 border border-[#cfa858]/50 shadow-2xl text-center relative">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#4d2d1b] to-[#1c0e07] border border-[#cfa858]/50 flex items-center justify-center shadow-lg">
          {isVictory ? (
            <Trophy className="w-9 h-9 text-[#cfa858] animate-bounce" />
          ) : (
            <Award className="w-9 h-9 text-stone-400" />
          )}
        </div>

        <h2 className="text-2xl font-black tracking-wider gold-text uppercase mb-1">
          {title}
        </h2>
        <p className="text-xs text-stone-300 mb-6 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onRematch();
            }}
            className="w-full py-3 rounded-xl tactile-btn bg-gradient-to-r from-[#59341c] via-[#754425] to-[#59341c] border-2 border-[#cfa858] font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl tactile-btn text-xs font-semibold text-stone-300 border border-stone-700"
            >
              Review Board
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onHome();
              }}
              className="flex-1 py-2.5 rounded-xl tactile-btn text-xs font-semibold text-[#cfa858] border border-[#cfa858]/40 flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
