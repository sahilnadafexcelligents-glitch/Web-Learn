import { CONFIG, DIR } from './constants';

export class FloatingScore {
  constructor(x, y, text, color = '#ffe600') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.alpha = 1.0;
    this.life = 45;
  }

  update() {
    this.y -= 0.5;
    this.alpha -= 1 / this.life;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.font = '800 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class Pacman {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 13.5 * CONFIG.TILE_SIZE;
    this.y = 23 * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    this.dir = DIR.LEFT;
    this.nextDir = DIR.LEFT;
    this.speed = CONFIG.BASE_SPEED;
    this.radius = CONFIG.TILE_SIZE / 2 - 1;
    this.mouthAngle = 0.2;
    this.mouthSpeed = 0.025;
    this.mouthDirection = 1;
  }

  setNextDirection(dir) {
    this.nextDir = dir;
  }

  update(map) {
    if (this.nextDir !== this.dir) {
      if (this.canTurn(this.nextDir, map)) {
        if (this.nextDir.x !== 0) {
          this.y = Math.floor(this.y / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        } else if (this.nextDir.y !== 0) {
          this.x = Math.floor(this.x / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        }
        this.dir = this.nextDir;
      }
    }

    if (this.canMove(this.dir, map)) {
      this.x += this.dir.x * this.speed;
      this.y += this.dir.y * this.speed;

      this.mouthAngle += this.mouthSpeed * this.mouthDirection;
      if (this.mouthAngle >= 0.45 || this.mouthAngle <= 0.05) {
        this.mouthDirection *= -1;
      }
    }

    const mapWidth = CONFIG.MAP_COLS * CONFIG.TILE_SIZE;
    if (this.x < -this.radius) {
      this.x = mapWidth + this.radius;
    } else if (this.x > mapWidth + this.radius) {
      this.x = -this.radius;
    }
  }

  canTurn(dir, map) {
    if (dir === DIR.NONE) return false;

    const tileX = Math.floor(this.x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / CONFIG.TILE_SIZE);

    const targetTileX = tileX + dir.x;
    const targetTileY = tileY + dir.y;

    if (targetTileY === 14 && (targetTileX < 0 || targetTileX >= CONFIG.MAP_COLS)) return true;
    if (targetTileY < 0 || targetTileY >= CONFIG.MAP_ROWS || targetTileX < 0 || targetTileX >= CONFIG.MAP_COLS) return false;

    const tile = map[targetTileY][targetTileX];
    if (tile === 1 || tile === 4) return false;

    if (dir.x !== 0) {
      const centerY = (tileY + 0.5) * CONFIG.TILE_SIZE;
      return Math.abs(this.y - centerY) <= CONFIG.TILE_SIZE * 0.45;
    } else {
      const centerX = (tileX + 0.5) * CONFIG.TILE_SIZE;
      return Math.abs(this.x - centerX) <= CONFIG.TILE_SIZE * 0.45;
    }
  }

  canMove(dir, map) {
    if (dir === DIR.NONE) return false;

    const nextX = this.x + dir.x * (this.speed + 1);
    const nextY = this.y + dir.y * (this.speed + 1);

    const checkRadius = this.radius - 1;
    const testPoints = [];

    if (dir.x !== 0) {
      testPoints.push({ x: nextX + dir.x * checkRadius, y: this.y - checkRadius });
      testPoints.push({ x: nextX + dir.x * checkRadius, y: this.y + checkRadius });
    } else {
      testPoints.push({ x: this.x - checkRadius, y: nextY + dir.y * checkRadius });
      testPoints.push({ x: this.x + checkRadius, y: nextY + dir.y * checkRadius });
    }

    for (let p of testPoints) {
      const tileX = Math.floor(p.x / CONFIG.TILE_SIZE);
      const tileY = Math.floor(p.y / CONFIG.TILE_SIZE);

      if (tileY === 14 && (tileX < 0 || tileX >= CONFIG.MAP_COLS)) continue;
      if (tileY < 0 || tileY >= CONFIG.MAP_ROWS || tileX < 0 || tileX >= CONFIG.MAP_COLS) return false;

      const tile = map[tileY][tileX];
      if (tile === 1 || tile === 4) return false;
    }
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    let angle = 0;
    if (this.dir === DIR.RIGHT) angle = 0;
    else if (this.dir === DIR.DOWN) angle = Math.PI / 2;
    else if (this.dir === DIR.LEFT) angle = Math.PI;
    else if (this.dir === DIR.UP) angle = (3 * Math.PI) / 2;

    ctx.rotate(angle);

    ctx.beginPath();
    ctx.arc(
      0, 0,
      this.radius,
      this.mouthAngle * Math.PI,
      (2 - this.mouthAngle) * Math.PI
    );
    ctx.lineTo(0, 0);
    ctx.fillStyle = '#ffe600';
    ctx.shadowColor = 'rgba(255, 230, 0, 0.8)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }
}

export class Ghost {
  constructor(name, color, spawnTileX, spawnTileY, scatterTarget) {
    this.name = name;
    this.color = color;
    this.spawnTile = { x: spawnTileX, y: spawnTileY };
    this.scatterTarget = scatterTarget;
    this.reset();
  }

  reset() {
    this.x = (this.spawnTile.x + 0.5) * CONFIG.TILE_SIZE;
    this.y = (this.spawnTile.y + 0.5) * CONFIG.TILE_SIZE;
    this.dir = DIR.UP;
    this.state = 'HOUSE';
    this.frightenedTimer = 0;
    this.flashState = false;
    this.speed = CONFIG.GHOST_SPEED;
    this.lastTileChosen = { x: -1, y: -1 };
  }

  update(pacman, blinky, map, globalState) {
    if (this.state === 'FRIGHTENED') {
      this.frightenedTimer -= 16.6;
      if (this.frightenedTimer <= CONFIG.FLASH_WARNING_TIME) {
        this.flashState = Math.floor(this.frightenedTimer / 200) % 2 === 0;
      }
      if (this.frightenedTimer <= 0) {
        this.state = globalState.ghostMode;
        this.flashState = false;
      }
    }

    if (this.state === 'EATEN') {
      this.speed = CONFIG.EATEN_GHOST_SPEED;
    } else if (this.state === 'FRIGHTENED') {
      this.speed = CONFIG.FRIGHTENED_GHOST_SPEED;
    } else {
      this.speed = CONFIG.GHOST_SPEED + (globalState.level - 1) * 0.15;
    }

    if (this.state === 'EATEN') {
      const houseX = 13.5 * CONFIG.TILE_SIZE;
      const houseY = 14.5 * CONFIG.TILE_SIZE;
      const distToHouse = Math.hypot(this.x - houseX, this.y - houseY);
      if (distToHouse < 4) {
        this.state = globalState.ghostMode;
      }
    }

    if (this.state === 'HOUSE') {
      const targetY = 11.5 * CONFIG.TILE_SIZE;
      const targetX = 13.5 * CONFIG.TILE_SIZE;

      if (Math.abs(this.x - targetX) > 2) {
        this.x += (targetX > this.x ? 1 : -1) * 1.5;
      } else if (this.y > targetY) {
        this.y -= 1.5;
      } else {
        this.state = globalState.ghostMode;
        this.dir = DIR.LEFT;
      }
      return;
    }

    const currentTileX = Math.floor(this.x / CONFIG.TILE_SIZE);
    const currentTileY = Math.floor(this.y / CONFIG.TILE_SIZE);
    const centerX = (currentTileX + 0.5) * CONFIG.TILE_SIZE;
    const centerY = (currentTileY + 0.5) * CONFIG.TILE_SIZE;

    const distToCenter = Math.hypot(this.x - centerX, this.y - centerY);

    if ((currentTileX !== this.lastTileChosen.x || currentTileY !== this.lastTileChosen.y) && distToCenter <= this.speed) {
      this.x = centerX;
      this.y = centerY;
      this.lastTileChosen = { x: currentTileX, y: currentTileY };

      const targetTile = this.getTargetTile(pacman, blinky, globalState.ghostMode);
      this.dir = this.chooseNextDirection(map, currentTileX, currentTileY, targetTile);
    }

    this.x += this.dir.x * this.speed;
    this.y += this.dir.y * this.speed;

    const mapWidth = CONFIG.MAP_COLS * CONFIG.TILE_SIZE;
    if (this.x < -CONFIG.TILE_SIZE / 2) {
      this.x = mapWidth + CONFIG.TILE_SIZE / 2;
    } else if (this.x > mapWidth + CONFIG.TILE_SIZE / 2) {
      this.x = -CONFIG.TILE_SIZE / 2;
    }
  }

  getTargetTile(pacman, blinky, globalGhostMode) {
    if (this.state === 'EATEN') {
      return { x: 13, y: 14 };
    }

    if (this.state === 'FRIGHTENED') {
      return {
        x: Math.floor(Math.random() * CONFIG.MAP_COLS),
        y: Math.floor(Math.random() * CONFIG.MAP_ROWS)
      };
    }

    const mode = this.state === 'HOUSE' ? 'CHASE' : (this.state === 'SCATTER' ? 'SCATTER' : globalGhostMode);

    if (mode === 'SCATTER') {
      return this.scatterTarget;
    }

    const pacTile = {
      x: Math.floor(pacman.x / CONFIG.TILE_SIZE),
      y: Math.floor(pacman.y / CONFIG.TILE_SIZE)
    };

    switch (this.name) {
      case 'blinky':
        return pacTile;
      case 'pinky':
        return {
          x: pacTile.x + pacman.dir.x * 4,
          y: pacTile.y + pacman.dir.y * 4
        };
      case 'inky':
        const offsetTile = {
          x: pacTile.x + pacman.dir.x * 2,
          y: pacTile.y + pacman.dir.y * 2
        };
        const blinkyTile = {
          x: Math.floor(blinky.x / CONFIG.TILE_SIZE),
          y: Math.floor(blinky.y / CONFIG.TILE_SIZE)
        };
        return {
          x: offsetTile.x + (offsetTile.x - blinkyTile.x),
          y: offsetTile.y + (offsetTile.y - blinkyTile.y)
        };
      case 'clyde':
        const myTile = {
          x: Math.floor(this.x / CONFIG.TILE_SIZE),
          y: Math.floor(this.y / CONFIG.TILE_SIZE)
        };
        const distToPac = Math.hypot(myTile.x - pacTile.x, myTile.y - pacTile.y);
        return distToPac > 8 ? pacTile : this.scatterTarget;
      default:
        return pacTile;
    }
  }

  chooseNextDirection(map, currentTileX, currentTileY, targetTile) {
    const possibleDirs = [DIR.UP, DIR.LEFT, DIR.DOWN, DIR.RIGHT];
    let bestDir = this.dir;
    let minDistance = Infinity;

    const oppositeDir = { x: -this.dir.x, y: -this.dir.y };

    for (let d of possibleDirs) {
      if (d.x === oppositeDir.x && d.y === oppositeDir.y) continue;

      const nextTileX = currentTileX + d.x;
      const nextTileY = currentTileY + d.y;

      if (nextTileY === 14 && (nextTileX < 0 || nextTileX >= CONFIG.MAP_COLS)) {
        return d;
      }

      if (
        nextTileY >= 0 && nextTileY < CONFIG.MAP_ROWS &&
        nextTileX >= 0 && nextTileX < CONFIG.MAP_COLS
      ) {
        const tile = map[nextTileY][nextTileX];
        if (tile === 1 || (tile === 4 && this.state !== 'EATEN')) continue;

        const dist = Math.hypot(nextTileX - targetTile.x, nextTileY - targetTile.y);
        if (dist < minDistance) {
          minDistance = dist;
          bestDir = d;
        }
      }
    }

    return bestDir;
  }

  makeFrightened() {
    if (this.state !== 'EATEN' && this.state !== 'HOUSE') {
      this.state = 'FRIGHTENED';
      this.frightenedTimer = CONFIG.FRIGHTENED_DURATION;
      this.flashState = false;
      this.dir = { x: -this.dir.x, y: -this.dir.y };
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const radius = CONFIG.TILE_SIZE / 2 - 1;
    let bodyColor = this.color;
    if (this.state === 'FRIGHTENED') {
      bodyColor = this.flashState ? '#ffffff' : '#0033ff';
    }

    if (this.state !== 'EATEN') {
      ctx.beginPath();
      ctx.arc(0, -2, radius, Math.PI, 0, false);
      ctx.lineTo(radius, radius - 2);

      const waveWidth = (radius * 2) / 3;
      ctx.lineTo(radius - waveWidth * 0.5, radius + 2);
      ctx.lineTo(radius - waveWidth, radius - 2);
      ctx.lineTo(radius - waveWidth * 1.5, radius + 2);
      ctx.lineTo(radius - waveWidth * 2, radius - 2);
      ctx.lineTo(radius - waveWidth * 2.5, radius + 2);
      ctx.lineTo(-radius, radius - 2);
      ctx.closePath();

      ctx.fillStyle = bodyColor;
      ctx.shadowColor = bodyColor;
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    const eyeOffset = 3;
    const irisOffsetX = this.dir.x * 2;
    const irisOffsetY = this.dir.y * 2;

    ctx.beginPath();
    ctx.arc(-eyeOffset, -3, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-eyeOffset + irisOffsetX, -3 + irisOffsetY, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = this.state === 'FRIGHTENED' && !this.flashState ? '#ffe600' : '#002288';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeOffset, -3, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeOffset + irisOffsetX, -3 + irisOffsetY, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = this.state === 'FRIGHTENED' && !this.flashState ? '#ffe600' : '#002288';
    ctx.fill();

    ctx.restore();
  }
}
