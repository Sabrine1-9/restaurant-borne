import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard serves as a middleware to protect routes.
 * Simply adding @UseGuards(JwtAuthGuard) above an endpoint blocks unauthorized users 
 * and automatically triggers the logic found inside jwt.strategy.ts.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}