import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const keys = await kv.keys('room:*');
      if (!keys || keys.length === 0) return res.status(200).json([]);
      const rooms = await kv.mget(...keys);
      return res.status(200).json(rooms.filter(r => r !== null));
    }

    if (req.method === 'POST') {
      const { id, hostName } = req.body;
      if (!id || !hostName) return res.status(400).json({ error: 'No data' });
      
      const roomData = { id, hostName, players: 1 };
      await kv.set(`room:${id}`, roomData, { ex: 300 });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'KV Error' });
  }
}
