import React, { useState } from 'react';

export const MobileInterface = ({ score, onMove, onSpit }) => {
  const [joystick, setJoystick] = useState({ active: false, x: 0, y: 0, id: null });
  const MAX_RADIUS = 60; // Радиус фона джойстика

  // Обработка касания джойстика
  const handleStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setJoystick({ active: true, x: touch.clientX, y: touch.clientY, id: touch.identifier });
    onMove(0, 0); // Обнуляем движение на старте
  };

  const handleMove = (e: React.TouchEvent) => {
    if (!joystick.active) return;
    e.preventDefault();
    const touch = Array.from(e.touches).find(t => t.identifier === joystick.id);
    if (!touch) return;

    // Считаем вектор от центра фона до пальца
    const dx = touch.clientX - joystick.x;
    const dy = touch.clientY - joystick.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Ограничиваем джойстик радиусом
    const limitedX = dx * Math.min(dist, MAX_RADIUS) / dist;
    const limitedY = dy * Math.min(dist, MAX_RADIUS) / dist;

    // Передаем вuseGame значения от -1 до 1
    onMove(limitedX / MAX_RADIUS, limitedY / MAX_RADIUS);

    // Рисуем внутреннюю ручку джойстика
    const stick = document.getElementById('joystick-stick');
    if (stick) {
      stick.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
    }
  };

  const handleEnd = (e: React.TouchEvent) => {
    setJoystick({ active: false, x: 0, y: 0, id: null });
    onMove(0, 0); // Останавливаем верблюда
    const stick = document.getElementById('joystick-stick');
    if (stick) stick.style.transform = `translate(0px, 0px)`;
  };

  return (
    <div 
      className="fixed inset-0 select-none touch-none h-screen w-screen" 
      style={{ orientation: 'landscape' }}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* 1. Счёт (Вверху по центру, стильно) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/60 border border-white/10 p-4 px-10 rounded-full flex items-center gap-4 shadow-xl">
        <span className="text-4xl">🐪</span>
        <span className="text-white text-3xl font-black">{score}</span>
        <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">Караван</span>
      </div>

      {/* 2. Джойстик (Mobile Legends Style) - Слева внизу */}
      <div 
        className="absolute bottom-12 left-12 w-[160px] h-[160px] flex items-center justify-center rounded-full"
        style={{ background: 'rgba(128, 128, 128, 0.1)', border: '4px solid rgba(255, 255, 255, 0.05)'}}
        onTouchStart={handleStart}
      >
          {/* Внутренний фон */}
          <div className="w-[120px] h-[120px] rounded-full" style={{ background: 'rgba(255, 255, 255, 0.03)' }}></div>
          {/* Стик */}
          <div 
            id="joystick-stick"
            className="absolute w-[60px] h-[60px] bg-slate-100 rounded-full shadow-lg"
            style={{ 
                border: '5px solid #3b82f6', 
                transition: 'transform 0.05s linear',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
            }}
          ></div>
      </div>

      {/* 3. Кнопка "Рывок" (Mobile Legends) - Справа внизу */}
      <button 
        className="absolute bottom-12 right-12 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-8 border-white/5 active:bg-blue-500 active:scale-90 transition-all"
        style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}
        onPointerDown={onSpit}
      >
          <span className="text-5xl">⚡️</span>
      </button>

      {/* Тени на весь экран */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 40%, rgba(15, 23, 42, 0.6) 100%)' }}></div>
    </div>
  );
};
