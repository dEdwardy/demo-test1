import { Injectable } from '@nestjs/common';
import { Script } from './script.entity';
import { Scene } from '../scenes/scene.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScriptsService {
  private readonly scriptsFile = path.join(__dirname, '../../data/scripts.json');
  private readonly scenesFile = path.join(__dirname, '../../data/scenes.json');
  private scripts: Script[] = [];
  private scenes: Scene[] = [];

  constructor() {
    this.loadScripts();
    this.loadScenes();
  }

  private loadScripts() {
    try {
      const dataDir = path.dirname(this.scriptsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.scriptsFile)) {
        const data = fs.readFileSync(this.scriptsFile, 'utf8');
        const parsed = JSON.parse(data);
        this.scripts = parsed.map(
          (s: any) =>
            new Script({
              ...s,
              createdAt: new Date(s.createdAt),
              updatedAt: new Date(s.updatedAt),
            })
        );
      }
    } catch (error) {
      console.log('No existing scripts data found, starting fresh');
      this.scripts = [];
    }
  }

  private loadScenes() {
    try {
      const dataDir = path.dirname(this.scenesFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.scenesFile)) {
        const data = fs.readFileSync(this.scenesFile, 'utf8');
        const parsed = JSON.parse(data);
        this.scenes = parsed.map(
          (s: any) =>
            new Scene({
              ...s,
              createdAt: new Date(s.createdAt),
              updatedAt: new Date(s.updatedAt),
            })
        );
      }
    } catch (error) {
      console.log('No existing scenes data found, starting fresh');
      this.scenes = [];
    }
  }

  private saveScripts() {
    try {
      fs.writeFileSync(this.scriptsFile, JSON.stringify(this.scripts, null, 2));
    } catch (error) {
      console.error('Failed to save scripts:', error);
    }
  }

  private saveScenes() {
    try {
      fs.writeFileSync(this.scenesFile, JSON.stringify(this.scenes, null, 2));
    } catch (error) {
      console.error('Failed to save scenes:', error);
    }
  }

  // Mock AI: Generate script from story
  private generateScriptFromStory(story: string): string {
    // Simple mock logic - in Phase 3 this will be replaced with real AI
    return `SCRIPT BASED ON STORY: "${story.substring(0, 50)}..."

INT. LOCATION - DAY

This is a script generated from the story. The story talks about: ${story.substring(0, 100)}...

The script expands the narrative into a proper screenplay format with scenes, dialogue, and directions.

SCENE 1:
A character discovers something important related to the story.

SCENE 2:
The conflict develops as challenges arise.

SCENE 3:
The climax where the main event happens.

SCENE 4:
Resolution and conclusion of the story.

[End of generated script]`;
  }

  // Mock AI: Split script into scenes
  private splitScriptIntoScenes(
    scriptContent: string
  ): { description: string; dialogue?: string }[] {
    // Simple mock logic - split by "SCENE X:" markers or generate 3-5 scenes
    const scenes = [];

    // Try to find scene markers
    const sceneRegex = /SCENE\s+\d+:/gi;
    const matches = scriptContent.match(sceneRegex);

    if (matches && matches.length > 0) {
      // Use found scenes
      const parts = scriptContent.split(sceneRegex);
      for (let i = 1; i < parts.length; i++) {
        if (i <= 5) {
          // Max 5 scenes
          const description = parts[i].trim().substring(0, 200);
          scenes.push({
            description: `Scene ${i}: ${description}`,
            dialogue: i % 2 === 0 ? `Character dialogue for scene ${i}` : undefined,
          });
        }
      }
    }

    // If no scenes found or less than 3, generate mock scenes
    while (scenes.length < 3) {
      const sceneNum = scenes.length + 1;
      scenes.push({
        description: `Mock Scene ${sceneNum}: A scene generated from the script content`,
        dialogue: sceneNum % 2 === 0 ? `Mock dialogue for scene ${sceneNum}` : undefined,
      });
    }

    // Limit to 5 scenes max
    return scenes.slice(0, 5);
  }

  async createScript(
    projectId: string,
    story: string
  ): Promise<{ script: Script; scenes: Scene[] }> {
    // Generate script content
    const scriptContent = this.generateScriptFromStory(story);

    // Create script
    const script = new Script({
      projectId,
      content: scriptContent,
    });

    this.scripts.push(script);
    this.saveScripts();

    // Generate scenes from script
    const sceneData = this.splitScriptIntoScenes(scriptContent);
    const scenes: Scene[] = [];

    sceneData.forEach((data, index) => {
      const scene = new Scene({
        scriptId: script.id,
        order: index + 1,
        description: data.description,
        dialogue: data.dialogue,
        duration: 5 + index * 2, // Varying durations: 5, 7, 9, 11, 13 seconds
      });

      scenes.push(scene);
      this.scenes.push(scene);
    });

    this.saveScenes();

    return { script, scenes };
  }

  async findScriptByProjectId(projectId: string): Promise<Script | null> {
    return this.scripts.find(script => script.projectId === projectId) || null;
  }

  async findScenesByScriptId(scriptId: string): Promise<Scene[]> {
    return this.scenes
      .filter(scene => scene.scriptId === scriptId)
      .sort((a, b) => a.order - b.order);
  }

  async findScriptWithScenes(
    projectId: string
  ): Promise<{ script: Script | null; scenes: Scene[] }> {
    const script = await this.findScriptByProjectId(projectId);
    if (!script) {
      return { script: null, scenes: [] };
    }

    const scenes = await this.findScenesByScriptId(script.id);
    return { script, scenes };
  }
}
