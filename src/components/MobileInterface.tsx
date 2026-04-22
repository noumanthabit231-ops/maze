import React, { useState, useCallback } from 'react';

interface MobileInterfaceProps {
  score: number;
  onMove: (x: number, y: number) => void;
  onDash: () => void;
}

export const MobileInterface: React.FC<MobileInterfaceProps> = ({ score, onMove, onDash }) => {
  const [joystick, setJoystick] = useState({
    active: false,
    baseX: 0,
    baseY: 0,
    stickX: 0,
    stickY: 0,
    touchId: null as number | null,
  });

  const JOYSTICK_RADIUS = 60; // Радиус фона джойстика

  const handleTouchStart = (e: React.TouchEvent) => {
    // Реагируем только на касания в левой половине экрана
    const touch = Array.from(e.changedTouches).find(t => t.clientX < window.innerWidth / 2);
    if (!touch || joystick.active) return;

    setJoystick({
      active: true,
      baseX: touch.clientX,
      baseY: touch.clientY,
      stickX: touch.clientX,
      stickY: touch.clientY,
      touchId: touch.identifier,
    });
    onMove(0, 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystick.active) return;
    const touch = Array.from(e.touches).find(t => t.identifier === joystick.touchId);
    if (!touch) return;

    const dx = touch.clientX - joystick.baseX;
    const dy = touch.clientY - joystick.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Ограничиваем движение стика радиусом джойстика
    const limitedDist = Math.min(distance, JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    
    const moveX = Math.cos(angle) * limitedDist;
    const moveY = Math.sin(angle) * limitedDist;

    setJoystick(prev => ({
      ...prev,
      stickX: prev.baseX + moveX,
      stickY: prev.baseY + moveY,
    }));

    // Передаем нормализованные значения (-1 до 1)
    onMove(moveX / JOYSTICK_RADIUS, moveY / JOYSTICK_RADIUS);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = Array.from(e.changedTouches).find(t => t.identifier === joystick.touchId);
    if (touch) {
      setJoystick({ active: false, baseX: 0, baseY: 0, stickX: 0, stickY: 0, touchId: null });
      onMove(0, 0);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Верхняя панель: Счёт каравана */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 px-8 py-2 rounded-full flex items-center gap-3 shadow-2xl">
          <span className="text-3xl">🐪</span>
          <span className="text-white text-2xl font-black italic">{score}</span>
        </div>
      </div>

      {/* Динамический Джойстик (виден только при нажатии) */}
      {joystick.active && (
        <div 
          className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: joystick.baseX, top: joystick.baseY }}
        >
          {/* Фон джойстика */}
          <div className="w-full h-full bg-white/5 border-2 border-white/10 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-white/5 rounded-full border border-white/5"></div>
          </div>
          {/* Стик (ручка) */}
          <div 
            className="absolute w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 shadow-xl"
            style={{ 
              left: joystick.stickX - joystick.baseX + 32, // Центрирование
              top: joystick.stickY - joystick.baseY + 32,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="absolute inset-2 bg-blue-500/40 rounded-full blur-sm"></div>
          </div>
        </div>
      )}

      {/* Кнопка "Рывок" (Справа) */}
      <div className="absolute bottom-10 right-10 pointer-events-auto">
        <button 
          onPointerDown={(e) => { e.preventDefault(); onDash(); }}
          className="w-24 h-24 bg-orange-600/80 active:bg-orange-500 backdrop-blur-md rounded-full border-4 border-white/20 shadow-2xl flex flex-col items-center justify-center transition-all active:scale-90"
        >
          <span className="text-3xl mb-[-4px]">⚡</span>
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Рывок</span>
        </button>
      </div>

      {/* Инструкция (исчезает при игре) */}
      {!joystick.active && score < 2 && (
        <div className="absolute bottom-32 left-12 text-white/30 text-xs font-bold uppercase tracking-widest animate-pulse">
          Тяни здесь для движения ←
        </div>
      )}
    </div>
  );
};
