import React from 'react';

export const Joystick = ({ onMove }) => {
  const btnClass = "w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center text-2xl active:bg-blue-600 active:scale-90 transition-all touch-none select-none border border-white/10";
  
  return (
    <div className="fixed bottom-8 right-8 grid grid-cols-3 gap-2 md:hidden">
      <div />
      <button className={btnClass} onPointerDown={() => onMove('up')}>⬆️</button>
      <div />
      <button className={btnClass} onPointerDown={() => onMove('left')}>⬅️</button>
      <button className={btnClass} onPointerDown={() => onMove('down')}>⬇️</button>
      <button className={btnClass} onPointerDown={() => onMove('right')}>➡️</button>
    </div>
  );
};
