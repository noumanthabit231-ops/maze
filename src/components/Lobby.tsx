import React, { useState, useEffect } from 'react';

export const Lobby = ({ 
  playerName, setPlayerName, roomCode, setRoomCode, 
  myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady 
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
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl text-center min-w-[320px]">
        <h2 className="text-blue-500 font-black text-xs uppercase tracking-widest mb-6">ЛОББИ ОЖИДАНИЯ</h2>
        <div className="bg-slate-800/50 p-6 rounded-3xl mb-6">
           <p className="text-white text-4xl font-black">{playersCount} / 4</p>
           <p className="text-slate-500 text-[10px] uppercase font-bold">Игроков готово</p>
        </div>
        <div className="bg-slate-800/30 p-3 rounded-xl mb-8 border border-slate-800 text-slate-500 text-[10px] truncate">
            ID: {myId || roomCode}
        </div>
        {isHost ? (
          <button onClick={onStart} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl shadow-lg active:scale-95 transition-all">НАЧАТЬ МАТЧ</button>
        ) : (
          <p className="text-slate-500 italic animate-pulse">Ждем хоста...</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl min-w-[350px]">
      <div className="flex flex-col items-center mb-8">
        <span className="text-4xl mb-2">🏆</span>
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Maze Race</h1>
      </div>

      {view === 'MENU' ? (
        <div className="space-y-4">
          <input placeholder="Твое имя..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-xl text-white font-bold text-center outline-none focus:border-blue-500" />
          <button onClick={onHost} disabled={!isPeerReady || !playerName} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            {isPeerReady ? '➕ СОЗДАТЬ ИГРУ' : '⏳ ЗАГРУЗКА...'}
          </button>
          <button onClick={() => setView('BROWSER')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            👥 НАЙТИ ИГРУ
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setView('MENU')} className="text-slate-500 text-xs font-bold uppercase mb-2">⬅ Назад</button>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {rooms.length > 0 ? rooms.map((room) => (
              <div key={room.id} className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                <div className="truncate mr-4">
                  <p className="text-white font-bold text-sm truncate">{room.hostName}</p>
                </div>
                <button onClick={() => onJoin(room.id)} className="bg-blue-600 text-white p-2 px-4 rounded-lg font-black text-xs">ИГРАТЬ</button>
              </div>
            )) : <p className="text-center text-slate-600 text-xs italic py-8">Комнат нет...</p>}
          </div>
          <button onClick={fetchRooms} className="w-full text-blue-500 text-[10px] font-bold uppercase">{isLoading ? 'Обновляю...' : '🔄 Обновить список'}</button>
        </div>
      )}
    </div>
  );
};
