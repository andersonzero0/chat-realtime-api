import { Injectable } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageDto } from '../messages/dto/message.dto';
import { RedisService } from '../../services/redis/redis.service';

type SendMessageData = {
  message: MessageDto;
  project_id: string;
};

// type MessageReadData = {
//   project_id: string;
//   sender_id: string;
//   receiver_id: string;
// };

@Injectable()
export class ChatService {
  constructor(
    private chatGateway: ChatGateway,
    private redisService: RedisService,
  ) {}

  async getSocketsId(
    projectId: string,
    userId1: string,
    userId2?: string,
  ): Promise<string[]> {
    try {
      const socketIdsFromProject: string[] =
        await this.redisService.getSocketsFromProject(projectId);

      const socketsId: string[] = [];

      socketIdsFromProject.map((id) => {
        const userId = id.split(':')[0];
        const socketId = id.split(':')[1];

        if (userId === userId1) {
          socketsId.push(socketId);
        }

        if (userId2 && userId === userId2) {
          socketsId.push(socketId);
        }
      });

      return socketsId;
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(sendMessageData: SendMessageData) {
    try {
      const message = sendMessageData.message;

      const socketsId = await this.getSocketsId(
        sendMessageData.project_id,
        message.sender_id,
        message.receiver_id,
      );

      if (socketsId.length > 0) {
        await Promise.all(
          socketsId.map((socketId: string) => {
            this.chatGateway.server
              .timeout(2000)
              .to(socketId)
              .emit(
                'private-message',
                {
                  id: message.id,
                  sender_id: message.sender_id,
                  receiver_id: message.receiver_id,
                  message: message.message,
                  ref_message: message.ref_message || null,
                  created_at: message.created_at,
                },
                // async () => {
                //   console.log('Message sent');
                // },
              );
          }),
        );
      }
    } catch (error) {
      throw error;
    }
  }

  // async emitMessageReadEvent({
  //   project_id,
  //   sender_id,
  //   receiver_id,
  // }: MessageReadData) {
  //   try {
  //     const socketsId = await this.getSocketsId(project_id, sender_id);

  //     if (socketsId.length > 0) {
  //       await Promise.all(
  //         socketsId.map((socketId: string) => {
  //           this.chatGateway.server
  //             .timeout(1000)
  //             .to(socketId)
  //             .emit('message-read-event', {
  //               sender_id,
  //               receiver_id,
  //             });
  //         }),
  //       );
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
