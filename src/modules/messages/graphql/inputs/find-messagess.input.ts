import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

@InputType()
export class FindMessagesInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  target_user_id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['one', 'two'])
  filter_send?: 'one' | 'two';

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  reading_mode?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  page?: number;

  @IsString()
  @ValidateIf(() => false)
  viewer_id: string;
}
