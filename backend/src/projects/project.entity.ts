export class Project {
  id: string;
  title: string;
  story: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  scriptId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Project>) {
    Object.assign(this, partial);
    this.id = partial.id || this.generateId();
    this.status = partial.status || 'draft';
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
  }

  private generateId(): string {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
