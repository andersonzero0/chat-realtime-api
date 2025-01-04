import { Injectable } from '@nestjs/common';
import { CacheManagerService } from '../../services/cache-manager/cache-manager.service';
import { MessageDto } from './dto/message.dto';

type TSaveMessageCache = {
  project_id: string;
  message: MessageDto;
};

@Injectable()
export class MessagesCache {
  constructor(private cacheManager: CacheManagerService) {}

  async getMessages(
    project_id: string,
    sender_id: string,
    receiver_id: string,
  ) {
    const key = await this.createKey(project_id, sender_id, receiver_id);

    console.log('KEY', key);

    const messages = await this.cacheManager.get<MessageDto[]>(key);

    return messages || [];
  }

  async saveMessage({ project_id, message }: TSaveMessageCache) {
    const key = await this.createKey(
      project_id,
      message.sender_id,
      message.receiver_id,
    );

    const messages = await this.getMessages(
      project_id,
      message.sender_id,
      message.receiver_id,
    );

    messages.push(message);

    await this.cacheManager.set(key, messages);
  }

  async deleteMessage({ project_id, message }: TSaveMessageCache) {
    console.log('DELETED !!!!!!');
    const key = await this.createKey(
      project_id,
      message.sender_id,
      message.receiver_id,
    );

    const messages = await this.getMessages(
      project_id,
      message.sender_id,
      message.receiver_id,
    );

    const newMessages = messages.filter((m) => m.id !== message.id);

    await this.cacheManager.set(key, newMessages);
  }

  async createKey(project_id: string, sender_id: string, receiver_id: string) {
    const usersIdOrder = [sender_id, receiver_id].sort();

    return `${project_id}-${usersIdOrder.join('-')}`;
  }
}
