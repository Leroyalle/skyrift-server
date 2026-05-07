import * as argon2 from 'argon2';
import { RefreshHasherPort } from 'src/modules/auth/application/ports/refresh-hasher.port';

import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshHasher implements RefreshHasherPort {
  public hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  public verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
