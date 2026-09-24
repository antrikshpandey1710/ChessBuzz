import React from 'react';
import { X, Volume2, VolumeX, Eye, Compass, Crown, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface GameSettings {
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  autoQueen: boolean;
  flippedBoard: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fadeIn">
      <div className="w-full max-w-md promotion-card p-6 border border-[#cfa858]/40 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-wider gold-text uppercase">
              Game Settings
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

        {/* Toggles */}
        <div className="space-y-3.5">
          {/* Sound */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#140b06]/80 border border-stone-800">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-[#cfa858]" />
              ) : (
                <VolumeX className="w-5 h-5 text-stone-500" />
              )}
              <div>
                <div className="text-sm font-semibold text-stone-200">Sound Effects</div>
                <div className="text-[11px] text-stone-400">Wooden move and capture sounds</div>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                sounds.enabled = next;
                if (next) sounds.playMove();
                onUpdateSettings({ soundEnabled: next });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-[#cfa858]' : 'bg-stone-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Legal Moves */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#140b06]/80 border border-stone-800">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#cfa858]" />
              <div>
                <div className="text-sm font-semibold text-stone-200">Legal Move Hints</div>
                <div className="text-[11px] text-stone-400">Show dots and capture indicators</div>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateSettings({ showLegalMoves: !settings.showLegalMoves });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showLegalMoves ? 'bg-[#cfa858]' : 'bg-stone-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.showLegalMoves ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Board Coordinates */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#140b06]/80 border border-stone-800">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-[#cfa858]" />
              <div>
                <div className="text-sm font-semibold text-stone-200">Board Coordinates</div>
                <div className="text-[11px] text-stone-400">Show rank (1-8) and file (a-h) markings</div>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateSettings({ showCoordinates: !settings.showCoordinates });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showCoordinates ? 'bg-[#cfa858]' : 'bg-stone-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.showCoordinates ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto Queen */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#140b06]/80 border border-stone-800">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-[#cfa858]" />
              <div>
                <div className="text-sm font-semibold text-stone-200">Auto-Promote to Queen</div>
                <div className="text-[11px] text-stone-400">Promote pawn to queen without dialog</div>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateSettings({ autoQueen: !settings.autoQueen });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.autoQueen ? 'bg-[#cfa858]' : 'bg-stone-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.autoQueen ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Flip Board */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#140b06]/80 border border-stone-800">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-[#cfa858]" />
              <div>
                <div className="text-sm font-semibold text-stone-200">Flip Board Perspective</div>
                <div className="text-[11px] text-stone-400">Play from Black's perspective</div>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateSettings({ flippedBoard: !settings.flippedBoard });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.flippedBoard ? 'bg-[#cfa858]' : 'bg-stone-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.flippedBoard ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full mt-5 py-2.5 rounded-xl tactile-btn font-bold text-sm text-[#f5eedc] border border-[#cfa858]/40 uppercase tracking-wider"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
