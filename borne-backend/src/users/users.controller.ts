import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // LOGIN
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // LIST USERS
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }

  // CREATE USER
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  async createUser(
    @Body()
    body: {
      username: string;
      password: string;
      role?: UserRole;
    },
  ) {
    return this.usersService.createUser(
      body.username,
      body.password,
      body.role ?? UserRole.ADMIN,
    );
  }

  // UPDATE USERNAME / ROLE
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: {
      username?: string;
      role?: UserRole;
    },
  ) {
    return this.usersService.updateUser(
      Number(id),
      body,
    );
  }

  // CHANGE PASSWORD
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    return this.usersService.changePassword(
      Number(id),
      body.password,
    );
  }

  // ACTIVATE / DEACTIVATE USER
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @Req() req: any,
  ) {
    const userId = Number(id);

    if (
      req.user.ID === userId &&
      body.isActive === false
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez pas désactiver votre propre compte',
      );
    }

    return this.usersService.changeStatus(
      userId,
      body.isActive,
    );
  }

  // DELETE USER
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = Number(id);

    if (req.user.ID === userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer votre propre compte',
      );
    }

    return this.usersService.deleteUser(userId);
  }
}