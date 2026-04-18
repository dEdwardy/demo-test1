# Story Video Creator - Phase 1

这是一个故事视频创作平台的基础骨架，当前仅实现 Phase 1 功能。

## Phase 1 功能

- 基础 monorepo 结构
- 后端 NestJS 应用（健康检查 + Project CRUD）
- 前端 Next.js 应用（项目列表、创建、详情）
- 简单本地数据存储

## 项目结构

```
story-video-creator/
├── backend/          # NestJS 后端
├── frontend/         # Next.js 前端
├── shared/           # 共享代码（预留）
└── package.json      # Workspace 配置
```

## 启动方式

```bash
# 安装所有依赖
npm run install:all

# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:backend
npm run dev:frontend
```

## 接口文档

- GET `/health` - 健康检查
- GET `/projects` - 获取项目列表
- GET `/projects/:id` - 获取项目详情
- POST `/projects` - 创建项目

## 页面

- `/` - 项目列表页
- `/create` - 创建项目页
- `/projects/[id]` - 项目详情页
