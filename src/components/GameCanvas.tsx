import React, { useRef } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { RenderUtils } from '../utils/render';

interface Props { myId: string; players: any[]; food: any[]; }

export const GameCanvas: React.FC<Props> = ({ myId, players = [], food = [] }) => {
  const camera = useRef({ x: 1000, y: 1000 });
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background('#eec988');
    const me = players.find(p => p.id === myId);
    if (!me || !me.segments) return;

    camera.current.x = p5.lerp(camera.current.x, me.segments[0].x, 0.1);
    camera.current.y = p5.lerp(camera.current.y, me.segments[0].y, 0.1);

    p5.push();
    p5.translate(p5.width/2 - camera.current.x, p5.height/2 - camera.current.y);

    // Сетка и границы
    p5.stroke('#e2bc7a');
    for (let x=0; x<=2000; x+=100) p5.line(x, 0, x, 2000);
    for (let y=0; y<=2000; y+=100) p5.line(0, y, 2000, y);

    food.forEach(f => RenderUtils.drawFood(p5, f.x, f.y));

    players.forEach(player => {
      // Рисуем хвост сначала, потом голову
      for (let i = player.segments.length - 1; i >= 0; i--) {
        const s = player.segments[i];
        RenderUtils.drawCamel(p5, s.x, s.y, s.angle || 0, player.color, i === 0);
      }
    });
    p5.pop();
  };

  return <Sketch setup={setup} draw={draw} windowResized={(p5) => p5.resizeCanvas(window.innerWidth, window.innerHeight)} />;
};
