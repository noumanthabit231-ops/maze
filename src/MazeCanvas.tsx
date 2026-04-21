import React from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { useGame, MazeCellHistory } from './hooks/useGame';

const cellWidth = 32;
const playerSize = 16;
const backgroundColor = '#1a1d2e';
const wallColor = '#475569';

export const MazeCanvas = ({ maze, players, cellHistory, myId }) => {
  const width = maze[0]?.length * cellWidth || 0;
  const height = maze?.length * cellWidth || 0;

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(backgroundColor);

    // 1. РИСУЕМ ИСТОРИЮ (СЛЕД)
    // Рисуем это ДО стен, чтобы след был "под" ними.
    p5.noStroke();
    cellHistory.forEach(cell => {
        p5.fill(p5.color(cell.color, 100)); // Добавили альфа-канал для прозрачности следа
        p5.rect(cell.x * cellWidth, cell.y * cellWidth, cellWidth, cellWidth);
    });

    // 2. РИСУЕМ СТЕНЫ
    p5.strokeWeight(2);
    p5.stroke(wallColor);
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.walls.top) p5.line(x * cellWidth, y * cellWidth, (x + 1) * cellWidth, y * cellWidth);
        if (cell.walls.right) p5.line((x + 1) * cellWidth, y * cellWidth, (x + 1) * cellWidth, (y + 1) * cellWidth);
        if (cell.walls.bottom) p5.line(x * cellWidth, (y + 1) * cellWidth, (x + 1) * cellWidth, (y + 1) * cellWidth);
        if (cell.walls.left) p5.line(x * cellWidth, y * cellWidth, x * cellWidth, (y + 1) * cellWidth);
      });
    });

    // 3. РИСУЕМ ПЕРСОНАЖЕЙ (РОВНО И ПО ЦЕНТРУ)
    p5.noStroke();
    players.forEach(player => {
      p5.fill(player.color);
      // Формулы для идеального центрирования в ячейке
      const centerX = (player.pos.x * cellWidth) + (cellWidth / 2);
      const centerY = (player.pos.y * cellWidth) + (cellWidth / 2);
      
      if (player.id === myId) {
          // Рисуем тебя (синий круг) по центру ячейки
          p5.ellipseMode(p5.RADIUS);
          p5.ellipse(centerX, centerY, playerSize / 2);
      } else {
          // Рисуем другого игрока (красный квадрат) по центру своей ячейки
          // playerSize = 16, ячейка = 32. Квадрат заполнит половину ячейки.
          p5.rectMode(p5.CENTER);
          p5.rect(centerX, centerY, playerSize, playerSize);
          p5.rectMode(p5.CORNER); // Сбрасываем режим
      }
    });

    // Рисуем финиш (флажок)
    const finishX = (maze[0].length - 1) * cellWidth + cellWidth / 2;
    const finishY = (maze.length - 1) * cellWidth + cellWidth / 2;
    p5.textSize(20);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text('🏁', finishX, finishY);
  };

  return <Sketch setup={setup} draw={draw} />;
};
