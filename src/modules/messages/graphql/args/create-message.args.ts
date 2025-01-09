import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMessageInput } from '../inputs/create-message.input';

@ArgsType()
export class CreateMessageArgs {
  @Field()
  @ValidateNested()
  @Type(() => CreateMessageInput)
  @IsNotEmpty()
  data: CreateMessageInput;
}
