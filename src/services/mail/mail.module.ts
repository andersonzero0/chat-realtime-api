import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from '../../config/configuration';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MailerOptions => {
        const mailConfig = configService.getOrThrow<MailConfig>('mail');

        return {
          transport: {
            host: mailConfig.smtp_host,
            port: mailConfig.smtp_port,
            auth: {
              user: mailConfig.smtp_username || '',
              pass: mailConfig.smtp_password || '',
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
