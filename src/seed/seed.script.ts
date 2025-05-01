import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    console.log('Running seed...');
    await seedService.run();
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error running seed:', error);
  } finally {
    await app.close();
  }
}

runSeed();
