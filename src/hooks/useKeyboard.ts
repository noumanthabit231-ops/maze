import { useEffect, useRef } from 'react';

interface KeyboardProps {
  onMove: (x: number, y: number) => void;
  onDash: () => void;
  enabled: boolean;
}

export const useKeyboard = ({ onMove, onDash, enabled }: KeyboardProps) => {
  // Используем реф для хранения состояния клавиш, чтобы избежать лишних рендеров
  const keys = useRef({
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
  });

  useEffect(() => {
    if (!enabled) return;

    const updateMovement = () => {
      let x = 0;
      let y = 0;
      const k = keys.current;

      if (k.w || k.ArrowUp) y -= 1;
      if (k.s || k.ArrowDown) y += 1;
      if (k.a || k.ArrowLeft) x -= 1;
      if (k.d || k.ArrowRight) x += 1;

      // Нормализация, чтобы по диагонали не бегал как угорелый
      if (x !== 0 && y !== 0) {
        const len = Math.sqrt(x * x + y * y);
        x /= len;
        y /= len;
      }

      onMove(x, y);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onDash();
      }
      if (e.key in keys.current) {
        keys.current[e.key as keyof typeof keys.current] = true;
        updateMovement();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in keys.current) {
        keys.current[e.key as keyof typeof keys.current] = false;
        updateMovement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onMove, onDash, enabled]);
};
