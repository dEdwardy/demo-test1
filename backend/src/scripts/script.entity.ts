export class Script {
  id: string;
  projectId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Script>) {
    Object.assign(this, partial);
    this.id = partial.id || this.generateId();
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
  }

  private generateId(): string {
    return 'script_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
