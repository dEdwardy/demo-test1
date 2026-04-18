export enum ImageStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AudioStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class Scene {
  id: string;
  scriptId: string;
  order: number;
  description: string;
  dialogue?: string;
  duration: number; // in seconds
  imagePath?: string;
  imageStatus: ImageStatus;
  audioPath?: string;
  audioStatus: AudioStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Scene>) {
    Object.assign(this, partial);
    this.id = partial.id || this.generateId();
    this.order = partial.order || 0;
    this.duration = partial.duration || 5; // default 5 seconds
    this.imageStatus = partial.imageStatus || ImageStatus.PENDING;
    this.audioStatus = partial.audioStatus || AudioStatus.PENDING;
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
  }

  private generateId(): string {
    return 'scene_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
