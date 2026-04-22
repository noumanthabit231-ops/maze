import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import { GameCanvas } from './components/GameCanvas';
import { MobileInterface } from './components/MobileInterface';

export default function App() {
  const { myId, players, gameState, setMoveInput, setPlayerName, playerName, handleHost, handleJoin } = useGame();
  const [copiedId, setCopiedId] = useState(false);

  // ГЛАВНОЕ МЕНЮ (ПЕРЕДЕЛАННОЕ ДЛЯ ПУСТЫНИ)
  if (gameState === 'LOBBY' || gameState === 'WAITING') {
    return (
      <div className="min-h-screen w-screen bg-[#eec988] flex flex-col items-center justify-center p-8 select-none" style={{ orientation: 'landscape' }}>
        
        {/* ФОН ЧЕРЕЗ ТЕНИ */}
        <div className="absolute inset-0 bg-slate-950/20" style={{ background: 'radial-gradient(circle, transparent 20%, rgba(15, 23, 42, 0.5) 100%)' }}></div>

        <div className="bg-slate-900/70 p-12 rounded-[2.5rem] border border-white/10 shadow-2xl z-10 min-w-[500px] text-center">
            <span className="text-7xl mb-2">🐪</span>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-12">Caravan.<span className="text-blue-500">io</span></h1>
            
            <input 
              placeholder="Твой ник..." 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-white/5 border-2 border-slate-700 p-5 rounded-2xl text-white font-bold text-center outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 mb-6" 
            />

            <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleHost('hard')} // Всегда Hard рум
                  disabled={!playerName}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black p-6 rounded-2xl active:scale-95 shadow-lg shadow-blue-600/30"
                >
                  СОЗДАТЬ
                </button>
                <button 
                  onClick={() => handleJoin(prompt('Введи ID хоста'))}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black p-6 rounded-2xl active:scale-95"
                >
                  НАЙТИ ИГРУ
                </button>
            </div>
            
            {gameState === 'WAITING' && (
                <div className="mt-8 text-slate-400 italic py-6">
                    <p>Ты хост: ID скопирован. Ждем других...</p>
                    <code className="text-[10px] bg-slate-800 p-2 rounded-xl mt-4 block">{myId}</code>
                </div>
            )}
        </div>
      </div>
    );
  }

  // ЭКРАН ИГРЫ (АРЕНА)
  if (gameState === 'PLAYING') {
    return (
      <div className="fixed inset-0 h-screen w-screen overflow-hidden" style={{ orientation: 'landscape' }}>
        <GameCanvas 
          myId={myId} 
          players={players} 
          score={players.find(p => p.id === myId)?.segments.length || 0}
          isHost={players[0]?.id === myId}
          onGameOver={() => alert('GAME OVER')}
        />
        <MobileInterface 
            score={players.find(p => p.id === myId)?.segments.length || 0}
            onMove={setMoveInput}
            onSpit={() => alert('Плевок! (Скоро добавим)')}
        />
      </div>
    );
  }

  return null;
}
