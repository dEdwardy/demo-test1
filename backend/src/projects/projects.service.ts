import { Injectable, Logger } from '@nestjs/common';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { ImagesService } from '../images/images.service';
import { ScriptsService } from '../scripts/scripts.service';
import { AudioService } from '../audio/audio.service';
import { ImageStatus, AudioStatus } from '../scenes/scene.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private readonly dataFile = path.join(__dirname, '../../data/projects.json');
  private projects: Project[] = [];

  constructor(
    private readonly imagesService: ImagesService,
    private readonly scriptsService: ScriptsService,
    private readonly audioService: AudioService
  ) {
    this.logger.log('ProjectsService 构造函数被调用');
    this.logger.log(`imagesService: ${imagesService ? '已注入' : '未注入'}`);
    this.logger.log(`scriptsService: ${scriptsService ? '已注入' : '未注入'}`);
    this.logger.log(`audioService: ${audioService ? '已注入' : '未注入'}`);
    this.loadProjects();
  }

  private loadProjects() {
    try {
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const parsed = JSON.parse(data);
        this.projects = parsed.map(
          (p: any) =>
            new Project({
              ...p,
              createdAt: new Date(p.createdAt),
              updatedAt: new Date(p.updatedAt),
            })
        );
      }
    } catch (error) {
      console.log('No existing projects data found, starting fresh');
      this.projects = [];
    }
  }

  private saveProjects() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.projects, null, 2));
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new Project({
      title: createProjectDto.title,
      story: createProjectDto.story,
    });

    this.projects.push(project);
    this.saveProjects();
    return project;
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findOne(id: string): Promise<Project | null> {
    return this.projects.find(project => project.id === id) || null;
  }

  async updateProjectScriptId(projectId: string, scriptId: string): Promise<Project | null> {
    const project = await this.findOne(projectId);
    if (!project) {
      return null;
    }

    project.scriptId = scriptId;
    project.updatedAt = new Date();
    this.saveProjects();

    return project;
  }

  /**
   * 为项目的所有场景生成图片
   */
  async generateImagesForProject(projectId: string): Promise<{
    success: boolean;
    message: string;
    generatedCount: number;
    results?: Array<{ sceneId: string; success: boolean; imagePath?: string }>;
  }> {
    this.logger.log(`开始生成图片，项目ID: ${projectId}`);

    const project = await this.findOne(projectId);
    if (!project) {
      this.logger.warn(`项目未找到: ${projectId}`);
      return {
        success: false,
        message: '项目不存在',
        generatedCount: 0,
      };
    }

    this.logger.log(`找到项目: ${project.title}, scriptId: ${project.scriptId}`);

    if (!project.scriptId) {
      this.logger.warn(`项目没有剧本: ${projectId}`);
      return {
        success: false,
        message: '项目尚未生成剧本，请先生成剧本',
        generatedCount: 0,
      };
    }

    // 获取项目的所有场景
    this.logger.log(`获取场景，scriptId: ${project.scriptId}`);
    const scenes = await this.scriptsService.findByScriptId(project.scriptId);
    this.logger.log(`找到 ${scenes?.length || 0} 个场景`);

    if (!scenes || scenes.length === 0) {
      this.logger.warn(`没有找到场景: ${project.scriptId}`);
      return {
        success: false,
        message: '项目没有场景，请先生成剧本和场景',
        generatedCount: 0,
      };
    }

    // 调试：检查场景数据
    this.logger.debug(`场景数据示例: ${JSON.stringify(scenes[0])}`);

    // 生成图片
    this.logger.log(`调用图片生成服务...`);
    const generationResult = await this.imagesService.generateSceneImages(scenes, projectId);
    this.logger.log(`图片生成结果: ${JSON.stringify(generationResult)}`);

    // 更新场景的图片信息
    for (const result of generationResult.results) {
      const scene = scenes.find(s => s.id === result.sceneId);
      if (scene && result.success && result.imagePath) {
        scene.imagePath = result.imagePath;
        scene.imageStatus = ImageStatus.COMPLETED;
        scene.updatedAt = new Date();
        this.logger.log(`场景 ${scene.id} 图片生成成功: ${result.imagePath}`);
      } else if (scene && !result.success) {
        scene.imageStatus = ImageStatus.FAILED;
        scene.updatedAt = new Date();
        this.logger.error(`场景 ${scene.id} 图片生成失败: ${result.error}`);
      }
    }

    // 保存更新后的场景
    this.logger.log(`保存更新后的场景...`);
    await this.scriptsService.saveScenes(scenes);

    const successfulCount = generationResult.results.filter(r => r.success).length;
    this.logger.log(`成功生成 ${successfulCount}/${scenes.length} 个场景的图片`);

    return {
      success: generationResult.success,
      message: generationResult.success
        ? `成功为 ${successfulCount}/${scenes.length} 个场景生成图片`
        : `图片生成完成，${successfulCount}/${scenes.length} 个场景成功`,
      generatedCount: successfulCount,
      results: generationResult.results,
    };
  }

  /**
   * 为项目的所有场景生成音频
   */
  async generateAudioForProject(projectId: string): Promise<{
    success: boolean;
    message: string;
    generatedCount: number;
    results?: Array<{ sceneId: string; success: boolean; audioPath?: string }>;
  }> {
    this.logger.log(`开始生成音频，项目ID: ${projectId}`);

    const project = await this.findOne(projectId);
    if (!project) {
      this.logger.warn(`项目未找到: ${projectId}`);
      return {
        success: false,
        message: '项目不存在',
        generatedCount: 0,
      };
    }

    this.logger.log(`找到项目: ${project.title}, scriptId: ${project.scriptId}`);

    if (!project.scriptId) {
      this.logger.warn(`项目没有剧本: ${projectId}`);
      return {
        success: false,
        message: '项目尚未生成剧本，请先生成剧本',
        generatedCount: 0,
      };
    }

    // 获取项目的所有场景
    this.logger.log(`获取场景，scriptId: ${project.scriptId}`);
    const scenes = await this.scriptsService.findByScriptId(project.scriptId);
    this.logger.log(`找到 ${scenes?.length || 0} 个场景`);

    if (!scenes || scenes.length === 0) {
      this.logger.warn(`没有找到场景: ${project.scriptId}`);
      return {
        success: false,
        message: '项目没有场景，请先生成剧本和场景',
        generatedCount: 0,
      };
    }

    // 生成音频
    this.logger.log(`调用音频生成服务...`);
    const generationResult = await this.audioService.generateSceneAudios(scenes, projectId);
    this.logger.log(`音频生成结果: ${JSON.stringify(generationResult)}`);

    // 更新场景的音频信息
    for (const result of generationResult.results) {
      const scene = scenes.find(s => s.id === result.sceneId);
      if (scene && result.success && result.audioPath) {
        scene.audioPath = result.audioPath;
        scene.audioStatus = AudioStatus.COMPLETED;
        scene.updatedAt = new Date();
        this.logger.log(`场景 ${scene.id} 音频生成成功: ${result.audioPath}`);
      } else if (scene && !result.success) {
        scene.audioStatus = AudioStatus.FAILED;
        scene.updatedAt = new Date();
        this.logger.error(`场景 ${scene.id} 音频生成失败: ${result.error}`);
      }
    }

    // 保存更新后的场景
    this.logger.log(`保存更新后的场景...`);
    await this.scriptsService.saveScenes(scenes);

    const successfulCount = generationResult.results.filter(r => r.success).length;
    this.logger.log(`成功生成 ${successfulCount}/${scenes.length} 个场景的音频`);

    return {
      success: generationResult.success,
      message: generationResult.success
        ? `成功为 ${successfulCount}/${scenes.length} 个场景生成音频`
        : `音频生成完成，${successfulCount}/${scenes.length} 个场景成功`,
      generatedCount: successfulCount,
      results: generationResult.results,
    };
  }
}
