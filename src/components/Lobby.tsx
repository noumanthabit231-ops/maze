import React, { useState, useEffect } from 'react';
// ТУТ ВАЖНО: Добавил Trophy и остальные иконки в импорт
import { Trophy, Users, Plus, ArrowLeft, Loader2, Play, RefreshCw, Copy, Check } from 'lucide-react';

export const Lobby = ({ 
  playerName, setPlayerName, roomCode, setRoomCode, 
  myId, isHost, onHost, onJoin, onStart, playersCount, gameState, isPeerReady 
}) => {
  const [view, setView] = useState<'MENU' | 'BROWSER'>('MENU');
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [copied, setCopied] = useState(false);

  // Функция для получения списка реальных комнат из Redis
  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      // Проверяем, что пришел массив
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Ошибка при загрузке комнат:", e);
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

  // --- ЭКРАН 2: ОЖИДАНИЕ (Когда ты уже в лобби) ---
  if (gameState === 'WAITING') {
    return (
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center min-w-[340px] animate-in zoom-in duration-300">
        <h2 className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-6 italic">Подготовка к забегу</h2>
        
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 mb-6">
           <div className="flex flex-col items-center gap-2">
              <span className="text-white text-4xl font-black">{playersCount} / 4</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Игроков готово</span>
           </div>
        </div>

        <div className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-800 mb-8">
            <code className="text-slate-500 text-[10px] truncate mr-4">ID: {myId || roomCode}</code>
            <button onClick={copyId} className="text-blue-500 hover:text-blue-400 transition-colors">
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
             <span className="text-sm font-medium">Ждем сигнала от хоста...</span>
          </div>
        )}
      </div>
    );
  }

  // --- ЭКРАН 1: ГЛАВНОЕ МЕНЮ / БРАУЗЕР ---
  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[350px]">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-blue-600/20 mb-4">
          <Trophy className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Maze <span className="text-blue-500">Race</span></h1>
      </div>

      {view === 'MENU' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-widest ml-2">Твой псевдоним</label>
            <input 
              placeholder="Введи имя..." 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              className="w-full bg-slate-800/50 border-2 border-slate-700 p-4 rounded-2xl text-white font-bold text-center outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" 
            />
          </div>

          <button 
            onClick={onHost} 
            disabled={!isPeerReady || !playerName.trim()} 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/25"
          >
            {!isPeerReady ? <Loader2 className="animate-spin" size={20} /> : <Plus size={22} />} 
            СОЗДАТЬ КОМНАТУ
          </button>

          <button 
            onClick={() => setView('BROWSER')} 
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Users size={22} /> СПИСОК КОМНАТ
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button onClick={() => setView('MENU')} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft size={24}/>
            </button>
            <h2 className="text-white font-black uppercase italic tracking-widest text-sm">Активные игры</h2>
            <button 
              onClick={fetchRooms} 
              className={isLoadingRooms ? "animate-spin text-blue-500" : "text-blue-500 hover:text-blue-400"}
            >
              <RefreshCw size={20} />
            </button>
          </div>
          
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.id} className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all duration-300">
                  <div>
                    <p className="text-white font-bold">{room.hostName || 'Неизвестный'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">ID: {room.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onJoin(room.id)} // ТЕПЕРЬ ОНА ВЫЗЫВАЕТ ПОДКЛЮЧЕНИЕ
                    className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all active:scale-90 shadow-md"
                  >
                    <Play size={18} fill="white" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-slate-800/30 rounded-full mb-4">
                   <Users className="text-slate-700" size={32} />
                </div>
                <p className="text-slate-600 italic text-sm font-medium">Пока никто не играет.<br/>Будь первым!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
