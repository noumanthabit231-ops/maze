import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { CaravanPhysics, Segment } from '../utils/physics';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export function useGame() {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [food, setFood] = useState([]); // Верблюжата на карте
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Управление
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDashing, setIsDashing] = useState(false);

  const connsRef = useRef([]);
  const peerRef = useRef<any>(null);

  // 1. СПАВН ВЕРБЛЮЖАТ (Только для хоста)
  useEffect(() => {
    if (!isHost || gameState !== 'PLAYING') return;

    const spawnInterval = setInterval(() => {
      if (food.length < 40) {
        const newFood = {
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random() * 1900 + 50,
          y: Math.random() * 1900 + 50,
          type: Math.random() > 0.8 ? 'GOLDEN' : 'NORMAL' // Золотые дают больше очков
        };
        setFood(prev => [...prev, newFood]);
        // Рассылаем всем инфу о новой еде
        connsRef.current.forEach(c => c.open && c.send({ type: 'FOOD_SPAWN', food: newFood }));
      }
    }, 3000);

    return () => clearInterval(spawnInterval);
  }, [isHost, gameState, food.length]);

  // 2. ЛОГИКА РЫВКА
  const handleDash = useCallback(() => {
    setPlayers(prev => {
      const me = prev.find(p => p.id === myId);
      if (!me || me.segments.length < 2 || isDashing) return prev;

      setIsDashing(true);
      
      // Рывок тратит последнего верблюда
      const newSegments = me.segments.slice(0, -1);
      
      setTimeout(() => setIsDashing(false), 800); // Длительность рывка

      return prev.map(p => p.id === myId ? { ...p, segments: newSegments } : p);
    });
  }, [myId, isDashing]);

  // 3. ОБРАБОТКА ПОЕДАНИЯ
  const checkFoodCollision = (head: Segment) => {
    const eaten = food.find(f => Math.sqrt((f.x - head.x)**2 + (f.y - head.y)**2) < 30);
    if (eaten) {
      setFood(prev => prev.filter(f => f.id !== eaten.id));
      
      setPlayers(prev => prev.map(p => {
        if (p.id === myId) {
          const last = p.segments[p.segments.length - 1];
          return { ...p, segments: [...p.segments, { ...last }] };
        }
        return p;
      }));

      connsRef.current.forEach(c => c.open && c.send({ type: 'FOOD_EATEN', foodId: eaten.id, eaterId: myId }));
    }
  };

  // Метод для интерфейса
  const setMoveInput = useCallback((x: number, y: number) => {
    const speed = isDashing ? 8 : 4; // В рывке скорость в два раза выше
    setVelocity({ x: x * speed, y: y * speed });
  }, [isDashing]);

  return { 
    myId, setMyId, playerName, setPlayerName, gameState, setGameState, 
    players, setPlayers, food, setFood, isHost, setIsHost, 
    handleDash, setMoveInput, connsRef, peerRef, checkFoodCollision 
  };
}
