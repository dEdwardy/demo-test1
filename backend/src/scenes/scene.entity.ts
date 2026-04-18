export class Scene {
  id: string;
  scriptId: string;
  order: number;
  description: string;
  dialogue?: string;
  duration: number; // in seconds
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Scene>) {
    Object.assign(this, partial);
    this.id = partial.id || this.generateId();
    this.order = partial.order || 0;
    this.duration = partial.duration || 5; // default 5 seconds
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
  }

  private generateId(): string {
    return 'scene_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
