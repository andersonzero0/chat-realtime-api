import { ChatService } from '../chat/chat.service';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  ChatListItem,
  CreateMessageDto,
  FindMessagesPrivateDto,
  FindUsersWithLastMessageDto,
  MessageDto,
} from './dto/message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from '../../interceptors/file-validation.interceptor';
import { FileValidationPipe } from '../../pipes/file-validation.pipe';
import * as crypto from 'crypto';
import { ApiDefaultResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { S3Service } from '../../services/s3/s3.service';
import { AuthUsersGuard } from '../auth/auth.users.guard';
@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private chatService: ChatService,
    private s3Service: S3Service,
  ) {}

  @ApiOperation({
    summary: 'Create a new message',
  })
  @ApiDefaultResponse({
    type: MessageDto,
  })
  @UseGuards(AuthUsersGuard)
  @UseInterceptors(FileInterceptor('file'), FileValidationInterceptor)
  @Post()
  async create(
    @Body() message: CreateMessageDto,
    @Request() req: any,
    @UploadedFile(FileValidationPipe)
    file: Express.Multer.File,
  ) {
    try {
      if (!file && message.message.type === 'photo') {
        throw new ForbiddenException('File is required');
      }

      if (req.user_id === message.receiver_id) {
        throw new ForbiddenException('You cannot send a message to yourself');
      }

      if (message.message.type === 'photo') {
        const url = await this.s3Service.uploadFile(file);

        if (!url) {
          throw new BadRequestException('Failed to upload file');
        }

        message.message.content = url;
      }

      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset() * 60000;
      const created_at = new Date(now.getTime() - timezoneOffset);
      const id = crypto.randomBytes(12).toString('hex');

      const newMessage = {
        ...message,
        id: id.toString(),
        sender_id: req.user_id,
        created_at,
        updated_at: created_at,
      };

      await this.messagesService.callJobRegisterMessages({
        message: newMessage,
        project_id: req.project_id,
      });

      await this.chatService.sendMessage({
        message: newMessage,
        project_id: req.project_id,
      });

      return {
        ...newMessage,
        read: false,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Find private messages' })
  @ApiDefaultResponse({
    status: 200,
    isArray: true,
    type: MessageDto,
  })
  @UseGuards(AuthUsersGuard)
  @Get()
  async findMessagesPrivate(
    @Query() data: FindMessagesPrivateDto,
    @Request() req: any,
  ) {
    try {
      return await this.messagesService.findMessagesPrivate(
        {
          ...data,
          viewer_id: req.user_id,
        },
        req.project_id,
      );
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Find chat list' })
  @ApiDefaultResponse({
    status: 200,
    isArray: true,
    type: ChatListItem,
  })
  @UseGuards(AuthUsersGuard)
  @Get('chat-list')
  async findUsersWithLastMessage(
    @Query() data: FindUsersWithLastMessageDto,
    @Request() req: any,
  ) {
    try {
      return await this.messagesService.findChatList(
        {
          ...data,
          user_id: req.user_id,
        },
        req.project_id,
      );
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Check if there are unread messages' })
  @ApiDefaultResponse({
    status: 200,
    type: Boolean,
  })
  @UseGuards(AuthUsersGuard)
  @Get('have-unread-messages')
  async haveUnreadMessages(@Request() req: any): Promise<boolean> {
    try {
      return await this.messagesService.haveUnreadMessages(
        req.user_id,
        req.project_id,
      );
    } catch (error) {
      throw error;
    }
  }
}
