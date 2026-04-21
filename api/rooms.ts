import React, { useState, useEffect } from 'react';
import { Trophy, Users, Plus, ArrowLeft, Loader2, Play, RefreshCw } from 'lucide-react';

export const Lobby = ({ playerName, setPlayerName, myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady }) => {
  const [view, setView] = useState<'MENU' | 'BROWSER'>('MENU');
  const [rooms, setRooms] = useState<any[]>([]);
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
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center min-w-[320px] animate-in zoom-in">
        <h2 className="text-blue-500 font-black text-xs uppercase tracking-widest mb-6">Лобби ожидания</h2>
        <p className="text-white font-bold mb-8 italic">Игроков в сети: {playersCount} / 4</p>
        {isHost ? (
          <button onClick={onStart} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl shadow-lg transition-all active:scale-95">НАЧАТЬ МАТЧ</button>
        ) : (
          <div className="flex items-center justify-center gap-3 text-slate-500 py-4 italic animate-pulse">
            <Loader2 size={18} className="animate-spin" /> Ждем старта...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[350px]">
      <div className="flex flex-col items-center mb-10">
        <Trophy className="text-blue-500 mb-2" size={40} />
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Maze Race</h1>
      </div>

      {view === 'MENU' ? (
        <div className="space-y-4">
          <input placeholder="Твой ник..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-xl text-white font-bold text-center outline-none focus:border-blue-500 transition-all" />
          <button onClick={onHost} disabled={!isPeerReady || !playerName} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/20">
            <Plus size={20} /> СОЗДАТЬ
          </button>
          <button onClick={() => setView('BROWSER')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95">
            <Users size={20} /> СПИСОК КОМНАТ
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('MENU')} className="text-slate-400 p-2 hover:bg-slate-800 rounded-xl"><ArrowLeft /></button>
            <h2 className="text-white font-black uppercase text-xs tracking-widest">Активные игры</h2>
            <button onClick={fetchRooms} className={`text-blue-500 ${loading ? 'animate-spin' : ''}`}><RefreshCw size={18}/></button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {rooms.length > 0 ? rooms.map(r => (
              <div key={r.id} className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-700 group hover:border-blue-500 transition-all">
                <div><p className="text-white font-bold">{r.hostName}</p></div>
                <button onClick={() => onJoin(r.id)} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all active:scale-90"><Play size={16} fill="white"/></button>
              </div>
            )) : (
              <p className="text-center text-slate-600 text-sm italic py-10">Комнат пока нет...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
