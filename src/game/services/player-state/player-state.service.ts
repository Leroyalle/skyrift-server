import { Injectable } from '@nestjs/common';
import { CharacterService } from 'src/character/character.service';
import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisService } from 'src/redis/redis.service';
import { ActionType } from '../../types/pending-actions.type';
import { ApplySkillResult } from '../../types/attack/apply-skill-result.type';
import { ApplyAutoAttackResult } from '../../types/attack/apply-auto-attack-result.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { CachedLocation } from 'src/location/types/cashed-location.type';
import { Teleport } from 'src/location/types/teleport.type';
import { Socket } from 'socket.io';

@Injectable()
export class PlayerStateService {
  constructor(
    private readonly redisService: RedisService,
    private readonly characterService: CharacterService,
  ) {}

  private readonly playersStates: Map<string, LiveCharacter> = new Map();

  async join(character: LiveCharacter, locationId: string) {
    console.log('[join]', character);

    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(locationId),
      character.id,
    );

    await this.redisService.set(
      RedisKeysFactory.playerNameToId(character.name),
      character.id,
    );

    if (!this.playersStates.has(character.id)) {
      this.playersStates.set(character.id, {
        id: character.id,
        name: character.name,
        x: character.x,
        y: character.y,
        level: character.level,
        maxHp: character.maxHp,
        hp: character.hp,
        defense: character.defense,
        attackRange: character.attackRange,
        isAlive: character.isAlive,
        basePhysicalDamage: character.basePhysicalDamage,
        baseMagicDamage: character.baseMagicDamage,
        locationId: character.locationId,
        attackSpeed: character.attackSpeed,
        lastMoveAt: character.lastMoveAt,
        lastAttackAt: character.lastAttackAt,
        lastHpRegenerationTime: character.lastHpRegenerationTime,
        userId: character.userId,
        isAttacking: false,
        currentTarget: null,
        characterSkills: character.characterSkills,
        characterClass: character.characterClass,
      });
    }
  }

  public moveTo(
    character: LiveCharacter,
    position: {
      x: number;
      y: number;
    },
    lastMoveAt: number,
  ) {
    character.x = position.x;
    character.y = position.y;
    character.lastMoveAt = lastMoveAt;
  }

  async leave(userId: string, playerId: string, locationId: string) {
    this.playersStates.delete(playerId);

    await this.redisService.srem(
      RedisKeysFactory.locationPlayers(locationId),
      playerId,
    );

    await this.redisService.del(RedisKeysFactory.connectedPlayer(userId));
  }

  async syncCharacterToDb(characterId: string) {
    const playerState = this.playersStates.get(characterId);

    if (!playerState) return;
    const {
      lastMoveAt: _,
      lastAttackAt: __,
      lastHpRegenerationTime: ___,
      isAttacking: ____,
      userId: _____,
      ...croppedCharacter
    } = playerState;

    await this.redisService.hset(
      RedisKeysFactory.playerState(characterId),
      playerState,
    );

    await this.characterService.update(playerState.id, croppedCharacter);
    return playerState;
  }

  public getCharacterState(characterId: string) {
    return this.playersStates.get(characterId);
  }

  public getCharactersArray() {
    return Array.from(this.playersStates.values());
  }

  public autoAttack(
    attackerId: string,
    victimId: string,
    now: number,
  ): ApplyAutoAttackResult | undefined {
    const attacker = this.playersStates.get(attackerId);
    const victim = this.playersStates.get(victimId);

    if (!attacker || !victim || attacker.locationId !== victim.locationId)
      return;

    // TODO: calculate received damage with defense and other stats
    const receivedDamage = attacker.basePhysicalDamage;
    console.log('receivedDamage', receivedDamage);
    const remainingHp = Math.max(victim.hp - receivedDamage, 0);
    const isAlive = remainingHp !== 0;

    victim.hp = remainingHp;
    victim.isAlive = isAlive;

    attacker.lastAttackAt = now;

    return {
      targets: [
        { characterId: victim.id, hp: remainingHp, isAlive, receivedDamage },
      ],
      type: ActionType.AutoAttack,
      skillId: null,
      victimIsAlive: victim.isAlive,
    };
  }

  public applySkill(
    attackerId: string,
    victimId: string,
    skillId: string,
    now: number,
  ): ApplySkillResult | undefined {
    const attacker = this.playersStates.get(attackerId);
    const victim = this.playersStates.get(victimId);

    if (!attacker || !victim || attacker.locationId !== victim.locationId)
      return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (!characterSkill) return;

    // TODO: return message with time for cooldown
    if ((characterSkill.cooldownEnd ?? 0) > now) return;

    const receivedDamage = characterSkill.skill.damage;
    const remainingHp = Math.max(victim.hp - receivedDamage, 0);
    victim.hp = remainingHp;
    victim.isAlive = remainingHp > 0;

    characterSkill.lastUsedAt = now;
    characterSkill.cooldownEnd = now + characterSkill.skill.cooldownMs;

    attacker.lastAttackAt = now;

    return {
      attackResult: {
        targets: [
          {
            characterId: victim.id,
            hp: remainingHp,
            isAlive: remainingHp > 0,
            receivedDamage,
          },
        ],
        type: ActionType.Skill,
        skillId: characterSkill.id,
      },
      cooldown: {
        cooldownEnd: characterSkill.cooldownEnd,
        skillId: characterSkill.id,
      },
    };
  }

  applyAoESkill(attackerId: string, skillId: string, area: PositionDto) {
    const attacker = this.getCharacterState(attackerId);
    if (!attacker) return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (!characterSkill) return;

    if (characterSkill.skill.type !== SkillType.AoE) return;
  }

  public changeUserLocation(
    playerState: LiveCharacter,
    targetLocation: CachedLocation,
    teleport: Teleport,
    client: Socket,
  ) {
    playerState.locationId = targetLocation.id;
    playerState.x = teleport.targetX;
    playerState.y = teleport.targetY;

    client.userData = {
      ...client.userData,
      position: { x: playerState.x, y: playerState.y },
      locationId: playerState.locationId,
    };
  }
}
