import React, { useRef, useEffect } from 'react';
import { CONFIG, ORIGINAL_MAP, DIR } from '../utils/constants';
import { Pacman, Ghost, FloatingScore } from '../utils/gameEngine';
import { soundEngine } from '../utils/soundEngine';

export const GameCanvas = ({
  gameState,
  setGameState,
  score,
  setScore,
  highScore,
  setHighScore,
  lives,
  setLives,
  level,
  setLevel,
  onDirectionChangeRef
}) => {
  const canvasRef = useRef(null);

  // Mutable Game References
  const gameRef = useRef({
    map: ORIGINAL_MAP.map(r => [...r]),
    pacman: new Pacman(),
    ghosts: [],
    floatingScores: [],
    dotsRemaining: 0,
    ghostMode: 'CHASE',
    ghostModeTimer: 0,
    ghostEatCombo: 0,
    animFrameId: null
  });

  // Expose direction change method via ref
  useEffect(() => {
    onDirectionChangeRef.current = (dir) => {
      if (gameState === 'PLAYING') {
        gameRef.current.pacman.setNextDirection(dir);
      }
    };
  }, [gameState, onDirectionChangeRef]);

  // Map & Ghost Reset Helper
  const resetMapAndEntities = () => {
    const g = gameRef.current;
    g.map = ORIGINAL_MAP.map(r => [...r]);
    g.dotsRemaining = 0;

    for (let r = 0; r < CONFIG.MAP_ROWS; r++) {
      for (let c = 0; c < CONFIG.MAP_COLS; c++) {
        if (g.map[r][c] === 2 || g.map[r][c] === 3) {
          g.dotsRemaining++;
        }
      }
    }

    g.pacman.reset();
    g.ghosts = [
      new Ghost('blinky', '#ff0055', 13, 11, { x: CONFIG.MAP_COLS - 2, y: 0 }),
      new Ghost('pinky', '#ff77bc', 13, 14, { x: 2, y: 0 }),
      new Ghost('inky', '#00f0ff', 11, 14, { x: CONFIG.MAP_COLS - 1, y: CONFIG.MAP_ROWS - 1 }),
      new Ghost('clyde', '#ff9900', 15, 14, { x: 0, y: CONFIG.MAP_ROWS - 1 })
    ];
    g.floatingScores = [];
    g.ghostEatCombo = 0;
  };

  // Trigger level reset on level/game start
  useEffect(() => {
    if (gameState === 'START') {
      resetMapAndEntities();
    }
  }, [gameState]);

  // Main Game Loop & Keyboard Listeners Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleKeyDown = (e) => {
      soundEngine.init();

      if (e.key === 'p' || e.key === 'P') {
        setGameState(prev => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
        return;
      }

      if (gameState !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          gameRef.current.pacman.setNextDirection(DIR.UP);
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          gameRef.current.pacman.setNextDirection(DIR.DOWN);
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          gameRef.current.pacman.setNextDirection(DIR.LEFT);
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          gameRef.current.pacman.setNextDirection(DIR.RIGHT);
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Touch Swipe handling on canvas
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      soundEngine.init();
    };

    const handleTouchEnd = (e) => {
      if (gameState !== 'PLAYING') return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) gameRef.current.pacman.setNextDirection(DIR.RIGHT);
        else if (dx < -20) gameRef.current.pacman.setNextDirection(DIR.LEFT);
      } else {
        if (dy > 20) gameRef.current.pacman.setNextDirection(DIR.DOWN);
        else if (dy < -20) gameRef.current.pacman.setNextDirection(DIR.UP);
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Render loop
    const renderMaze = () => {
      const g = gameRef.current;
      for (let r = 0; r < CONFIG.MAP_ROWS; r++) {
        for (let c = 0; c < CONFIG.MAP_COLS; c++) {
          const tile = g.map[r][c];
          const x = c * CONFIG.TILE_SIZE;
          const y = r * CONFIG.TILE_SIZE;

          if (tile === 1) { // Wall
            ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, CONFIG.TILE_SIZE - 2, CONFIG.TILE_SIZE - 2, 4);
            ctx.fill();
            ctx.stroke();
          } else if (tile === 4) { // Ghost Gate
            ctx.strokeStyle = '#ff77bc';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(255, 119, 188, 0.8)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(x, y + CONFIG.TILE_SIZE / 2);
            ctx.lineTo(x + CONFIG.TILE_SIZE, y + CONFIG.TILE_SIZE / 2);
            ctx.stroke();
          } else if (tile === 2) { // Dot
            ctx.fillStyle = '#ffe600';
            ctx.shadowColor = 'rgba(255, 230, 0, 0.8)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 3) { // Power Pellet
            const pulseRadius = 5 + Math.sin(Date.now() * 0.008) * 1.5;
            ctx.fillStyle = '#ff007f';
            ctx.shadowColor = 'rgba(255, 0, 127, 0.9)';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const updateFrame = () => {
      if (gameState === 'PLAYING') {
        const g = gameRef.current;

        // Pacman Update
        g.pacman.update(g.map);

        // Dot & Pellet Collision
        const pacTileX = Math.floor(g.pacman.x / CONFIG.TILE_SIZE);
        const pacTileY = Math.floor(g.pacman.y / CONFIG.TILE_SIZE);

        if (pacTileY >= 0 && pacTileY < CONFIG.MAP_ROWS && pacTileX >= 0 && pacTileX < CONFIG.MAP_COLS) {
          const tile = g.map[pacTileY][pacTileX];
          if (tile === 2) {
            g.map[pacTileY][pacTileX] = 0;
            g.dotsRemaining--;
            soundEngine.playDotSound();
            setScore(prev => {
              const next = prev + CONFIG.DOT_PTS;
              if (next > highScore) setHighScore(next);
              return next;
            });
          } else if (tile === 3) {
            g.map[pacTileY][pacTileX] = 0;
            g.dotsRemaining--;
            soundEngine.playPowerPelletSound();
            g.ghostEatCombo = 0;
            g.ghosts.forEach(ghost => ghost.makeFrightened());
            setScore(prev => {
              const next = prev + CONFIG.POWER_PELLET_PTS;
              if (next > highScore) setHighScore(next);
              return next;
            });
          }
        }

        // Check Victory
        if (g.dotsRemaining <= 0) {
          soundEngine.playWinSound();
          setGameState('VICTORY');
          return;
        }

        // Mode switch
        g.ghostModeTimer += 16.6;
        if (g.ghostModeTimer > 20000) {
          g.ghostMode = g.ghostMode === 'CHASE' ? 'SCATTER' : 'CHASE';
          g.ghostModeTimer = 0;
        }

        // Ghosts Update & Collision
        const blinky = g.ghosts.find(ghost => ghost.name === 'blinky');
        g.ghosts.forEach(ghost => {
          ghost.update(g.pacman, blinky, g.map, { level, ghostMode: g.ghostMode });

          const dist = Math.hypot(g.pacman.x - ghost.x, g.pacman.y - ghost.y);
          if (dist < CONFIG.TILE_SIZE * 0.75) {
            if (ghost.state === 'FRIGHTENED') {
              ghost.state = 'EATEN';
              soundEngine.playEatGhostSound();

              const pts = CONFIG.GHOST_PTS[Math.min(g.ghostEatCombo, 3)];
              g.ghostEatCombo++;
              g.floatingScores.push(new FloatingScore(ghost.x, ghost.y, `+${pts}`, '#00f0ff'));

              setScore(prev => {
                const next = prev + pts;
                if (next > highScore) setHighScore(next);
                return next;
              });
            } else if (ghost.state !== 'EATEN') {
              // Player hit by ghost!
              soundEngine.playDeathSound();
              setLives(prev => {
                const nextLives = prev - 1;
                if (nextLives <= 0) {
                  setGameState('GAME_OVER');
                } else {
                  // Reset positions for next life
                  g.pacman.reset();
                  g.ghosts.forEach(gh => gh.reset());
                }
                return nextLives;
              });
            }
          }
        });

        // Floating Scores
        g.floatingScores.forEach(fs => fs.update());
        g.floatingScores = g.floatingScores.filter(fs => fs.alpha > 0);
      }

      // Render Step
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
      renderMaze();
      gameRef.current.pacman.draw(ctx);
      gameRef.current.ghosts.forEach(gh => gh.draw(ctx));
      gameRef.current.floatingScores.forEach(fs => fs.draw(ctx));

      gameRef.current.animFrameId = requestAnimationFrame(updateFrame);
    };

    gameRef.current.animFrameId = requestAnimationFrame(updateFrame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (gameRef.current.animFrameId) {
        cancelAnimationFrame(gameRef.current.animFrameId);
      }
    };
  }, [gameState, level, setScore, setHighScore, setLives, setGameState, highScore]);

  return (
    <canvas
      ref={canvasRef}
      id="gameCanvas"
      width={CONFIG.CANVAS_WIDTH}
      height={CONFIG.CANVAS_HEIGHT}
    />
  );
};
