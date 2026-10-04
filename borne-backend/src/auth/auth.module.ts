import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * AuthModule bundles all authentication-related features.
 * It imports dependencies, configures the JWT token generation,
 * and exports the AuthService so other modules (like UsersModule) can use it.
 */
@Module({
   imports: [
    TypeOrmModule.forFeature([User]), // Gives access to the User database table
    UsersModule,                      // To interact with users (check if user exists)
    PassportModule,                   // NestJS authentication library
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],  

      useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET') ,
      signOptions: {
         expiresIn: '1h' 
        }, // Token expiration time (1 hour validity)
    }),
    }),
  ],
  providers: [AuthService, JwtStrategy], // Services that execute the logic
  controllers: [AuthController],         // To handle incoming HTTP requests related to auth
  exports: [AuthService],                // Allow AuthService to be used in other modules (e.g., users.controller)
})
export class AuthModule {}
