import React from 'react';

export const GameBoard = ({ maze, players, myId, onMove }) => {
  if (!maze || maze.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
      <div className="relative bg-slate-800 p-2 rounded-xl shadow-2xl border-4 border-slate-700">
        <div 
          className="grid gap-0" 
          style={{ 
            gridTemplateColumns: `repeat(${maze[0].length}, 30px)`,
            gridTemplateRows: `repeat(${maze.length}, 30px)` 
          }}
        >
          {maze.map((row, y) => row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="relative bg-slate-900"
              style={{
                width: '30px',
                height: '30px',
                borderTop: cell.walls.top ? '2px solid #475569' : 'none',
                borderRight: cell.walls.right ? '2px solid #475569' : 'none',
                borderBottom: cell.walls.bottom ? '2px solid #475569' : 'none',
                borderLeft: cell.walls.left ? '2px solid #475569' : 'none',
              }}
            >
              {/* Финиш */}
              {x === maze[0].length - 1 && y === maze.length - 1 && (
                <div className="absolute inset-0 flex items-center justify-center text-sm">🏁</div>
              )}
            </div>
          )))}

          {/* Игроки */}
          {players.map((player) => (
            <div
              key={player.id}
              className="absolute transition-all duration-150 ease-out z-10"
              style={{
                width: '20px',
                height: '20px',
                left: player.pos.x * 30 + 5,
                top: player.pos.y * 30 + 5,
                backgroundColor: player.color,
                borderRadius: player.id === myId ? '4px' : '50%',
                boxShadow: `0 0 10px ${player.color}`,
                border: player.id === myId ? '2px solid white' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-2 bg-slate-900 p-2 px-4 rounded-full border border-white/10">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-white font-bold text-xs">{p.name} {p.id === myId && '(ТЫ)'}</span>
            {p.finished && <span className="ml-2">✅</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
