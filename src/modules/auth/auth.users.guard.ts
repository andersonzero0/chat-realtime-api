import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthUsersGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request = context.switchToHttp().getRequest();

    if (!request) {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    }

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
