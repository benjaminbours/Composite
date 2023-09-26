import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-streams-adapter';
// import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ENVIRONMENT } from './environment';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: ENVIRONMENT.REDIS_URL,
    });
    // const subClient = pubClient.duplicate();
    await pubClient.connect();
    // await Promise.all([pubClient.connect(), subClient.connect()]);

    // this.adapterConstructor = createAdapter(pubClient, subClient);
    this.adapterConstructor = createAdapter(pubClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    // const server = new Server(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
