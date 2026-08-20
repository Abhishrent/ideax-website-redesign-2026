import { HALF_FOV } from './constants'

export function castRay(rayAngle, player, museum) {
  const dirX = Math.cos(rayAngle), dirY = Math.sin(rayAngle);
  let mapX = Math.floor(player.x), mapY = Math.floor(player.y);

  const deltaDistX = dirX === 0 ? Infinity : Math.abs(1 / dirX);
  const deltaDistY = dirY === 0 ? Infinity : Math.abs(1 / dirY);

  let stepX, stepY, sideDistX, sideDistY;
  if (dirX < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; }
  else          { stepX = 1;  sideDistX = (mapX + 1 - player.x) * deltaDistX; }
  if (dirY < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; }
  else          { stepY = 1;  sideDistY = (mapY + 1 - player.y) * deltaDistY; }

  let side = 0, cellValue = 1, hit = false, iter = 0;
  while (!hit && iter < 160) {
    if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
    else                       { sideDistY += deltaDistY; mapY += stepY; side = 1; }
    if (mapX < 0 || mapY < 0 || mapX >= museum.W || mapY >= museum.H) { cellValue = 1; hit = true; break; }
    cellValue = museum.grid[mapY][mapX];
    if (cellValue !== 0) hit = true;
    iter++;
  }

  let perpDist = side === 0
    ? (mapX - player.x + (1 - stepX) / 2) / dirX
    : (mapY - player.y + (1 - stepY) / 2) / dirY;
  perpDist = Math.abs(perpDist);

  let wallX = side === 0 ? player.y + perpDist * dirY : player.x + perpDist * dirX;
  wallX -= Math.floor(wallX);

  return { perpDist, side, mapX, mapY, wallX, cellValue, dirX, dirY };
}
