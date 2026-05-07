import { FactionName } from 'src/modules/faction/domain/types/faction.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('factions')
export class FactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: FactionName;

  @Column()
  logo!: string;

  @Column()
  description!: string;
}
