import React, { useState, useEffect } from 'react';
import { Difficulty } from './chessEngine';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { SettingsModal, GameSettings } from './components/SettingsModal';
import { StatsModal, GameStats } from './components/StatsModal';
import { sounds } from './utils/audio';
import './App.css';

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  difficultyStats: {
    easy: { wins: 0, losses: 0, draws: 0 },
    medium: { wins: 0, losses: 0, draws: 0 },
    hard: { wins: 0, losses: 0, draws: 0 },
    advanced: { wins: 0, losses: 0, draws: 0 },
  },
};

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<'ai' | 'pass_play'>('ai');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

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

  // Statistics
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('chessbuzz_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    localStorage.setItem('chessbuzz_settings', JSON.stringify(settings));
    sounds.enabled = settings.soundEnabled;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('chessbuzz_stats', JSON.stringify(stats));
  }, [stats]);

  const handleStartGame = (mode: 'ai' | 'pass_play') => {
    setGameMode(mode);
    setCurrentScreen('game');
  };

  const handleRecordGameResult = (result: 'win' | 'loss' | 'draw', matchDifficulty: Difficulty) => {
    setStats((prev) => {
      const diffStat = prev.difficultyStats[matchDifficulty] || { wins: 0, losses: 0, draws: 0 };
      const updatedDiff = {
        wins: result === 'win' ? diffStat.wins + 1 : diffStat.wins,
        losses: result === 'loss' ? diffStat.losses + 1 : diffStat.losses,
        draws: result === 'draw' ? diffStat.draws + 1 : diffStat.draws,
      };

      return {
        gamesPlayed: prev.gamesPlayed + 1,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        losses: result === 'loss' ? prev.losses + 1 : prev.losses,
        draws: result === 'draw' ? prev.draws + 1 : prev.draws,
        difficultyStats: {
          ...prev.difficultyStats,
          [matchDifficulty]: updatedDiff,
        },
      };
    });
  };

  const handleResetStats = () => {
    setStats(DEFAULT_STATS);
  };

  return (
    <div className="w-full h-full min-h-screen select-none overflow-hidden">
      {currentScreen === 'home' && (
        <HomeScreen
          selectedDifficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          onStartGame={handleStartGame}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() =>
            setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          difficulty={difficulty}
          gameMode={gameMode}
          onBackToMenu={() => setCurrentScreen('home')}
          onRecordGameResult={handleRecordGameResult}
        />
      )}

      {/* Global Modals for Home Screen access */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onResetStats={handleResetStats}
      />
    </div>
  );
};

export default App;
