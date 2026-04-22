import { useEffect } from 'react';

interface KeyboardProps {
  onMove: (x: number, y: number) => void;
  onSpit: () => void;
  enabled: boolean;
}

export const useKeyboard = ({ onMove, onSpit, enabled }: KeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    // Состояние зажатых клавиш
    const keys = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
    };

    const updateMovement = () => {
      let x = 0;
      let y = 0;

      if (keys.w || keys.ArrowUp) y -= 1;
      if (keys.s || keys.ArrowDown) y += 1;
      if (keys.a || keys.ArrowLeft) x -= 1;
      if (keys.d || keys.ArrowRight) x += 1;

      // Нормализация вектора (чтобы диагональ не была быстрее)
      if (x !== 0 && y !== 0) {
        const length = Math.sqrt(x * x + y * y);
        x /= length;
        y /= length;
      }

      onMove(x, y);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Кнопка атаки - Пробел
      if (e.code === 'Space') {
        e.preventDefault();
        onSpit();
      }

      if (e.key in keys) {
        keys[e.key as keyof typeof keys] = true;
        updateMovement();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in keys) {
        keys[e.key as keyof typeof keys] = false;
        updateMovement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onMove, onSpit, enabled]);
};
