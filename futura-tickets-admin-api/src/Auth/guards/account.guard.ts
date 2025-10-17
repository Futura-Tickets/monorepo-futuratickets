import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

// SERVICES
import { AuthService } from '../services/auth.service';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization.slice(7);
    const decodedToken = await this.authService.decodeToken(token);

    if (decodedToken.email == request.body.email) return true;
    return false;
  }
}
