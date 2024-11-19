import { BadRequestException, Injectable } from '@nestjs/common';
import { MailDto } from './dto/mail.dto';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  private resend = new Resend(
    this.configService.get<string>('email.resendApiKey'),
  );

  async sendTokenByMail({ id, email, name, token }: MailDto) {
    try {
      const responseSendMail = await this.resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [`${email}`],
        subject: 'Token Access',
        html: `<div>
            <p>Project: ${name} | ${id}</p>
            <p>Here is your token:</p><br/>
            <strong>${token}<strong/><br/>
            <small>Use this token to send messages!</small>
            <small>Thanks</small>
        <div/>`,
      });

      if (responseSendMail.error !== null) {
        console.log(responseSendMail.error);
        throw new BadRequestException('Error sending email!');
      }

      return {
        message: 'Email sent successfully!',
      };
    } catch (error) {
      throw error;
    }
  }
}
