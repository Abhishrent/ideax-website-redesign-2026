export const WALL_RAMP  = " .:-=+*#%@";
export const FLOOR_RAMP = " .,:;+*#";
export const CEIL_RAMP  = "  .`'";

export const FOV = Math.PI / 3;
export const HALF_FOV = FOV / 2;
export const MAX_DEPTH = 40;
export const EYE_HEIGHT = 1.7;

export const CHAR_W = 8;
export const CHAR_H = 14;

export const TIERS = {
  platinum: { wFrac: 0.88, hFrac: 0.82, maxLen: 10, frame: [222, 222, 230], canvasA: [200, 210, 235], canvasB: [90, 100, 150] },
  gold:     { wFrac: 0.62, hFrac: 0.56, maxLen: 7,  frame: [199, 158, 66],  canvasA: [230, 180, 90],  canvasB: [120, 60, 20]  },
  silver:   { wFrac: 0.40, hFrac: 0.36, maxLen: 6,  frame: [178, 178, 188], canvasA: [180, 190, 205], canvasB: [70, 80, 100]  },
};

export const WALL_COLOR    = [132, 130, 146];
export const MORTAR_COLOR  = [64, 62, 74];
export const COLUMN_COLOR  = [206, 196, 168];
export const COLUMN_SHADOW = [92, 86, 72];
export const CEIL_COLOR    = [104, 102, 120];
export const FLOOR_COLOR_A = [94, 90, 84];
export const FLOOR_COLOR_B = [72, 69, 64];
export const PLAQUE_INK    = [244, 214, 150];
export const PLAQUE_BG     = [34, 26, 18];
export const TORCH_FLAME_A = [255, 224, 140];
export const TORCH_FLAME_B = [214, 90, 34];
export const GLASS_COLORS  = [[80, 100, 200], [140, 80, 195], [214, 168, 70]];

export const TAPESTRY_PALETTES = [
  [[128, 24, 30], [196, 160, 68]],
  [[24, 92, 62], [200, 200, 210]],
  [[30, 52, 118], [206, 168, 76]],
  [[96, 34, 110], [214, 190, 120]],
];
