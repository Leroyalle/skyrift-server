import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { PayloadUser } from 'src/common/types/user-request.type';

import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  public createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'findAllUsers' })
  public findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'findOneUser' })
  public findOne(@Args('id', { type: () => ID }) id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => User, { name: 'getCurrentUser' })
  public getCurrentUser(@CurrentUser() user: PayloadUser) {
    return this.userService.findOne(user.sub);
  }
}
