import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { CaravanPhysics } from '../utils/physics';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export function useGame() {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<'LOBBY' | 'WAITING' | 'PLAYING'>('LOBBY');
  const [players, setPlayers] = useState([]);
  const [food, setFood] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [isDashing, setIsDashing] = useState(false);

  const connsRef = useRef<any[]>([]);
  const peerRef = useRef<any>(null);
  const playersRef = useRef([]);

  useEffect(() => { playersRef.current = players; }, [players]);

  // Инициализация PeerJS с защитой от "зависания"
  useEffect(() => {
    const initPeer = () => {
      const peer = new Peer({
        config: { 
          'iceServers': [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'stun:stun1.l.google.com:19302' }
          ] 
        }
      });

      peer.on('open', (id) => {
        console.log('✅ Твой ID получен:', id);
        setMyId(id);
      });

      peer.on('error', (err) => {
        console.error('❌ Ошибка PeerJS:', err.type);
        if (err.type === 'network') setTimeout(initPeer, 3000);
      });

      peerRef.current = peer;
    };

    initPeer();
    return () => peerRef.current?.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => { if (c.open) c.send(data); });
  };

  // Логика рывка
  const handleDash = useCallback(() => {
    if (isDashing) return;
    setPlayers(prev => {
      const me = prev.find(p => p.id === myId);
      if (!me || me.segments.length < 2) return prev;

      setIsDashing(true);
      const newSegments = me.segments.slice(0, -1);
      setTimeout(() => setIsDashing(false), 800);

      const up = prev.map(p => p.id === myId ? { ...p, segments: newSegments } : p);
      broadcast({ type: 'MOVE_UPDATE', id: myId, segments: newSegments });
      return up;
    });
  }, [myId, isDashing]);

  const setMoveInput = useCallback((x: number, y: number) => {
    const speed = isDashing ? 8 : 4.5;
    setVelocity({ x: x * speed, y: y * speed });
    if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) {
      setAngle(Math.atan2(y, x));
    }
  }, [isDashing]);

  // Основной цикл синхронизации
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      setPlayers(prev => {
        const me = prev.find(p => p.id === myId);
        if (!me) return prev;

        const head = me.segments[0];
        const newHead = {
          x: Math.max(0, Math.min(2000, head.x + velocity.x)),
          y: Math.max(0, Math.min(2000, head.y + velocity.y)),
          angle: angle
        };

        const newSegments = [...me.segments];
        newSegments[0] = newHead;
        const updated = CaravanPhysics.updateSegments(newSegments);
        
        const up = prev.map(p => p.id === myId ? { ...p, segments: updated } : p);
        
        if (isHost) broadcast({ type: 'PLAYERS_UPDATE', players: up });
        else connsRef.current[0]?.send({ type: 'MOVE_UPDATE', id: myId, segments: updated });

        return up;
      });
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameState, velocity, angle, myId, isHost]);

  // Обработка Хоста
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
        conn.send({ type: 'INIT_ARENA', players: playersRef.current, food: [] });
      });

      conn.on('data', (data: any) => {
        if (data.type === 'JOIN_ARENA') {
          const newPlayer = {
            id: conn.peer,
            name: data.name,
            color: COLORS[playersRef.current.length % COLORS.length],
            segments: [{ x: 1000 + (Math.random() * 50), y: 1000, angle: 0 }]
          };
          const up = [...playersRef.current, newPlayer];
          setPlayers(up);
          broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
        if (data.type === 'MOVE_UPDATE') {
          setPlayers(p => p.map(pl => pl.id === data.id ? { ...pl, segments: data.segments } : pl));
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
      if (data.type === 'INIT_ARENA' || data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'MOVE_UPDATE') {
        setPlayers(p => p.map(pl => pl.id === data.id ? { ...pl, segments: data.segments } : pl));
      }
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [playerName]);

  const handleStart = () => {
    setGameState('PLAYING');
    broadcast({ type: 'GAME_START' });
  };

  return { myId, playerName, setPlayerName, gameState, players, food, isHost, handleHost, handleJoin, handleStart, setMoveInput, handleDash };
}
