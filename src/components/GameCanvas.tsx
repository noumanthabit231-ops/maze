import React, { useRef } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { RenderUtils } from '../utils/render'; // --- IMPORT the new render utils ---

interface Props {
  myId: string;
  players: any[];
  food: any[];
}

const ARENA_SIZE = 2000;
const CELL_SIZE = 25; // Size is now handled *inside* the render functions

export const GameCanvas: React.FC<Props> = ({ myId, players, food = [] }) => {
  const camera = useRef({ x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 });

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    p5.ellipseMode(p5.RADIUS);
    p5.noStroke();
  };

  const draw = (p5: p5Types) => {
    // 1. Draw sand
    p5.background('#f3e5ab');

    const me = players.find((p) => p.id === myId);
    if (!me || me.segments.length === 0) return;

    // 2. Smooth camera
    camera.current.x = p5.lerp(camera.current.x, me.segments[0].x, 0.1);
    camera.current.y = p5.lerp(camera.current.y, me.segments[0].y, 0.1);

    p5.push();
    p5.translate(p5.width / 2 - camera.current.x, p5.height / 2 - camera.current.y);

    // 3. Desert Grid
    p5.stroke('rgba(0,0,0,0.05)');
    for (let x = 0; x <= ARENA_SIZE; x += 100) p5.line(x, 0, x, ARENA_SIZE);
    for (let y = 0; y <= ARENA_SIZE; y += 100) p5.line(0, y, ARENA_SIZE, y);

    // 4. Arena Boundary
    p5.noFill();
    p5.stroke('#c49e63');
    p5.strokeWeight(5);
    p5.rect(0, 0, ARENA_SIZE, ARENA_SIZE);

    // --- REPLACED: Draw Scattered Camel Kids ---
    food.forEach((f) => {
        // CALL the new camel kid render function (we add 0 for angle for now)
        RenderUtils.drawCamelKid(p5, f.x, f.y, 0); 
    });
    // -------------------------------------------

    // --- REPLACED: Draw Players (Real Camels) ---
    players.forEach((player) => {
      const isMe = player.id === myId;
      
      // We are NO LONGER drawing simple p5.rect squares
      player.segments.forEach((seg: any, i: number) => {
        // We use rotation logic (following snake behavior)
        const prevSeg = i === 0 ? seg : player.segments[i-1];
        const angle = Math.atan2(prevSeg.y - seg.y, prevSeg.x - seg.x) + Math.PI/2;
        
        // CALL the correct adult camel render function
        if (isMe) {
            RenderUtils.drawPlayerCamel(p5, seg.x, seg.y, angle, player.color);
        } else {
            RenderUtils.drawEnemyCamel(p5, seg.x, seg.y, angle, player.color);
        }
      });
    });
    // ---------------------------------------------

    p5.pop();
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};
