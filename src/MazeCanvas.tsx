import React from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';

const CELL_SIZE = 25; // Уменьшим немного, чтобы Ultra влезала в экран

export const MazeCanvas = ({ maze, players, cellHistory, myId }) => {
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    const w = maze[0].length * CELL_SIZE;
    const h = maze.length * CELL_SIZE;
    p5.createCanvas(w, h).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background('#0f172a');

    // 1. Рисуем след (закрашиваем ячейки)
    p5.noStroke();
    p5.fill('rgba(59, 130, 246, 0.3)');
    cellHistory.forEach(key => {
      const [x, y] = key.split('-').map(Number);
      p5.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // 2. Рисуем стены
    p5.stroke('#475569');
    p5.strokeWeight(2);
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const sx = x * CELL_SIZE;
        const sy = y * CELL_SIZE;
        if (cell.walls.top) p5.line(sx, sy, sx + CELL_SIZE, sy);
        if (cell.walls.bottom) p5.line(sx, sy + CELL_SIZE, sx + CELL_SIZE, sy + CELL_SIZE);
        if (cell.walls.left) p5.line(sx, sy, sx, sy + CELL_SIZE);
        if (cell.walls.right) p5.line(sx + CELL_SIZE, sy, sx + CELL_SIZE, sy + CELL_SIZE);
      });
    });

    // 3. Рисуем игроков (Центрировано!)
    p5.noStroke();
    players.forEach(p => {
      const px = p.pos.x * CELL_SIZE + CELL_SIZE / 2;
      const py = p.pos.y * CELL_SIZE + CELL_SIZE / 2;
      
      p5.fill(p.color);
      if (p.id === myId) {
        p5.ellipse(px, py, CELL_SIZE * 0.6); // Ты — круг
        p5.stroke(255);
        p5.strokeWeight(2);
        p5.noFill();
        p5.ellipse(px, py, CELL_SIZE * 0.7); // Обводка вокруг тебя
      } else {
        p5.rectMode(p5.CENTER);
        p5.rect(px, py, CELL_SIZE * 0.6, CELL_SIZE * 0.6); // Другие — квадраты
        p5.rectMode(p5.CORNER);
      }
    });

    // Финиш
    const fx = (maze[0].length - 1) * CELL_SIZE + CELL_SIZE / 2;
    const fy = (maze.length - 1) * CELL_SIZE + CELL_SIZE / 2;
    p5.textSize(CELL_SIZE * 0.6);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text('🏁', fx, fy);
  };

  return <Sketch setup={setup} draw={draw} />;
};
