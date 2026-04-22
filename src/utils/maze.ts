export const generateMaze = (width: number, height: number, difficulty: string) => {
  const maze = Array(height).fill(null).map(() => 
    Array(width).fill(null).map(() => ({
      walls: { top: true, right: true, bottom: true, left: true },
      visited: false
    }))
  );

  const stack = [[0, 0]];
  maze[0][0].visited = true;

  // Строгий алгоритм генерации идеального лабиринта (1 путь, много тупиков)
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
    } else {
      stack.pop();
    }
  }

  // "Дырявим" стены только на лёгком уровне, чтобы новичкам было проще.
  // Сложные уровни остаются монолитными и запутанными.
  if (difficulty === 'easy') {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (Math.random() < 0.15) {
          const walls = ['top', 'right', 'bottom', 'left'];
          const randomWall = walls[Math.floor(Math.random() * 4)];
          maze[y][x].walls[randomWall] = false;
          if (randomWall === 'top') maze[y-1][x].walls.bottom = false;
          if (randomWall === 'bottom') maze[y+1][x].walls.top = false;
          if (randomWall === 'left') maze[y][x-1].walls.right = false;
          if (randomWall === 'right') maze[y][x+1].walls.left = false;
        }
      }
    }
  }

  return maze;
};
