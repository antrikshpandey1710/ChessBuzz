import React from 'react';
import { ChessPiece3D, PieceColor } from './ChessPiece3D';
import { sounds } from '../utils/audio';

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (piece: PromotionPiece) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onSelect,
}) => {
  if (!isOpen) return null;

  const options: { type: PromotionPiece; name: string }[] = [
    { type: 'q', name: 'Queen' },
    { type: 'r', name: 'Rook' },
    { type: 'b', name: 'Bishop' },
    { type: 'n', name: 'Knight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fadeIn">
      <div className="w-full max-w-sm promotion-card p-6 border border-[#cfa858]/50 shadow-2xl text-center">
        <h3 className="text-base sm:text-lg font-black tracking-wider gold-text uppercase mb-1">
          Pawn Promotion
        </h3>
        <p className="text-xs text-stone-400 mb-5">
          Select a piece to promote your pawn
        </p>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                sounds.playClick();
                onSelect(opt.type);
              }}
              className="group p-2 sm:p-3 rounded-xl bg-gradient-to-b from-[#3a2012] to-[#1a0e08] border border-[#cfa858]/30 hover:border-[#cfa858] hover:shadow-[0_0_15px_rgba(207,168,88,0.4)] transition-all flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 transition-transform group-hover:scale-110">
                <ChessPiece3D type={opt.type} color={color} />
              </div>
              <span className="text-[11px] font-bold text-stone-300 group-hover:text-white uppercase tracking-wider">
                {opt.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
