import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_PATTERN } from '../username';

export class RegisterDto {
  @Matches(USERNAME_PATTERN, {
    message: '用户名只能包含英文、数字、下划线，长度 4-20 位',
  })
  username!: string;

  @IsString()
  @MinLength(6, { message: '密码至少需要 6 位' })
  @MaxLength(72, { message: '密码不能超过 72 位' })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  nickname?: string;
}

export class LoginDto {
  @Matches(USERNAME_PATTERN, {
    message: '用户名只能包含英文、数字、下划线，长度 4-20 位',
  })
  username!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(6, { message: '新密码至少需要 6 位' })
  @MaxLength(72, { message: '新密码不能超过 72 位' })
  newPassword!: string;
}
