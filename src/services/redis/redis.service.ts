import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';
import { RedisConfig } from '../../config/configuration';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);
  private redisConfig = this.configService.get<RedisConfig>('redis');

  async onModuleInit() {
    if (!this.redisConfig) {
      throw new Error('Redis credentials not found');
    }

    this.client = createClient({
      url: this.redisConfig.url,
      password: this.redisConfig.password,
    });
    this.client.on('error', (err) =>
      this.logger.error('Redis Client Error', err),
    );
    await this.client.connect();
    await this.client.flushAll();
  }

  async addSocket(userId: string, socketId: string): Promise<void> {
    await this.client.sAdd(userId, socketId);
  }

  async addSocketToProject(
    projectId: string,
    userId: string,
    socketId: string,
  ): Promise<void> {
    await this.client.sAdd(projectId, `${userId}:${socketId}`);
  }

  async removeSocket(userId: string, socketId: string): Promise<void> {
    await this.client.sRem(userId, socketId);
  }

  async removeSocketFromProject(
    projectId: string,
    userId: string,
    socketId: string,
  ): Promise<void> {
    await this.client.sRem(projectId, `${userId}:${socketId}`);
  }

  async getSockets(userId: string): Promise<string[]> {
    return await this.client.sMembers(userId);
  }

  async getSocketsFromProject(projectId: string): Promise<string[]> {
    return await this.client.sMembers(projectId);
  }

  async getCountSocketFromProject(projectId: string): Promise<number> {
    return await this.client.sCard(projectId);
  }

  async getAllUsers(): Promise<string[]> {
    return await this.client.keys('*');
  }

  async deleteUser(userId: string): Promise<void> {
    await this.client.del(userId);
  }
}
