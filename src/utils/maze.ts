import { MazeCell } from '../types';

export const generateMaze = (width: number, height: number): MazeCell[][] => {
  const maze: MazeCell[][] = [];
  for (let y = 0; y < height; y++) {
    maze[y] = [];
    for (let x = 0; x < width; x++) {
      maze[y][x] = { x, y, walls: { top: true, right: true, bottom: true, left: true } };
    }
  }
  const stack: { x: number; y: number }[] = [];
  const visited = new Set<string>();
  stack.push({ x: 0, y: 0 });
  visited.add('0,0');

  while (stack.length > 0) {
    const curr = stack[stack.length - 1];
    const neighbors = [
      { x: curr.x, y: curr.y - 1, dir: 'top', opp: 'bottom' },
      { x: curr.x + 1, y: curr.y, dir: 'right', opp: 'left' },
      { x: curr.x, y: curr.y + 1, dir: 'bottom', opp: 'top' },
      { x: curr.x - 1, y: curr.y, dir: 'left', opp: 'right' },
    ].filter(n => n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && !visited.has(`${n.x},${n.y}`));

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[curr.y][curr.x].walls[next.dir as keyof MazeCell['walls']] = false;
      maze[next.y][next.x].walls[next.opp as keyof MazeCell['walls']] = false;
      visited.add(`${next.x},${next.y}`);
      stack.push({ x: next.x, y: next.y });
    } else { stack.pop(); }
  }
  return maze;
};