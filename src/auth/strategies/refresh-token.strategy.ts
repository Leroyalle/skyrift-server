import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          throw new UnauthorizedException('Refresh token not found in cookies');
        }
        return refreshToken;
      },
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: JwtPayload,
  ): { refreshToken: string; [key: string]: unknown } {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }
    return { ...payload, refreshToken };
  }
}
