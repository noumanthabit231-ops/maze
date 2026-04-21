import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { generateMaze } from '../utils/maze';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
const DIFF_SETTINGS = {
  easy: { size: 15 },
  hard: { size: 31 },
  ultra: { size: 51 }
};

export function useGame() {
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [maze, setMaze] = useState([]);
  const [cellHistory, setCellHistory] = useState([]); 
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const connsRef = useRef([]);
  const mazeRef = useRef([]);
  const playersRef = useRef([]);

  useEffect(() => {
    mazeRef.current = maze;
    playersRef.current = players;
  }, [maze, players]);

  useEffect(() => {
    const newPeer = new Peer({
      config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] }
    });
    newPeer.on('open', (id) => setMyId(id));
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => c.open && c.send(data));
  };

  const move = useCallback((dir: string) => {
    if (gameState !== 'PLAYING') return;
    setPlayers(prev => {
      const me = prev.find(p => p.id === myId);
      if (!me || me.finished || !mazeRef.current.length) return prev;
      
      const cell = mazeRef.current[me.pos.y][me.pos.x];
      const next = { ...me.pos };
      
      if (dir === 'up' && !cell.walls.top) next.y--;
      else if (dir === 'down' && !cell.walls.bottom) next.y++;
      else if (dir === 'left' && !cell.walls.left) next.x--;
      else if (dir === 'right' && !cell.walls.right) next.x++;
      
      if (next.x === me.pos.x && next.y === me.pos.y) return prev;
      
      const finished = next.x === mazeRef.current[0].length - 1 && next.y === mazeRef.current.length - 1;
      const up = prev.map(p => p.id === myId ? { ...p, pos: next, finished } : p);
      
      // ОСТАВЛЯЕМ СЛЕД (Функциональное обновление, чтобы не было ошибок)
      setCellHistory(historyPrev => {
        const exists = historyPrev.some(h => h.x === next.x && h.y === next.y);
        if (exists) return historyPrev;
        return [...historyPrev, { x: next.x, y: next.y, color: '#3b82f6' }];
      });
      
      if (isHost) broadcast({ type: 'PLAYERS_UPDATE', players: up });
      else connsRef.current[0]?.send({ type: 'MOVE', pos: next, finished });
      
      return up;
    });
  }, [myId, isHost, gameState]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') move('up');
      if (k === 's' || k === 'arrowdown') move('down');
      if (k === 'a' || k === 'arrowleft') move('left');
      if (k === 'd' || k === 'arrowright') move('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const handleHost = async (diff: 'easy' | 'hard' | 'ultra') => {
    if (!playerName) return;
    setIsHost(true);
    const size = DIFF_SETTINGS[diff].size;
    const newMaze = generateMaze(size, size, diff);
    setMaze(newMaze);
    setCellHistory([{ x: 0, y: 0, color: '#3b82f6' }]);
    setPlayers([{ id: myId, name: playerName, color: COLORS[0], pos: { x: 0, y: 0 }, finished: false }]);
    setGameState('WAITING');

    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: myId, hostName: playerName, difficulty: diff })
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        conn.send({ type: 'INIT', maze: mazeRef.current, players: playersRef.current });
      });
      conn.on('data', (data: any) => {
        if (data.type === 'JOIN') {
          const p = { id: conn.peer, name: data.name, color: COLORS[playersRef.current.length % 4], pos: { x: 0, y: 0 }, finished: false };
          const up = [...playersRef.current, p];
          setPlayers(up);
          broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
        if (data.type === 'MOVE') {
          const up = playersRef.current.map(p => p.id === conn.peer ? { ...p, pos: data.pos, finished: data.finished } : p);
          setPlayers(up);
          broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
      });
    });
  };

  const handleJoin = useCallback((targetId: string) => {
    setGameState('WAITING'); 
    const conn = peer.connect(targetId);
    conn.on('open', () => {
      connsRef.current = [conn];
      conn.send({ type: 'JOIN', name: playerName });
    });
    conn.on('data', (data: any) => {
      if (data.type === 'INIT') { 
        setMaze(data.maze); 
        setPlayers(data.players); 
        setCellHistory([{ x: 0, y: 0, color: '#3b82f6' }]);
      }
      if (data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [peer, playerName]); // ТЕПЕРЬ ТУТ ВСЁ ПРАВИЛЬНО

  return { 
    myId, playerName, setPlayerName, gameState, players, maze, 
    cellHistory, isHost, handleHost, handleJoin, 
    handleStart: () => {
      setGameState('PLAYING');
      broadcast({ type: 'GAME_START' });
    }, move 
  };
}
