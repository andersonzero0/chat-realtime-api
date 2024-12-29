import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthUsersGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.authService.extractTokenFromHeader(request, 'Bearer');
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.authService.verifyUser(token);

      if (!payload) {
        throw new UnauthorizedException();
      }

      const [project_id, user_id] = payload.id.split('_');

      request['project_id'] = project_id;
      request['user_id'] = user_id;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
