export const generateMaze = (width: number, height: number, difficulty: string) => {
  const maze = Array(height).fill(null).map(() => 
    Array(width).fill(null).map(() => ({
      walls: { top: true, right: true, bottom: true, left: true },
      visited: false
    }))
  );

  const stack = [[0, 0]];
  maze[0][0].visited = true;

  while (stack.length > 0) {
    const [x, y] = stack[stack.length - 1];
    const neighbors = [];
    if (y > 0 && !maze[y-1][x].visited) neighbors.push([x, y-1, 'top', 'bottom']);
    if (y < height-1 && !maze[y+1][x].visited) neighbors.push([x, y+1, 'bottom', 'top']);
    if (x > 0 && !maze[y][x-1].visited) neighbors.push([x-1, y, 'left', 'right']);
    if (x < width-1 && !maze[y][x+1].visited) neighbors.push([x+1, y, 'right', 'left']);

    if (neighbors.length > 0) {
      const [nx, ny, wall, oppWall] = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[y][x].walls[wall] = false;
      maze[ny][nx].walls[oppWall] = false;
      maze[ny][nx].visited = true;
      stack.push([nx, ny]);
    } else stack.pop();
  }

  // Делаем «ОКОШКИ» (Braid Maze)
  const chance = difficulty === 'easy' ? 0.3 : difficulty === 'hard' ? 0.15 : 0.05;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.random() < chance) {
        const walls = Object.keys(maze[y][x].walls);
        const wall = walls[Math.floor(Math.random() * 4)];
        if (wall === 'top' && y > 0) { maze[y][x].walls.top = false; maze[y-1][x].walls.bottom = false; }
        if (wall === 'bottom' && y < height-1) { maze[y][x].walls.bottom = false; maze[y+1][x].walls.top = false; }
        if (wall === 'left' && x > 0) { maze[y][x].walls.left = false; maze[y][x-1].walls.right = false; }
        if (wall === 'right' && x < width-1) { maze[y][x].walls.right = false; maze[y][x+1].walls.left = false; }
      }
    }
  }
  return maze;
};
