import p5Types from 'p5';

export const RenderUtils = {
  // Рисуем еду (маленький верблюжонок)
  drawFood: (p5: p5Types, x: number, y: number) => {
    p5.push();
    p5.translate(x, y);
    p5.fill('#8b5e34');
    p5.noStroke();
    p5.ellipse(0, 0, 8, 6);
    p5.ellipse(0, -4, 5, 4); // Один горбик для малыша
    p5.ellipse(4, -3, 3, 3); // Голова
    p5.pop();
  },

  // Основная функция отрисовки верблюда
  drawCamel: (p5: p5Types, x: number, y: number, angle: number, color: string, isHead: boolean) => {
    p5.push();
    p5.translate(x, y);
    
    // Тень на песке
    p5.fill('rgba(0,0,0,0.1)');
    p5.ellipse(0, 15, isHead ? 22 : 16, 8);

    p5.rotate(angle);
    
    // Масштаб: вожак крупнее, последователи — 75% от размера
    const s = isHead ? 1.2 : 0.8;
    p5.scale(s);

    p5.fill(color);
    p5.noStroke();

    // 1. Длинные ноги
    p5.stroke(color);
    p5.strokeWeight(3);
    p5.line(-8, 5, -10, 15);
    p5.line(8, 5, 10, 15);
    p5.noStroke();

    // 2. Тело
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 28, 18, 5);

    // 3. ДВА ГОРБА (Бактриан)
    p5.ellipse(-6, -10, 11, 12); // Задний
    p5.ellipse(6, -10, 10, 11);  // Передний

    // 4. ШЕЯ И ГОЛОВА
    p5.push();
    p5.translate(12, -2);
    p5.rotate(-0.4); // Изгиб шеи
    p5.rect(4, -8, 7, 18, 3); // Шея
    
    p5.push();
    p5.translate(6, -14);
    p5.rotate(0.4); // Голова смотрит прямо
    p5.ellipse(0, 0, 12, 9); // Морда
    
    // Детали морды
    p5.fill(0);
    p5.ellipse(4, -2, 2, 2); // Глаз
    p5.fill(color);
    p5.ellipse(-3, -6, 3, 5); // Ушко
    p5.pop();
    p5.pop();

    p5.pop();
  }
};
