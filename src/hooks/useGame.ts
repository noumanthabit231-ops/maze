import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';

const COLORS = ['#8b5e34', '#af8a56', '#5d4037', '#d2b48c'];

export function useGame() {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<'LOBBY' | 'WAITING' | 'PLAYING'>('LOBBY');
  const [players, setPlayers] = useState([]);
  const [food, setFood] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const velocityRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(0);
  const isDashingRef = useRef(false);
  const connsRef = useRef<any[]>([]);
  const peerRef = useRef<any>(null);

  useEffect(() => {
    const peer = new Peer({ config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } });
    peer.on('open', (id) => setMyId(id));
    peerRef.current = peer;
    return () => peer.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => { if (c.open) c.send(data); });
  };

  const setMoveInput = useCallback((x: number, y: number) => {
    const speed = isDashingRef.current ? 8 : 4.5;
    velocityRef.current = { x: x * speed, y: y * speed };
    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) angleRef.current = Math.atan2(y, x);
  }, []);

  const handleDash = useCallback(() => {
    if (isDashingRef.current) return;
    setPlayers(prev => {
      const me = prev.find(p => p.id === myId);
      if (!me || me.segments.length < 2) return prev;
      isDashingRef.current = true;
      const up = prev.map(p => p.id === myId ? { ...p, segments: p.segments.slice(0, -1) } : p);
      setTimeout(() => { isDashingRef.current = false; }, 800);
      return up;
    });
  }, [myId]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      setPlayers(prev => {
        const me = prev.find(p => p.id === myId);
        if (!me) return prev;

        const head = me.segments[0];
        const newHead = {
          x: Math.max(0, Math.min(2000, head.x + velocityRef.current.x)),
          y: Math.max(0, Math.min(2000, head.y + velocityRef.current.y)),
          angle: angleRef.current
        };

        // Логика поедания
        let ateId = null;
        for (const f of food) {
          if (Math.sqrt((newHead.x - f.x)**2 + (newHead.y - f.y)**2) < 30) {
            ateId = f.id; break;
          }
        }

        let currentSegments = [...me.segments];
        if (ateId) {
          currentSegments.push({ ...currentSegments[currentSegments.length - 1] });
          setFood(f => f.filter(item => item.id !== ateId));
          if (isHost) broadcast({ type: 'FOOD_EATEN', id: ateId });
          else connsRef.current[0]?.send({ type: 'NOTIFY_EATEN', id: ateId });
        }

        const newSegments = [newHead];
        const minDist = 38; // Чтобы не слипались
        for (let i = 1; i < currentSegments.length; i++) {
          const prevSeg = newSegments[i - 1];
          const currSeg = currentSegments[i];
          const dx = prevSeg.x - currSeg.x;
          const dy = prevSeg.y - currSeg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > minDist) {
            const angle = Math.atan2(dy, dx);
            newSegments.push({ x: prevSeg.x - Math.cos(angle) * minDist, y: prevSeg.y - Math.sin(angle) * minDist, angle });
          } else {
            newSegments.push({ ...currSeg });
          }
        }

        const up = prev.map(p => p.id === myId ? { ...p, segments: newSegments } : p);
        if (isHost) broadcast({ type: 'PLAYERS_UPDATE', players: up });
        else connsRef.current[0]?.send({ type: 'MOVE_UPDATE', id: myId, segments: newSegments });
        return up;
      });
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameState, myId, isHost, food]);

  const handleHost = async () => {
    if (!myId || !playerName) return;
    setIsHost(true);
    setPlayers([{ id: myId, name: playerName, color: COLORS[0], segments: [{ x: 1000, y: 1000, angle: 0 }] }]);
    setGameState('WAITING');
    await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: myId, hostName: playerName, type: 'arena' }) });
    peerRef.current.on('connection', (conn: any) => {
      conn.on('open', () => { connsRef.current.push(conn); conn.send({ type: 'INIT', players: [{ id: myId, name: playerName, color: COLORS[0], segments: [{ x: 1000, y: 1000, angle: 0 }] }] }); });
      conn.on('data', (data: any) => {
        if (data.type === 'JOIN_ARENA') {
          const up = [...players, { id: conn.peer, name: data.name, color: COLORS[1], segments: [{ x: 1000, y: 1000, angle: 0 }] }];
          setPlayers(up); broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
        if (data.type === 'MOVE_UPDATE') setPlayers(p => p.map(pl => pl.id === data.id ? { ...pl, segments: data.segments } : pl));
        if (data.type === 'NOTIFY_EATEN') { setFood(f => f.filter(item => item.id !== data.id)); broadcast({ type: 'FOOD_EATEN', id: data.id }); }
      });
    });
  };

  const handleJoin = useCallback((id: string) => {
    setGameState('WAITING');
    const conn = peerRef.current.connect(id);
    conn.on('open', () => { connsRef.current = [conn]; conn.send({ type: 'JOIN_ARENA', name: playerName }); });
    conn.on('data', (data: any) => {
      if (data.type === 'INIT' || data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'FOOD_EATEN') setFood(f => f.filter(item => item.id !== data.id));
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [playerName]);

  // Спавн еды для хоста
  useEffect(() => {
    if (!isHost || gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      if (food.length < 30) {
        const newFood = { id: Math.random().toString(36).substring(7), x: Math.random()*1900+50, y: Math.random()*1900+50 };
        setFood(f => { const next = [...f, newFood]; broadcast({ type: 'SYNC_FOOD', food: next }); return next; });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isHost, gameState, food.length]);

  return { myId, playerName, setPlayerName, gameState, players, food, isHost, handleHost, handleJoin, handleStart: () => { setGameState('PLAYING'); broadcast({ type: 'GAME_START' }); }, setMoveInput, handleDash };
}
