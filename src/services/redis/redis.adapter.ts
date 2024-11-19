import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../../config/configuration';

export class RedisIoAdapter extends IoAdapter {
  constructor(
    app: INestApplication,
    private configService: ConfigService,
  ) {
    super(app);
  }

  private adapterConstructor: ReturnType<typeof createAdapter>;
  private configRedos =
    this.configService.get<DatabaseConfig>('database')?.redis;

  async connectToRedis(): Promise<void> {
    if (!this.configRedos) {
      throw new Error('Redis credentials not found');
    }

    const pubClient = createClient({
      url: this.configRedos.url,
      password: this.configRedos.password,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
