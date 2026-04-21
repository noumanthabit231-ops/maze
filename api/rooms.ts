import Redis from 'ioredis';

// Твой Redis от RedisLabs
const redis = new Redis("redis://default:Bfuc7ZcI40a7NaJsjhztKvzKidMiEq0A@redis-19328.c277.us-east-1-3.ec2.cloud.redislabs.com:19328");

export default async function handler(req, res) {
  try {
    // 1. Получить список комнат
    if (req.method === 'GET') {
      const keys = await redis.keys('room:*');
      if (keys.length === 0) return res.status(200).json([]);
      
      const roomsData = await redis.mget(...keys);
      const rooms = roomsData
        .filter(r => r !== null)
        .map(r => JSON.parse(r as string));
        
      return res.status(200).json(rooms);
    }

    // 2. Создать комнату
    if (req.method === 'POST') {
      const { id, hostName } = req.body;
      if (!id || !hostName) return res.status(400).json({ error: 'No data' });
      
      const roomData = JSON.stringify({ id, hostName, players: 1 });
      // Сохраняем на 5 минут (300 секунд)
      await redis.set(`room:${id}`, roomData, 'EX', 300);
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('REDIS ERROR:', e);
    return res.status(500).json({ error: e.message });
  }
}
