import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { CaravanPhysics, Segment } from '../utils/physics';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

// Простая функция интерполяции, так как p5 тут недоступен
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export function useGame() {
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // УПРАВЛЕНИЕ
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);

  const connsRef = useRef([]);
  const playersRef = useRef([]);

  useEffect(() => { playersRef.current = players; }, [players]);

  // Инициализация PeerJS
  useEffect(() => {
    const newPeer = new Peer({ 
      config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } 
    });
    newPeer.on('open', (id) => {
      setMyId(id);
      console.log('✅ PeerJS готов, ID:', id);
    });
    newPeer.on('error', (err) => console.error('PeerJS Error:', err));
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => { if (c.open) c.send(data); });
  };

  // УПРАВЛЕНИЕ (Mobile Legends Style)
  const setMoveInput = useCallback((joystickX: number, joystickY: number) => {
    const targetSpeed = 4.5; 
    const tx = joystickX * targetSpeed;
    const ty = joystickY * targetSpeed;

    setVelocity(prev => ({
        x: lerp(prev.x, tx, 0.15),
        y: lerp(prev.y, ty, 0.15)
    }));

    if (Math.abs(joystickX) > 0.1 || Math.abs(joystickY) > 0.1) {
        setAngle(Math.atan2(joystickY, joystickX));
    }
  }, []);

  // Игровой цикл
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setPlayers(prev => {
        const me = prev.find(p => p.id === myId);
        if (!me) return prev;

        const currentHead = me.segments[0];
        const newHead: Segment = {
          x: currentHead.x + velocity.x,
          y: currentHead.y + velocity.y,
          angle: angle
        };

        // Границы
        newHead.x = Math.max(0, Math.min(2000, newHead.x));
        newHead.y = Math.max(0, Math.min(2000, newHead.y));

        const newSegments = [...me.segments];
        newSegments[0] = newHead;
        const updatedCaravan = CaravanPhysics.updateSegments(newSegments);
        
        const up = prev.map(p => p.id === myId ? { ...p, segments: updatedCaravan } : p);

        if (isHost) broadcast({ type: 'PLAYERS_UPDATE', players: up });
        else if (connsRef.current[0]?.open) {
          connsRef.current[0].send({ type: 'MOVE_UPDATE', segments: updatedCaravan });
        }

        return up;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState, velocity, angle, myId, isHost]);

  // СОЗДАТЬ ИГРУ
  const handleHost = async () => {
    if (!myId || !playerName) return;
    
    console.log('⛺ Создаю караван...');
    setIsHost(true);
    
    // Начальный верблюд в центре арены
    const initialSegments = [{ x: 1000, y: 1000, angle: 0 }];
    const me = { id: myId, name: playerName, color: COLORS[0], segments: initialSegments };
    
    setPlayers([me]);
    setGameState('WAITING');

    // Регистрация в Redis через твой API
    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: myId, hostName: playerName, type: 'arena' })
      });
    } catch (e) {
      console.error('Ошибка API:', e);
    }

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        console.log('📡 Игрок подключился:', conn.peer);
        connsRef.current.push(conn);
        // Шлем текущее состояние новичку
        conn.send({ type: 'INIT_ARENA', players: playersRef.current });
      });

      conn.on('data', (data: any) => {
        if (data.type === 'JOIN_ARENA') {
          const newPlayer = { 
            id: conn.peer, 
            name: data.name, 
            color: COLORS[playersRef.current.length % 4], 
            segments: [{ x: 1000 + (Math.random() * 100), y: 1000, angle: 0 }] 
          };
          const up = [...playersRef.current, newPlayer];
          setPlayers(up);
          broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
        if (data.type === 'MOVE_UPDATE') {
          setPlayers(p => p.map(player => player.id === conn.peer ? { ...player, segments: data.segments } : player));
        }
      });
    });
  };

  // ПРИСОЕДИНИТЬСЯ
  const handleJoin = useCallback((targetId: string) => {
    if (!peer || !targetId) return;
    setGameState('WAITING');
    
    const conn = peer.connect(targetId);
    conn.on('open', () => {
      connsRef.current = [conn];
      conn.send({ type: 'JOIN_ARENA', name: playerName });
    });

    conn.on('data', (data: any) => {
      if (data.type === 'INIT_ARENA') setPlayers(data.players);
      if (data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [peer, playerName]);

  const handleStart = () => {
    setGameState('PLAYING');
    broadcast({ type: 'GAME_START' });
  };

  return { 
    myId, playerName, setPlayerName, gameState, players, 
    isHost, handleHost, handleJoin, handleStart, setMoveInput 
  };
}
