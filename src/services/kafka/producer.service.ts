import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { IProducer } from './interfaces/producer.interface';
import { ConfigService } from '@nestjs/config';
import { Message } from 'kafkajs';
import { KafkaProducer } from './kafka.producer';
import { DatabaseConfig } from '../../config/configuration';

type KafkaMessageType<T = any> = Omit<Message, 'value'> & {
  value: T | Buffer | string | null;
};

interface KafkaProducerOptions<T = any> {
  topic: string;
  message: KafkaMessageType<T>;
}

@Injectable()
export class ProducerService implements OnApplicationShutdown {
  private readonly producers = new Map<string, IProducer>();

  constructor(private readonly configService: ConfigService) {}

  private readonly configKafka =
    this.configService.get<DatabaseConfig>('database')?.kafka;

  async produce<T = any>({ topic, message }: KafkaProducerOptions<T>) {
    if (message && message.value) {
      message.value = JSON.stringify(message.value);
    }

    const producer = await this.getProducer(topic);
    await producer.produce(message);
  }

  private async getProducer(topic: string) {
    if (!this.configKafka) {
      throw new Error('Database configuration is missing');
    }

    let producer = this.producers.get(topic);
    if (!producer) {
      producer = new KafkaProducer(topic, this.configKafka.broker);
      await producer.connect();
      this.producers.set(topic, producer);
    }
    return producer;
  }

  async onApplicationShutdown() {
    for (const producer of this.producers.values()) {
      await producer.disconnect();
    }
  }
}
