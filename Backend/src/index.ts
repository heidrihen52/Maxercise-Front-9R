import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initSocket } from './config/socket';
import { prisma } from './config/prisma';

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  initSocket(httpServer);

  httpServer.listen(env.port as number, '0.0.0.0', () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
    console.log(`WebSocket ready via Socket.IO`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down...`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
