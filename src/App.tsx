import React from 'react';
import { useGame } from './hooks/useGame';
import { GameCanvas } from './components/GameCanvas';
import { MobileInterface } from './components/MobileInterface';
import { Lobby } from './components/Lobby'; // Возвращаем импорт

export default function App() {
  const { 
    myId, players, gameState, setMoveInput, setPlayerName, 
    playerName, handleHost, handleJoin, handleStart 
  } = useGame();

  // ИСПОЛЬЗУЕМ НАШЕ ЛОББИ
  if (gameState === 'LOBBY' || gameState === 'WAITING') {
    return (
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
        isPeerReady={!!myId} // Если ID получен, PeerJS готов к работе
      />
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
          onGameOver={() => alert('КАРАВАН РАЗБИТ')}
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
