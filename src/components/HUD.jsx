import React from 'react';

export const HUD = ({ score, highScore, level, lives }) => {
  return (
    <section className="hud-card glass-panel">
      <div className="hud-item">
        <span className="hud-label">SCORE</span>
        <span className="hud-value neon-yellow">
          {score.toString().padStart(5, '0')}
        </span>
      </div>

      <div className="hud-item">
        <span className="hud-label">HIGH SCORE</span>
        <span className="hud-value neon-cyan">
          {highScore.toString().padStart(5, '0')}
        </span>
      </div>

      <div className="hud-item">
        <span className="hud-label">LEVEL</span>
        <span className="hud-value neon-pink">{level}</span>
      </div>

      <div className="hud-item">
        <span className="hud-label">LIVES</span>
        <div className="lives-icons">
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <div key={i} className="life-icon"></div>
          ))}
        </div>
      </div>
    </section>
  );
};
