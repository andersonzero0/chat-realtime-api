import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../../config/configuration';
import { ProjectsService } from '../projects/projects.service';
import { MailService } from '../../services/mail/mail.service';
import { Request } from 'express';

export type Payload = {
  id: string;
  name?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private projectService: ProjectsService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  private configAuth = this.configService.get<AuthConfig>('auth');

  async verifyProject(token: string) {
    try {
      if (!this.configAuth) {
        throw new Error('Secret key not found');
      }

      const payload = this.decryptPayload(token);

      const project = await this.projectService.getProjectById(payload);

      if (!project) {
        throw new UnauthorizedException();
      }

      return payload;
    } catch (error) {
      throw error;
    }
  }

  async authProject(id: string) {
    try {
      if (!this.configAuth) {
        throw new Error('Secret key not found');
      }

      const project = await this.projectService.getProjectById(id);

      const payload = project.id;

      const token = this.encryptPayload(payload);

      console.log('token', token);

      // return await this.mailService.sendTokenByMail({
      //   id: project.id,
      //   email: project.email,
      //   name: project.name,
      //   token,
      // });
    } catch (error) {
      throw error;
    }
  }

  async verifyUser(token: string): Promise<Payload | null> {
    try {
      if (!this.configAuth) {
        throw new Error('JWT Secret not found');
      }

      if (!token) {
        throw new Error('No token provided');
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const decrypted = await this.jwtService.verifyAsync(token, {
        secret: this.configAuth.jwtSecretUser,
      });

      return decrypted;
    } catch (error) {
      throw error;
    }
  }

  async generateTokenFromUser(id: string): Promise<{ token: string }> {
    try {
      if (!this.configAuth) {
        throw new Error('JWT Secret not found');
      }

      const payload = { id };
      const token = await this.jwtService.signAsync(payload);

      return {
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  encryptPayload(payload: string): string {
    const token = Buffer.from(payload, 'utf8').toString('base64');
    return token;
  }

  decryptPayload(token: string): string {
    const payload = Buffer.from(token, 'base64').toString('utf8');
    return payload;
  }

  extractTokenFromHeader(
    request: Request,
    typeCrypt: 'Bearer' | 'Token',
  ): string | undefined {
    if (typeCrypt === 'Token') {
      return request.headers.authorization;
    }

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === typeCrypt ? token : undefined;
  }
}
