import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async createUser(
    username: string,
    password: string,
    role: UserRole = UserRole.ADMIN,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.findByUsername(username);

    if (existingUser) {
      throw new ConflictException('Utilisateur déjà existant');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      role,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    const { password: _, ...result } = savedUser;

    return result;
  }

  async getUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      order: {
        ID: 'ASC',
      },
    });

    return users.map(({ password, ...user }) => user);
  }

  async updateUser(
    id: number,
    data: {
      username?: string;
      role?: UserRole;
    },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { ID: id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (data.username && data.username !== user.username) {
      const existingUser = await this.findByUsername(data.username);

      if (existingUser) {
        throw new ConflictException(
          'Ce nom utilisateur existe déjà',
        );
      }

      user.username = data.username;
    }

    if (data.role) {
      user.role = data.role;
    }

    const savedUser = await this.userRepository.save(user);

    const { password: _, ...result } = savedUser;

    return result;
  }

  async changePassword(
    id: number,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { ID: id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await this.userRepository.save(user);

    return {
      message: 'Mot de passe modifié avec succès',
    };
  }

  async changeStatus(
    id: number,
    isActive: boolean,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { ID: id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.isActive = isActive;

    const savedUser = await this.userRepository.save(user);

    const { password: _, ...result } = savedUser;

    return result;
  }

  async deleteUser(
    id: number,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { ID: id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    await this.userRepository.remove(user);

    return {
      message: 'Utilisateur supprimé avec succès',
    };
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<any> {
    const user = await this.findByUsername(username);

    if (!user) return null;

    if (!user.isActive) return null;

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;

    return result;
  }
}