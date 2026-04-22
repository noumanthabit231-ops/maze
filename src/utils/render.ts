import p5Types from 'p5';

export const RenderUtils = {
  // 1. РИСУЕМ ВЕРБЛЮЖОНКА (ЕДУ)
  drawFood: (p5: p5Types, x: number, y: number, type: string) => {
    p5.push();
    p5.translate(x, y);
    
    // Тень
    p5.fill('rgba(0,0,0,0.15)');
    p5.ellipse(0, 4, 10, 6);

    // Цвет (золотой или обычный песочный)
    const color = type === 'GOLDEN' ? '#ffd700' : '#d2b48c';
    p5.fill(color);
    p5.noStroke();

    // Тельце верблюжонка
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 12, 10, 3);
    
    // Горбик
    p5.ellipse(0, -5, 8, 5);
    
    // Голова
    p5.ellipse(6, -4, 6, 5);
    
    // Ушки
    p5.fill(color);
    p5.ellipse(5, -7, 2, 3);
    
    p5.pop();
  },

  // 2. РИСУЕМ ТЕЛО КАРАВАНА (СЕГМЕНТЫ)
  drawSegment: (p5: p5Types, x: number, y: number, angle: number, color: string) => {
    p5.push();
    p5.translate(x, y);
    p5.rotate(angle);

    // Тень под сегментом
    p5.fill('rgba(0,0,0,0.1)');
    p5.ellipse(0, 6, 18, 10);

    // Основное тело верблюда в связке
    p5.fill(color);
    p5.noStroke();
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 22, 16, 4);

    // Горб
    p5.fill(color);
    p5.ellipse(0, -4, 12, 8);

    // Попона (накидка) на верблюде, чтобы караван выглядел богаче
    p5.fill('rgba(255,255,255,0.2)');
    p5.rect(0, 0, 12, 12, 2);

    p5.pop();
  },

  // 3. РИСУЕМ ГОЛОВУ (ВОЖАК)
  drawHead: (p5: p5Types, x: number, y: number, angle: number, color: string, name: string, isMe: boolean) => {
    p5.push();
    p5.translate(x, y);
    
    // Имя игрока
    p5.textAlign(p5.CENTER);
    p5.textSize(12);
    p5.textStyle(p5.BOLD);
    p5.fill(isMe ? '#fff' : 'rgba(255,255,255,0.7)');
    p5.text(name, 0, -35);

    p5.rotate(angle);

    // Тень
    p5.fill('rgba(0,0,0,0.2)');
    p5.ellipse(0, 8, 25, 12);

    // Тело головы
    p5.fill(color);
    if (isMe) {
      p5.stroke(255);
      p5.strokeWeight(2);
    } else {
      p5.noStroke();
    }
    
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, 30, 22, 8);

    // Большая морда
    p5.noStroke();
    p5.ellipse(12, 0, 15, 14);

    // Уши
    p5.ellipse(-5, -10, 4, 8);
    p5.ellipse(-10, -8, 4, 8);

    // Глаза
    p5.fill(0);
    p5.ellipse(10, -5, 3, 3);
    p5.ellipse(10, 5, 3, 3);

    // Уздечка (деталь управления)
    p5.stroke('rgba(0,0,0,0.3)');
    p5.strokeWeight(1);
    p5.noFill();
    p5.arc(12, 0, 10, 10, p5.HALF_PI, p5.PI + p5.HALF_PI);

    p5.pop();
  }
};
