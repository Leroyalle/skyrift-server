import { AppModule } from 'src/app.module';
import 'src/common/types/socket/socket';

import { NestFactory } from '@nestjs/core';

import { SeedService } from './seed.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    console.log('Running seed...');
    await seedService.run();
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seed:', error);
  } finally {
    await app.close();
  }
}

void runSeed();
