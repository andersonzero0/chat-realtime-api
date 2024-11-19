import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const file = context.switchToHttp().getRequest().file;
    const body = context.switchToHttp().getRequest().body;

    if (file && file.mimetype && body && body.message) {
      const message = JSON.parse(body.message);
      if (message && message.type && message.type === 'photo') {
        file.isValid = true;
      } else {
        file.isValid = false;
      }
    }

    return next.handle();
  }
}
