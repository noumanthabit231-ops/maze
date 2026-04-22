import React from 'react';
import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard'; // Наш новый файл для ПК
import { GameCanvas } from './components/GameCanvas';
import { MobileInterface } from './components/MobileInterface';
import { Lobby } from './components/Lobby';

export default function App() {
  const { 
    myId, 
    players, 
    food, // Не забываем про верблюжат
    gameState, 
    setMoveInput, 
    setPlayerName, 
    playerName, 
    handleHost, 
    handleJoin, 
    handleStart,
    handleDash // Вместо плевка используем рывок
  } = useGame();

  // ПОДКЛЮЧАЕМ КЛАВИАТУРУ (WASD + Space)
  // Она будет работать только когда gameState === 'PLAYING'
  useKeyboard({
    onMove: setMoveInput,
    onDash: handleDash,
    enabled: gameState === 'PLAYING'
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f172a]">
      
      {/* 1. ПРЕДУПРЕЖДЕНИЕ О ПОВОРОТЕ (для мобилок) */}
      <div id="rotate-overlay" className="hidden portrait:flex fixed inset-0 bg-slate-900 z-[9999] flex-col items-center justify-center text-white p-10 text-center">
        <span className="text-6xl mb-4 animate-bounce">🔄</span>
        <h2 className="text-2xl font-black uppercase tracking-tighter">Поверни телефон</h2>
        <p className="text-slate-400 mt-2 text-sm font-medium">Караван движется только в горизонтальном режиме</p>
      </div>

      {/* 2. ЛОББИ И ОЖИДАНИЕ */}
      {(gameState === 'LOBBY' || gameState === 'WAITING') && (
        <Lobby
          playerName={playerName}
          setPlayerName={setPlayerName}
          myId={myId}
          isHost={players[0]?.id === myId}
          onHost={handleHost}
          onJoin={handleJoin}
          onStart={handleStart}
          playersCount={players.length}
          gameState={gameState}
          isPeerReady={!!myId}
        />
      )}

      {/* 3. ИГРОВОЙ ПРОЦЕСС */}
      {gameState === 'PLAYING' && (
        <div className="fixed inset-0 w-full h-full touch-none">
          {/* Сама графика (верблюды, песок, еда) */}
          <GameCanvas 
            myId={myId} 
            players={players} 
            food={food || []} 
          />
          
          {/* Слой управления и интерфейса поверх графики */}
          <MobileInterface 
            score={players.find(p => p.id === myId)?.segments.length || 0}
            onMove={setMoveInput}
            onDash={handleDash}
          />
        </div>
      )}
    </div>
  );
}
