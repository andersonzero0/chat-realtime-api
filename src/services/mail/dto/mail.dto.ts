import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class MailDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
