import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  ChatListItem,
  FindMessagesPrivateDto,
  FindUsersWithLastMessageDto,
  LastMessage,
  MessageDto,
} from './dto/message.dto';
import { ProducerService } from '../../services/kafka/producer.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { MessageConsumerType } from './types/message.type';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private producer: ProducerService,
  ) {}

  private logger = new Logger('MessagesService');

  async callJobRegisterMessages(messageConsumer: MessageConsumerType) {
    try {
      await this.producer.produce<MessageConsumerType>({
        topic: 'messages',
        message: {
          value: messageConsumer,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createMessage(message: MessageDto, project_id: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: {
          id: project_id,
        },
      });

      if (!project) {
        throw new NotFoundException("Project doesn't exist");
      }

      if (message.sender_id == message.receiver_id) {
        return;
      }

      const sortedString = [message.sender_id, message.receiver_id].sort();
      const concatString = sortedString.join('-');

      const newIdValidChatList = concatString + '-' + project_id;

      const newMessage = await this.prisma.message.create({
        data: {
          ...message,
          message: instanceToPlain(message.message),
          ref_message: instanceToPlain(message.ref_message) || null,
          project_messages: {
            connectOrCreate: {
              where: {
                id: project_id,
              },
              create: {
                project_id,
              },
            },
          },
          chat_list_item: {
            connectOrCreate: {
              where: {
                valid_chatlist_id: newIdValidChatList,
              },
              create: {
                project_id,
                valid_chatlist_id: newIdValidChatList,
                user_one_id: message.sender_id,
                user_two_id: message.receiver_id,
                chat_list_on_chat_list_item: {
                  create: [
                    {
                      chat_list: {
                        connectOrCreate: {
                          where: {
                            user_id: message.sender_id,
                            project_id,
                          },
                          create: {
                            user_id: message.sender_id,
                            project_id,
                          },
                        },
                      },
                    },
                    {
                      chat_list: {
                        connectOrCreate: {
                          where: {
                            user_id: message.receiver_id,
                            project_id,
                          },
                          create: {
                            user_id: message.receiver_id,
                            project_id,
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        select: {
          id: true,
          sender_id: true,
          receiver_id: true,
          message: true,
          read: true,
          ref_message: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!newMessage) {
        this.logger.error('Error creating message');
        throw new ForbiddenException();
      }

      return {
        ...newMessage,
        created_at: new Date(
          newMessage.created_at.getTime() - 3 * 60 * 60 * 1000,
        ),
        updated_at: new Date(
          newMessage.updated_at.getTime() - 3 * 60 * 60 * 1000,
        ),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findMessagesPrivate(data: FindMessagesPrivateDto, project_id: string) {
    try {
      const response = await this.prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
          where: {
            id: project_id,
          },
        });

        if (!project) {
          throw new NotFoundException("Project doesn't exist");
        }

        if (data.reading_mode == null) {
          data.reading_mode = 'true';
        }

        let page = data.page || 0;
        page = Math.max(1, page);
        const pageSize = 40;

        const sortedString = [data.viewer_id, data.target_user_id].sort();
        const concatString = sortedString.join('-');

        const newIdValidChatList = concatString + '-' + project_id;

        const chatListItem = await tx.chatListItem.findFirst({
          where: {
            project_id,
            valid_chatlist_id: newIdValidChatList,
          },
          select: {
            messages: {
              select: {
                id: true,
                sender_id: true,
                receiver_id: true,
                message: true,
                read: true,
                ref_message: true,
                created_at: true,
                updated_at: true,
              },
              skip: (page - 1) * pageSize,
              take: pageSize,
              orderBy: {
                created_at: 'desc',
              },
            },
          },
        });

        if (!chatListItem) {
          return [];
        }

        const messages = chatListItem.messages;

        if (messages.length == 0) {
          return messages;
        }

        if (data.reading_mode == 'true') {
          for (let i = 0; i < messages.length; i++) {
            if (
              messages[i].receiver_id == data.viewer_id &&
              !messages[i].read
            ) {
              messages[i].read = true;
            }
          }

          await this.updateReadMessages(
            messages,
            {
              user_one: data.viewer_id,
            },
            project_id,
          );
        }

        return messages;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateReadMessages(
    messages: { id: string }[],
    data: { user_one: string },
    project_id: string,
  ) {
    try {
      await this.prisma.message.updateMany({
        where: {
          AND: [
            {
              id: {
                in: messages.map((message: { id: string }) => message.id),
              },
            },
            {
              receiver_id: data.user_one,
              read: false,
              project_messages: {
                project_id,
              },
            },
          ],
        },
        data: {
          read: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findChatList(
    data: FindUsersWithLastMessageDto,
    project_id: string,
  ): Promise<ChatListItem[]> {
    try {
      const project = await this.prisma.project.findUnique({
        where: {
          id: project_id,
        },
      });

      if (!project) {
        throw new NotFoundException("Project doesn't exist");
      }

      let page = data.page || 0;
      page = Math.max(1, page);
      const pageSize = 20;

      const chat_lists = await this.prisma.chatList.findMany({
        where: {
          project_id,
          user_id: data.user_id,
        },
        select: {
          id: true,
          user_id: true,
          chat_list: {
            include: {
              chat_list_item: {
                select: {
                  id: true,
                  user_one_id: true,
                  user_two_id: true,
                  messages: {
                    select: {
                      id: true,
                      message: true,
                      read: true,
                      created_at: true,
                      sender_id: true,
                      receiver_id: true,
                    },
                  },
                },
              },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
          },
        },
      });

      if (chat_lists.length == 0) {
        return [];
      }

      const chat_list = chat_lists[0];

      if (chat_lists.length > 1) {
        chat_lists.map((item) => {
          if (chat_list.id == item.id) {
            return;
          }

          item.chat_list.forEach((item1) => {
            chat_list.chat_list.push(item1);
          });
        });
      }

      const newChatList: typeof chat_list.chat_list = [];

      chat_list.chat_list.forEach((item1) => {
        const id_user =
          data.user_id == item1.chat_list_item.user_one_id
            ? item1.chat_list_item.user_two_id
            : item1.chat_list_item.user_one_id;

        let found = false;

        newChatList.forEach((item2) => {
          if (item1.id == item2.id) {
            found = true;
            return;
          }

          const id_userCompare =
            data.user_id == item2.chat_list_item.user_one_id
              ? item2.chat_list_item.user_two_id
              : item2.chat_list_item.user_one_id;

          if (id_user == id_userCompare) {
            found = true;
          }
        });

        if (!found) {
          newChatList.push(item1);
        }
      });

      chat_list.chat_list = newChatList;

      const formattedChatList = {
        chat_list: chat_list.chat_list
          .map((item) => {
            const messages = item.chat_list_item.messages;
            const last_message =
              messages.length > 0 ? messages[messages.length - 1] : null;

            // unread_messages_count de messages
            const unread_messages_count = messages.filter(
              (message) => message.receiver_id == data.user_id && !message.read,
            ).length;

            return {
              id:
                chat_list.user_id == item.chat_list_item.user_one_id
                  ? item.chat_list_item.user_two_id
                  : item.chat_list_item.user_one_id,

              unread_messages_count,
              last_message: plainToInstance(LastMessage, last_message),
            };
          })
          .sort((a, b) =>
            a.last_message && b.last_message
              ? b.last_message.created_at.getTime() -
                a.last_message.created_at.getTime()
              : 0,
          ),
      };

      return formattedChatList.chat_list;
    } catch (error) {
      throw error;
    }
  }

  async haveUnreadMessages(
    user_id: string,
    project_id: string,
  ): Promise<boolean> {
    try {
      const chatList = await this.prisma.chatListItem.findFirst({
        where: {
          OR: [
            {
              AND: {
                project_id,
                user_one_id: user_id,
              },
            },
            {
              AND: {
                project_id,
                user_two_id: user_id,
              },
            },
          ],
        },
        select: {
          messages: {
            select: {
              id: true,
              read: true,
              receiver_id: true,
            },
          },
        },
      });

      if (chatList) {
        return chatList.messages.some(
          (message) => message.receiver_id == user_id && !message.read,
        );
      }

      return false;
    } catch (error) {
      throw error;
    }
  }
}
