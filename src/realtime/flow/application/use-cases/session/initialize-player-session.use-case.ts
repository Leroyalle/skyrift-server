import type { SocketUserData } from 'src/infrastructure/ws';
import { CHARACTER_FACADE_TOKEN, type CharacterFacadePort } from 'src/modules/character';
import { EFFECT_FACADE_TOKEN, type EffectFacadePort } from 'src/modules/effect';
import { LOCATION_READER_FACADE_TOKEN, type LocationReaderFacadePort } from 'src/modules/location';
import { OWNED_SKILL_FACADE_TOKEN, type OwnedSkillFacadePort } from 'src/modules/owned-skill';
import { PLAYER_QUEST_READER_TOKEN, type PlayerQuestReaderPort } from 'src/modules/quest';
import { SKILL_FACADE_TOKEN, type SkillFacadePort } from 'src/modules/skill';
import {
  CONNECT_PLAYER_USE_CASE_TOKEN,
  type ConnectPlayerUseCasePort,
} from 'src/realtime/player-session';
import { PLAYER_QUEST_FACADE_TOKEN, type PlayerQuestFacadePort } from 'src/realtime/quest';

import { Inject, Injectable } from '@nestjs/common';

import { SessionClientMapper } from '../../../../shared/mappers/session-client.mapper';
import { PlayerConnectionMapper } from '../../mappers/player-connection.mapper';
import { RuntimeBagLoader } from '../../services/loaders/runtime-bag-loader.service';
import { RuntimeEquipmentLoader } from '../../services/loaders/runtime-equipment-loader.service';

@Injectable()
export class InitializePlayerSessionUseCase {
  constructor(
    @Inject(CONNECT_PLAYER_USE_CASE_TOKEN)
    private readonly connectPlayerUseCase: ConnectPlayerUseCasePort,
    @Inject(CHARACTER_FACADE_TOKEN) private readonly characterFacade: CharacterFacadePort,
    @Inject(LOCATION_READER_FACADE_TOKEN)
    private readonly locationReaderFacade: LocationReaderFacadePort,
    @Inject(OWNED_SKILL_FACADE_TOKEN) private readonly ownedSkillFacade: OwnedSkillFacadePort,
    @Inject(SKILL_FACADE_TOKEN) private readonly skillFacade: SkillFacadePort,
    @Inject(EFFECT_FACADE_TOKEN) private readonly effectFacade: EffectFacadePort,
    @Inject(PLAYER_QUEST_FACADE_TOKEN) private readonly playerQuestFacade: PlayerQuestFacadePort,
    @Inject(PLAYER_QUEST_READER_TOKEN) private readonly playerQuestReader: PlayerQuestReaderPort,

    private readonly runtimeBagLoader: RuntimeBagLoader,
    private readonly runtimeEquipmentLoader: RuntimeEquipmentLoader,
  ) {}

  public async execute(payload: SocketUserData) {
    const character = await this.characterFacade.findById(payload.userId, payload.characterId);

    if (!character) return;

    const location = await this.locationReaderFacade.get(character.locationId);

    if (!location) return;

    const ownedSkills = await this.ownedSkillFacade.findOwnedSkills({
      id: character.id,
      type: 'player',
    });

    const skills = await this.skillFacade.findByIds(ownedSkills.map(skill => skill.skillId));

    const effects = await this.effectFacade.findEffectsBySkillIds(skills.map(skill => skill.id));

    const connectionPayload = PlayerConnectionMapper.toSessionProps({
      character,
      skills,
      effects,
      ownedSkills,
    });

    if (!character.equipmentId || !character.bagId) throw new Error('Character is not initialized');

    const bagContainer = await this.runtimeBagLoader.execute(character.bagId);
    const equipmentContainer = await this.runtimeEquipmentLoader.execute(character.equipmentId);

    const playerQuests = await this.playerQuestReader.findByCharacterId(character.id);

    for (const playerQuest of playerQuests) {
      this.playerQuestFacade.save(playerQuest);
    }

    const playerSessionSnapshot = await this.connectPlayerUseCase.execute(connectionPayload);

    const playerSession = SessionClientMapper.mapPlayerSession(
      playerSessionSnapshot,
      equipmentContainer,
    );

    return {
      bag: bagContainer,
      player: playerSession,
    };
  }
}
