import React, { useRef } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { RenderUtils } from '../utils/render';

interface Props {
  myId: string;
  players: any[];
  food: any[];
}

const ARENA_SIZE = 2000;

export const GameCanvas: React.FC<Props> = ({ myId, players, food }) => {
  // Координаты камеры (плавное следование)
  const camera = useRef({ x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 });

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    p5.noStroke();
  };

  const draw = (p5: p5Types) => {
    // 1. Цвет глубокого песка
    p5.background('#eec988');

    const me = players.find((p) => p.id === myId);
    if (!me || !me.segments || me.segments.length === 0) return;

    const head = me.segments[0];

    // 2. Плавное движение камеры за головой верблюда
    camera.current.x = p5.lerp(camera.current.x, head.x, 0.1);
    camera.current.y = p5.lerp(camera.current.y, head.y, 0.1);

    p5.push();
    // Центрируем камеру относительно экрана
    p5.translate(p5.width / 2 - camera.current.x, p5.height / 2 - camera.current.y);

    // 3. Рисуем сетку пустыни (дюны/песок)
    p5.stroke('#e2bc7a');
    p5.strokeWeight(1);
    for (let x = 0; x <= ARENA_SIZE; x += 100) p5.line(x, 0, x, ARENA_SIZE);
    for (let y = 0; y <= ARENA_SIZE; y += 100) p5.line(0, y, ARENA_SIZE, y);

    // 4. Граница Арены (Песчаный борт)
    p5.noFill();
    p5.stroke('#c49e63');
    p5.strokeWeight(15);
    p5.rect(0, 0, ARENA_SIZE, ARENA_SIZE);

    // 5. Отрисовка Еды (Верблюжат)
    food.forEach((f) => {
      RenderUtils.drawFood(p5, f.x, f.y, f.type);
    });

    // 6. Отрисовка Игроков
    players.forEach((player) => {
      const isMe = player.id === myId;
      
      // Сначала рисуем хвост (сегменты)
      for (let i = player.segments.length - 1; i > 0; i--) {
        const seg = player.segments[i];
        RenderUtils.drawSegment(p5, seg.x, seg.y, seg.angle, player.color);
      }

      // Затем рисуем голову вожака (чтобы она была поверх хвоста)
      const headPos = player.segments[0];
      RenderUtils.drawHead(
        p5, 
        headPos.x, 
        headPos.y, 
        headPos.angle, 
        player.color, 
        player.name, 
        isMe
      );
    });

    p5.pop();

    // Эффект виньетки (затемнение по краям для фокуса)
    p5.noFill();
    for(let i = 0; i < 10; i++) {
        p5.stroke(15, 23, 42, i * 10);
        p5.strokeWeight(i * 20);
        p5.rect(0, 0, p5.width, p5.height);
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};
