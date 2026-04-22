import p5Types from 'p5';

export const RenderUtils = {
  // Рисуем маленького верблюжонка (еду)
  drawFood: (p5: p5Types, x: number, y: number) => {
    p5.push();
    p5.translate(x, y);
    p5.fill('#8b5e34');
    p5.noStroke();
    
    // Тельце
    p5.ellipse(0, 0, 10, 7);
    // Горбик
    p5.ellipse(0, -4, 6, 4);
    // Маленькая шея и голова
    p5.rect(4, -4, 3, 6);
    p5.ellipse(6, -4, 4, 3);
    p5.pop();
  },

  // Рисуем сегмент каравана (верблюд с горбом)
  drawSegment: (p5: p5Types, x: number, y: number, angle: number, color: string) => {
    p5.push();
    p5.translate(x, y);
    p5.rotate(angle);
    
    p5.fill(color);
    p5.noStroke();
    
    // Основное тело
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 24, 16, 5);
    
    // Горб (Camel Hump)
    p5.ellipse(0, -6, 14, 10);
    
    // Хвостик
    p5.stroke(color);
    p5.strokeWeight(2);
    p5.line(-12, 0, -18, 5);
    
    p5.pop();
  },

  // Рисуем Вожака (Верблюд с длинной шеей и головой)
  drawHead: (p5: p5Types, x: number, y: number, angle: number, color: string, name: string, isMe: boolean) => {
    p5.push();
    p5.translate(x, y);
    
    // Имя игрока
    p5.textAlign(p5.CENTER);
    p5.fill(0, 100);
    p5.textSize(12);
    p5.text(name, 0, -40);

    p5.rotate(angle);
    
    // Тело
    p5.fill(color);
    if (isMe) {
        p5.stroke(255);
        p5.strokeWeight(2);
    } else {
        p5.noStroke();
    }
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 26, 18, 5);
    p5.ellipse(0, -7, 16, 12); // Большой горб

    // ШЕЯ И ГОЛОВА (то, что делает его верблюдом)
    p5.push();
    p5.translate(10, 0);
    p5.rotate(-0.5); // Наклон шеи вперед
    p5.rect(5, -8, 8, 18, 4); // Шея
    p5.ellipse(10, -15, 12, 8); // Голова
    
    // Глаза
    p5.fill(0);
    p5.noStroke();
    p5.ellipse(12, -16, 2, 2);
    p5.pop();
    
    p5.pop();
  }
};
