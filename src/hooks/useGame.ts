import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { generateMaze } from '../utils/maze';

const DIFF_SETTINGS = {
  easy: { size: 15, label: 'Легко' },
  hard: { size: 31, label: 'Сложно' },
  ultra: { size: 51, label: 'УЛЬТРА' }
};

export function useGame() {
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [maze, setMaze] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const connsRef = useRef([]);

  useEffect(() => {
    const newPeer = new Peer({
      config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] }
    });
    newPeer.on('open', (id) => setMyId(id));
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  const handleHost = async (diff = 'easy') => {
    if (!playerName) return;
    setIsHost(true);
    const size = DIFF_SETTINGS[diff].size;
    const newMaze = generateMaze(size, size, diff); // Передаем сложность
    setMaze(newMaze);
    setPlayers([{ id: myId, name: playerName, color: '#3b82f6', pos: { x: 0, y: 0 }, finished: false }]);
    setGameState('WAITING');

    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: myId, hostName: playerName, difficulty: diff })
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        conn.send({ type: 'INIT', maze: newMaze, players: [{ id: myId, name: playerName, color: '#3b82f6', pos: { x: 0, y: 0 } }] });
      });
      conn.on('data', (data) => {
        if (data.type === 'JOIN') {
          const newPlayer = { id: conn.peer, name: data.name, color: '#ef4444', pos: { x: 0, y: 0 } };
          setPlayers(prev => {
            const up = [...prev, newPlayer];
            connsRef.current.forEach(c => c.send({ type: 'PLAYERS_UPDATE', players: up }));
            return up;
          });
        }
      });
    });
  };

  const handleJoin = (targetId) => {
    if (!peer || !playerName) return;
    setGameState('WAITING'); // Форсируем смену экрана сразу
    
    const conn = peer.connect(targetId);
    conn.on('open', () => {
      connsRef.current = [conn];
      conn.send({ type: 'JOIN', name: playerName });
    });
    conn.on('data', (data) => {
      if (data.type === 'INIT') { setMaze(data.maze); setPlayers(data.players); }
      if (data.type === 'PLAYERS_UPDATE') setPlayers(data.players);
      if (data.type === 'GAME_START') setGameState('PLAYING');
    });
  };

  return { myId, playerName, setPlayerName, gameState, players, maze, isHost, handleHost, handleJoin, handleStart: () => {
    setGameState('PLAYING');
    connsRef.current.forEach(c => c.send({ type: 'GAME_START' }));
  }};
}
