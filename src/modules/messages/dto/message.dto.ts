import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum MessageTypeEnum {
  photo = 'photo',
  text = 'text',
}

class MessageContent {
  @ApiProperty({ enum: MessageTypeEnum })
  @IsEnum(MessageTypeEnum)
  type: MessageTypeEnum;

  @ApiProperty({
    description: 'This field is required when type is text',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === 'text')
  content: string;
}

class RefMessage {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class MessageDto {
  @ApiProperty({ readOnly: true })
  id: string;

  @ValidateIf(() => false)
  sender_id: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  receiver_id: string;

  @ApiProperty()
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => MessageContent)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  message: MessageContent;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => RefMessage)
  ref_message?: RefMessage;

  @ApiProperty({
    readOnly: true,
    type: 'boolean',
    default: false,
    required: false,
  })
  read?: boolean;

  @ApiProperty({ readOnly: true, required: false })
  created_at?: Date | string;

  @ApiProperty({ readOnly: true, required: false })
  updated_at?: Date | string;
}

export class CreateMessageDto extends OmitType(MessageDto, [
  'id',
  'read',
  'created_at',
  'updated_at',
]) {}

export class FindMessagesPrivateDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  target_user_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['one', 'two'])
  filter_send?: 'one' | 'two';

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  @IsBooleanString()
  reading_mode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  page?: number;

  @IsString()
  @ValidateIf(() => false)
  viewer_id: string;
}

export class FindUsersWithLastMessageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  page?: number;

  @IsString()
  @ValidateIf(() => false)
  user_id: string;
}

export class LastMessage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message: MessageContent;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  sender_id: string;

  @ApiProperty()
  receiver_id: string;
}

export class ChatListItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  unread_messages_count: number;

  @ApiProperty({ type: () => LastMessage, nullable: true })
  last_message: LastMessage | null;
}

export class FindChatListReturn {
  @ApiProperty({ type: () => [ChatListItem] })
  data: ChatListItem[];
}

export class HaveUnreadMessagesDto {
  @IsString()
  id_user: string;
}
