import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { IConsumer } from './interfaces/consumer.interface';
import { KafkaConsumer } from './kafka.consumer';
import { ConsumerConfig, ConsumerSubscribeTopics, KafkaMessage } from 'kafkajs';
import { DatabaseConfig } from '../../config/configuration';
import { ConfigService } from '@nestjs/config';

type KafkaMessageType<T = any> = Omit<KafkaMessage, 'value'> & {
  value: T | Buffer | string | null;
};

interface KafkaConsumerOptions<T = any> {
  topic: ConsumerSubscribeTopics;
  config: ConsumerConfig;
  onMessage: (message: KafkaMessageType<T>) => Promise<void>;
}

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];

  constructor(private readonly configService: ConfigService) {}

  private readonly configKafka =
    this.configService.get<DatabaseConfig>('database')?.kafka;

  async consume<T = any>({
    topic,
    config,
    onMessage,
  }: KafkaConsumerOptions<T>) {
    if (!this.configKafka) {
      throw new Error('Database configuration is missing');
    }

    const consumer = new KafkaConsumer(topic, config, this.configKafka.broker);
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
