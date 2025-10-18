import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

// SERVICES
import { AuthService } from '../services/auth.service';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Extract and validate authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid authorization header');
      }

      const token = authHeader.slice(7);
      if (!token) {
        throw new UnauthorizedException('Token is required');
      }

      // SECURITY FIX: Use verifyToken() instead of decodeToken()
      // verify() checks the signature, decode() does NOT
      const verifiedToken = await this.authService.verifyToken(token);

      // Attach verified user to request for use in controllers
      request.user = verifiedToken;

      // Validate email matches (use strict equality)
      if (verifiedToken.email !== request.body.email) {
        throw new UnauthorizedException('Email mismatch');
      }

      return true;
    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Wrap other errors in UnauthorizedException
      throw new UnauthorizedException(error.message || 'Invalid or expired token');
    }
  }
}
