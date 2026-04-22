// Тип для сегмента каравана
export type Segment = { x: number, y: number, angle: number };

// Математика физики для каравана
export class CaravanPhysics {
  // Расстояние между сегментами (верблюдами)
  static segmentDist = 20;

  // Функция автоматического следования хвоста за головой
  // heads[0] - это твоя голова (которой ты управляешь)
  static updateSegments(segments: Segment[]): Segment[] {
    if (segments.length < 2) return segments;

    const newSegments = [...segments];
    for (let i = 1; i < newSegments.length; i++) {
      const prev = newSegments[i - 1];
      const current = newSegments[i];

      // Расчет вектора между текущим и предыдущим верблюдом
      const dx = prev.x - current.x;
      const dy = prev.y - current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Если они слишком далеко, "притягиваем" хвост к голове
      if (dist > this.segmentDist) {
        const factor = this.segmentDist / dist;
        current.x = prev.x - dx * factor;
        current.y = prev.y - dy * factor;
        // Угол поворота хвоста за головой
        current.angle = Math.atan2(dy, dx);
      }
    }
    return newSegments;
  }

  // Проверка столкновения Головы vs Чужого Хвоста
  static checkCollision(myHead: Segment, otherSegments: Segment[]): boolean {
    // Не проверяем первые 5 сегментов своего каравана, чтобы не врезаться в себя
    const startIndex = (otherSegments[0] && myHead.x === otherSegments[0].x) ? 5 : 0;
    
    for (let i = startIndex; i < otherSegments.length; i++) {
      const seg = otherSegments[i];
      const dx = myHead.x - seg.x;
      const dy = myHead.y - seg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Если голова подьехала слишком близко к сегменту — врезалась
      if (dist < 15) return true; 
    }
    return false;
  }
}
