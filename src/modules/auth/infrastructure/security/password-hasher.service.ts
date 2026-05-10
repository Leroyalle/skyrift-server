import * as argon2 from 'argon2';

import { Injectable } from '@nestjs/common';

import { PasswordHasherPort } from '../../application/ports/password-hasher.port';

@Injectable()
export class ArgonPasswordHasher implements PasswordHasherPort {
  public verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  public hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }
}
