import { MessageDto } from '../dto/message.dto';

export type MessageConsumerType = {
  message: MessageDto;
  project_id: string;
};
