import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Le nom d utilisateur doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom d utilisateur est obligatoire' })
  username: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(4, { message: 'Le mot de passe doit contenir au moins 4 caractères' })
  password: string;
}
