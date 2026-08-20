import {
  WALL_RAMP, FLOOR_RAMP, CEIL_RAMP,
  WALL_COLOR, MORTAR_COLOR, COLUMN_COLOR, COLUMN_SHADOW,
  CEIL_COLOR, FLOOR_COLOR_A, FLOOR_COLOR_B,
  PLAQUE_INK, PLAQUE_BG, TORCH_FLAME_A, TORCH_FLAME_B,
  GLASS_COLORS, TAPESTRY_PALETTES,
} from './constants'
import { glyphAt } from './font'

export function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function lerpColor3(stops, t) {
  t = Math.max(0, Math.min(0.9999, t));
  const seg = t * (stops.length - 1);
  const i = Math.floor(seg);
  return lerpColor(stops[i], stops[i + 1], seg - i);
}

export function shade(rgb, t) {
  t = Math.max(0, Math.min(1, t));
  const r = Math.round(rgb[0] * t), g = Math.round(rgb[1] * t), b = Math.round(rgb[2] * t);
  return `rgba(${r},${g},${b},${(0.25 + t * 0.75).toFixed(3)})`;
}

export function rampChar(ramp, t) {
  const i = Math.max(0, Math.min(ramp.length - 1, Math.floor(t * (ramp.length - 1))));
  return ramp[i];
}

export function stoneWallTexture(wallX, rowFrac, brightness) {
  const courseH = 0.125;
  const course = Math.floor(rowFrac / courseH);
  const brickW = 0.2;
  const offset = (course % 2) * (brickW / 2);
  const u = (wallX + offset) % brickW;
  const uLocal = u / brickW;
  const vLocal = (rowFrac % courseH) / courseH;
  const mortar = uLocal < 0.07 || uLocal > 0.93 || vLocal < 0.09;
  const brickIdx = Math.floor((wallX + offset) / brickW) + course * 97;
  const n = Math.sin(brickIdx * 12.9898) * 43758.5453;
  const noise = n - Math.floor(n);
  if (mortar) {
    return { ch: rampChar(WALL_RAMP, brightness * 0.32), colr: shade(MORTAR_COLOR, 0.2 + brightness * 0.55) };
  }
  const shadeVar = 0.82 + noise * 0.32;
  return { ch: rampChar(WALL_RAMP, brightness * shadeVar), colr: shade(WALL_COLOR, (0.25 + brightness * 0.75) * shadeVar) };
}

export function columnTexture(wallX, rowFrac, brightness) {
  const band = rowFrac < 0.09 || rowFrac > 0.91;
  const edge = Math.abs(rowFrac - 0.09) < 0.015 || Math.abs(rowFrac - 0.91) < 0.015;
  if (edge) return { ch: "-", colr: shade(COLUMN_SHADOW, 0.3 + brightness * 0.5) };
  if (band) return { ch: rampChar(WALL_RAMP, 0.75 + brightness * 0.25), colr: shade(COLUMN_COLOR, 0.55 + brightness * 0.45) };
  const flute = Math.sin(wallX * Math.PI * 10);
  const t = Math.max(0, Math.min(1, 0.45 + flute * 0.3 + brightness * 0.35));
  const cshade = Math.max(0.15, Math.min(1, 0.35 + brightness * 0.65 + flute * 0.15));
  return { ch: rampChar(WALL_RAMP, t), colr: shade(COLUMN_COLOR, cshade) };
}

export function windowTexture(wallX, rowFrac, brightness, timeSec) {
  const cx0 = 0.10, cx1 = 0.90, cy0 = 0.05, cy1 = 0.95;
  if (wallX < cx0 || wallX > cx1 || rowFrac < cy0 || rowFrac > cy1) {
    return stoneWallTexture(wallX, rowFrac, brightness);
  }
  const frameM = 0.06;
  const archFrac = 0.35;
  const localU = (wallX - cx0) / (cx1 - cx0);
  const localV = (rowFrac - cy0) / (cy1 - cy0);

  let inGlass;
  if (localV < archFrac) {
    const half = (0.5 - frameM) * (localV / archFrac);
    inGlass = Math.abs(localU - 0.5) <= half;
  } else {
    inGlass = localU > frameM && localU < 1 - frameM && localV < 1 - frameM;
  }
  const mullion = (Math.abs(localU - 0.5) < 0.028 && localV > archFrac) ||
                   (Math.abs(localV - 0.64) < 0.022 && localV > archFrac);
  if (mullion) return { ch: "|", colr: shade([20, 18, 24], 0.5 + brightness * 0.3) };
  if (!inGlass) {
    return { ch: rampChar(WALL_RAMP, 0.6 + brightness * 0.35), colr: shade(COLUMN_COLOR, 0.45 + brightness * 0.5) };
  }
  const shimmer = 0.08 * Math.sin(timeSec * 0.7 + localU * 5);
  const t = Math.max(0, Math.min(1, (localU * 0.5 + localV * 0.5) + shimmer));
  const glassColor = lerpColor3(GLASS_COLORS, t);
  const glow = 0.62 + brightness * 0.22 + shimmer * 0.5;
  return { ch: rampChar(WALL_RAMP, 0.5 + glow * 0.4), colr: shade(glassColor, Math.max(0.35, Math.min(1, glow))) };
}

export function torchCellTexture(wallX, rowFrac, brightness, timeSec, torchRef, torchFlickerFn) {
  const flame = torchRef ? torchFlickerFn(torchRef, timeSec) : 0.85;
  const fx = wallX - 0.5;
  const flameDist = Math.hypot(fx * 2.2, (rowFrac - 0.4) * 3.4);
  if (rowFrac > 0.18 && rowFrac < 0.55 && flameDist < 0.42 * (1.15 - rowFrac)) {
    const core = Math.max(0, 1 - flameDist * 2.1);
    const flameColor = lerpColor(TORCH_FLAME_B, TORCH_FLAME_A, core);
    return { ch: rampChar(WALL_RAMP, 0.7 + core * 0.3), colr: shade(flameColor, Math.min(1, 0.7 + flame * 0.3)) };
  }
  if (rowFrac >= 0.55 && rowFrac < 0.72 && Math.abs(wallX - 0.5) < 0.10) {
    return { ch: "#", colr: shade([40, 32, 24], 0.35 + brightness * 0.3) };
  }
  return stoneWallTexture(wallX, rowFrac, brightness * 0.85);
}

export function tapestryTexture(wallX, rowFrac, brightness, seed) {
  const cx0 = 0.18, cx1 = 0.82, cy0 = 0.04, cy1 = 0.88, fringeY = 0.96;
  if (wallX < cx0 - 0.03 || wallX > cx1 + 0.03 || rowFrac < cy0 - 0.03 || rowFrac > fringeY) {
    return stoneWallTexture(wallX, rowFrac, brightness);
  }
  if (rowFrac < cy0) return { ch: "=", colr: shade([60, 50, 40], 0.4 + brightness * 0.4) };
  if (rowFrac > cy1) {
    const tassel = Math.floor(wallX * 14) % 2 === 0;
    return { ch: tassel ? "!" : ".", colr: shade([50, 42, 30], 0.3 + brightness * 0.4) };
  }
  if (wallX < cx0 || wallX > cx1) return stoneWallTexture(wallX, rowFrac, brightness);
  const palette = TAPESTRY_PALETTES[seed % TAPESTRY_PALETTES.length];
  const weave = (Math.floor(wallX * 22) + Math.floor(rowFrac * 22)) % 2 === 0;
  const col = weave ? palette[0] : palette[1];
  return { ch: rampChar(WALL_RAMP, 0.35 + brightness * 0.5), colr: shade(col, 0.35 + brightness * 0.6) };
}

export function ceilingTexture(fx, fy, t, ambientFlicker, ceilGlow, timeSec) {
  const mod = (v, m) => ((v % m) + m) % m;
  const ribSpacing = 2.2;
  const ribX = mod(fx, ribSpacing) < 0.06;
  const ribY = mod(fy, ribSpacing) < 0.06;
  if (ribX || ribY) {
    const pulse = 0.5 + 0.5 * Math.sin(timeSec * 0.5 + fx * 0.7 + fy * 0.7);
    return {
      ch: rampChar(WALL_RAMP, 0.5 + t * 0.35),
      colr: shade([196, 150, 64], Math.min(1, (0.3 + t * 0.5) * ambientFlicker + ceilGlow + pulse * 0.1)),
    };
  }
  const cellX = Math.floor(fx * 2.4), cellY = Math.floor(fy * 2.4);
  const h = Math.sin(cellX * 12.9898 + cellY * 78.233) * 43758.5453;
  const n = h - Math.floor(h);
  if (n > 0.955) {
    const twinkle = 0.5 + 0.5 * Math.sin(timeSec * 2.3 + n * 60);
    return {
      ch: twinkle > 0.45 ? "*" : ".",
      colr: shade([228, 224, 250], Math.min(1, 0.45 + twinkle * 0.55)),
    };
  }
  return {
    ch: rampChar(CEIL_RAMP, Math.min(1, t * 0.55 + ceilGlow)),
    colr: shade(CEIL_COLOR, Math.min(1, (0.3 + t * 0.55) * ambientFlicker + ceilGlow)),
  };
}

export function paintCell(painting, tier, wallX, rowFrac, brightness) {
  const cx0 = 0.5 - tier.wFrac / 2, cx1 = 0.5 + tier.wFrac / 2;
  const cy0 = 0.5 - tier.hFrac / 2, cy1 = 0.5 + tier.hFrac / 2;
  const fx0 = cx0 - 0.035, fx1 = cx1 + 0.035;
  const fy0 = cy0 - 0.035, fy1 = cy1 + 0.035;

  if (wallX < fx0 || wallX > fx1 || rowFrac < fy0 || rowFrac > fy1) {
    return stoneWallTexture(wallX, rowFrac, brightness);
  }

  const inCanvas = wallX >= cx0 && wallX <= cx1 && rowFrac >= cy0 && rowFrac <= cy1;
  if (!inCanvas) {
    return { ch: rampChar(WALL_RAMP, 0.6 + brightness * 0.4), colr: shade(tier.frame, 0.5 + brightness * 0.5) };
  }

  const plaqueH = 0.22;
  const plaqueY0 = cy1 - plaqueH * (cy1 - cy0);

  if (rowFrac >= plaqueY0) {
    const label = painting.name.toUpperCase().slice(0, tier.maxLen);
    const n = label.length;
    const localU = (wallX - cx0) / (cx1 - cx0);
    const localV = (rowFrac - plaqueY0) / (cy1 - plaqueY0);
    const idx = Math.min(n - 1, Math.max(0, Math.floor(localU * n)));
    const cu = localU * n - idx;
    const col = Math.min(4, Math.max(0, Math.floor(cu * 5)));
    const rw = Math.min(6, Math.max(0, Math.floor(localV * 7)));
    const ink = glyphAt(label[idx], col, rw);
    return ink
      ? { ch: "#", colr: shade(PLAQUE_INK, 0.55 + brightness * 0.45) }
      : { ch: ".", colr: shade(PLAQUE_BG, 0.3 + brightness * 0.4) };
  }

  const seed = painting.x * 12.9898 + painting.y * 78.233;
  const n1 = Math.sin(wallX * 9 + seed) * Math.cos(rowFrac * 7 + seed * 0.7);
  const v = (n1 + 1) / 2;
  const artColor = lerpColor(tier.canvasA, tier.canvasB, v);
  return {
    ch: rampChar(WALL_RAMP, 0.25 + v * 0.55),
    colr: shade(artColor, 0.3 + brightness * 0.65 + v * 0.1),
  };
}

export function pedestalTexture(u, v, brightness, glow, timeSec) {
  const du = u - 0.5;
  if (v > 0.55) {
    const halfW = 0.10 + (v - 0.55) * 0.62;
    if (Math.abs(du) > halfW) return null;
    const b = Math.max(0.2, Math.min(1, brightness * 0.7 + 0.2));
    return { ch: rampChar(WALL_RAMP, 0.4 + b * 0.4), colr: shade(COLUMN_COLOR, b) };
  }
  const cx = 0.5, cyv = 0.28;
  const d = Math.hypot((u - cx) * 2.1, (v - cyv) * 2.6);
  const pulse = 0.7 + 0.3 * Math.sin(timeSec * 2.2);
  if (d < 0.14) {
    const core = Math.max(0, 1 - d / 0.14);
    return { ch: rampChar(WALL_RAMP, 0.75 + core * 0.25), colr: shade(TORCH_FLAME_A, Math.min(1, 0.6 + core * 0.4 + pulse * 0.2)) };
  }
  if (d < 0.26) {
    const ring = 1 - (d - 0.14) / 0.12;
    return { ch: ".", colr: shade(TORCH_FLAME_B, Math.max(0, ring * 0.5 * pulse)) };
  }
  return null;
}

export function chandelierTexture(u, v, brightness, glow, timeSec) {
  const du = u - 0.5;
  const flicker = (phase) => 0.72 + 0.28 * Math.sin(timeSec * 7 + phase);
  const lit = Math.min(1, brightness * 0.5 + 0.3 + glow * 0.3);

  if (Math.abs(du) < 0.012 && v < 0.88) {
    return { ch: "|", colr: shade([58, 50, 34], 0.35 + lit * 0.35) };
  }
  if (v > 0.09 && v < 0.15) {
    const w = 0.055 * (1 - Math.abs(v - 0.12) / 0.03);
    if (Math.abs(du) < w) return { ch: "^", colr: shade([196, 150, 64], 0.5 + lit * 0.45) };
  }

  const CROWN = { cy: 0.20, r: 0.075, spokes: 5 };
  const UPPER = { cy: 0.34, r: 0.22, spokes: 8 };
  const LOWER = { cy: 0.66, r: 0.44, spokes: 12 };

  for (const sgn of [-1, 1]) {
    const armT = (v - 0.15) / (UPPER.cy - 0.15);
    if (armT > 0 && armT < 1) {
      const armX = sgn * armT * UPPER.r * 0.85;
      if (Math.abs(du - armX) < 0.010) {
        return { ch: sgn < 0 ? "\\" : "/", colr: shade([196, 150, 64], 0.4 + lit * 0.4) };
      }
    }
  }

  for (const ring of [CROWN, UPPER, LOWER]) {
    const d = Math.hypot(du * 1.5, (v - ring.cy) * 1.7);
    if (Math.abs(d - ring.r) < (ring === CROWN ? 0.022 : 0.032)) {
      return { ch: "=", colr: shade([196, 150, 64], 0.45 + lit * 0.4) };
    }
  }
  for (let i = 0; i < CROWN.spokes; i++) {
    const ang = (i / CROWN.spokes) * Math.PI * 2;
    const cxp = Math.cos(ang) * CROWN.r, cyp = CROWN.cy + Math.sin(ang) * CROWN.r * 0.7;
    if (Math.hypot(du - cxp, v - cyp) < 0.022) {
      return { ch: "o", colr: shade([222, 200, 140], 0.5 + lit * 0.5) };
    }
  }
  for (const ring of [UPPER, LOWER]) {
    for (let i = 0; i < ring.spokes; i++) {
      const ang = (i / ring.spokes) * Math.PI * 2;
      const cxp = Math.cos(ang) * ring.r * 0.75, cyp = ring.cy + Math.sin(ang) * ring.r * 0.75 * 0.7;
      if (Math.hypot(du - cxp, v - cyp) < 0.05) {
        const f = flicker(i * 1.7 + ring.cy * 4);
        return { ch: rampChar(WALL_RAMP, 0.55 + f * 0.45), colr: shade(TORCH_FLAME_A, Math.min(1, 0.55 + f * 0.45)) };
      }
    }
  }
  for (let i = 0; i < LOWER.spokes; i++) {
    const ang = (i / LOWER.spokes) * Math.PI * 2;
    if (Math.sin(ang) < 0.05) continue;
    const cxp = Math.cos(ang) * LOWER.r * 0.95, cyp = LOWER.cy + Math.sin(ang) * LOWER.r * 0.95 * 0.7;
    const dropLen = (i % 2 === 0) ? 0.16 : 0.10;
    if (v > cyp && v < cyp + dropLen && Math.abs(du - cxp) < 0.014) {
      const t = (v - cyp) / dropLen;
      const glassColor = lerpColor3(GLASS_COLORS, 0.5 + 0.5 * Math.sin(timeSec + i));
      return { ch: t > 0.7 ? "v" : "'", colr: shade(glassColor, Math.max(0.3, 1 - t * 0.4) * (0.6 + lit * 0.4)) };
    }
  }
  for (let i = 0; i < UPPER.spokes; i++) {
    const ang = (i / UPPER.spokes) * Math.PI * 2;
    if (Math.sin(ang) < 0.05) continue;
    const cxp = Math.cos(ang) * UPPER.r * 0.9, cyp = UPPER.cy + Math.sin(ang) * UPPER.r * 0.9 * 0.7;
    const dropLen = 0.07;
    if (v > cyp && v < cyp + dropLen && Math.abs(du - cxp) < 0.011) {
      const t = (v - cyp) / dropLen;
      const glassColor = lerpColor3(GLASS_COLORS, 0.3 + 0.5 * Math.sin(timeSec * 1.1 + i * 2));
      return { ch: "'", colr: shade(glassColor, Math.max(0.3, 1 - t * 0.5) * (0.6 + lit * 0.4)) };
    }
  }
  const pd = Math.hypot(du * 2.6, (v - 0.94) * 2.0);
  if (v > 0.84 && pd < 0.075) {
    const core = Math.max(0, 1 - pd / 0.075);
    const glassColor = lerpColor3(GLASS_COLORS, 0.5 + 0.5 * Math.sin(timeSec * 1.3));
    return { ch: rampChar(WALL_RAMP, 0.6 + core * 0.4), colr: shade(glassColor, Math.min(1, 0.5 + core * 0.5 + lit * 0.3)) };
  }
  return null;
}

export const SPRITE_DEFS = {
  pedestal:   { hWorld: 0.72, wWorld: 0.50, anchor: 'floor',   collide: true,  radius: 0.34, tex: pedestalTexture },
  chandelier: { hWorld: 1.85, wWorld: 1.55, anchor: 'ceiling', collide: false, radius: 0,    tex: chandelierTexture },
};
