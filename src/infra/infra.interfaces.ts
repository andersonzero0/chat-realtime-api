import { Request as RequestExpress } from 'express';

export type Request = RequestExpress & {
  project_id: string;
  user_id: string;
};
