import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Inject, UseGuards, ValidationPipe } from '@nestjs/common';
import { MessagesService } from '../../messages.service';
import { AuthUsersGuard } from '../../../auth/auth.users.guard';
import { Request } from '../../../../infra/infra.interfaces';
import { MessagesObject } from '../objects/messages.object';
import { CreateMessageArgs } from '../args/create-message.args';
import { PubSub } from 'graphql-subscriptions';
import { AuthService } from '../../../auth/auth.service';
import { FindMessagesArgs } from '../args/find-messages.args';

@Resolver()
export class MessagesResolver {
  constructor(
    private messagesService: MessagesService,
    @Inject('PUB_SUB') private pubSub: PubSub,
    private authService: AuthService,
  ) {}

  @Mutation(() => MessagesObject)
  @UseGuards(AuthUsersGuard)
  createUser(
    @Args(new ValidationPipe()) args: CreateMessageArgs,
    @Context('req') req: Request,
  ) {
    try {
      return this.messagesService.processMessage(
        {
          receiver_id: args.data.receiver_id,
          message: args.data.message,
          sender_id: req.user_id,
          ref_message: args.data.ref_message,
        },
        null,
        req,
      );
    } catch (error) {
      throw error;
    }
  }

  @Query(() => [MessagesObject])
  @UseGuards(AuthUsersGuard)
  async getMessages(
    @Args(new ValidationPipe()) args: FindMessagesArgs,
    @Context('req') req: Request,
  ) {
    try {
      return this.messagesService.findMessagesPrivate(
        {
          ...args.data,
          viewer_id: req.user_id,
          reading_mode: args.data.reading_mode
            ? args.data.reading_mode.toString()
            : undefined,
        },
        req.project_id,
      );
    } catch (error) {
      throw error;
    }
  }

  @Subscription(() => MessagesObject, {
    name: 'messageCreated',
    async filter(payload, __, context) {
      const connectionParams = context.req.connectionParams;

      if (
        !connectionParams.Authorization ||
        !connectionParams.user_id ||
        !connectionParams.project_id
      ) {
        return false;
      }

      const payloadData = payload.messageCreated;
      const payloadProjectId = payloadData.project_id;
      const user_id = connectionParams.user_id;
      const project_id = connectionParams.project_id;

      if (payloadProjectId !== project_id) {
        return false;
      }

      if (payloadData.receiver_id === user_id) {
        return true;
      }

      if (payloadData.sender_id === user_id) {
        return true;
      }

      return false;
    },
  })
  messageCreated() {
    return this.pubSub.asyncIterableIterator('messageCreated');
  }
}
