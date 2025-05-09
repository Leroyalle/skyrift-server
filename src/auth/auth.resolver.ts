import {
  Resolver,
  Mutation,
  Args,
  GraphQLExecutionContext,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { RegisterInput } from './dto/register.input';
import { Logout } from './entities/logout.entity';
import { Res, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PayloadUser } from 'src/common/types/user-request.type';
import { LoginInput } from './dto/login.input';
import { Response } from 'express';
import { Context } from '@nestjs/graphql';

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
    const tokens = await this.authService.refreshTokens(
      user.sub,
      user.refreshToken,
    );
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
}
