import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import {
  StartOverlay,
  CountdownOverlay,
  PauseOverlay,
  GameOverOverlay,
  VictoryOverlay
} from './components/Overlays';
import { DPadControls } from './components/DPadControls';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [gameState, setGameState] = useState('START'); // 'START', 'COUNTDOWN', 'PLAYING', 'PAUSED', 'GAME_OVER', 'VICTORY'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('pacman_high_score') || '0', 10)
  );
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [soundMuted, setSoundMuted] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  const directionChangeRef = useRef(() => {});

  // Save High Score to LocalStorage
  useEffect(() => {
    localStorage.setItem('pacman_high_score', highScore.toString());
  }, [highScore]);

  // Handle Confetti on Victory Stage Clear
  useEffect(() => {
    if (gameState === 'VICTORY') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [gameState]);

  const toggleSound = () => {
    soundEngine.muted = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  const startCountdown = () => {
    setGameState('COUNTDOWN');
    setCountdownNumber(3);

    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNumber(count);
      } else if (count === 0) {
        setCountdownNumber('GO!');
      } else {
        clearInterval(timer);
        setGameState('PLAYING');
      }
    }, 800);
  };

  const handleRestart = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    startCountdown();
  };

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    startCountdown();
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        soundMuted={soundMuted}
        onToggleSound={toggleSound}
        onRestart={handleRestart}
      />

      {/* Main Layout */}
      <main className="main-layout">
        {/* HUD Card */}
        <HUD
          score={score}
          highScore={highScore}
          level={level}
          lives={lives}
        />

        {/* Game Canvas Container */}
        <section className="game-container glass-panel">
          <GameCanvas
            gameState={gameState}
            setGameState={setGameState}
            score={score}
            setScore={setScore}
            highScore={highScore}
            setHighScore={setHighScore}
            lives={lives}
            setLives={setLives}
            level={level}
            setLevel={setLevel}
            onDirectionChangeRef={directionChangeRef}
          />

          {/* Overlays */}
          <StartOverlay
            active={gameState === 'START'}
            onStart={startCountdown}
          />

          <CountdownOverlay
            active={gameState === 'COUNTDOWN'}
            number={countdownNumber}
          />

          <PauseOverlay
            active={gameState === 'PAUSED'}
            onResume={() => setGameState('PLAYING')}
            onRestart={handleRestart}
          />

          <GameOverOverlay
            active={gameState === 'GAME_OVER'}
            score={score}
            highScore={highScore}
            onPlayAgain={handleRestart}
          />

          <VictoryOverlay
            active={gameState === 'VICTORY'}
            score={score}
            onNextLevel={handleNextLevel}
          />
        </section>

        {/* Mobile D-Pad */}
        <DPadControls
          onDirectionChange={(dir) => directionChangeRef.current(dir)}
        />
      </main>

      {/* Footer */}
      <footer className="footer-bar">
        <span>Pac-Man Neon Cyber Edition • React + Vite + 60 FPS HTML5 Canvas</span>
      </footer>
    </div>
  );
}
