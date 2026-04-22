import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { CaravanPhysics } from '../utils/physics';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export function useGame() {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<'LOBBY' | 'WAITING' | 'PLAYING'>('LOBBY');
  const [players, setPlayers] = useState([]);
  const [food, setFood] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // ИСПОЛЬЗУЕМ REFS ДЛЯ МГНОВЕННОГО ДВИЖЕНИЯ
  const velocityRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(0);
  const isDashingRef = useRef(false);

  const connsRef = useRef<any[]>([]);
  const peerRef = useRef<any>(null);
  const playersRef = useRef([]);

  useEffect(() => { playersRef.current = players; }, [players]);

  // Чиним PeerJS
  useEffect(() => {
    const peer = new Peer({
      config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] }
    });
    peer.on('open', (id) => { setMyId(id); console.log('✅ ID:', id); });
    peerRef.current = peer;
    return () => peer.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => { if (c.open) c.send(data); });
  };

  // Метод для джойстика и WASD
  const setMoveInput = useCallback((x: number, y: number) => {
    const speed = isDashingRef.current ? 8 : 4.5;
    velocityRef.current = { x: x * speed, y: y * speed };
    if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) {
      angleRef.current = Math.atan2(y, x);
    }
  }, []);

  const handleDash = useCallback(() => {
    if (isDashingRef.current) return;
    setPlayers(prev => {
      const me = prev.find(p => p.id === myId);
      if (!me || me.segments.length < 2) return prev;
      isDashingRef.current = true;
      const newSegments = me.segments.slice(0, -1);
      setTimeout(() => { isDashingRef.current = false; }, 800);
      return prev.map(p => p.id === myId ? { ...p, segments: newSegments } : p);
    });
  }, [myId]);

  // ГЛАВНЫЙ ЦИКЛ (60 FPS)
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

        const newSegments = [...me.segments];
        newSegments[0] = newHead;
        const updated = CaravanPhysics.updateSegments(newSegments);
        
        const up = prev.map(p => p.id === myId ? { ...p, segments: updated } : p);

        // Отправка данных
        if (isHost) broadcast({ type: 'PLAYERS_UPDATE', players: up });
        else if (connsRef.current[0]?.open) {
          connsRef.current[0].send({ type: 'MOVE_UPDATE', id: myId, segments: updated });
        }
        return up;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState, myId, isHost]);

  // Хостинг и подключение (без изменений, они работали)
  const handleHost = async () => {
    if (!myId || !playerName) return;
    setIsHost(true);
    setPlayers([{ id: myId, name: playerName, color: COLORS[0], segments: [{ x: 1000, y: 1000, angle: 0 }] }]);
    setGameState('WAITING');
    await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: myId, hostName: playerName, type: 'arena' }) });
    peerRef.current.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        conn.send({ type: 'INIT_ARENA', players: playersRef.current });
      });
      conn.on('data', (data: any) => {
        if (data.type === 'JOIN_ARENA') {
          const up = [...playersRef.current, { id: conn.peer, name: data.name, color: COLORS[playersRef.current.length % COLORS.length], segments: [{ x: 1000, y: 1000, angle: 0 }] }];
          setPlayers(up); broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
        if (data.type === 'MOVE_UPDATE') {
          setPlayers(p => p.map(pl => pl.id === data.id ? { ...pl, segments: data.segments } : pl));
        }
      });
    });
  };

  const handleJoin = useCallback((id: string) => {
    setGameState('WAITING');
    const conn = peerRef.current.connect(id);
    conn.on('open', () => { connsRef.current = [conn]; conn.send({ type: 'JOIN_ARENA', name: playerName }); });
    conn.on('data', (data: any) => {
      if (data.type === 'INIT_ARENA' || data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'MOVE_UPDATE') setPlayers(p => p.map(pl => pl.id === data.id ? { ...pl, segments: data.segments } : pl));
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [playerName]);

  return { myId, playerName, setPlayerName, gameState, players, isHost, handleHost, handleJoin, handleStart: () => { setGameState('PLAYING'); broadcast({ type: 'GAME_START' }); }, setMoveInput, handleDash };
}
