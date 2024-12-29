import { Logger, UseFilters } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AllWsExceptionsFilterFilter } from '../../filters/all-ws-exceptions-filter.filter';
import { AuthService } from '../auth/auth.service';
import { RedisService } from '../../services/redis/redis.service';

@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
@UseFilters(new AllWsExceptionsFilterFilter())
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private authService: AuthService,
    private redisService: RedisService,
  ) {}
  private logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('ChatGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      if (client.request == null) {
        client.disconnect();

        return;
      }

      const auth = client.handshake.auth;

      const [type, token] = auth.token.split(' ');
      if (type !== 'Bearer' || !token) {
        client.disconnect();

        return;
      }

      if (!auth) {
        client.disconnect();

        return;
      }

      const payload = await this.authService.verifyUser(token);

      if (!payload) {
        client.disconnect();

        return;
      }

      const project_id = payload.id.split('_')[0];
      const user_id = payload.id.split('_')[1];

      client.data.project_id = project_id;
      client.data.user_id = user_id;
      client.join(project_id);

      await this.redisService.addSocketToProject(
        project_id,
        user_id,
        client.id,
      );
    } catch (error) {
      client.disconnect();
      throw error;
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      if (
        !client.data.project_id ||
        typeof client.id !== 'string' ||
        !client.data.user_id ||
        typeof client.data.user_id !== 'string'
      ) {
        return;
      }

      const project_id = client.data.project_id;
      const user_id = client.data.user_id;

      await this.redisService.removeSocketFromProject(
        project_id,
        user_id,
        client.id,
      );
    } catch (error) {
      throw error;
    }
  }
}
