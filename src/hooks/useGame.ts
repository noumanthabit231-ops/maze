import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { generateMaze } from '../utils/maze'; // НЕ УДАЛЯЕМ старый импорт, он нам пока не мешает
import { CaravanPhysics, Segment } from '../utils/physics';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export function useGame() {
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // УПРАВЛЕНИЕ: скорость и угол движения
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);

  const connsRef = useRef([]);
  const playersRef = useRef([]);

  useEffect(() => { playersRef.current = players; }, [players]);

  // Инициализация PeerJS
  useEffect(() => {
    const newPeer = new Peer({ config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } });
    newPeer.on('open', (id) => setMyId(id));
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  // ИНЕРЦИОННОЕ УПРАВЛЕНИЕ (Mobile Legends Style)
  const setMoveInput = useCallback((joystickX: number, joystickY: number) => {
    // joystickX/Y от -1 до 1
    const targetSpeed = 5; // Максимальная скорость верблюда
    const tx = joystickX * targetSpeed;
    const ty = joystickY * targetSpeed;

    // Плавный разгон (Инерция)
    setVelocity(prev => ({
        x: p5.lerp(prev.x, tx, 0.1),
        y: p5.lerp(prev.y, ty, 0.1)
    }));

    if (joystickX !== 0 || joystickY !== 0) {
        setAngle(Math.atan2(joystickY, joystickX));
    }
  }, []);

  // Основной цикл движения (1 раз в кадр)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setPlayers(prev => {
        const me = prev.find(p => p.id === myId);
        if (!me) return prev;

        // Обновляем голову
        const currentHead = me.segments[0];
        const newHead: Segment = {
          x: currentHead.x + velocity.x,
          y: currentHead.y + velocity.y,
          angle: angle
        };

        // Запрет на выход за границы Арены
        newHead.x = Math.max(0, Math.min(2000, newHead.x));
        newHead.y = Math.max(0, Math.min(2000, newHead.y));

        const myCaravan = [...me.segments];
        myCaravan[0] = newHead;

        // Автоматически обновляем хвост (математика змейки)
        const updatedCaravan = CaravanPhysics.updateSegments(myCaravan);
        
        const up = prev.map(p => p.id === myId ? { ...p, segments: updatedCaravan } : p);

        // Расшариваем новую позицию всем
        if (isHost) connsRef.current.forEach(c => c.open && c.send({ type: 'PLAYERS_UPDATE', players: up }));
        else connsRef.current[0]?.send({ type: 'MOVE_UPDATE', segments: updatedCaravan });

        return up;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [gameState, velocity, angle, myId, isHost]);

  // Хостинг и Вход (оставляем старую P2P логику, она работает)
  const handleHost = async (diff: string) => {
    // ... (старая логика рума)
    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.push(conn);
        conn.send({ type: 'INIT_ARENA', 
          players: [{ id: myId, name: playerName, color: COLORS[0], segments: [{x: 1000, y: 1000, angle: 0}] }] 
        });
      });
      conn.on('data', (data: any) => {
        if (data.type === 'MOVE_UPDATE') {
          setPlayers(p => p.map(player => player.id === conn.peer ? { ...player, segments: data.segments } : player));
        }
      });
    });
  };

  const handleJoin = useCallback((id: string) => {
    setGameState('WAITING');
    const conn = peer.connect(id);
    conn.on('open', () => { connsRef.current = [conn]; conn.send({ type: 'JOIN_ARENA', name: playerName }); });
    conn.on('data', (data: any) => {
      if (data.type === 'INIT_ARENA') { setPlayers(data.players); }
    });
  }, [peer, playerName]);

  return { myId, playerName, setPlayerName, gameState, players, isHost, handleHost, handleJoin, handleStart: () => {}, setMoveInput };
}
