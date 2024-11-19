import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ip = context.switchToHttp().getRequest().ip;

    if (ip == '::ffff:127.0.0.1') {
      Logger.warn(`Unauthorized access from IP: ${ip}`);
      throw new UnauthorizedException();
    }

    return next.handle();
  }
}
