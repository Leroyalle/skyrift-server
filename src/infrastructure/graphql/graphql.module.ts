import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { IS_DEV } from 'src/common/lib/is-dev';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // sortSchema: true,
      playground: IS_DEV,
      context: ({ req, res }) => ({ req, res }),
      // installSubscriptionHandlers: true,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
    }),
  ],
  exports: [GraphQLModule],
})
export class GraphqlModule {}
