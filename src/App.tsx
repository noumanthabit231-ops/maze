import { useGame } from "./hooks/useGame";
import { Lobby } from "./components/Lobby";
import { GameBoard } from "./components/GameBoard";

export default function App() {
  const {
    myId, isPeerReady, roomCode, setRoomCode, playerName, setPlayerName,
    gameState, players, maze, isHost, handleHost, handleJoin, handleStart, move
  } = useGame();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {(gameState === 'LOBBY' || gameState === 'WAITING') ? (
        <Lobby
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          myId={myId}
          isHost={isHost}
          onHost={handleHost}
          onJoin={handleJoin}
          onStart={handleStart}
          playersCount={players.length}
          gameState={gameState}
          isPeerReady={isPeerReady}
        />
      ) : (
        <GameBoard 
          maze={maze} 
          players={players} 
          myId={myId} 
          onMove={move} 
        />
      )}
    </div>
  );
}