import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenPort } from '../../application/ports/access-token-service.port';
import { SignPayload } from '../../application/types/sign-payload.type';
import { TokenData } from '../../application/types/token-data.type';

@Injectable()
export class AccessTokenService implements AccessTokenPort {
  private readonly accessSecret: string;
  private readonly refreshToken: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = configService.getOrThrow<string>('ACCESS_SECRET');
    this.refreshToken = configService.getOrThrow<string>('REFRESH_SECRET');
  }

  public async sign(payload: SignPayload): Promise<TokenData> {
    const stringExpiresAt = '5m';

    const expiresMs = parseInt(stringExpiresAt) * 1000 * 60 + Date.now();
    const expiresDate = new Date(Date.now() + expiresMs);
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: expiresMs,
      secret: this.accessSecret,
    });

    return { token, expiresAt: { expiresMs, expiresDate } };
  }

  public async verify(token: string): Promise<SignPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.accessSecret,
    });
  }
}
