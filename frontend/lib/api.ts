import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
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
  videoPath?: string;
  videoStatus: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  totalScenes: number;
  totalDuration: number;
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
  imagePath?: string;
  imageStatus: 'pending' | 'generating' | 'completed' | 'failed';
  audioPath?: string;
  audioStatus: 'pending' | 'generating' | 'completed' | 'failed';
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

export interface GenerateVideoResponse {
  success: boolean;
  message: string;
  videoPath?: string;
  ffmpegCommands?: string[];
}

export interface VideoInfoResponse {
  exists: boolean;
  videoPath?: string;
  videoStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  url?: string;
  size?: number;
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

  // 生成图片
  async generateImages(projectId: string): Promise<{
    success: boolean;
    message: string;
    generatedCount: number;
    results?: Array<{ sceneId: string; success: boolean; imagePath?: string }>;
  }> {
    const response = await api.post<{
      success: boolean;
      message: string;
      generatedCount: number;
      results?: Array<{ sceneId: string; success: boolean; imagePath?: string }>;
    }>(`/projects/${projectId}/generate-images`);
    return response.data;
  },

  // 生成音频
  async generateAudio(projectId: string): Promise<{
    success: boolean;
    message: string;
    generatedCount: number;
    results?: Array<{ sceneId: string; success: boolean; audioPath?: string }>;
  }> {
    const response = await api.post<{
      success: boolean;
      message: string;
      generatedCount: number;
      results?: Array<{ sceneId: string; success: boolean; audioPath?: string }>;
    }>(`/projects/${projectId}/generate-audio`);
    return response.data;
  },

  // 生成视频
  async generateVideo(projectId: string): Promise<GenerateVideoResponse> {
    const response = await api.post<GenerateVideoResponse>(`/projects/${projectId}/generate-video`);
    return response.data;
  },

  // 获取视频信息
  async getVideo(projectId: string): Promise<VideoInfoResponse> {
    const response = await api.get<VideoInfoResponse>(`/projects/${projectId}/video`);
    return response.data;
  },
};

export default api;
