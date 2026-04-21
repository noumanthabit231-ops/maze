import { Users, Play, RefreshCw } from 'lucide-react';

interface Room {
  host_id: string;
  host_name: string;
  players_count: number;
}

interface RoomListProps {
  rooms: Room[];
  onJoin: (roomId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const RoomList = ({ rooms, onJoin, onRefresh, isLoading }: RoomListProps) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">Доступные игры</h3>
        <button 
          onClick={onRefresh}
          className={`text-blue-500 hover:rotate-180 transition-all duration-500 ${isLoading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {rooms.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-600 text-sm">Пока нет активных комнат...</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div 
              key={room.host_id}
              className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between hover:border-blue-500/50 transition-all group"
            >
              <div>
                <p className="text-white font-bold">{room.host_name}</p>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Users size={12} />
                  <span>{room.players_count} / 4</span>
                </div>
              </div>
              <button 
                onClick={() => onJoin(room.host_id)}
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
              >
                Войти
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};