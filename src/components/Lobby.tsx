import React, { useState, useEffect } from 'react';
// ТУТ ВСЕ ИКОНКИ, ЧТОБЫ НЕ БЫЛО ОШИБОК:
import { Trophy, Users, Plus, ArrowLeft, Loader2, Play, RefreshCw, Copy, Check } from 'lucide-react';

export const Lobby = ({ 
  playerName, setPlayerName, roomCode, setRoomCode, 
  myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady 
}) => {
  const [view, setView] = useState<'MENU' | 'BROWSER'>('MENU');
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl text-center min-w-[320px] animate-in zoom-in">
        <h2 className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-6">Лобби ожидания</h2>
        <div className="bg-slate-800/50 p-6 rounded-3xl mb-6">
           <p className="text-white text-3xl font-black">{playersCount} / 4</p>
           <p className="text-slate-500 text-[10px] uppercase font-bold">Игроков в комнате</p>
        </div>
        <div className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl mb-8 border border-slate-700">
            <code className="text-slate-500 text-[10px] truncate mr-2">ID: {myId || roomCode}</code>
            <button onClick={() => { navigator.clipboard.writeText(myId); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-blue-500">
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
        </div>
        {isHost ? (
          <button onClick={onStart} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">НАЧАТЬ МАТЧ</button>
        ) : (
          <p className="text-slate-500 italic animate-pulse">Ожидание хоста...</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl min-w-[350px]">
      <div className="flex flex-col items-center mb-10">
        <Trophy className="text-blue-500 mb-2" size={40} />
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Maze Race</h1>
      </div>

      {view === 'MENU' ? (
        <div className="space-y-4">
          <input placeholder="Имя игрока" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-xl text-white font-bold text-center outline-none focus:border-blue-500" />
          <button onClick={onHost} disabled={!isPeerReady || !playerName} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
            {!isPeerReady ? <Loader2 className="animate-spin" /> : <Plus size={20} />} СОЗДАТЬ ИГРУ
          </button>
          <button onClick={() => setView('BROWSER')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Users size={20} /> НАЙТИ ИГРУ
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setView('MENU')} className="text-slate-500 p-1"><ArrowLeft size={20}/></button>
            <h2 className="text-white font-bold uppercase text-[10px] tracking-widest">Список комнат</h2>
            <button onClick={fetchRooms} className={isLoading ? "animate-spin text-blue-500" : "text-blue-500"}><RefreshCw size={18}/></button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {rooms.length > 0 ? rooms.map((room) => (
              <div key={room.id} className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700 hover:border-blue-500 transition-all">
                <div className="truncate mr-4">
                  <p className="text-white font-bold text-sm truncate">{room.hostName}</p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-tighter">ID: {room.id.substring(0,8)}...</p>
                </div>
                <button 
                  onClick={() => { console.log('Подключаюсь к:', room.id); onJoin(room.id); }} 
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all active:scale-90"
                >
                  <Play size={16} fill="white" />
                </button>
              </div>
            )) : (
              <p className="text-center text-slate-600 text-xs italic py-8">Комнат пока нет...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
