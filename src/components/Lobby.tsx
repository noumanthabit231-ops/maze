import React, { useState, useEffect } from 'react';

export const Lobby = ({ playerName, setPlayerName, myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady }) => {
  const [view, setView] = useState('MENU');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (view === 'BROWSER') fetchRooms(); }, [view]);

  if (gameState === 'WAITING') {
    return (
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl text-center min-w-[320px]">
        <h2 className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-6 italic">Лобби ожидания</h2>
        <div className="bg-slate-800/50 p-6 rounded-3xl mb-8">
           <p className="text-white text-4xl font-black">{playersCount} / 4</p>
           <p className="text-slate-500 text-[10px] uppercase font-bold">Игроков готово</p>
        </div>
        {isHost ? (
          <button onClick={onStart} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl active:scale-95 transition-all">НАЧАТЬ МАТЧ</button>
        ) : (
          <p className="text-slate-500 italic animate-pulse">Ждем старта...</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl min-w-[350px]">
      <div className="flex flex-col items-center mb-10">
        <span className="text-4xl mb-2">🏆</span>
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Maze Race</h1>
      </div>

      {view === 'MENU' ? (
        <div className="space-y-4">
          <input placeholder="Твое имя" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-xl text-white font-bold text-center outline-none focus:border-blue-500" />
          <button onClick={onHost} disabled={!isPeerReady || !playerName} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-xl flex items-center justify-center gap-2 active:scale-95">
            {isPeerReady ? '➕ СОЗДАТЬ' : '⏳ ЖДЕМ СЕТЬ...'}
          </button>
          <button onClick={() => setView('BROWSER')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-5 rounded-xl flex items-center justify-center gap-2 active:scale-95">
            👥 НАЙТИ ИГРУ
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <button onClick={() => setView('MENU')} className="text-slate-500 text-[10px] font-black mb-2 uppercase">⬅ Назад</button>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {rooms.length > 0 ? rooms.map((room) => (
              <div key={room.id} className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                <p className="text-white font-bold text-sm truncate mr-4">{room.hostName}</p>
                <button 
                  onClick={() => { console.log("Жму вход в:", room.id); onJoin(room.id); }} 
                  className="bg-blue-600 text-white p-2 px-4 rounded-lg font-black text-xs hover:bg-blue-500"
                >
                  ИГРАТЬ
                </button>
              </div>
            )) : <p className="text-center text-slate-600 text-xs italic py-8">Пусто...</p>}
          </div>
          <button onClick={fetchRooms} className="w-full text-blue-500 text-[10px] font-bold uppercase">{loading ? '...' : '🔄 Обновить'}</button>
        </div>
      )}
    </div>
  );
};
