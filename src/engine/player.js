import { isWall, isSpriteBlocked } from './museum'

export function createPlayer(spawn) {
  return { x: spawn.x, y: spawn.y, angle: 0, pitch: 0, speed: 2.6, runMul: 1.8 };
}

export function createInputState() {
  return { keys: {}, mouseLocked: false, mapOpen: false };
}

export function tryMove(nx, ny, player, museum, sprites) {
  const pad = 0.2;
  if (!isWall(nx + Math.sign(nx - player.x) * pad, player.y, museum) && !isSpriteBlocked(nx, player.y, sprites)) player.x = nx;
  if (!isWall(player.x, ny + Math.sign(ny - player.y) * pad, museum) && !isSpriteBlocked(player.x, ny, sprites)) player.y = ny;
}

export function updatePlayer(dt, player, input, museum, sprites) {
  if (input.mapOpen) return;
  let dx = 0, dy = 0;
  const forward = { x: Math.cos(player.angle), y: Math.sin(player.angle) };
  const strafe  = { x: Math.cos(player.angle + Math.PI / 2), y: Math.sin(player.angle + Math.PI / 2) };
  if (input.keys["KeyW"] || input.keys["ArrowUp"])   { dx += forward.x; dy += forward.y; }
  if (input.keys["KeyS"] || input.keys["ArrowDown"]) { dx -= forward.x; dy -= forward.y; }
  if (input.keys["KeyD"]) { dx += strafe.x; dy += strafe.y; }
  if (input.keys["KeyA"]) { dx -= strafe.x; dy -= strafe.y; }
  if (input.keys["ArrowLeft"])  player.angle -= 1.8 * dt;
  if (input.keys["ArrowRight"]) player.angle += 1.8 * dt;

  const len = Math.hypot(dx, dy);
  if (len > 0) {
    dx /= len; dy /= len;
    const mul = input.keys["ShiftLeft"] || input.keys["ShiftRight"] ? player.runMul : 1;
    const step = player.speed * mul * dt;
    tryMove(player.x + dx * step, player.y + dy * step, player, museum, sprites);
  }
}
