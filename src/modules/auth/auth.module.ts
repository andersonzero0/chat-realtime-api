import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { ProjectsModule } from '../projects/projects.module';
import { MailModule } from '../../services/mail/mail.module';

@Module({
  imports: [
    forwardRef(() => ProjectsModule),
    MailModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('auth.jwtSecretUser'),
        signOptions: {
          expiresIn: '15d',
        },
        verifyOptions: {},
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
