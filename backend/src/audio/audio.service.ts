import { Injectable, Logger } from '@nestjs/common';
import { Scene, AudioStatus } from '../scenes/scene.entity';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface AudioGenerationResult {
  success: boolean;
  audioPath?: string;
  error?: string;
}

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private readonly audioDir = path.join(__dirname, '../../data/audio');

  /**
   * 为单个场景生成音频
   */
  async generateSceneAudio(scene: Scene, projectId: string): Promise<AudioGenerationResult> {
    this.logger.log(`为场景生成音频: ${scene.id}, 项目: ${projectId}`);

    try {
      // 确保音频目录存在
      await this.ensureAudioDirectory();

      // 创建项目音频目录
      const projectAudioDir = path.join(this.audioDir, projectId);
      if (!(await this.exists(projectAudioDir))) {
        await fs.mkdir(projectAudioDir, { recursive: true });
        this.logger.log(`创建项目音频目录: ${projectAudioDir}`);
      }

      // 生成音频文件名
      const audioFilename = `scene_${scene.id}.wav`;
      const audioPath = path.join(projectAudioDir, audioFilename);

      // 生成音频文件
      await this.generatePlaceholderAudio(scene, audioPath);

      this.logger.log(`音频生成成功: ${audioPath}`);

      return {
        success: true,
        audioPath: `/api/audio/${projectId}/${audioFilename}`,
      };
    } catch (error) {
      this.logger.error(`生成音频失败: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 批量生成场景音频
   */
  async generateSceneAudios(
    scenes: Scene[],
    projectId: string
  ): Promise<{
    success: boolean;
    results: Array<{ sceneId: string; success: boolean; audioPath?: string; error?: string }>;
  }> {
    this.logger.log(`批量生成音频，项目: ${projectId}, 场景数量: ${scenes.length}`);

    const results = [];

    for (const scene of scenes) {
      const result = await this.generateSceneAudio(scene, projectId);
      results.push({
        sceneId: scene.id,
        success: result.success,
        audioPath: result.audioPath,
        error: result.error,
      });
    }

    const allSuccess = results.every(r => r.success);
    return {
      success: allSuccess,
      results,
    };
  }

  /**
   * 生成占位音频（模拟TTS生成）
   * 在实际应用中，这里会调用真实的TTS API
   */
  private async generatePlaceholderAudio(scene: Scene, audioPath: string): Promise<void> {
    // 在实际项目中，这里可能是：
    // 1. 调用OpenAI TTS API
    // 2. 调用Google Cloud Text-to-Speech
    // 3. 调用Amazon Polly
    // 4. 使用本地TTS引擎

    // 当前实现：创建一个简单的WAV文件头+静音数据
    // 这是一个最小化的WAV文件（44字节头 + 静音数据）

    const sampleRate = 44100; // 44.1kHz
    const duration = scene.duration || 5; // 秒
    const numSamples = sampleRate * duration;

    // 创建WAV文件头
    const wavHeader = this.createWavHeader(sampleRate, numSamples);

    // 创建静音数据（全零）
    const silentData = new Uint8Array(numSamples * 2); // 16-bit = 2 bytes per sample

    // 合并头和数据
    const wavData = new Uint8Array(wavHeader.length + silentData.length);
    wavData.set(wavHeader);
    wavData.set(silentData, wavHeader.length);

    // 写入文件
    await fs.writeFile(audioPath, Buffer.from(wavData));

    this.logger.log(`占位音频已生成: ${audioPath}, 时长: ${duration}秒`);
  }

  /**
   * 创建WAV文件头
   */
  private createWavHeader(sampleRate: number, numSamples: number): Uint8Array {
    // WAV文件格式参考：http://soundfile.sapp.org/doc/WaveFormat/
    const bytesPerSample = 2; // 16-bit
    const numChannels = 1; // 单声道
    const byteRate = sampleRate * numChannels * bytesPerSample;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = numSamples * bytesPerSample;
    const fileSize = 36 + dataSize;

    const header = new Uint8Array(44);
    const view = new DataView(header.buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true); // Bits per sample

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    return header;
  }

  /**
   * 将字符串写入DataView
   */
  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /**
   * 确保音频目录存在
   */
  private async ensureAudioDirectory(): Promise<void> {
    if (!(await this.exists(this.audioDir))) {
      await fs.mkdir(this.audioDir, { recursive: true });
      this.logger.log(`创建音频目录: ${this.audioDir}`);
    }
  }

  /**
   * 检查文件或目录是否存在
   */
  private async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取音频的HTTP访问URL
   */
  getAudioUrl(audioPath: string): string {
    if (!audioPath) return '';

    // 如果已经是完整URL，直接返回
    if (audioPath.startsWith('http')) {
      return audioPath;
    }

    // 否则返回相对于后端的路径
    return `/api${audioPath}`;
  }
}
