import { Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { PayloadUser } from 'src/common/types/user-request.type';

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Context } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { Auth } from './entities/auth.entity';
import { Logout } from './entities/logout.entity';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  signUp(@Args('signUpInput') signUpInput: RegisterInput) {
    return this.authService.signUp(signUpInput);
  }

  @Mutation(() => Auth)
  async signIn(
    @Args('signInInput') signInInput: LoginInput,
    @Context() context: { res: Response },
  ) {
    const tokens = await this.authService.signIn(signInInput);

    context.res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    context.res.cookie('accessToken', tokens.accessToken, {
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15,
    });

    return tokens;
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Logout)
  logout(@CurrentUser() user: PayloadUser) {
    return this.authService.logout(user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @Mutation(() => Auth)
  public async refreshTokens(
    @CurrentUser() user: PayloadUser,
    @Context() context: { res: Response },
  ) {
    console.log('REFRESH USR');
    const tokens = await this.authService.refreshTokens(user.sub, user.refreshToken);
    context.res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    context.res.cookie('accessToken', tokens.accessToken, {
      sameSite: 'strict',
      maxAge: 1000 * 60 * 30,
    });
    return tokens;
  }
}
