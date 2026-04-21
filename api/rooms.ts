import { createClient } from 'redis';

// Создаем клиента один раз вне обработчика, чтобы не плодить соединения
let client;

const getClient = async () => {
  if (!client) {
    // Vercel сам подставит REDIS_URL из настроек проекта
    client = createClient({ url: process.env.REDIS_URL || process.env.storage_REDIS_URL });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
  }
  return client;
};

export default async function handler(req, res) {
  try {
    const redis = await getClient();

    // 1. Получить список всех комнат (GET)
    if (req.method === 'GET') {
      const keys = await redis.keys('room:*');
      if (keys.length === 0) return res.status(200).json([]);
      
      const rawRooms = await redis.mGet(keys);
      const rooms = rawRooms
        .filter(r => r !== null)
        .map(r => JSON.parse(r));
        
      return res.status(200).json(rooms);
    }

    // 2. Создать комнату (POST)
    if (req.method === 'POST') {
      const { id, hostName } = req.body;
      if (!id || !hostName) return res.status(400).json({ error: 'Missing data' });
      
      const roomData = JSON.stringify({ id, hostName, players: 1 });
      // Сохраняем на 5 минут (300 секунд)
      await redis.set(`room:${id}`, roomData, { EX: 300 });
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('SERVER ERROR:', e);
    return res.status(500).json({ error: e.message });
  }
}
