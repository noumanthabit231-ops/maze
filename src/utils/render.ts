import p5Types from 'p5';

export const RenderUtils = {
  // Рисуем верблюжонка (еду)
  drawFood: (p5: p5Types, x: number, y: number) => {
    p5.push();
    p5.translate(x, y);
    p5.fill('#8b5e34');
    p5.noStroke();
    p5.ellipse(0, 0, 10, 7); // Тело
    p5.ellipse(0, -4, 6, 4);  // Горбик
    p5.ellipse(5, -3, 4, 3);  // Голова
    p5.pop();
  },

  // Рисуем сегмент каравана (верблюд-тело)
  drawSegment: (p5: p5Types, x: number, y: number, angle: number, color: string) => {
    p5.push();
    p5.translate(x, y);
    p5.rotate(angle);
    p5.fill(color);
    p5.noStroke();
    
    // Тело
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 24, 16, 4);
    // Горб
    p5.ellipse(0, -6, 12, 10);
    // Ноги (схематично)
    p5.stroke(color);
    p5.strokeWeight(3);
    p5.line(-8, 8, -8, 12);
    p5.line(8, 8, 8, 12);
    p5.pop();
  },

  // Рисуем вожака (верблюд с шеей)
  drawHead: (p5: p5Types, x: number, y: number, angle: number, color: string, name: string, isMe: boolean) => {
    p5.push();
    p5.translate(x, y);
    
    // Никнейм
    p5.textAlign(p5.CENTER);
    p5.textSize(12);
    p5.fill(isMe ? '#fff' : 'rgba(0,0,0,0.5)');
    p5.text(name, 0, -45);

    p5.rotate(angle);
    p5.fill(color);
    if (isMe) { p5.stroke(255); p5.strokeWeight(2); } else { p5.noStroke(); }

    // Основное тело вожака
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 26, 18, 5);
    p5.ellipse(0, -8, 14, 12); // Горб

    // Шея и голова
    p5.push();
    p5.translate(12, 0);
    p5.rotate(-0.4); // Наклон шеи
    p5.rect(5, -8, 8, 16, 3); // Шея
    p5.ellipse(10, -14, 12, 8); // Голова
    // Глаз
    p5.fill(0); p5.noStroke();
    p5.ellipse(12, -15, 2, 2);
    p5.pop();
    
    p5.pop();
  }
};
