import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthProjectsGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.authService.extractTokenFromHeader(request, 'Token');
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const project_id: string = await this.authService.verifyProject(token);

      request['project_id'] = project_id;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
