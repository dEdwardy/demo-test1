import { Injectable } from '@nestjs/common';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  private readonly dataFile = path.join(__dirname, '../../data/projects.json');
  private projects: Project[] = [];

  constructor() {
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
}
