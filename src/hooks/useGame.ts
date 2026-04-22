import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';

const COLORS = ['#8b5e34', '#af8a56', '#5d4037', '#d2b48c']; // Цвета пустыни для верблюдов

export function useGame() {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<'LOBBY' | 'WAITING' | 'PLAYING'>('LOBBY');
  const [players, setPlayers] = useState([]);
  const [food, setFood] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Refs для мгновенного доступа в интервале (решает проблему "замерзания")
  const velocityRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(0);
  const playersRef = useRef([]);
  const foodRef = useRef([]);
  const connsRef = useRef<any[]>([]);
  const peerRef = useRef<any>(null);

  useEffect(() => {
    playersRef.current = players;
    foodRef.current = food;
  }, [players, food]);

  // Инициализация PeerJS
  useEffect(() => {
    const peer = new Peer({
      config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] }
    });
    peer.on('open', (id) => setMyId(id));
    peerRef.current = peer;
    return () => peer.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => { if (c.open) c.send(data); });
  };

  // Универсальный ввод (для джойстика и клавиатуры)
  const setMoveInput = useCallback((x: number, y: number) => {
    const speed = 4.5;
    velocityRef.current = { x: x * speed, y: y * speed };
    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
      angleRef.current = Math.atan2(y, x);
    }
  }, []);

  // Главный игровой цикл
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setPlayers(prev => {
        const me = prev.find(p => p.id === myId);
        if (!me || !me.segments) return prev;

        const head = me.segments[0];
        const newHead = {
          x: Math.max(0, Math.min(2000, head.x + velocityRef.current.x)),
          y: Math.max(0, Math.min(2000, head.y + velocityRef.current.y)),
          angle: angleRef.current
        };

        // 1. ПРОВЕРКА ЕДЫ (только для своей головы)
        let ateId = null;
        for (const f of foodRef.current) {
          const dist = Math.sqrt((newHead.x - f.x) ** 2 + (newHead.y - f.y) ** 2);
          if (dist < 25) {
            ateId = f.id;
            break;
          }
        }

        // 2. ОБНОВЛЕНИЕ СЕГМЕНТОВ (Логика следования)
        let newSegments = [newHead];
        const currentSegments = [...me.segments];

        if (ateId) {
          // Если съел — добавляем новый сегмент в конец
          const last = currentSegments[currentSegments.length - 1];
          currentSegments.push({ ...last });
          
          // Сообщаем всем, что еда съедена
          if (isHost) {
            setFood(prevFood => prevFood.filter(f => f.id !== ateId));
            broadcast({ type: 'FOOD_EATEN', foodId: ateId });
          } else {
            connsRef.current[0]?.send({ type: 'NOTIFY_EATEN', foodId: ateId });
          }
        }

        // Логика "Притяжения" хвоста к голове
        for (let i = 1; i < currentSegments.length; i++) {
          const prev = newSegments[i - 1];
          const curr = currentSegments[i];
          const dx = prev.x - curr.x;
          const dy = prev.y - curr.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = 22; // Расстояние между верблюдами

          if (dist > minDist) {
            const angle = Math.atan2(dy, dx);
            newSegments.push({
              x: prev.x - Math.cos(angle) * minDist,
              y: prev.y - Math.sin(angle) * minDist,
              angle: angle
            });
          } else {
            newSegments.push({ ...curr });
          }
        }

        const updatedPlayers = prev.map(p => p.id === myId ? { ...p, segments: newSegments } : p);

        // СИНХРОНИЗАЦИЯ
        if (isHost) {
          broadcast({ type: 'PLAYERS_UPDATE', players: updatedPlayers });
        } else {
          connsRef.current[0]?.send({ type: 'MOVE_UPDATE', id: myId, segments: newSegments });
        }

        return updatedPlayers;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState, myId, isHost]);

  // СПАВН ЕДЫ (только для хоста)
  useEffect(() => {
    if (!isHost || gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      if (foodRef.current.length < 40) {
        const newFood = {
          id: Math.random().toString(36).substring(7),
          x: Math.random() * 1900 + 50,
          y: Math.random() * 1900 + 50
        };
        setFood(prev => {
          const next = [...prev, newFood];
          broadcast({ type: 'SYNC_FOOD', food: next });
          return next;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isHost, gameState]);

  // Обработка сети
  const handleHost = async () => {
    if (!myId || !playerName) return;
    setIsHost(true);
    setPlayers([{ id: myId, name: playerName, color: COLORS[0], segments: [{ x: 1000, y: 1000, angle: 0 }] }]);
    setGameState('WAITING');
    
    await fetch('/api/rooms', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: myId, hostName: playerName, type: 'arena' }) 
    });

    peerRef.current.on('connection', (conn: any) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        conn.send({ type: 'INIT_ARENA', players: playersRef.current, food: foodRef.current });
      });
      conn.on('data', (data: any) => {
        if (data.type === 'JOIN_ARENA') {
          const up = [...playersRef.current, { 
            id: conn.peer, 
            name: data.name, 
            color: COLORS[playersRef.current.length % COLORS.length], 
            segments: [{ x: 1000, y: 1000, angle: 0 }] 
          }];
          setPlayers(up);
          broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
        if (data.type === 'MOVE_UPDATE') {
          setPlayers(p => p.map(pl => pl.id === data.id ? { ...pl, segments: data.segments } : pl));
        }
        if (data.type === 'NOTIFY_EATEN') {
          setFood(prev => prev.filter(f => f.id !== data.foodId));
          broadcast({ type: 'FOOD_EATEN', foodId: data.foodId });
        }
      });
    });
  };

  const handleJoin = useCallback((id: string) => {
    if (!id) return;
    setGameState('WAITING');
    const conn = peerRef.current.connect(id);
    conn.on('open', () => {
      connsRef.current = [conn];
      conn.send({ type: 'JOIN_ARENA', name: playerName });
    });
    conn.on('data', (data: any) => {
      if (data.type === 'INIT_ARENA') { setPlayers(data.players); setFood(data.food || []); }
      if (data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'SYNC_FOOD') setFood(data.food);
      if (data.type === 'FOOD_EATEN') setFood(prev => prev.filter(f => f.id !== data.foodId));
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [playerName]);

  const handleStart = () => {
    setGameState('PLAYING');
    broadcast({ type: 'GAME_START' });
  };

  return { myId, playerName, setPlayerName, gameState, players, food, isHost, handleHost, handleJoin, handleStart, setMoveInput };
}
