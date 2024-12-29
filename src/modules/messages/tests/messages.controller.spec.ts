import { PrismaService } from '../../../services/prisma/prisma.service';
import { MessagesController } from '../messages.controller';
import { MessagesService } from '../messages.service';
import { Test } from '@nestjs/testing';
import { ProducerService } from '../../../services/kafka/producer.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import { ProjectsService } from '../../projects/projects.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../../services/mail/mail.service';
import { ChatService } from '../../chat/chat.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { RedisService } from '../../../services/redis/redis.service';
import { S3Service } from '../../../services/s3/s3.service';

describe('MessagesController', () => {
  let messagesController: MessagesController;
  let messagesService: MessagesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        MessagesService,
        PrismaService,
        ProducerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('dummy-api-key'),
          },
        },
        AuthService,
        ProjectsService,
        JwtService,
        MailService,
        ChatService,
        ChatGateway,
        RedisService,
        S3Service,
      ],
    }).compile();

    messagesService = moduleRef.get<MessagesService>(MessagesService);
    messagesController = moduleRef.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(messagesController).toBeDefined();
    expect(messagesService).toBeDefined();
  });
});
