import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ScriptsService } from '../scripts/scripts.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { Script } from '../scripts/script.entity';
import { Scene } from '../scenes/scene.entity';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly scriptsService: ScriptsService
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project | null> {
    return this.projectsService.findOne(id);
  }

  @Post(':id/generate-script')
  async generateScript(@Param('id') id: string): Promise<{ script: Script; scenes: Scene[] }> {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if script already exists
    const existingScript = await this.scriptsService.findScriptByProjectId(id);
    if (existingScript) {
      const scenes = await this.scriptsService.findScenesByScriptId(existingScript.id);
      return { script: existingScript, scenes };
    }

    // Generate new script and scenes
    const result = await this.scriptsService.createScript(id, project.story);

    // Update project with scriptId
    await this.projectsService.updateProjectScriptId(id, result.script.id);

    return result;
  }

  @Get(':id/script')
  async getScript(@Param('id') id: string): Promise<{ script: Script | null; scenes: Scene[] }> {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    return this.scriptsService.findScriptWithScenes(id);
  }
}
