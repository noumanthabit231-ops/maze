import React from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { CaravanPhysics, Segment } from '../utils/physics';

const ARENA_WIDTH = 2000; // Огромная пустыня
const ARENA_HEIGHT = 2000;

export const GameCanvas = ({ myId, players, score, isHost, onGameOver }) => {
  const [camera, setCamera] = React.useState({ x: 0, y: 0 });

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // ВАЖНО: Делаем канвас во весь экран, но рисуем внутри Арену
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.ellipseMode(p5.RADIUS);
    p5.rectMode(p5.CENTER);
  };

  const draw = (p5: p5Types) => {
    p5.background('#eec988'); // Цвет песка

    const me = players.find(p => p.id === myId);
    if (!me) return;

    // Обновляем камеру за головой твоего верблюда
    const targetCamX = p5.lerp(camera.x, me.segments[0].x - p5.width / 2, 0.1);
    const targetCamY = p5.lerp(camera.y, me.segments[0].y - p5.height / 2, 0.1);
    setCamera({ x: targetCamX, y: targetCamY });

    p5.push();
    p5.translate(-camera.x, -camera.y);

    // Рисуем границы Арены
    p5.noFill();
    p5.stroke('#c49e63');
    p5.strokeWeight(10);
    p5.rect(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, ARENA_WIDTH, ARENA_HEIGHT);

    // Рисуем Пыль (Fog of War) по краям
    for (let y = 0; y < ARENA_HEIGHT; y += 100) {
      for (let x = 0; x < ARENA_WIDTH; x += 100) {
          const dx = me.segments[0].x - x;
          const dy = me.segments[0].y - y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d > 350) {
              p5.noStroke();
              p5.fill(p5.color(196, 158, 99, 10)); // Прозрачный песок
              p5.rect(x, y, 100, 100);
          }
      }
    }

    // РИСУЕМ КАРАВАНЫ
    p5.noStroke();
    players.forEach(player => {
      // 1. Рисуем Тела
      p5.fill(p5.color(player.color + 'AA')); // Полупрозрачные
      player.segments.forEach((seg, i) => {
        if (i === 0) return; // Голову рисуем отдельно
        p5.rect(seg.x, seg.y, 18, 18, 4); // Верблюжье телце
      });

      // 2. Рисуем Головы
      p5.push();
      p5.translate(player.segments[0].x, player.segments[0].y);
      p5.rotate(player.segments[0].angle); // Поворачиваем по направлению движения
      
      p5.fill(player.color);
      if (player.id === myId) {
          p5.stroke(255); p5.strokeWeight(3);
      }
      p5.rect(0, 0, 30, 22, 10); // Удлиненная верблюжья голова
      
      // Глаза
      p5.noStroke(); p5.fill(0);
      p5.ellipse(8, -5, 2, 2); p5.ellipse(8, 5, 2, 2);
      p5.pop();
    });

    p5.pop();

    // Рисуем Счёт на экране
    p5.noStroke();
    p5.fill(255);
    p5.textSize(24);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text(`🐪 Караван: ${score} верблюдов`, p5.width - 20, 20);
  };

  // Обработка изменения размера окна
  const windowResized = (p5: p5Types) => { p5.resizeCanvas(p5.windowWidth, p5.windowHeight); };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};
