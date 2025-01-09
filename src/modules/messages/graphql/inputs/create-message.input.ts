import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageTypeEnum } from '../../dto/message.dto';

@InputType()
export class MessagesContentInput {
  @Field(() => MessageTypeEnum)
  @IsEnum(MessageTypeEnum)
  type: MessageTypeEnum;

  @Field()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === 'text')
  content: string;
}

@InputType()
export class RefMessageInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;
}

@InputType()
export class CreateMessageInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  receiver_id: string;

  @Field(() => MessagesContentInput)
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => MessagesContentInput)
  message: MessagesContentInput;

  @Field(() => RefMessageInput, { nullable: true })
  @ValidateNested()
  @Type(() => RefMessageInput)
  ref_message?: RefMessageInput;
}
