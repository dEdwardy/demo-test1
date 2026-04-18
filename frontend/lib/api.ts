import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Project {
  id: string;
  title: string;
  story: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  scriptId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  projectId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  scriptId: string;
  order: number;
  description: string;
  dialogue?: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  title: string;
  story: string;
}

export interface ScriptWithScenes {
  script: Script | null;
  scenes: Scene[];
}

export const projectsApi = {
  // 获取所有项目
  async getAll(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  // 获取单个项目
  async getById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // 创建项目
  async create(data: CreateProjectData): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  // 生成剧本
  async generateScript(projectId: string): Promise<{ script: Script; scenes: Scene[] }> {
    const response = await api.post<{ script: Script; scenes: Scene[] }>(
      `/projects/${projectId}/generate-script`
    );
    return response.data;
  },

  // 获取剧本和场景
  async getScript(projectId: string): Promise<ScriptWithScenes> {
    const response = await api.get<ScriptWithScenes>(`/projects/${projectId}/script`);
    return response.data;
  },
};

export default api;
