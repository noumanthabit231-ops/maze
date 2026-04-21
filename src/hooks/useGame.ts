import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { generateMaze } from '../utils/maze';
import { GameState, Player, MazeCell } from '../types';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

// Конфиг сложности
const DIFF_SETTINGS = {
  easy: { size: 11, label: 'Легко' },
  hard: { size: 21, label: 'Сложно' },
  ultra: { size: 35, label: 'УЛЬТРА' }
};

export function useGame() {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myId, setMyId] = useState('');
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([]);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | 'ultra'>('easy');

  const playersRef = useRef<Player[]>([]);
  const connsRef = useRef<DataConnection[]>([]);
  const mazeRef = useRef<MazeCell[][]>([]);

  useEffect(() => { 
    playersRef.current = players;
    mazeRef.current = maze;
  }, [players, maze]);

  useEffect(() => {
    const newPeer = new Peer({
      config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] }
    });
    newPeer.on('open', (id) => { setMyId(id); setIsPeerReady(true); });
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => c.open && c.send(data));
  };

  // СОЗДАНИЕ ИГРЫ (ХОСТ)
  const handleHost = useCallback(async (diff: 'easy' | 'hard' | 'ultra' = 'easy') => {
    if (!isPeerReady || !playerName) return;
    
    setDifficulty(diff);
    setIsHost(true);
    const size = DIFF_SETTINGS[diff].size;
    const newMaze = generateMaze(size, size);
    setMaze(newMaze);
    
    const me = { id: myId, name: playerName, color: COLORS[0], pos: { x: 0, y: 0 }, trail: [], isReady: true, finished: false };
    setPlayers([me]);
    setGameState('WAITING');

    // Регистрируем в Redis
    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: myId, hostName: playerName, difficulty: diff })
    });

    peer?.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        // Шлем текущую карту и настройки
        conn.send({ type: 'INIT', maze: mazeRef.current, players: playersRef.current, difficulty: diff });
      });

      conn.on('data', (data: any) => {
        if (data.type === 'JOIN') {
          const p = { id: conn.peer, name: data.name, color: COLORS[playersRef.current.length % 4], pos: { x: 0, y: 0 }, trail: [], isReady: false, finished: false };
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
  }, [peer, myId, playerName, isPeerReady]);

  // ВХОД В ИГРУ (КЛИЕНТ)
  const handleJoin = useCallback((targetId: string) => {
    if (!peer || !targetId || !playerName) return;
    
    console.log('🔗 Подключаюсь к:', targetId);
    setGameState('WAITING'); // Сразу переключаем экран!

    const conn = peer.connect(targetId, { reliable: true });
    
    conn.on('open', () => {
      connsRef.current = [conn];
      conn.send({ type: 'JOIN', name: playerName });
    });

    conn.on('data', (data: any) => {
      if (data.type === 'INIT') {
        setMaze(data.maze);
        setPlayers(data.players);
        setDifficulty(data.difficulty);
      }
      if (data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  }, [peer, playerName]);

  // ДВИЖЕНИЕ
  const move = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
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

      if (isHost) broadcast({ type: 'PLAYERS_UPDATE', players: up });
      else connsRef.current[0]?.send({ type: 'MOVE', pos: next, finished });

      return up;
    });
  }, [myId, isHost, gameState]);

  // Управление
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

  return { 
    myId, isPeerReady, playerName, setPlayerName, gameState, players, 
    maze, isHost, difficulty, handleHost, handleJoin, 
    handleStart: () => { setGameState('PLAYING'); broadcast({ type: 'GAME_START' }); } 
  };
}
