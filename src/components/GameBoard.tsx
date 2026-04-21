import { cn } from '../utils/cn';        // Было ../cn, теперь лезем в utils
import { MazeCell, Player } from '../types'; // Выходим из components в src

interface GameBoardProps {
  maze: MazeCell[][];
  players: Player[];
  myId: string;
  onMove: (dir: 'up' | 'down' | 'left' | 'right') => void;
}

export const GameBoard = ({ maze, players, myId, onMove }: GameBoardProps) => {
  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="relative p-2 bg-slate-800 rounded-xl shadow-2xl border-4 border-slate-700">
        <div 
          className="grid gap-0" 
          style={{ gridTemplateColumns: `repeat(${maze[0].length}, minmax(0, 1fr))` }}
        >
          {maze.flat().map((cell, i) => (
            <div
              key={`${cell.x}-${cell.y}`}
              className={cn(
                "w-6 h-6 sm:w-8 sm:h-8 border-slate-600 transition-all duration-300",
                cell.walls.top && "border-t-2",
                cell.walls.right && "border-r-2",
                cell.walls.bottom && "border-b-2",
                cell.walls.left && "border-l-2",
                cell.x === maze[0].length - 1 && cell.y === maze.length - 1 && "bg-yellow-500/20"
              )}
            >
              {cell.x === maze[0].length - 1 && cell.y === maze.length - 1 && (
                <div className="w-full h-full flex items-center justify-center">
                  <Trophy size={16} className="text-yellow-500 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Отрисовка игроков */}
        {players.map(player => (
          <div
            key={player.id}
            className="absolute transition-all duration-200 ease-out z-10"
            style={{
              width: '1.5rem',
              height: '1.5rem',
              left: `calc(${player.pos.x} * 1.5rem + 0.5rem)`,
              top: `calc(${player.pos.y} * 1.5rem + 0.5rem)`,
            }}
          >
             <div 
               className="w-full h-full rounded-full shadow-lg flex items-center justify-center text-[10px] font-black text-white border-2 border-white/20"
               style={{ backgroundColor: player.color }}
             >
               {player.id === myId ? 'Я' : player.name[0]}
             </div>
          </div>
        ))}
      </div>

      {/* Контроллеры для мобилок */}
      <div className="grid grid-cols-3 gap-3 sm:hidden">
        <div />
        <ControlBtn icon={ChevronUp} onClick={() => onMove('up')} />
        <div />
        <ControlBtn icon={ChevronLeft} onClick={() => onMove('left')} />
        <ControlBtn icon={ChevronDown} onClick={() => onMove('down')} />
        <ControlBtn icon={ChevronRight} onClick={() => onMove('right')} />
      </div>
    </div>
  );
};

const ControlBtn = ({ icon: Icon, onClick }: { icon: any, onClick: () => void }) => (
  <button 
    onPointerDown={onClick}
    className="w-16 h-16 bg-slate-800 active:bg-blue-600 active:scale-90 flex items-center justify-center rounded-2xl shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-1 transition-all"
  >
    <Icon size={32} className="text-white" />
  </button>
);