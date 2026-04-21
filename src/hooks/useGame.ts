import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { generateMaze } from '../utils/maze';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export function useGame() {
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [maze, setMaze] = useState([]);
  const [cellHistory, setCellHistory] = useState([]); // Массив строк "x-y"
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const connsRef = useRef([]);
  const mazeRef = useRef([]);

  useEffect(() => { mazeRef.current = maze; }, [maze]);

  useEffect(() => {
    const newPeer = new Peer({ config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } });
    newPeer.on('open', (id) => setMyId(id));
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

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
      
      // ОБНОВЛЯЕМ СЛЕД
      setCellHistory(h => {
        const key = `${next.x}-${next.y}`;
        return h.includes(key) ? h : [...h, key];
      });
      
      if (isHost) connsRef.current.forEach(c => c.open && c.send({ type: 'PLAYERS_UPDATE', players: up }));
      else connsRef.current[0]?.send({ type: 'MOVE', pos: next, finished });
      
      return up;
    });
  }, [myId, isHost, gameState]);

  // Кнопки управления
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
        if (k === 'w' || k === 'arrowup') move('up');
        if (k === 's' || k === 'arrowdown') move('down');
        if (k === 'a' || k === 'arrowleft') move('left');
        if (k === 'd' || k === 'arrowright') move('right');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const handleHost = async (diff: string) => {
    if (!playerName) return;
    setIsHost(true);
    const size = diff === 'easy' ? 15 : diff === 'hard' ? 31 : 51;
    const newMaze = generateMaze(size, size, diff);
    setMaze(newMaze);
    setCellHistory(['0-0']);
    setPlayers([{ id: myId, name: playerName, color: COLORS[0], pos: { x: 0, y: 0 }, finished: false }]);
    setGameState('WAITING');
    await fetch('/api/rooms', { method: 'POST', body: JSON.stringify({ id: myId, hostName: playerName, difficulty: diff }), headers: {'Content-Type': 'application/json'} });
    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        conn.send({ type: 'INIT', maze: newMaze, players: [{ id: myId, name: playerName, color: COLORS[0], pos: { x: 0, y: 0 } }] });
      });
      conn.on('data', (data: any) => {
        if (data.type === 'JOIN') {
          setPlayers(p => {
            const up = [...p, { id: conn.peer, name: data.name, color: COLORS[p.length % 4], pos: { x: 0, y: 0 } }];
            connsRef.current.forEach(c => c.open && c.send({ type: 'PLAYERS_UPDATE', players: up }));
            return up;
          });
        }
        if (data.type === 'MOVE') {
          setPlayers(p => {
            const up = p.map(player => player.id === conn.peer ? { ...player, pos: data.pos, finished: data.finished } : player);
            connsRef.current.forEach(c => c.open && c.send({ type: 'PLAYERS_UPDATE', players: up }));
            return up;
          });
        }
      });
    });
  };

  const handleJoin = useCallback((id: string) => {
    setGameState('WAITING');
    const conn = peer.connect(id);
    conn.on('open', () => { connsRef.current = [conn]; conn.send({ type: 'JOIN', name: playerName }); });
    conn.on('data', (data: any) => {
      if (data.type === 'INIT') { setMaze(data.maze); setPlayers(data.players); setCellHistory(['0-0']); }
      if (data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [peer, playerName]);

  return { myId, playerName, setPlayerName, gameState, players, maze, cellHistory, isHost, handleHost, handleJoin, handleStart: () => { setGameState('PLAYING'); connsRef.current.forEach(c => c.open && c.send({ type: 'GAME_START' })); }, move };
}
