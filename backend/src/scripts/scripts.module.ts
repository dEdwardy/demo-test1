import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';

@Module({
  providers: [ScriptsService],
  exports: [ScriptsService],
})
export class ScriptsModule {}
