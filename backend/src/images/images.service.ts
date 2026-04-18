import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { ImageStatus, Scene } from '../scenes/scene.entity';

export interface ImageGenerationResult {
  success: boolean;
  imagePath?: string;
  error?: string;
}

@Injectable()
export class ImagesService {
  private readonly imagesDir = join(process.cwd(), 'data', 'images');

  /**
   * 生成场景图片
   * 当前使用占位图片方案，后续可替换为真实AI图片生成API
   */
  async generateSceneImage(scene: Scene, projectId: string): Promise<ImageGenerationResult> {
    console.log(`[ImagesService] 开始生成场景图片，sceneId: ${scene.id}, projectId: ${projectId}`);

    try {
      // 确保图片目录存在
      console.log(`[ImagesService] 确保图片目录存在: ${this.imagesDir}`);
      await this.ensureImagesDirectory();

      // 生成图片文件名
      const imageFilename = `scene_${scene.id}.png`;
      const imagePath = join(this.imagesDir, projectId, imageFilename);
      console.log(`[ImagesService] 图片路径: ${imagePath}`);

      // 创建项目特定的图片目录
      const projectImageDir = join(this.imagesDir, projectId);
      console.log(`[ImagesService] 项目图片目录: ${projectImageDir}`);

      if (!existsSync(projectImageDir)) {
        console.log(`[ImagesService] 创建项目图片目录...`);
        await mkdir(projectImageDir, { recursive: true });
      }

      // 当前使用占位图片方案
      // 在实际应用中，这里会调用AI图片生成API（如DALL-E、Stable Diffusion等）
      console.log(`[ImagesService] 生成占位图片...`);
      await this.generatePlaceholderImage(scene, imagePath);

      console.log(`[ImagesService] 图片生成成功: ${imagePath}`);

      return {
        success: true,
        imagePath: `/api/images/${projectId}/${imageFilename}`,
      };
    } catch (error) {
      console.error('[ImagesService] 生成图片失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 生成占位图片（模拟图片生成）
   * 在实际应用中，这里会调用真实的图片生成API
   */
  private async generatePlaceholderImage(scene: Scene, imagePath: string): Promise<void> {
    // 创建一个简单的占位图片（实际项目中会生成真实图片）
    // 这里我们创建一个简单的文本图片作为占位

    // 在实际项目中，这里可能是：
    // 1. 调用DALL-E API
    // 2. 调用Stable Diffusion API
    // 3. 使用其他AI图片生成服务

    // 当前实现：创建一个简单的文本文件模拟图片
    const placeholderContent = `
      Scene ${scene.order + 1}: ${scene.description}
      ${scene.dialogue ? `Dialogue: ${scene.dialogue}` : ''}
      Duration: ${scene.duration}s
      Generated at: ${new Date().toISOString()}
    `;

    // 在实际项目中，这里应该是真正的图片二进制数据
    // 为了简单起见，我们保存为文本文件
    // 注意：为了测试，我们将.txt改为.png，但内容仍然是文本
    try {
      await writeFile(imagePath, placeholderContent.trim(), 'utf-8');
      console.log(`占位图片已生成: ${imagePath}`);
    } catch (error) {
      console.error(`生成占位图片失败: ${error.message}`);
      console.error(`图片路径: ${imagePath}`);
      throw error;
    }
  }

  /**
   * 确保图片目录存在
   */
  private async ensureImagesDirectory(): Promise<void> {
    if (!existsSync(this.imagesDir)) {
      await mkdir(this.imagesDir, { recursive: true });
    }
  }

  /**
   * 获取图片的HTTP访问URL
   */
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    // 如果已经是完整URL，直接返回
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // 否则返回相对于后端的路径
    return `/api${imagePath}`;
  }

  /**
   * 批量生成场景图片
   */
  async generateSceneImages(
    scenes: Scene[],
    projectId: string
  ): Promise<{
    success: boolean;
    results: Array<{ sceneId: string; success: boolean; imagePath?: string; error?: string }>;
  }> {
    const results = [];

    for (const scene of scenes) {
      const result = await this.generateSceneImage(scene, projectId);
      results.push({
        sceneId: scene.id,
        success: result.success,
        imagePath: result.imagePath,
        error: result.error,
      });
    }

    const allSuccess = results.every(r => r.success);
    return {
      success: allSuccess,
      results,
    };
  }
}
