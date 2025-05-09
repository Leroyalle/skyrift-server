import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  public async signUp(registerInput: RegisterInput) {
    const findUser = await this.userService.findByEmail(registerInput.email);

    if (findUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже зарегестрирован',
      );
    }

    const hashedPassword = await this.hashData(registerInput.password);

    const createdUser = await this.userService.create({
      ...registerInput,
      password: hashedPassword,
      refreshToken: null,
    });

    const tokens = await this.getTokens(createdUser.id, createdUser.name);
    await this.updateRefreshToken(createdUser.id, tokens.refreshToken);

    return tokens;
  }

  public async signIn(loginInput: LoginInput) {
    const findUser = await this.userService.findByEmail(loginInput.email);
    if (!findUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    const verifyPassword = await argon2.verify(
      findUser.password,
      loginInput.password,
    );

    if (!verifyPassword) {
      throw new BadRequestException('Неверный логин или пароль');
    }

    const tokens = await this.getTokens(findUser.id, findUser.name);

    await this.updateRefreshToken(findUser.id, tokens.refreshToken);

    return tokens;
  }

  public async logout(userId: string) {
    return await this.userService.update({ id: userId, refreshToken: null });
  }

  updateRefreshToken(userId: string, refreshToken: string) {
    return this.userService.update({ id: userId, refreshToken });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET') as string,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>(
            'JWT_REFRESH_SECRET',
          ) as string,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async refreshTokens(userId: string, refreshToken: string) {
    const findUser = await this.userService.findOne(userId);

    if (!findUser || !findUser.refreshToken) {
      throw new ForbiddenException('Доступ запрещен');
    }

    const verifyRefresh = await argon2.verify(
      findUser.refreshToken,
      refreshToken,
    );

    if (!verifyRefresh) {
      throw new ForbiddenException('Доступ запрещен');
    }

    const tokens = await this.getTokens(findUser.id, findUser.name);
    await this.userService.update({
      id: findUser.id,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }
}
