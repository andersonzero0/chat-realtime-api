import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from '../../services/kafka/consumer.service';
import { MessageConsumerType } from './types/message.type';
import { MessagesService } from './messages.service';

@Injectable()
export class MessagesConsumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly messagesService: MessagesService,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume<MessageConsumerType>({
      topic: { topics: ['messages'], fromBeginning: true },
      config: {
        groupId: 'messages-consumer',
        retry: {
          retries: 5,
          factor: 2,
          multiplier: 2,
          initialRetryTime: 500,
          maxRetryTime: 2000,
        },
        sessionTimeout: 10000,
      },
      onMessage: async (messageConsumer) => {
        if (messageConsumer && messageConsumer.value) {
          const data = JSON.parse(
            messageConsumer.value.toString(),
          ) as MessageConsumerType;

          const { message, project_id } = data;

          await this.messagesService.createMessage(message, project_id);
        }
      },
    });
  }
}
