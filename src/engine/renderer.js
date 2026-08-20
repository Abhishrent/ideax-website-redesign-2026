import {
  CHAR_W, CHAR_H, FOV, HALF_FOV, MAX_DEPTH, EYE_HEIGHT,
  WALL_RAMP, FLOOR_RAMP,
  TIERS,
} from './constants'
import { castRay } from './raycaster'
import {
  rampChar, shade,
  stoneWallTexture, columnTexture, windowTexture,
  torchCellTexture, tapestryTexture, ceilingTexture, paintCell,
  SPRITE_DEFS,
} from './textures'
import { currentRoom, ROOMS, torchGlow as calcTorchGlow, torchFlicker } from './museum'

function cellHeight(museum, x, y) {
  return (museum.heightGrid[y] && museum.heightGrid[y][x]) || 3.2;
}

const MAP_CH = {
  1: ["#", "rgba(140,138,155,0.5)"],
  3: ["I", "rgba(206,196,168,0.85)"],
  4: ["\u25AF", "rgba(120,150,220,0.85)"],
  5: ["*", "#e8934f"],
  6: ["~", "rgba(150,90,110,0.8)"],
};
const TIER_DOT_COLOR = { platinum: "#d6d6de", gold: "#c49b40", silver: "#b0b0b8" };
const MM_COLORS = {
  1: "rgba(150,150,165,0.35)",
  2: "rgba(217,165,68,0.9)",
  3: "rgba(210,196,168,0.55)",
  4: "rgba(120,150,220,0.75)",
  5: "rgba(230,140,50,0.85)",
  6: "rgba(150,90,110,0.6)",
};

export function createRendererState() {
  return {
    COLS: 0, ROWS: 0, PITCH_LIMIT: 0,
    zbuffer: null,
    fps: 0, fpsFrames: 0, fpsTimer: 0,
  };
}

export function resize(renderer, canvas) {
  const ctx = canvas.getContext("2d");
  renderer.COLS = Math.max(70, Math.floor(window.innerWidth / CHAR_W));
  renderer.ROWS = Math.max(34, Math.floor(window.innerHeight / CHAR_H));
  canvas.width = renderer.COLS * CHAR_W;
  canvas.height = renderer.ROWS * CHAR_H;
  ctx.font = `${CHAR_H - 2}px 'JetBrains Mono', ui-monospace, monospace`;
  ctx.textBaseline = "top";
  renderer.PITCH_LIMIT = renderer.ROWS * 0.62;
  renderer.zbuffer = new Float32Array(renderer.COLS);
}

export function renderFullMap(timeSec, ctx, renderer, player, museum, paintingLookup) {
  const { COLS, ROWS } = renderer;
  ctx.fillStyle = "#0d0f14";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const title = "IDEAX \u2014 FULL MAP";
  ctx.fillStyle = "#e8e2f5";
  ctx.fillText(title, ((COLS - title.length) / 2) * CHAR_W, 1.4 * CHAR_H);

  const marginTop = 4, marginBottom = 3;
  const availCols = COLS - 6, availRows = ROWS - marginTop - marginBottom;
  const cell = Math.max(1, Math.floor(Math.min(availCols / museum.W, availRows / museum.H)));
  const offCol = Math.floor((COLS - museum.W * cell) / 2);
  const offRow = marginTop + Math.floor((availRows - museum.H * cell) / 2);

  for (let y = 0; y < museum.H; y++) {
    for (let x = 0; x < museum.W; x++) {
      const v = museum.grid[y][x];
      if (v === 0) continue;
      let ch = "#", color = "rgba(140,138,155,0.5)";
      if (v === 2) {
        const p = paintingLookup[`${x},${y}`];
        ch = "\u25AE";
        color = p ? TIER_DOT_COLOR[p.tier] : "#d9a544";
      } else if (MAP_CH[v]) {
        [ch, color] = MAP_CH[v];
      }
      ctx.fillStyle = color;
      for (let cy = 0; cy < cell; cy++) {
        for (let cx = 0; cx < cell; cx++) {
          ctx.fillText(ch, (offCol + x * cell + cx) * CHAR_W, (offRow + y * cell + cy) * CHAR_H);
        }
      }
    }
  }

  ctx.fillStyle = "#e8e2f5";
  for (const r of ROOMS) {
    const label = r.name;
    const cx = offCol + ((r.x0 + r.x1 + 1) / 2) * cell;
    const cy = offRow + ((r.y0 + r.y1 + 1) / 2) * cell;
    ctx.fillText(label, (cx - label.length / 2) * CHAR_W, cy * CHAR_H);
  }

  const blink = Math.sin(timeSec * 6) > 0;
  const px = offCol + player.x * cell, py = offRow + player.y * cell;
  ctx.fillStyle = "#b3382b";
  ctx.fillText(blink ? "@" : "\u25CF", px * CHAR_W, py * CHAR_H);
  const ax = px + Math.cos(player.angle) * 1.6, ay = py + Math.sin(player.angle) * 1.6;
  ctx.fillText("\u2022", ax * CHAR_W, ay * CHAR_H);

  const legendY = (ROWS - 2) * CHAR_H;
  ctx.fillStyle = TIER_DOT_COLOR.platinum; ctx.fillText("\u25AE PLATINUM", 3 * CHAR_W, legendY);
  ctx.fillStyle = TIER_DOT_COLOR.gold;     ctx.fillText("\u25AE GOLD", 17 * CHAR_W, legendY);
  ctx.fillStyle = TIER_DOT_COLOR.silver;   ctx.fillText("\u25AE SILVER", 26 * CHAR_W, legendY);
  ctx.fillStyle = "#b3382b";               ctx.fillText("@ YOU", 37 * CHAR_W, legendY);
  ctx.fillStyle = "#4a4a5c";
  const hint = "press M to close";
  ctx.fillText(hint, (COLS - hint.length - 3) * CHAR_W, legendY);
}

export function render(timeSec, ctx, renderer, player, input, museum, paintingLookup, torches, sprites) {
  const { COLS, ROWS, PITCH_LIMIT } = renderer;

  if (input.mapOpen) {
    renderFullMap(timeSec, ctx, renderer, player, museum, paintingLookup);
    return;
  }

  ctx.fillStyle = "#0d0f14";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const horizon = ROWS / 2 + player.pitch;
  const ambientFlicker = 0.97 + 0.03 * Math.sin(timeSec * 3.1) + 0.02 * Math.sin(timeSec * 5.7);

  for (let col = 0; col < COLS; col++) {
    const rayAngle = player.angle - HALF_FOV + (col / COLS) * FOV;
    const { perpDist, side, wallX, cellValue, dirX, dirY, mapX, mapY } = castRay(rayAngle, player, museum);
    renderer.zbuffer[col] = perpDist;

    const wallH = cellHeight(museum, mapX, mapY);
    const totalHeight = Math.max(1, Math.min(ROWS * 8, Math.round(wallH * ROWS / (perpDist + 0.0001))));
    const scalePerUnit = totalHeight / wallH;
    const aboveEye = Math.max(0, wallH - EYE_HEIGHT) * scalePerUnit;
    const belowEye = Math.min(wallH, EYE_HEIGHT) * scalePerUnit;
    const wallTop = Math.floor(horizon - aboveEye);
    const wallBottom = Math.floor(horizon + belowEye);
    const baseBrightness = Math.max(0, 1 - perpDist / MAX_DEPTH) * (side === 0 ? 1 : 0.72) * ambientFlicker;

    const wallGlow = calcTorchGlow(
      side === 0 ? mapX + (dirX > 0 ? 0 : 1) : player.x + perpDist * dirX,
      side === 1 ? mapY + (dirY > 0 ? 0 : 1) : player.y + perpDist * dirY,
      timeSec, torches
    );
    const brightness = Math.min(1, baseBrightness + wallGlow * 0.28);

    let painting = null, tier = null, torchRef = null, tapestrySeed = 0;
    if (cellValue === 2) { painting = paintingLookup[`${mapX},${mapY}`]; tier = painting ? TIERS[painting.tier] : null; }
    if (cellValue === 5) { torchRef = torches.find(t => Math.floor(t.x) === mapX && Math.floor(t.y) === mapY) || null; }
    if (cellValue === 6) { tapestrySeed = Math.abs((mapX * 7 + mapY * 13) | 0); }

    const px = col * CHAR_W;
    for (let row = 0; row < ROWS; row++) {
      const py = row * CHAR_H;
      let ch = " ", colr = null;

      if (row < wallTop) {
        const rowDist = horizon / Math.max(0.0001, (horizon - row));
        const t = Math.max(0, 1 - rowDist / MAX_DEPTH);
        const cfx = player.x + dirX * rowDist, cfy = player.y + dirY * rowDist;
        const ceilGlow = calcTorchGlow(cfx, cfy, timeSec, torches) * 0.15;
        const ceilResult = ceilingTexture(cfx, cfy, t, ambientFlicker, ceilGlow, timeSec);
        ch = ceilResult.ch; colr = ceilResult.colr;
      } else if (row <= wallBottom) {
        const rowFrac = (row - wallTop) / Math.max(1, wallBottom - wallTop);
        let result;
        if (cellValue === 2 && painting && tier) result = paintCell(painting, tier, wallX, rowFrac, brightness);
        else if (cellValue === 3) result = columnTexture(wallX, rowFrac, brightness);
        else if (cellValue === 4) result = windowTexture(wallX, rowFrac, brightness, timeSec);
        else if (cellValue === 5) result = torchCellTexture(wallX, rowFrac, brightness, timeSec, torchRef, torchFlicker);
        else if (cellValue === 6) result = tapestryTexture(wallX, rowFrac, brightness, tapestrySeed);
        else result = stoneWallTexture(wallX, rowFrac, brightness);
        ch = result.ch; colr = result.colr;
      } else {
        const rowDist = horizon / Math.max(0.0001, (row - horizon));
        const t = Math.max(0, 1 - rowDist / MAX_DEPTH);
        const fx = player.x + dirX * rowDist;
        const fy = player.y + dirY * rowDist;
        const plank = (Math.floor(fx * 2) + Math.floor(fy * 2)) % 2 === 0;
        const floorGlow = calcTorchGlow(fx, fy, timeSec, torches);
        ch = rampChar(FLOOR_RAMP, Math.min(1, t + floorGlow * 0.5));
        const floorBase = plank ? [94, 90, 84] : [72, 69, 64];
        colr = shade(floorBase, Math.min(1, (0.3 + t * 0.6) * ambientFlicker + floorGlow * 0.55));
      }

      if (ch !== " ") { ctx.fillStyle = colr; ctx.fillText(ch, px, py); }
    }
  }

  /* sprite pass */
  const projected = [];
  for (const s of sprites) {
    const dx = s.x - player.x, dy = s.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.15) continue;
    let angle = Math.atan2(dy, dx) - player.angle;
    angle = ((angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    if (Math.abs(angle) > HALF_FOV + 0.5) continue;
    projected.push({ s, dist, angle });
  }
  projected.sort((a, b) => b.dist - a.dist);

  for (const { s, dist, angle } of projected) {
    const def = SPRITE_DEFS[s.type];
    const sizeMul = s.scale || 1;
    const rowsPerUnit = ROWS / dist;
    const colsPerUnit = COLS / FOV / dist;
    const colCenter = COLS / 2 + (angle * COLS) / FOV;
    const spriteH = rowsPerUnit * def.hWorld * sizeMul;
    const spriteW = colsPerUnit * def.wWorld * sizeMul;

    const localH = cellHeight(museum, Math.floor(s.x), Math.floor(s.y));
    const floorRow = horizon + Math.min(localH, EYE_HEIGHT) * rowsPerUnit;
    const ceilRow = horizon - Math.max(0, localH - EYE_HEIGHT) * rowsPerUnit;

    let top, bottom;
    if (def.anchor === 'floor') {
      bottom = floorRow;
      top = bottom - spriteH;
    } else {
      top = ceilRow;
      bottom = top + spriteH;
    }
    const left = colCenter - spriteW / 2;
    const right = colCenter + spriteW / 2;

    const c0 = Math.max(0, Math.floor(left)), c1 = Math.min(COLS - 1, Math.ceil(right));
    const r0 = Math.max(0, Math.floor(top)), r1 = Math.min(ROWS - 1, Math.ceil(bottom));
    if (c1 < c0 || r1 < r0) continue;

    const spriteBrightness = Math.max(0, 1 - dist / MAX_DEPTH);
    const glow = calcTorchGlow(s.x, s.y, timeSec, torches);

    for (let col = c0; col <= c1; col++) {
      if (dist >= renderer.zbuffer[col]) continue;
      const u = (col + 0.5 - left) / (right - left);
      if (u < 0 || u > 1) continue;
      const spx = col * CHAR_W;
      for (let row = r0; row <= r1; row++) {
        const v = (row + 0.5 - top) / (bottom - top);
        if (v < 0 || v > 1) continue;
        const result = def.tex(u, v, spriteBrightness, glow, timeSec);
        if (!result) continue;
        ctx.fillStyle = result.colr;
        ctx.fillText(result.ch, spx, row * CHAR_H);
      }
    }
  }
}

export function renderMinimap(mmCtx, mmCanvas, player, museum) {
  const size = mmCanvas.width;
  const cell = size / 12;
  mmCtx.fillStyle = "#0d0f14";
  mmCtx.fillRect(0, 0, size, size);
  const startX = Math.floor(player.x - 6);
  const startY = Math.floor(player.y - 6);
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      const mx = startX + x, my = startY + y;
      if (mx < 0 || my < 0 || mx >= museum.W || my >= museum.H) continue;
      const v = museum.grid[my][mx];
      if (v !== 0) { mmCtx.fillStyle = MM_COLORS[v] || MM_COLORS[1]; mmCtx.fillRect(x * cell, y * cell, cell, cell); }
    }
  }
  const pcx = (player.x - startX) * cell, pcy = (player.y - startY) * cell;
  mmCtx.fillStyle = "#b3382b";
  mmCtx.beginPath(); mmCtx.arc(pcx, pcy, 3, 0, Math.PI * 2); mmCtx.fill();
  mmCtx.strokeStyle = "#b3382b";
  mmCtx.beginPath(); mmCtx.moveTo(pcx, pcy); mmCtx.lineTo(pcx + Math.cos(player.angle) * 10, pcy + Math.sin(player.angle) * 10); mmCtx.stroke();
}

export function compass(angle) {
  const dirs = ["E","SE","S","SW","W","NW","N","NE"];
  const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return dirs[Math.round(norm / (Math.PI / 4)) % 8];
}

export function renderHud(hudTR, hudBL, fps, player, renderer) {
  const pitchDeg = Math.round((player.pitch / renderer.PITCH_LIMIT) * 60);
  hudTR.textContent = `FPS ${fps}\nHEADING ${compass(player.angle)}\nPITCH ${pitchDeg >= 0 ? "+" : ""}${pitchDeg}\u00B0`;
  hudBL.textContent = `${currentRoom(player, ROOMS)}\nX ${player.x.toFixed(2)}  Y ${player.y.toFixed(2)}`;
}
