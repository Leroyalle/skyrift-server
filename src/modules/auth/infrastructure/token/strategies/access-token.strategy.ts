import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/common/types/jwt-payload.type';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_SECRET as string,
    });
  }

  public validate(payload: JwtPayload) {
    return payload;
  }
}
