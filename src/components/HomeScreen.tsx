import React from 'react';
import { Difficulty, botSettings } from '../chessEngine';
import { ChessPiece3D } from './ChessPiece3D';
import { Play, Users, BarChart3, Settings, Volume2, VolumeX, Shield, Award, Zap, Compass } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HomeScreenProps {
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartGame: (mode: 'ai' | 'pass_play') => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenSettings,
  onOpenStats,
  soundEnabled,
  onToggleSound,
}) => {
  const difficulties: { key: Difficulty; icon: React.ReactNode; color: string; badge: string }[] = [
    {
      key: 'easy',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300',
      badge: 'EASY',
    },
    {
      key: 'medium',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-700/60 bg-amber-950/20 text-amber-300',
      badge: 'MEDIUM',
    },
    {
      key: 'hard',
      icon: <Zap className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-700/60 bg-rose-950/20 text-rose-300',
      badge: 'HARD',
    },
    {
      key: 'advanced',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-700/60 bg-purple-950/20 text-purple-300',
      badge: 'ADVANCED',
    },
  ];

  return (
    <div className="relative w-full h-full min-h-screen wood-tabletop flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Header & Quick Toggles */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4d2d1b] to-[#1c0e07] border border-[#cfa858]/40 flex items-center justify-center shadow-lg">
            <div className="w-7 h-7">
              <ChessPiece3D type="k" color="w" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider gold-text uppercase">
              ChessBuzz
            </h1>
            <p className="text-[11px] text-[#cfa858]/70 tracking-widest font-semibold uppercase -mt-0.5">
              Grandmaster 3D Edition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onToggleSound();
            }}
            className="w-10 h-10 rounded-xl tactile-btn flex items-center justify-center text-[#cfa858]"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-stone-500" />}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenStats();
            }}
            className="w-10 h-10 rounded-xl tactile-btn flex items-center justify-center text-[#cfa858]"
            title="Statistics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-xl tactile-btn flex items-center justify-center text-[#cfa858]"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Showcase Centerpiece */}
      <div className="w-full max-w-xl flex flex-col items-center text-center my-auto py-4 z-10">
        {/* 3D Visual Duel Avatar Showcase */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 mb-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-[#3d2417] to-[#180d07] border-2 border-[#cfa858]/50 p-2 shadow-2xl flex items-center justify-center">
            <ChessPiece3D type="k" color="w" />
          </div>
          <div className="px-3 py-1 rounded-full bg-[#180d07]/80 border border-[#cfa858]/30 text-xs font-bold text-[#cfa858] tracking-widest uppercase shadow-md">
            VS
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-[#3d2417] to-[#180d07] border-2 border-[#cfa858]/50 p-2 shadow-2xl flex items-center justify-center">
            <ChessPiece3D type="k" color="b" />
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold tracking-widest text-[#cfa858] uppercase">
              AI Difficulty
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              {botSettings[selectedDifficulty].name}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {difficulties.map((d) => {
              const isSelected = selectedDifficulty === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => {
                    sounds.playClick();
                    onSelectDifficulty(d.key);
                  }}
                  className={`relative p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-left ${
                    isSelected
                      ? 'border-[#cfa858] bg-gradient-to-b from-[#4d2c18] to-[#25140b] shadow-[0_0_15px_rgba(207,168,88,0.35)] ring-1 ring-[#cfa858]'
                      : 'border-stone-800 bg-[#1e1009]/70 hover:border-stone-700 hover:bg-[#28150c]/80 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {d.icon}
                    <span className="text-[10px] font-black tracking-wider uppercase opacity-80">
                      {d.badge}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-stone-100 mt-0.5">
                    {botSettings[d.key].name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-stone-400 line-clamp-1">
                    Depth {botSettings[d.key].depth}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-400/90 italic text-center mt-2.5 px-2">
            "{botSettings[selectedDifficulty].description}"
          </p>
        </div>

        {/* Primary Action Launch Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onStartGame('ai');
            }}
            className="flex-1 py-3.5 px-6 rounded-xl tactile-btn bg-gradient-to-r from-[#59341c] via-[#754425] to-[#59341c] border-2 border-[#cfa858] flex items-center justify-center gap-3 shadow-xl group cursor-pointer"
          >
            <Play className="w-5 h-5 text-[#f5eedc] fill-[#f5eedc] transition-transform group-hover:scale-110" />
            <div className="text-left">
              <div className="text-base font-black tracking-wider text-white uppercase">
                Play vs Computer
              </div>
              <div className="text-[11px] text-[#cfa858] font-semibold tracking-wide uppercase">
                {botSettings[selectedDifficulty].name}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onStartGame('pass_play');
            }}
            className="flex-1 py-3.5 px-6 rounded-xl tactile-btn border border-[#cfa858]/40 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Users className="w-5 h-5 text-[#cfa858]" />
            <div className="text-left">
              <div className="text-base font-bold text-stone-100">
                Pass & Play
              </div>
              <div className="text-[11px] text-stone-400">
                2 Players • Local Board
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/80 pt-3 z-10">
        <span>Staunton 3D Classical Rules</span>
        <span className="text-[#cfa858]/80 font-medium">Auto-Queen • Castling • En Passant</span>
      </div>
    </div>
  );
};
