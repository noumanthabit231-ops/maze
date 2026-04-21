import React, { useState, useEffect } from 'react';
// Добавил Trophy и остальные иконки в импорт, чтобы не было краша
import { Trophy, Users, Plus, ArrowLeft, Loader2, Play, RefreshCw, Copy, Check } from 'lucide-react';

export const Lobby = ({ 
  playerName, setPlayerName, roomCode, setRoomCode, 
  myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady 
}) => {
  const [view, setView] = useState<'MENU' | 'BROWSER'>('MENU');
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [copied, setCopied] = useState(false);

  // Функция получения реальных комнат из твоего Redis
  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Ошибка загрузки комнат:", e);
    }
    setIsLoadingRooms(false);
  };

  useEffect(() => {
    if (view === 'BROWSER') fetchRooms();
  }, [view]);

  const copyId = () => {
    navigator.clipboard.writeText(myId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ЭКРАН ОЖИДАНИЯ (Когда ты уже создал или вошел)
  if (gameState === 'WAITING') {
    return (
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center min-w-[340px] animate-in zoom-in duration-300">
        <h2 className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-6">Лобби ожидания</h2>
        
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 mb-8">
           <div className="flex flex-col items-center gap-2">
              <span className="text-white text-3xl font-black">{playersCount} / 4</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Игроков в лобби</span>
           </div>
        </div>

        <div className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-800 mb-8">
            <code className="text-slate-500 text-xs truncate mr-4">ID: {myId || roomCode}</code>
            <button onClick={copyId} className="text-blue-500 hover:text-blue-400">
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
        </div>
        
        {isHost ? (
          <button 
            onClick={onStart} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            НАЧАТЬ МАТЧ
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3 text-slate-500 italic py-4">
             <Loader2 className="animate-spin" size={18} />
             <span>Ждем хоста...</span>
          </div>
        )}
      </div>
    );
  }

  // ГЛАВНОЕ МЕНЮ
  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[350px]">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-blue-600/20 mb-4">
          <Trophy className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Maze Race</h1>
      </div>

      {view === 'MENU' ? (
        <div className="space-y-4">
          <input 
            placeholder="Твой ник..." 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)} 
            className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl text-white font-bold text-center outline-none focus:border-blue-500 transition-all" 
          />

          <button 
            onClick={onHost} 
            disabled={!isPeerReady || !playerName} 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/25"
          >
            <Plus size={22} /> СОЗДАТЬ
          </button>

          <button 
            onClick={() => setView('BROWSER')} 
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Users size={22} /> НАЙТИ ИГРУ
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('MENU')} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
              <ArrowLeft size={24}/>
            </button>
            <h2 className="text-white font-black uppercase italic tracking-widest text-sm">Список комнат</h2>
            <button onClick={fetchRooms} className={isLoadingRooms ? "animate-spin text-blue-500" : "text-blue-500"}>
              <RefreshCw size={20} />
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.id} className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all">
                  <div>
                    <p className="text-white font-bold">{room.hostName || 'Аноним'}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase">ID: {room.id.slice(0, 8)}...</p>
                  </div>
                  <button 
                    onClick={() => onJoin(room.id)} // ТЕПЕРЬ КНОПКА РАБОТАЕТ
                    className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all active:scale-90"
                  >
                    <Play size={18} fill="white" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-600 italic text-sm">Комнат пока нет...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
