# Story Video Creator

这是一个故事视频创作平台，当前已实现 Phase 1 和 Phase 2 功能。

## Phase 1 - 基础项目骨架 ✅ 已完成

- 基础 monorepo 结构
- 后端 NestJS 应用（健康检查 + Project CRUD）
- 前端 Next.js 应用（项目列表、创建、详情）
- 简单本地数据存储

## Phase 2 - 故事到剧本到场景管线 ✅ 已完成

- **Script 模块**: 剧本数据结构和API
- **Scene 模块**: 场景数据结构和API
- **剧本生成API**: `POST /projects/:id/generate-script`
- **剧本获取API**: `GET /projects/:id/script`
- **前端剧本生成UI**: 在项目详情页添加生成按钮
- **剧本和场景展示**: 显示生成的剧本和拆分后的场景
- **Phase 2 状态跟踪**: 显示生成进度状态

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

### 基础接口

- GET `/health` - 健康检查
- GET `/projects` - 获取项目列表
- GET `/projects/:id` - 获取项目详情
- POST `/projects` - 创建项目

### Phase 2 接口

- POST `/projects/:id/generate-script` - 生成剧本
- GET `/projects/:id/script` - 获取剧本详情

## 页面

- `/` - 项目列表页
- `/create` - 创建项目页
- `/projects/[id]` - 项目详情页（包含Phase 2剧本生成功能）
