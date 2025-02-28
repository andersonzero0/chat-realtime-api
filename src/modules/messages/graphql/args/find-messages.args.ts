import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { FindMessagesInput } from '../inputs/find-messagess.input';

@ArgsType()
export class FindMessagesArgs {
  @Field()
  @ValidateNested()
  @Type(() => FindMessagesInput)
  @IsNotEmpty()
  data: FindMessagesInput;
}
