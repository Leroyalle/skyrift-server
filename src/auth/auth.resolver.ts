import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { RegisterInput } from './dto/register.input';
import { Logout } from './entities/logout.entity';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PayloadUser } from 'src/common/types/user-request.type';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  signUp(@Args('signUpInput') signUpInput: RegisterInput) {
    return this.authService.signUp(signUpInput);
  }

  @Mutation(() => Auth)
  signIn(@Args('signInInput') signInInput: RegisterInput) {
    return this.authService.signIn(signInInput);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Logout)
  logout(@CurrentUser() user: PayloadUser) {
    return this.authService.logout(user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @Mutation(() => Auth)
  refreshTokens(@CurrentUser() user: PayloadUser) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
