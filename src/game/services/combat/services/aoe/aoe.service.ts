import { Injectable } from '@nestjs/common';
import { BatchUpdateAction, Target } from 'src/game/types/batch-update/batch-update-action.type';
import { ActiveAoEZone } from './types/active-aoe-zone.type';
import { SocketService } from 'src/game/services/socket/socket.service';
import { PlayerStateService } from 'src/game/services/characters/player-state/player-state.service';
import { SpatialGridService } from 'src/game/services/spatial-grid/spatial-grid.service';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { ActionType } from 'src/game/types/pending-actions.type';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { CharacterSkill } from 'src/characters/character/character-skill/entities/character-skill.entity';
import { PositionDto } from 'src/common/dto/position.dto';
import { v4 as uuidv4 } from 'uuid';
import { RuntimeEntityService } from 'src/game/services/runtime-entity/runtime-entity.service';
import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { isMob } from '../../lib/entity/guards/is-mob.lib';

@Injectable()
export class AoeService {
  constructor(
    private readonly socketService: SocketService,
    private readonly playerStateService: PlayerStateService,
    private readonly spatialGridService: SpatialGridService<TRuntimeEntity>,
    private readonly runtimeEntityService: RuntimeEntityService,
  ) {}

  private readonly activeAoEZones: Map<string, ActiveAoEZone> = new Map();

  public tickAoE() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();
    for (const zone of this.activeAoEZones.values()) {
      console.log('tickAoE', zone);
      const now = Date.now();

      if (now >= zone.expiresAt) {
        this.despawnAoEZone(zone);
        continue;
      }

      if (zone.lastUsedAt && now - zone.lastUsedAt <= 1000) continue;

      // FIXME: update for all entities
      const attacker = this.playerStateService.getCharacterState(zone.casterId);
      if (!attacker) {
        this.despawnAoEZone(zone);
        continue;
      }

      const cSkill = attacker.characterSkills.find(cSkill => cSkill.id === zone.skillId);

      if (!cSkill) {
        this.despawnAoEZone(zone);
        continue;
      }

      const { entities } = this.spatialGridService.queryRadius(
        zone.locationId,
        zone.x,
        zone.y,
        zone.radius,
      );

      // let batchLocation = updatesByLocation.get(zone.locationId);
      // if (!batchLocation) {
      //   batchLocation = [];
      //   updatesByLocation.set(zone.locationId, batchLocation);
      // }
      const batchLocation = getOrCreate(updatesByLocation, zone.locationId, () => []);

      const targets: Target[] = [];
      entities.forEach(({ id, type }) => {
        const victim = this.runtimeEntityService.getEntityByType(type, id);
        if (!victim || !cSkill.skill.damagePerSecond || !victim.isAlive) return;
        if (attacker.id === victim.id) return;
        const receivedDamage = cSkill.skill.damagePerSecond;
        const remainingHp = Math.max(victim.hp - receivedDamage, 0);
        victim.hp = remainingHp;
        victim.isAlive = remainingHp > 0;
        if (isMob(victim)) {
          victim.aggro.updateThreatMap(attacker, receivedDamage);
        }
        zone.lastUsedAt = now;
        targets.push({
          id: victim.id,
          type: victim.type,
          hp: victim.hp,
          isAlive: victim.isAlive,
          receivedDamage,
        });

        console.log('TICK AOE', victim.name, receivedDamage);
      });

      batchLocation.push({
        targets,
        type: ActionType.Skill,
        skillId: cSkill.id,
      });
    }

    for (const [locationId, update] of updatesByLocation.entries()) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.EntityStateUpdate,
        update,
      );
    }
  }

  public spawnAoeZone(
    caster: IRuntimeCharacter,
    cSkill: CharacterSkill,
    area: PositionDto,
    now: number,
  ) {
    if (!cSkill.skill.areaRadius || !cSkill.skill.duration) return;

    console.log('spawn AOE zone');

    const zoneId = uuidv4() as string;
    this.activeAoEZones.set(zoneId, {
      id: zoneId,
      casterId: caster.id,
      locationId: caster.locationId,
      skillId: cSkill.id,
      radius: cSkill.skill.areaRadius,
      x: area.x,
      y: area.y,
      expiresAt: cSkill.skill.duration + now,
      effects: cSkill.skill.effects ?? [],
      lastUsedAt: 0,
    });

    console.log('[spawnAoeZone] locationId', caster.locationId);

    this.socketService.sendTo(
      RedisKeys.Location + caster.locationId,
      ServerToClientEvents.AoESpawn,
      {
        id: zoneId,
        casterId: caster.id,
        skillId: cSkill.id,
        radius: cSkill.skill.areaRadius,
        x: area.x,
        y: area.y,
        expiresAt: cSkill.skill.duration + now,
      },
    );
  }

  private despawnAoEZone(zone: ActiveAoEZone) {
    console.log('despawnAoEZone', zone);
    this.activeAoEZones.delete(zone.id);
    this.socketService.sendTo(
      RedisKeys.Location + zone.locationId,
      ServerToClientEvents.AoERemove,
      { id: zone.id },
    );
  }

  public getActiveAoeZones(locationId: string) {
    return Array.from(this.activeAoEZones.values()).filter(zone => zone.locationId === locationId);
  }
}
