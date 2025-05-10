import { Inject, Injectable } from '@nestjs/common';
import { UpdateGameDto } from './dto/update-game.dto';
import { PlayerWalkDto } from './dto/player-walk.dto';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CharacterService } from 'src/character/character.service';

@Injectable()
export class GameService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly characterService: CharacterService,
    @Inject('SOCKET_IO_SERVER') private readonly server: Server,
  ) {}

  private readonly activeConnections: Map<string, string> = new Map();

  public async handleConnection(client: Socket) {
    try {
      const { token: accessToken, characterId } = client.handshake.auth as {
        token?: string;
        characterId?: string;
      };

      if (!accessToken || !characterId) {
        client.disconnect();
        return;
      }

      const payload = this.authService.verifyToken(accessToken, 'access');

      if (!payload) {
        client.disconnect();
        return;
      }

      const findUser = await this.userService.findOne(payload.sub);

      if (!findUser) {
        client.disconnect();
        return;
      }

      const findCharacter = await this.characterService.findOwnedCharacter(
        findUser.id,
        characterId,
      );

      if (!findCharacter) {
        client.disconnect();
        return;
      }

      const oldClientId = this.activeConnections.get(findUser.id);
      if (oldClientId) {
        const oldClient = this.server.sockets.sockets.get(oldClientId);
        if (oldClient) oldClient?.disconnect();
        this.activeConnections.delete(findUser.id);
      }

      this.activeConnections.set(findUser.id, client.id);
      client['userData'] = {
        userId: findUser.id,
        characterId: findCharacter.id,
      };
    } catch {
      client.disconnect(true);
    }
  }

  playerWalk(input: PlayerWalkDto) {
    return 'This action adds a new game';
  }

  findAll() {
    return `This action returns all game`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
