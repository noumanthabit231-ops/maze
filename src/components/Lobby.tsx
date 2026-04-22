import React, { useState, useEffect } from 'react';

export const Lobby = ({ 
  playerName, setPlayerName, myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady 
}) => {
  const [view, setView] = useState('MENU');
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => { if (view === 'BROWSER') fetchRooms(); }, [view]);

  if (gameState === 'WAITING') {
    return (
      <div className="min-h-screen w-screen bg-[#eec988] flex flex-col items-center justify-center p-8 select-none">
        <div className="absolute inset-0 bg-slate-950/20" style={{ background: 'radial-gradient(circle, transparent 20%, rgba(15, 23, 42, 0.5) 100%)' }}></div>
        <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-white/10 shadow-2xl text-center min-w-[400px] z-10">
          <h2 className="text-blue-500 font-black text-xs uppercase tracking-widest mb-6">ОАЗИС ОЖИДАНИЯ</h2>
          <div className="bg-slate-800/50 p-6 rounded-3xl mb-6">
             <p className="text-white text-5xl font-black">{playersCount} / 4</p>
             <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-2">Игроков в караване</p>
          </div>
          <div className="bg-slate-800/30 p-3 rounded-xl mb-8 border border-slate-800 text-slate-500 text-[10px] truncate">
              ID Комнаты: {myId}
          </div>
          {isHost ? (
            <button onClick={onStart} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl shadow-lg active:scale-95 transition-all text-xl">В ПУТЬ!</button>
          ) : (
            <p className="text-slate-500 italic animate-pulse font-bold">Ждем вожака...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#eec988] flex flex-col items-center justify-center p-8 select-none">
      <div className="absolute inset-0 bg-slate-950/20" style={{ background: 'radial-gradient(circle, transparent 20%, rgba(15, 23, 42, 0.5) 100%)' }}></div>
      
      <div className="bg-slate-900/80 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[450px] z-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-6xl mb-4">🐪</span>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Caravan.<span className="text-blue-500">io</span></h1>
        </div>

        {view === 'MENU' ? (
          <div className="space-y-4">
            <input 
                placeholder="Имя погонщика..." 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                className="w-full bg-slate-800/80 border-2 border-slate-700 p-5 rounded-xl text-white font-bold text-center outline-none focus:border-blue-500 text-lg" 
            />
            <button 
                onClick={() => onHost('arena')} 
                disabled={!isPeerReady || !playerName} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black p-5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-lg"
            >
              {isPeerReady ? '⛺ РАЗБИТЬ ЛАГЕРЬ (СОЗДАТЬ)' : '⏳ СВЯЗЬ...'}
            </button>
            <button 
                onClick={() => setView('BROWSER')} 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-lg"
            >
              👥 НАЙТИ КАРАВАН
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <button onClick={() => setView('MENU')} className="text-slate-500 text-xs font-bold uppercase hover:text-white">⬅ Назад</button>
                <button onClick={fetchRooms} className="text-blue-500 text-[10px] font-bold uppercase hover:text-blue-400">{isLoading ? 'Обновляю...' : '🔄 Обновить'}</button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {rooms.length > 0 ? rooms.map((room) => (
                <div key={room.id} className="bg-slate-800/80 p-4 rounded-xl flex items-center justify-between border border-slate-700 hover:border-blue-500 transition-colors">
                  <div className="truncate mr-4">
                    <p className="text-white font-bold text-lg truncate">{room.hostName}</p>
                    <p className="text-slate-500 text-[10px]">Арена</p>
                  </div>
                  <button onClick={() => onJoin(room.id)} className="bg-blue-600 hover:bg-blue-500 text-white p-3 px-6 rounded-lg font-black text-sm active:scale-95 transition-all">ВОЙТИ</button>
                </div>
              )) : <p className="text-center text-slate-500 text-sm italic py-8">Пустыня пуста. Создай игру первым!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
