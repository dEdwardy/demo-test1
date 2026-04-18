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

  @Post(':id/generate-images')
  async generateImages(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
    generatedCount: number;
    results?: Array<{ sceneId: string; success: boolean; imagePath?: string }>;
  }> {
    console.log(`[ProjectsController] generateImages called for project: ${id}`);

    const project = await this.projectsService.findOne(id);
    if (!project) {
      console.log(`[ProjectsController] Project not found: ${id}`);
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    console.log(
      `[ProjectsController] Project found: ${project.title}, scriptId: ${project.scriptId}`
    );

    const result = await this.projectsService.generateImagesForProject(id);
    console.log(`[ProjectsController] generateImages result:`, JSON.stringify(result, null, 2));

    return result;
  }

  @Post(':id/generate-audio')
  async generateAudio(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
    generatedCount: number;
    results?: Array<{ sceneId: string; success: boolean; audioPath?: string }>;
  }> {
    console.log(`[ProjectsController] generateAudio called for project: ${id}`);

    const project = await this.projectsService.findOne(id);
    if (!project) {
      console.log(`[ProjectsController] Project not found: ${id}`);
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    console.log(
      `[ProjectsController] Project found: ${project.title}, scriptId: ${project.scriptId}`
    );

    const result = await this.projectsService.generateAudioForProject(id);
    console.log(`[ProjectsController] generateAudio result:`, JSON.stringify(result, null, 2));

    return result;
  }
}
