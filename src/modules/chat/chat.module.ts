import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../../services/redis/redis.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [AuthModule, RedisModule, ProjectsModule],
  providers: [ChatService, ChatGateway],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
