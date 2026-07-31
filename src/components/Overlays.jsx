import React from 'react';
import { Play, RotateCcw, ArrowRight } from 'lucide-react';

export const StartOverlay = ({ active, onStart }) => {
  if (!active) return null;

  return (
    <div className="overlay-screen active">
      <div className="overlay-content">
        <h2 className="game-logo">PAC-MAN</h2>
        <p className="subtitle">NEON CYBER EDITION</p>

        <div className="ghost-preview-row">
          <div className="ghost-chip blinky" title="Blinky - Chaser"></div>
          <div className="ghost-chip pinky" title="Pinky - Ambusher"></div>
          <div className="ghost-chip inky" title="Inky - Flanker"></div>
          <div className="ghost-chip clyde" title="Clyde - Wanderer"></div>
        </div>

        <div className="instructions-box glass-card">
          <h3>CONTROLS</h3>
          <div className="controls-grid">
            <div className="key-group">
              <span className="key">W</span>
              <span className="key">A</span>
              <span className="key">S</span>
              <span className="key">D</span>
              <span className="key-desc">or</span>
              <span className="key">↑</span>
              <span className="key">←</span>
              <span className="key">↓</span>
              <span className="key">→</span>
              <span className="key-desc">Move</span>
            </div>
            <div className="key-group">
              <span className="key">P</span> <span className="key-desc">Pause</span>
              <span className="key">M</span> <span className="key-desc">Mute</span>
              <span className="key">R</span> <span className="key-desc">Restart</span>
            </div>
          </div>
        </div>

        <button onClick={onStart} className="primary-btn pulse-btn">
          <Play size={18} inline="true" /> START GAME
        </button>
      </div>
    </div>
  );
};

export const CountdownOverlay = ({ active, number }) => {
  if (!active) return null;

  return (
    <div className="overlay-screen active">
      <div className="countdown-text">{number}</div>
    </div>
  );
};

export const PauseOverlay = ({ active, onResume, onRestart }) => {
  if (!active) return null;

  return (
    <div className="overlay-screen active">
      <div className="overlay-content glass-card">
        <h2 className="neon-cyan">GAME PAUSED</h2>
        <p>Press <kbd>P</kbd> to resume</p>
        <div className="overlay-actions">
          <button onClick={onResume} className="primary-btn">
            Resume
          </button>
          <button onClick={onRestart} className="secondary-btn">
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameOverOverlay = ({ active, score, highScore, onPlayAgain }) => {
  if (!active) return null;

  return (
    <div className="overlay-screen active">
      <div className="overlay-content glass-card">
        <h2 className="neon-pink glow-text">GAME OVER</h2>
        <div className="final-stats">
          <div className="stat-row">
            <span>Final Score:</span>
            <span className="neon-yellow">{score}</span>
          </div>
          <div className="stat-row">
            <span>High Score:</span>
            <span className="neon-cyan">{highScore}</span>
          </div>
        </div>
        <button onClick={onPlayAgain} className="primary-btn pulse-btn">
          <RotateCcw size={18} /> PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export const VictoryOverlay = ({ active, score, onNextLevel }) => {
  if (!active) return null;

  return (
    <div className="overlay-screen active">
      <div className="overlay-content glass-card">
        <h2 className="neon-green glow-text">STAGE CLEAR!</h2>
        <p>Ready for the next challenge?</p>
        <div className="final-stats">
          <div className="stat-row">
            <span>Current Score:</span>
            <span className="neon-yellow">{score}</span>
          </div>
        </div>
        <button onClick={onNextLevel} className="primary-btn pulse-btn">
          <ArrowRight size={18} /> NEXT LEVEL
        </button>
      </div>
    </div>
  );
};
