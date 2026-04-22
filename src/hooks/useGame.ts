import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { generateMaze } from '../utils/maze'; // Старый импорт, не мешает

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export function useGame() {
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  
  // --- МЫ ДОБАВИЛИ ЭТОТ СТЕЙТ ---
  const [food, setFood] = useState([]); // Верблюжата на карте
  // -----------------------------

  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const connsRef = useRef([]);
  const playersRef = useRef([]);
  const foodRef = useRef([]); // Реф для доступа к еде внутри интервала

  useEffect(() => { 
    playersRef.current = players; 
    foodRef.current = food; // Синхронизируем реф
  }, [players, food]);

  // Инициализация PeerJS
  useEffect(() => {
    const newPeer = new Peer({ config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } });
    newPeer.on('open', (id) => setMyId(id));
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  // Основной цикл движения (60 FPS)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setPlayers(prev => {
        const me = prev.find(p => p.id === myId);
        if (!me) return prev;

        const currentHead = me.segments[0];
        const newHead = { ...currentHead };

        // WASD Управление
        const speed = 5;
        if (window.pressedKeys?.['w']) newHead.y -= speed;
        if (window.pressedKeys?.['s']) newHead.y += speed;
        if (window.pressedKeys?.['a']) newHead.x -= speed;
        if (window.pressedKeys?.['d']) newHead.x += speed;

        // Границы арены
        newHead.x = Math.max(0, Math.min(2000, newHead.x));
        newHead.y = Math.max(0, Math.min(2000, newHead.y));

        // Логика Змейки (следование хвоста)
        const updatedSegments = [newHead];
        for (let i = 1; i < me.segments.length; i++) {
            const prevSeg = me.segments[i-1];
            const currSeg = me.segments[i];
            const dx = prevSeg.x - currSeg.x;
            const dy = prevSeg.y - currSeg.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const minDist = 20; // Дистанция между верблюдами
            
            if (dist > minDist) {
                const angle = Math.atan2(dy, dx);
                updatedSegments.push({
                    x: prevSeg.x - Math.cos(angle) * minDist,
                    y: prevSeg.y - Math.sin(angle) * minDist
                });
            } else {
                updatedSegments.push(currSeg);
            }
        }

        const updatedPlayers = prev.map(p => p.id === myId ? { ...p, segments: updatedSegments } : p);

        // Отправка данных
        if (isHost) {
          connsRef.current.forEach(c => c.open && c.send({ type: 'PLAYERS_UPDATE', players: updatedPlayers }));
        } else {
          connsRef.current[0]?.send({ type: 'MOVE_UPDATE', segments: updatedSegments });
        }

        return updatedPlayers;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState, myId, isHost]);


  // --- ВОТ ЭТО МЫ ДОБАВИЛИ: СПАВН ЕДЫ (Только для хоста) ---
  useEffect(() => {
    if (!isHost || gameState !== 'PLAYING') return;

    const spawnInterval = setInterval(() => {
      // Спавним, только если еды мало
      if (foodRef.current.length < 50) {
        const newFood = {
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random() * 1900 + 50, // Не спавним у самого края
          y: Math.random() * 1900 + 50
        };
        const updatedFood = [...foodRef.current, newFood];
        setFood(updatedFood);
        
        // Рассылаем всем игрокам новую еду
        connsRef.current.forEach(c => c.open && c.send({ type: 'FOOD_SPAWN', food: updatedFood }));
      }
    }, 2000); // Раз в 2 секунды

    return () => clearInterval(spawnInterval);
  }, [isHost, gameState]);
  // -------------------------------------------------------


  // Хостинг и Вход (добавили синхронизацию еды при входе)
  const handleHost = async (diff: string) => {
    setIsHost(true);
    setGameState('WAITING');
    await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: myId, hostName: playerName, type: 'arena' }) });

    setPlayers([{ id: myId, name: playerName, color: COLORS[0], segments: [{x: 1000, y: 1000}] }]);

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        conn.send({ type: 'INIT_ARENA', 
          players: playersRef.current, 
          food: foodRef.current // ОТПРАВЛЯЕМ ЕДУ
        });
      });
      conn.on('data', (data: any) => {
        if (data.type === 'MOVE_UPDATE') {
          setPlayers(p => p.map(player => player.id === conn.peer ? { ...player, segments: data.segments } : player));
        }
      });
    });
  };

  const handleJoin = useCallback((id: string) => {
    setGameState('WAITING');
    const conn = peer.connect(id);
    conn.on('open', () => {
      connsRef.current = [conn];
      conn.send({ type: 'JOIN_ARENA', name: playerName });
    });
    conn.on('data', (data: any) => {
      if (data.type === 'INIT_ARENA') { 
        setPlayers(data.players); 
        setFood(data.food || []); // ПОЛУЧАЕМ ЕДУ
      }
    });
  }, [peer, playerName]);

  // Глобальный слушатель клавиш (чтобы WASD работал)
  useEffect(() => {
    window.pressedKeys = {};
    const down = (e) => window.pressedKeys[e.key.toLowerCase()] = true;
    const up = (e) => window.pressedKeys[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  return { 
    myId, playerName, setPlayerName, gameState, players, 
    food, // ЭТО МЫ ТОЖЕ ВОЗВРАЩАЕМ
    isHost, handleHost, handleJoin, handleStart: () => {} 
  };
}
