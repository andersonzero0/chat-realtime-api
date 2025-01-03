import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from '../../config/configuration';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendMail(email: string, name: string, token: string) {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');

    await this.mailerService.sendMail({
      from: mailConfig.mail_sender,
      to: mailConfig.mail_send_test ? mailConfig.mail_send_test_to : email,
      subject: 'Token',
      template: 'token',
      context: {
        name,
        token,
      },
    });
  }
}
