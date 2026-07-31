import React from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

export const Header = ({ soundMuted, onToggleSound, onRestart }) => {
  return (
    <header className="header-bar">
      <div className="brand">
        <div className="brand-icon"></div>
        <h1 className="brand-title">
          PAC-MAN <span className="badge">NEON REACT</span>
        </h1>
      </div>

      <div className="header-actions">
        <button
          onClick={onToggleSound}
          className="glass-btn"
          title="Toggle Sound (M)"
        >
          {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span className="btn-text">{soundMuted ? 'Muted' : 'Sound ON'}</span>
        </button>

        <button
          onClick={onRestart}
          className="glass-btn"
          title="Restart Game (R)"
        >
          <RotateCcw size={16} />
          <span className="btn-text">Restart</span>
        </button>
      </div>
    </header>
  );
};
