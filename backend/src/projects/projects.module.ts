import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ScriptsModule } from '../scripts/scripts.module';
import { ImagesModule } from '../images/images.module';
import { AudioModule } from '../audio/audio.module';

@Module({
  imports: [ScriptsModule, ImagesModule, AudioModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
