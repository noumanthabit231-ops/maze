import p5Types from 'p5';

export const RenderUtils = {
  // Рисуем верблюжонка (еду на карте)
  drawFood: (p5: p5Types, x: number, y: number) => {
    p5.push();
    p5.translate(x, y);
    p5.fill('#8b5e34');
    p5.noStroke();
    p5.ellipse(0, 0, 8, 6); // Тело
    p5.ellipse(0, -5, 5, 4); // Один горбик
    p5.ellipse(4, -3, 3, 3); // Голова
    p5.pop();
  },

  // Рисуем верблюда (сегмент или голову)
  drawCamel: (p5: p5Types, x: number, y: number, angle: number, color: string, isHead: boolean, index: number) => {
    p5.push();
    p5.translate(x, y);
    
    // Тень (делаем чуть больше, так как верблюд высокий)
    p5.fill('rgba(0,0,0,0.15)');
    p5.ellipse(0, 15, isHead ? 20 : 15, 10);

    p5.rotate(angle);

    // Масштаб: вожак большой (1.0), остальные меньше (0.7)
    const scale = isHead ? 1.2 : 0.8;
    p5.scale(scale);

    p5.fill(color);
    p5.noStroke();

    // 1. Ноги (высокие)
    p5.stroke(color);
    p5.strokeWeight(3);
    p5.line(-8, 5, -10, 15);
    p5.line(8, 5, 10, 15);
    p5.noStroke();

    // 2. Тело (поднято выше)
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 28, 18, 5);

    // 3. ДВА ГОРБА (настоящий Бактриан)
    p5.ellipse(-7, -10, 12, 12); // Задний горб
    p5.ellipse(5, -10, 10, 10);  // Передний горб

    // 4. ШЕЯ И ГОЛОВА (только для вожака или всех сегментов, если хочешь)
    // Рисуем шею, которая смотрит вперед по вектору движения
    p5.push();
    p5.translate(12, -5); 
    p5.rotate(-0.3); // Наклон шеи вверх
    p5.rect(5, -8, 8, 20, 4); // Длинная шея
    
    p5.push();
    p5.translate(8, -15);
    p5.rotate(0.3); // Выравниваем голову
    p5.ellipse(0, 0, 14, 10); // Голова
    
    // Глаза и детали
    p5.fill(0);
    p5.ellipse(3, -2, 2, 2); 
    
    // Ушки
    p5.fill(color);
    p5.ellipse(-4, -6, 3, 5);
    p5.pop();
    p5.pop();

    p5.pop();
  }
};
