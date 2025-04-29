import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PagePagination {
  @Field(() => Int, {
    description: 'Страница',
    defaultValue: 1,
    nullable: true,
  })
  page: number;

  @Field(() => Int, {
    description: 'Количество',
    defaultValue: 20,
    nullable: true,
  })
  perPage: number;
}
