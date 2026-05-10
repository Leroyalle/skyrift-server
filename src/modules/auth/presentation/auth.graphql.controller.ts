import { Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { PayloadUser } from 'src/common/types/user-request.type';

import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Context } from '@nestjs/graphql';

import { LogoutPort } from '../application/ports/logout.port';
import { RefreshPort } from '../application/ports/refresh.port';
import { SignInPort } from '../application/ports/sign-in.port';
import { SignUpPort } from '../application/ports/sign-up.port';
import {
  LOGOUT_USE_CASE_TOKEN,
  REFRESH_USE_CASE_TOKEN,
  SIGN_IN_USE_CASE_TOKEN,
  SIGN_UP_USE_CASE_TOKEN,
} from '../application/ports/tokens';

import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthModel } from './models/auth.model';
import { LogoutModel } from './models/logout.model';

@Resolver()
export class AuthGraphqlController {
  constructor(
    @Inject(SIGN_IN_USE_CASE_TOKEN) private readonly signInUseCase: SignInPort,
    @Inject(SIGN_UP_USE_CASE_TOKEN) private readonly signUpUseCase: SignUpPort,
    @Inject(LOGOUT_USE_CASE_TOKEN) private readonly logoutUseCase: LogoutPort,
    @Inject(REFRESH_USE_CASE_TOKEN) private readonly refreshUseCase: RefreshPort,
  ) {}

  @Mutation(() => AuthModel)
  public signUp(@Args('signUpInput') signUpInput: RegisterInput) {
    return this.signUpUseCase.execute(signUpInput);
  }

  @Mutation(() => AuthModel)
  public async signIn(
    @Args('signInInput') signInInput: LoginInput,
    @Context() context: { res: Response },
  ): Promise<AuthModel> {
    const tokens = await this.signInUseCase.execute(signInInput);

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

    return { accessToken: tokens.accessToken.token, refreshToken: tokens.refreshToken.token };
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => LogoutModel)
  public logout(@CurrentUser() user: PayloadUser) {
    return this.logoutUseCase.execute(user.id);
  }

  @UseGuards(RefreshTokenGuard)
  @Mutation(() => AuthModel)
  public async refreshTokens(
    @CurrentUser() user: PayloadUser,
    @Context() context: { res: Response },
  ) {
    const tokens = await this.refreshUseCase.execute(user.id, user.refreshToken);
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
