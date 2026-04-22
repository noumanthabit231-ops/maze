import React, { useState, useEffect } from 'react';

interface Props {
  score: number;
  onMove: (x: number, y: number) => void;
  onSpit: () => void;
}

export const MobileInterface: React.FC<Props> = ({ score, onMove, onSpit }) => {
  const [touch, setTouch] = useState<{ active: boolean; startX: number; startY: number; currentX: number; currentY: number; id: number | null }>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    id: null
  });

  const MAX_DIST = 50; // Радиус хода джойстика

  const handleTouchStart = (e: React.TouchEvent) => {
    // Берем только левую половину экрана для джойстика
    const t = Array.from(e.changedTouches).find(item => item.clientX < window.innerWidth / 2);
    if (t) {
      setTouch({
        active: true,
        startX: t.clientX,
        startY: t.clientY,
        currentX: t.clientX,
        currentY: t.clientY,
        id: t.identifier
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touch.active) return;
    const t = Array.from(e.touches).find(item => item.identifier === touch.id);
    if (t) {
      const dx = t.clientX - touch.startX;
      const dy = t.clientY - touch.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const limitedX = dist > MAX_DIST ? (dx / dist) * MAX_DIST : dx;
      const limitedY = dist > MAX_DIST ? (dy / dist) * MAX_DIST : dy;

      setTouch(prev => ({ ...prev, currentX: touch.startX + limitedX, currentY: touch.startY + limitedY }));
      
      // Передаем нормализованные значения (-1..1) в движок
      onMove(limitedX / MAX_DIST, limitedY / MAX_DIST);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const t = Array.from(e.changedTouches).find(item => item.identifier === touch.id);
    if (t) {
      setTouch({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, id: null });
      onMove(0, 0); // Остановка
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-50">
      {/* Счётчик верблюдов */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
        <span className="text-white font-black tracking-tighter text-2xl">🐪 {score}</span>
      </div>

      {/* Зона Джойстика (Лево) */}
      <div 
        className="absolute bottom-10 left-10 w-40 h-40 flex items-center justify-center pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Внешний круг */}
        <div className="w-32 h-32 bg-white/5 border-2 border-white/10 rounded-full flex items-center justify-center">
            {/* Стик (отображается при активном касании или в центре) */}
            <div 
              className="w-14 h-14 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform duration-75"
              style={{
                transform: touch.active 
                  ? `translate(${touch.currentX - touch.startX}px, ${touch.currentY - touch.startY}px)` 
                  : 'translate(0px, 0px)'
              }}
            />
        </div>
      </div>

      {/* Кнопка Атаки (Право) */}
      <div className="absolute bottom-12 right-12 pointer-events-auto">
        <button 
          onPointerDown={(e) => { e.preventDefault(); onSpit(); }}
          className="w-24 h-24 bg-red-600 active:bg-red-700 active:scale-90 rounded-full border-4 border-white/20 shadow-xl flex items-center justify-center transition-all"
        >
          <span className="text-white font-black text-xs uppercase">Плевок</span>
        </button>
      </div>
    </div>
  );
};
