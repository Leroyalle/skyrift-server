import { CreateSkillProps } from '../../types/create-skill.type';

export class CreateSkillCommand {
  constructor(public readonly props: CreateSkillProps) {}
}
