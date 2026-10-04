import { Controller } from '@nestjs/common';

/**
 * AuthController manages the API endpoints related to authentication via the /auth route.
 * Note: Currently empty because the login endpoint sits inside users.controller.ts instead.
 */
@Controller('auth')
export class AuthController {}
