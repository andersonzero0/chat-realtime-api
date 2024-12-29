import { Injectable } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageDto } from '../messages/dto/message.dto';
import { RedisService } from '../../services/redis/redis.service';

type SendMessageData = {
  message: MessageDto;
  project_id: string;
};

@Injectable()
export class ChatService {
  constructor(
    private chatGateway: ChatGateway,
    private redisService: RedisService,
  ) {}

  async sendMessage(sendMessageData: SendMessageData) {
    try {
      const message = sendMessageData.message;

      const socketIdsFromProject: string[] =
        await this.redisService.getSocketsFromProject(
          sendMessageData.project_id,
        );

      const socketsId: string[] = [];

      socketIdsFromProject.map((id) => {
        const userId = id.split(':')[0];
        const socketId = id.split(':')[1];

        if (userId === message.sender_id) {
          socketsId.push(socketId);
        }

        if (userId === message.receiver_id) {
          socketsId.push(socketId);
        }
      });

      if (socketsId.length > 0) {
        await Promise.all(
          socketsId.map((socketId: string) => {
            this.chatGateway.server
              .timeout(1000)
              .to(socketId)
              .emit('private-message', {
                id: message.id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                message: message.message,
                ref_message: message.ref_message || null,
                created_at: message.created_at,
              });
          }),
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
