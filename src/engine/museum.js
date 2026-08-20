const DEFAULT_HEIGHT = 3.2;

export function buildMuseum() {
  const W = 32, H = 26;
  const grid = Array.from({ length: H }, () => new Array(W).fill(1));
  const heightGrid = Array.from({ length: H }, () => new Array(W).fill(DEFAULT_HEIGHT));
  const carve = (x0, y0, x1, y1, wallH = DEFAULT_HEIGHT) => {
    for (let y = y0 - 1; y <= y1 + 1; y++) {
      for (let x = x0 - 1; x <= x1 + 1; x++) {
        if (y >= 0 && y < H && x >= 0 && x < W) heightGrid[y][x] = wallH;
      }
    }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = 0;
  };

  const paintings = [];
  const torches = [];

  const wallDeco = (x, y, code, extra) => {
    grid[y][x] = code;
    if (code === 2 && extra) paintings.push({ x, y, tier: extra.tier, name: extra.name });
    if (code === 5) torches.push({ x: x + 0.5, y: y + 0.5 });
  };
  const pillar = (x, y) => { grid[y][x] = 3; };

  carve(2, 11, 10, 14, 4.2);
  carve(11, 12, 13, 13, 4.2);
  carve(14, 7, 25, 17, 13.5);
  carve(19, 6, 20, 6, 5.0);
  carve(7, 1, 28, 5, 9.5);
  carve(26, 12, 26, 13, 4.4);
  carve(27, 9, 30, 16, 7.0);
  carve(19, 18, 20, 18, 4.2);
  carve(2, 19, 29, 22, 6.5);

  const platItems = [
    [9, 'col'], [11, 'win'], [13, 'plat:NORTHWIND'], [15, 'col'], [17, 'win'],
    [19, 'plat:VERTEX'], [21, 'col'], [23, 'win'], [25, 'plat:ARCLIGHT'], [27, 'col'],
  ];
  for (const [cx, kind] of platItems) {
    if (kind === 'col') wallDeco(cx, 0, 3);
    else if (kind === 'win') wallDeco(cx, 0, 4);
    else { const [, name] = kind.split(':'); wallDeco(cx, 0, 2, { tier: 'platinum', name }); }
  }
  wallDeco(6, 3, 5);
  wallDeco(29, 3, 5);

  for (const [x, y] of [[15, 8], [24, 8], [15, 16], [24, 16], [17, 9], [22, 9], [17, 15], [22, 15]]) {
    pillar(x, y);
  }
  wallDeco(13, 8, 5);  wallDeco(13, 16, 5);
  wallDeco(26, 8, 5);  wallDeco(26, 16, 5);
  wallDeco(15, 6, 5);  wallDeco(24, 6, 5);
  wallDeco(15, 18, 5); wallDeco(24, 18, 5);

  wallDeco(31, 10, 2, { tier: 'gold', name: 'CASCADE' });
  wallDeco(31, 12, 2, { tier: 'gold', name: 'ORBIT' });
  wallDeco(31, 15, 2, { tier: 'gold', name: 'HALIFAX' });
  wallDeco(28, 8, 5);
  wallDeco(28, 17, 5);

  const silverItems = [
    [4, 'PIVOT'], [7, null], [10, 'LUMEN'], [13, null], [16, 'ANCHOR'],
    [19, null], [22, 'RAVEN'], [25, null], [28, 'CORVUS'],
  ];
  for (const [cx, name] of silverItems) {
    if (name) wallDeco(cx, 23, 2, { tier: 'silver', name });
    else wallDeco(cx, 23, 6);
  }
  wallDeco(1, 20, 5);
  wallDeco(30, 21, 5);

  wallDeco(4, 10, 3); wallDeco(8, 10, 3);
  wallDeco(4, 15, 3); wallDeco(8, 15, 3);
  wallDeco(11, 11, 5); wallDeco(11, 14, 5);

  const sprites = [
    { type: 'pedestal',   x: 19.5, y: 12.0 },
    { type: 'chandelier', x: 19.5, y: 12.0, scale: 2.4 },
    { type: 'chandelier', x: 16.0, y: 9.0,  scale: 1.5 },
    { type: 'chandelier', x: 23.0, y: 15.0, scale: 1.5 },
    { type: 'chandelier', x: 13.0, y: 3.0, scale: 1.7 },
    { type: 'chandelier', x: 19.5, y: 3.0, scale: 1.7 },
    { type: 'chandelier', x: 25.0, y: 3.0, scale: 1.7 },
    { type: 'chandelier', x: 28.5, y: 12.5, scale: 1.3 },
    { type: 'chandelier', x: 9.5,  y: 20.5, scale: 1.3 },
    { type: 'chandelier', x: 21.5, y: 20.5, scale: 1.3 },
  ];

  return { grid, heightGrid, W, H, paintings, torches, sprites, spawn: { x: 4.0, y: 12.5 } };
}

export const ROOMS = [
  { name: "ENTRANCE HALL", x0: 2,  y0: 11, x1: 10, y1: 14 },
  { name: "GREAT HALL",    x0: 14, y0: 7,  x1: 25, y1: 17 },
  { name: "PLATINUM WING", x0: 7,  y0: 1,  x1: 28, y1: 5  },
  { name: "GOLD HALL",     x0: 27, y0: 9,  x1: 30, y1: 16 },
  { name: "SILVER HALL",   x0: 2,  y0: 19, x1: 29, y1: 22 },
];

export function currentRoom(player, rooms) {
  for (const r of rooms) {
    if (player.x >= r.x0 && player.x <= r.x1 + 1 && player.y >= r.y0 && player.y <= r.y1 + 1) return r.name;
  }
  return "CORRIDOR";
}

export function setupTorchFlicker(torches) {
  return torches.map(t => {
    const h = Math.sin(t.x * 12.9898 + t.y * 78.233) * 43758.5453;
    return { x: t.x, y: t.y, phase: (h - Math.floor(h)) * Math.PI * 2 };
  });
}

export function torchFlicker(t, timeSec) {
  return 0.78 + 0.14 * Math.sin(timeSec * 6.1 + t.phase) + 0.08 * Math.sin(timeSec * 13.3 + t.phase * 1.7);
}

export function torchGlow(wx, wy, timeSec, TORCHES) {
  let g = 0;
  for (const t of TORCHES) {
    const dx = wx - t.x, dy = wy - t.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > 20) continue;
    const d = Math.sqrt(d2);
    const falloff = Math.max(0, 1 - d / 4.4);
    g += falloff * falloff * torchFlicker(t, timeSec);
  }
  return Math.min(1, g);
}

export function isWall(x, y, museum) {
  const mx = Math.floor(x), my = Math.floor(y);
  if (mx < 0 || my < 0 || mx >= museum.W || my >= museum.H) return true;
  return museum.grid[my][mx] !== 0;
}

export function isSpriteBlocked(x, y, sprites) {
  for (const s of sprites) {
    if (!s.collide) continue;
    const dx = x - s.x, dy = y - s.y;
    if (dx * dx + dy * dy < s.radius * s.radius) return true;
  }
  return false;
}
