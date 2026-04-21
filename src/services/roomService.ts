// Здесь логика для работы с твоей базой (например, Supabase)
// Таблица 'rooms' должна иметь колонки: id, host_id, host_name, players_count, status

export const roomService = {
  // Хост вызывает это при создании комнаты
  async createRoom(hostId: string, hostName: string) {
    // console.log('Публикуем комнату в БД...', { hostId, hostName });
    // await supabase.from('rooms').insert({ host_id: hostId, host_name: hostName, status: 'LOBBY' });
  },

  // Клиент вызывает это, чтобы увидеть список
  async getActiveRooms() {
    // return await supabase.from('rooms').select('*').eq('status', 'LOBBY');
    return [
       { host_id: 'peer-id-1', host_name: 'Shamil Game', players_count: 1 },
       { host_id: 'peer-id-2', host_name: 'Marat Pro', players_count: 3 },
    ]; // Заглушка для теста
  },

  // Удаление комнаты при старте или выходе
  async removeRoom(hostId: string) {
    // await supabase.from('rooms').delete().eq('host_id', hostId);
  }
};