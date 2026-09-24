import React from 'react';
import { X, Trophy, Award, RotateCcw } from 'lucide-react';
import { Difficulty } from '../chessEngine';
import { sounds } from '../utils/audio';

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  difficultyStats: Record<Difficulty, { wins: number; losses: number; draws: number }>;
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  const diffRows: { key: Difficulty; label: string }[] = [
    { key: 'easy', label: 'Easy Level' },
    { key: 'medium', label: 'Medium Level' },
    { key: 'hard', label: 'Hard Level' },
    { key: 'advanced', label: 'Advanced Level' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fadeIn">
      <div className="w-full max-w-md promotion-card p-6 border border-[#cfa858]/40 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#cfa858]" />
            <h2 className="text-lg font-bold tracking-wider gold-text uppercase">
              Player Statistics
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg tactile-btn flex items-center justify-center text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Badges */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="p-3 rounded-xl bg-[#140b06]/80 border border-stone-800">
            <div className="text-2xl font-black text-stone-100">{stats.gamesPlayed}</div>
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Played</div>
          </div>
          <div className="p-3 rounded-xl bg-[#140b06]/80 border border-emerald-900/50">
            <div className="text-2xl font-black text-emerald-400">{stats.wins}</div>
            <div className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider mt-0.5">Victories</div>
          </div>
          <div className="p-3 rounded-xl bg-[#140b06]/80 border border-amber-900/50">
            <div className="text-2xl font-black text-amber-400">{winRate}%</div>
            <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider mt-0.5">Win Rate</div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-bold text-[#cfa858] tracking-wider uppercase mb-1">
            Performance by Difficulty
          </div>
          {diffRows.map(({ key, label }) => {
            const data = stats.difficultyStats[key] || { wins: 0, losses: 0, draws: 0 };
            const total = data.wins + data.losses + data.draws;
            const rate = total > 0 ? Math.round((data.wins / total) * 100) : 0;

            return (
              <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-[#140b06]/60 border border-stone-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-stone-400" />
                  <span className="font-semibold text-stone-200">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-stone-400">
                    <span className="text-emerald-400 font-bold">{data.wins}W</span> /{' '}
                    <span className="text-rose-400 font-bold">{data.losses}L</span> /{' '}
                    <span className="text-amber-400 font-bold">{data.draws}D</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-800/80 text-[11px] font-bold text-[#cfa858]">
                    {rate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              if (window.confirm('Reset all statistics?')) {
                onResetStats();
              }
            }}
            className="flex-1 py-2.5 rounded-xl tactile-btn text-xs font-semibold text-rose-300/90 border border-rose-900/40 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Stats
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl tactile-btn text-xs font-bold text-[#f5eedc] border border-[#cfa858]/40 uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
