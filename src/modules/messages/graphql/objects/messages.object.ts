import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { MessageTypeEnum } from '../../dto/message.dto';

registerEnumType(MessageTypeEnum, {
  name: 'MessageTypeEnum',
});

@ObjectType()
export class MessagesContentObject {
  @Field(() => MessageTypeEnum)
  type: MessageTypeEnum;

  @Field()
  content: string;
}

@ObjectType()
export class RefMessageObject {
  @Field()
  id: string;

  @Field({ nullable: true })
  url?: string;

  @Field()
  content: string;
}

@ObjectType()
export class MessagesObject {
  @Field(() => ID)
  id: string;

  @Field()
  sender_id: string;

  @Field()
  receiver_id: string;

  @Field(() => MessagesContentObject)
  message: MessagesContentObject;

  @Field(() => RefMessageObject, { nullable: true })
  ref_message?: RefMessageObject;

  @Field()
  read: boolean;

  @Field()
  created_at: string;

  @Field()
  updated_at: string;
}
