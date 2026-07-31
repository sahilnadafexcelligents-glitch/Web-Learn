import React from 'react';
import { DIR } from '../utils/constants';

export const DPadControls = ({ onDirectionChange }) => {
  return (
    <section className="mobile-controls glass-panel">
      <div className="dpad">
        <button
          onClick={() => onDirectionChange(DIR.UP)}
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange(DIR.UP);
          }}
          className="dpad-btn up"
          aria-label="Up"
        >
          ▲
        </button>
        <button
          onClick={() => onDirectionChange(DIR.LEFT)}
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange(DIR.LEFT);
          }}
          className="dpad-btn left"
          aria-label="Left"
        >
          ◀
        </button>
        <button
          onClick={() => onDirectionChange(DIR.RIGHT)}
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange(DIR.RIGHT);
          }}
          className="dpad-btn right"
          aria-label="Right"
        >
          ▶
        </button>
        <button
          onClick={() => onDirectionChange(DIR.DOWN)}
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange(DIR.DOWN);
          }}
          className="dpad-btn down"
          aria-label="Down"
        >
          ▼
        </button>
        <div className="dpad-center"></div>
      </div>
    </section>
  );
};
