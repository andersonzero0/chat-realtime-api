import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  Kafka,
  KafkaMessage,
  logLevel as LogLevelKafka,
} from 'kafkajs';
import { IConsumer } from './interfaces/consumer.interface';
import { Logger } from '@nestjs/common';
import { sleep } from '../../utils/sleep';
import { logCreatorKafka } from './kafka.utils';

export class KafkaConsumer implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger = new Logger('KafkaConsumer');

  constructor(
    private readonly topic: ConsumerSubscribeTopics,
    config: ConsumerConfig,
    broker: string,
  ) {
    this.kafka = new Kafka({
      clientId: 'chat-api-consumer',
      brokers: [broker],
      logCreator: (logLevel: LogLevelKafka) =>
        logCreatorKafka(logLevel, this.logger),
    });
    this.consumer = this.kafka.consumer(config);
    this.logger.log(`Kafka Consumer created for topic: ${topic.topics}`);
  }

  async consume(onMessage: (message: KafkaMessage) => Promise<void>) {
    await this.consumer.subscribe(this.topic);
    await this.consumer.run({
      partitionsConsumedConcurrently: 100, // TODO: ENV
      eachMessage: async ({ message }) => {
        try {
          return onMessage(message);
        } catch (err) {
          this.logger.error(
            'Error consuming message. Adding to dead letter queue...',
            err,
          );
        }
      },
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
