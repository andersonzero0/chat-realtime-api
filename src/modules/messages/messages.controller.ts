import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request as RequestNest,
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
import { ApiDefaultResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUsersGuard } from '../auth/auth.users.guard';
import { Request } from '../../infra/infra.interfaces';
@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

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
    @Body() data: CreateMessageDto,
    @RequestNest() req: Request,
    @UploadedFile(FileValidationPipe)
    file: Express.Multer.File,
  ) {
    try {
      return await this.messagesService.processMessage(data, file, req);
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
    @RequestNest() req: Request,
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
    @RequestNest() req: Request,
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
  async haveUnreadMessages(@RequestNest() req: Request): Promise<boolean> {
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
