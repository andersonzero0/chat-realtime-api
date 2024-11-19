import {
  Kafka,
  Partitioners,
  Producer,
  logLevel as LogLevelKafka,
} from 'kafkajs';
import { IProducer } from './interfaces/producer.interface';
import { Logger } from '@nestjs/common';
import { sleep } from '../../utils/sleep';
import { logCreatorKafka } from './kafka.utils';

export class KafkaProducer implements IProducer {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly logger = new Logger('KafkaProducer');

  constructor(
    private readonly topic: string,
    broker: string,
  ) {
    this.kafka = new Kafka({
      brokers: [broker],
      logCreator: (logLevel: LogLevelKafka) =>
        logCreatorKafka(logLevel, this.logger),
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
      retry: {
        retries: 5,
        factor: 2,
        multiplier: 2,
        initialRetryTime: 500,
        maxRetryTime: 2000,
      },
    });
    this.logger.log(`Kafka Producer created for topic: ${topic}`);
  }

  async produce(message: any): Promise<void> {
    await this.producer.send({ topic: this.topic, messages: [message] });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}
