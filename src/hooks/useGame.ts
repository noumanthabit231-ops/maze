import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { generateMaze } from '../utils/maze';
import { GameState, Player, MazeCell } from '../types';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export function useGame() {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myId, setMyId] = useState('');
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([]);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const playersRef = useRef<Player[]>([]);
  const connsRef = useRef<DataConnection[]>([]);
  const mazeRef = useRef<MazeCell[][]>([]);

  useEffect(() => { 
    playersRef.current = players;
    mazeRef.current = maze;
  }, [players, maze]);

  useEffect(() => {
    const newPeer = new Peer({
      config: {
        'iceServers': [
          { url: 'stun:stun.l.google.com:19302' },
          { url: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    newPeer.on('open', (id) => { 
      setMyId(id); 
      setIsPeerReady(true); 
      console.log('✅ PeerJS готов. ID:', id);
    });

    newPeer.on('error', (err) => {
      console.error('❌ Ошибка PeerJS:', err.type);
      setIsPeerReady(false);
    });

    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  const broadcast = (data: any) => {
    connsRef.current.forEach(c => { if(c.open) c.send(data); });
  };

  const handleHost = useCallback(async () => {
    if (!isPeerReady || !playerName) return;
    setIsHost(true);
    const newMaze = generateMaze(13, 13);
    setMaze(newMaze);
    const me = { id: myId, name: playerName, color: COLORS[0], pos: { x: 0, y: 0 }, trail: [], isReady: true, finished: false };
    setPlayers([me]);
    setGameState('WAITING');

    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: myId, hostName: playerName })
    });

    peer?.on('connection', (conn) => {
      console.log('📡 Кто-то стучится:', conn.peer);
      conn.on('open', () => {
        connsRef.current.push(conn);
        // Сразу шлем данные новичку
        conn.send({ 
          type: 'INIT', 
          maze: mazeRef.current, 
          players: playersRef.current 
        });
      });

      conn.on('data', (data: any) => {
        if (data.type === 'JOIN') {
          const p = { id: conn.peer, name: data.name, color: COLORS[playersRef.current.length % 4], pos: { x: 0, y: 0 }, trail: [], isReady: false, finished: false };
          const up = [...playersRef.current, p];
          setPlayers(up);
          broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
        if (data.type === 'MOVE') {
          const up = playersRef.current.map(p => p.id === conn.peer ? { ...p, pos: data.pos } : p);
          setPlayers(up);
          broadcast({ type: 'PLAYERS_UPDATE', players: up });
        }
      });
    });
  }, [peer, myId, playerName, isPeerReady]);

  const handleJoin = useCallback((code?: string) => {
    const target = code || roomCode;
    if (!peer || !target || !playerName) return;
    
    setRoomCode(target);
    console.log('🛰 Пытаюсь войти в:', target);
    
    const conn = peer.connect(target);
    
    conn.on('open', () => {
      console.log('🔓 Соединение открыто, шлю JOIN');
      connsRef.current = [conn];
      conn.send({ type: 'JOIN', name: playerName });
      // Не ждем INIT, сразу переходим в экран ожидания, чтобы юзер видел прогресс
      setGameState('WAITING'); 
    });

    conn.on('data', (data: any) => {
      if (data.type === 'INIT') { 
        console.log('🗺 Карта получена');
        setMaze(data.maze); 
        setPlayers(data.players); 
      }
      if (data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });

    conn.on('error', (err) => {
      console.error('❌ Ошибка коннекта:', err);
      setGameState('LOBBY');
      alert('Не удалось подключиться к игроку');
    });
  }, [peer, playerName, roomCode]);

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
      else connsRef.current[0]?.send({ type: 'MOVE', pos: next });

      return up;
    });
  }, [myId, isHost, gameState]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') move('up');
      if (k === 's' || k === 'arrowdown') move('down');
      if (k === 'a' || k === 'arrowleft') move('left');
      if (k === 'd' || k === 'arrowright') move('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, move]);

  return { myId, isPeerReady, roomCode, setRoomCode, playerName, setPlayerName, gameState, players, maze, isHost, handleHost, handleJoin, handleStart: () => { setGameState('PLAYING'); broadcast({ type: 'GAME_START' }); }, move };
}
