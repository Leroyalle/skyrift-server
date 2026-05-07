import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { PayloadUser } from 'src/common/types/user-request.type';

import { Inject, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { USER_FACADE_TOKEN } from '../application/ports/tokens';
import { UserFacadePort } from '../application/ports/user-facade.port';

import { CreateUserDto } from './dto/create-user.dto';
import { UserPresentationMapper } from './mappers/user.presentation.mapper';
import { UserModel } from './models/user.model';

@Resolver(() => UserModel)
export class UserGraphqlController {
  constructor(@Inject(USER_FACADE_TOKEN) private readonly userFacade: UserFacadePort) {}

  @Mutation(() => UserModel)
  public async createUser(@Args('createUserInput') createUserInput: CreateUserDto): Promise<void> {
    await this.userFacade.create(createUserInput);
  }

  @Query(() => [UserModel], { name: 'findAllUsers' })
  public async findAll() {
    const users = await this.userFacade.findAll();
    return users.map(UserPresentationMapper.toModel);
  }

  @Query(() => UserModel, { name: 'findOneUser' })
  public async findOne(@Args('id', { type: () => ID }) id: string) {
    const user = await this.userFacade.findOne(id);
    if (!user) return null;
    return UserPresentationMapper.toModel(user);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => UserModel, { name: 'getCurrentUser' })
  public async getCurrentUser(@CurrentUser() user: PayloadUser) {
    const foundUser = await this.userFacade.findOne(user.id);
    if (!foundUser) return null;
    return UserPresentationMapper.toModel(foundUser);
  }
}
