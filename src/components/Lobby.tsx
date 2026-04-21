import React, { useState, useEffect } from 'react';

export const Lobby = ({ playerName, setPlayerName, myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady }) => {
  const [view, setView] = useState('MENU');
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (view === 'BROWSER') fetchRooms(); }, [view]);

  if (gameState === 'WAITING') {
    return (
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 text-center min-w-[320px]">
        <h2 className="text-blue-500 font-black text-[10px] mb-6 tracking-widest">ЛОББИ ОЖИДАНИЯ</h2>
        <div className="bg-slate-800/50 p-6 rounded-3xl mb-8">
           <p className="text-white text-4xl font-black">{playersCount} / 4</p>
           <p className="text-slate-500 text-[10px] uppercase font-bold">Игроков</p>
        </div>
        {isHost ? (
          <button onClick={onStart} className="w-full bg-blue-600 text-white font-black p-5 rounded-2xl active:scale-95">СТАРТ</button>
        ) : (
          <p className="text-slate-500 italic animate-pulse font-bold text-sm">Ждем хоста...</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 min-w-[350px]">
      <div className="text-center mb-8">
        <span className="text-4xl">🏆</span>
        <h1 className="text-2xl font-black text-white italic uppercase">Maze Race</h1>
      </div>

      {view === 'MENU' ? (
        <div className="space-y-4">
          <input placeholder="Имя..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-xl text-white font-bold text-center" />
          
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onHost('easy')} className="bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white text-[10px] font-black p-3 rounded-xl transition-all">ЛЕГКО</button>
            <button onClick={() => onHost('hard')} className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-500 hover:text-white text-[10px] font-black p-3 rounded-xl transition-all">СЛОЖНО</button>
            <button onClick={() => onHost('ultra')} className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-black p-3 rounded-xl transition-all">УЛЬТРА</button>
          </div>

          <button onClick={() => setView('BROWSER')} className="w-full bg-slate-800 text-white font-black p-5 rounded-xl active:scale-95">👥 НАЙТИ ИГРУ</button>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setView('MENU')} className="text-slate-500 text-[10px] font-black uppercase">⬅ Назад</button>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {rooms.length > 0 ? rooms.map((room) => (
              <div key={room.id} className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                <div>
                    <p className="text-white font-bold text-sm">{room.hostName}</p>
                    <p className="text-blue-500 text-[8px] font-black uppercase">{room.difficulty || 'easy'}</p>
                </div>
                <button onClick={() => onJoin(room.id)} className="bg-blue-600 text-white p-2 px-4 rounded-lg font-black text-xs">ИГРАТЬ</button>
              </div>
            )) : <p className="text-center text-slate-600 text-xs italic py-8">Комнат нет...</p>}
          </div>
        </div>
      )}
    </div>
  );
};
