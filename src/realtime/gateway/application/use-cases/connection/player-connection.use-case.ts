import { BAG_FACADE_TOKEN, type BagFacadePort } from 'src/modules/bag';
import { CHARACTER_FACADE_TOKEN, type CharacterFacadePort } from 'src/modules/character';
import { EFFECT_FACADE_TOKEN, type EffectFacadePort } from 'src/modules/effect';
import { EQUIPMENT_FACADE_TOKEN, type EquipmentFacadePort } from 'src/modules/equipment';
import {
  ITEM_INSTANCE_FACADE_TOKEN,
  ITEM_TEMPLATE_FACADE_TOKEN,
  type ItemInstanceFacadePort,
  type ItemTemplateFacadePort,
} from 'src/modules/item';
import { LOCATION_READER_FACADE_TOKEN, type LocationReaderFacadePort } from 'src/modules/location';
import { OWNED_SKILL_FACADE_TOKEN, type OwnedSkillFacadePort } from 'src/modules/owned-skill';
import { PLAYER_QUEST_READER_TOKEN, type PlayerQuestReaderPort } from 'src/modules/quest';
import { SKILL_FACADE_TOKEN, type SkillFacadePort } from 'src/modules/skill';
import { CONTAINER_INITIALIZER_TOKEN, type ContainerInitializerPort } from 'src/realtime/container';
import {
  CONNECT_PLAYER_USE_CASE_TOKEN,
  type ConnectPlayerUseCasePort,
} from 'src/realtime/player-session';
import { PLAYER_QUEST_FACADE_TOKEN, type PlayerQuestFacadePort } from 'src/realtime/quest';

import { Inject, Injectable } from '@nestjs/common';

import { ContainerInitializerMapper } from '../../mappers/container-initializer.mapper';
import { PlayerConnectionMapper } from '../../mappers/player-connection.mapper';
import { SessionClientMapper } from '../../mappers/session-client.mapper';
import type { SocketUserData } from '../../ports/socket-adapter.port';

@Injectable()
export class PlayerConnectionUseCase {
  constructor(
    @Inject(CONNECT_PLAYER_USE_CASE_TOKEN)
    private readonly connectPlayerUseCase: ConnectPlayerUseCasePort,
    @Inject(CHARACTER_FACADE_TOKEN) private readonly characterFacade: CharacterFacadePort,
    @Inject(LOCATION_READER_FACADE_TOKEN)
    private readonly locationReaderFacade: LocationReaderFacadePort,
    @Inject(OWNED_SKILL_FACADE_TOKEN) private readonly ownedSkillFacade: OwnedSkillFacadePort,
    @Inject(SKILL_FACADE_TOKEN) private readonly skillFacade: SkillFacadePort,
    @Inject(EFFECT_FACADE_TOKEN) private readonly effectFacade: EffectFacadePort,
    @Inject(BAG_FACADE_TOKEN) private readonly bagFacade: BagFacadePort,
    @Inject(EQUIPMENT_FACADE_TOKEN) private readonly equipmentFacade: EquipmentFacadePort,
    @Inject(ITEM_INSTANCE_FACADE_TOKEN) private readonly itemInstanceFacade: ItemInstanceFacadePort,
    @Inject(ITEM_TEMPLATE_FACADE_TOKEN) private readonly itemTemplateFacade: ItemTemplateFacadePort,
    @Inject(CONTAINER_INITIALIZER_TOKEN)
    private readonly containerInitializer: ContainerInitializerPort,
    @Inject(PLAYER_QUEST_FACADE_TOKEN) private readonly playerQuestFacade: PlayerQuestFacadePort,
    @Inject(PLAYER_QUEST_READER_TOKEN) private readonly playerQuestReader: PlayerQuestReaderPort,
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

    const bag = await this.bagFacade.getById(character.bagId);

    if (!bag) return;

    const bagItems = await this.itemInstanceFacade.findByContainerRef(character.bagId, 'bag');
    const bagItemTemplates = await this.itemTemplateFacade.findByIds(
      bagItems.map(item => item.templateId),
    );

    const equipment = await this.equipmentFacade.findById(character.equipmentId);

    if (!equipment) return;

    const equipmentItems = await this.itemInstanceFacade.findByContainerRef(
      character.equipmentId,
      'equipment',
    );
    const equipmentItemTemplates = await this.itemTemplateFacade.findByIds(
      equipmentItems.map(item => item.templateId),
    );

    const bagProps = ContainerInitializerMapper.toBagProps({
      bag,
      itemInstances: bagItems,
      itemTemplates: bagItemTemplates,
    });

    const equipmentProps = ContainerInitializerMapper.toEquipmentProps({
      equipment,
      itemInstances: equipmentItems,
      itemTemplates: equipmentItemTemplates,
    });

    const bagContainer = this.containerInitializer.initializeBag(bagProps);
    const equipmentContainer = this.containerInitializer.initializeEquipment(equipmentProps);

    const playerQuests = await this.playerQuestReader.findByCharacterId(character.id);

    for (const playerQuest of playerQuests) {
      this.playerQuestFacade.save(playerQuest);
    }

    const playerSessionSnapshot = await this.connectPlayerUseCase.execute(connectionPayload);

    const playerSession = SessionClientMapper.mapPlayerSession(playerSessionSnapshot);

    return {
      bag: bagContainer,
      equipment: equipmentContainer,
      player: playerSession,
    };
  }
}
