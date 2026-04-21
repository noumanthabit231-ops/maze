export type Point = { x: number; y: number };

export interface Player {
  id: string;
  name: string;
  color: string;
  pos: Point;
  trail: Point[];
  isReady: boolean;
  finished: boolean;
  finishTime?: number;
}

export type MazeCell = {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
};

export type GameState = 'LOBBY' | 'WAITING' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED';

export interface GameData {
  maze: MazeCell[][];
  players: Player[];
  status: GameState;
  startTime?: number;
  roomCode: string;
}
