export default async function handler(req, res) {
  // Твои данные из Vercel Storage (REST API)
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  const headers = { Authorization: `Bearer ${token}` };

  try {
    // 1. Получить список комнат (GET)
    if (req.method === 'GET') {
      const response = await fetch(`${url}/keys/room:*`, { headers });
      const { result: keys } = await response.json();

      if (!keys || keys.length === 0) return res.status(200).json([]);

      // Получаем данные по всем ключам
      const rooms = [];
      for (const key of keys) {
        const r = await fetch(`${url}/get/${key}`, { headers });
        const { result } = await r.json();
        if (result) rooms.push(JSON.parse(result));
      }

      return res.status(200).json(rooms);
    }

    // 2. Создать комнату (POST)
    if (req.method === 'POST') {
      const { id, hostName } = req.body;
      const roomData = JSON.stringify({ id, hostName, players: 1 });
      
      // Записываем в Redis через HTTP (EX 300 - живет 5 минут)
      await fetch(`${url}/set/room:${id}/${encodeURIComponent(roomData)}/EX/300`, { 
        headers 
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
