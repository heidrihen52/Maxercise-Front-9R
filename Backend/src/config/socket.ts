import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin === '*' ? true : env.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join_seed_room', (roomId: string) => {
      socket.join(roomId);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}

export function emitToRoom(roomId: string, event: string, payload: unknown): void {
  getIO().to(roomId).emit(event, payload);
}
