import React, { useRef } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';

interface Props {
  myId: string;
  players: any[];
  food: any[]; // МЫ ДОБАВИЛИ ЭТОТ ПРОП
}

const ARENA_SIZE = 2000;
const CELL_SIZE = 25; // Размер одного верблюда

export const GameCanvas: React.FC<Props> = ({ myId, players, food = [] }) => {
  const camera = useRef({ x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 });

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    p5.ellipseMode(p5.RADIUS);
    p5.noStroke();
  };

  const draw = (p5: p5Types) => {
    // 1. Рисуем песок
    p5.background('#f3e5ab');

    const me = players.find((p) => p.id === myId);
    if (!me || me.segments.length === 0) return;

    // 2. Плавная камера
    camera.current.x = p5.lerp(camera.current.x, me.segments[0].x, 0.1);
    camera.current.y = p5.lerp(camera.current.y, me.segments[0].y, 0.1);

    p5.push();
    p5.translate(p5.width / 2 - camera.current.x, p5.height / 2 - camera.current.y);

    // 3. Сетка пустыни
    p5.stroke('rgba(0,0,0,0.05)');
    for (let x = 0; x <= ARENA_SIZE; x += 100) p5.line(x, 0, x, ARENA_SIZE);
    for (let y = 0; y <= ARENA_SIZE; y += 100) p5.line(0, y, ARENA_SIZE, y);

    // 4. Граница Арены
    p5.noFill();
    p5.stroke('#c49e63');
    p5.strokeWeight(5);
    p5.rect(0, 0, ARENA_SIZE, ARENA_SIZE);

    // --- ВОТ ЭТО МЫ ДОБАВИЛИ: РИСУЕМ ВЕРБЛЮЖАТ (ЕДУ) ---
    p5.noStroke();
    p5.fill('#8b5e34'); // Коричневый цвет еды
    food.forEach((f) => {
      // Рисуем маленьких верблюжат (эллипсы)
      p5.ellipse(f.x, f.y, 8, 6); // Тело
      p5.ellipse(f.x + 5, f.y - 3, 3, 4); // Голова
    });
    // ------------------------------------------------

    // 5. Рисуем Игроков (Бегемотов... пока что)
    players.forEach((player) => {
      const isMe = player.id === myId;
      p5.fill(player.color);
      
      player.segments.forEach((seg: any, i: number) => {
        // Добавим обводку только вожаку каравана
        if (i === 0 && isMe) {
            p5.stroke(255);
            p5.strokeWeight(3);
        } else {
            p5.noStroke();
        }
        
        // Тело сегмента (бегемот)
        p5.rect(seg.x - CELL_SIZE/2, seg.y - CELL_SIZE/2, CELL_SIZE, CELL_SIZE, 8);
        
        // Глаза вожаку
        if (i === 0) {
            p5.fill(255);
            p5.noStroke();
            p5.ellipse(seg.x + 5, seg.y - 5, 2, 2);
            p5.ellipse(seg.x + 5, seg.y + 5, 2, 2);
            p5.fill(player.color); // Вернуть цвет тела
        }
      });
    });

    p5.pop();
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};
