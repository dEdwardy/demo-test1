# 故事到视频生成平台 - 使用指南

## 📋 项目概述

这是一个完整的故事到视频生成平台，采用三阶段架构：

1. **Phase 1**: 基础项目骨架 - 项目管理、故事输入
2. **Phase 2**: 媒体生成 - 剧本生成、图片生成、音频生成
3. **Phase 3**: 视频合成 - 视频生成、文件服务

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+
- ffmpeg（视频生成必需）
- 至少2GB可用内存

### 安装依赖

```bash
# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd frontend && npm install
```

### 启动服务

```bash
# 启动后端服务（端口4000）
cd backend && npm run start:dev

# 启动前端服务（端口3000）
cd frontend && npm run dev
```

### 访问地址

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:4000
- **健康检查**: http://localhost:4000/health

## 📖 完整使用流程

### 第一步：创建项目

1. 访问 http://localhost:3000
2. 点击导航栏的"Create New Project"按钮
3. 填写项目信息：
   - **Title**: 项目标题（必填，如"森林探险"）
   - **Story**: 故事内容（必填，至少50字，建议200-500字）
4. 点击"Create Project"按钮提交

**API方式**:

```bash
curl -X POST http://localhost:4000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的故事",
    "story": "这是一个关于勇气和友谊的故事..."
  }'
```

### 第二步：生成剧本

1. 在项目列表页点击项目卡片
2. 进入项目详情页
3. 在"Actions"区域点击"Generate Script"按钮
4. 等待系统分析故事并生成剧本（约3-5秒）

**生成结果**:

- 创建1个剧本（包含标题、摘要、总时长）
- 创建8个场景（每个场景包含描述、对话、时长）
- 更新项目状态为"processing"

**API方式**:

```bash
curl -X POST http://localhost:4000/projects/{project_id}/generate-script
```

### 第三步：生成图片

1. 在项目详情页点击"Generate Images"按钮
2. 系统为每个场景生成对应的图片
3. 显示生成进度和状态

**生成结果**:

- 为每个场景生成PNG格式图片
- 图片保存在 `backend/data/images/{project_id}/`
- 可通过API访问：`http://localhost:4000/api/images/{project_id}/scene_{n}.png`

**API方式**:

```bash
curl -X POST http://localhost:4000/projects/{project_id}/generate-images
```

### 第四步：生成音频

1. 在项目详情页点击"Generate Audio"按钮
2. 系统为每个场景生成旁白音频
3. 显示生成进度和状态

**生成结果**:

- 为每个场景生成WAV格式音频
- 音频保存在 `backend/data/audio/{project_id}/`
- 可通过API访问：`http://localhost:4000/api/audio/{project_id}/scene_{n}.wav`

**API方式**:

```bash
curl -X POST http://localhost:4000/projects/{project_id}/generate-audio
```

### 第五步：生成视频（Phase 3）

1. 在项目详情页点击"Generate Video"按钮
2. 系统使用ffmpeg合成图片和音频
3. 显示视频生成进度

**生成过程**:

1. 为每个场景生成临时视频（图片+音频）
2. 合并所有场景视频为最终视频
3. 保存最终视频文件

**生成结果**:

- 最终视频：`backend/project-files/{project_id}/output/final-video.mp4`
- 临时文件：`backend/project-files/{project_id}/temp/`
- 可通过API访问：`http://localhost:4000/api/videos/{project_id}/final-video.mp4`

**API方式**:

```bash
curl -X POST http://localhost:4000/projects/{project_id}/generate-video
```

## 🔧 API参考

### 项目管理

| 方法 | 端点             | 描述         |
| ---- | ---------------- | ------------ |
| POST | `/projects`      | 创建新项目   |
| GET  | `/projects`      | 获取项目列表 |
| GET  | `/projects/{id}` | 获取项目详情 |

### 剧本生成

| 方法 | 端点                             | 描述         |
| ---- | -------------------------------- | ------------ |
| POST | `/projects/{id}/generate-script` | 生成剧本     |
| GET  | `/projects/{id}/script`          | 获取剧本信息 |

### 媒体生成

| 方法 | 端点                             | 描述         |
| ---- | -------------------------------- | ------------ |
| POST | `/projects/{id}/generate-images` | 生成图片     |
| POST | `/projects/{id}/generate-audio`  | 生成音频     |
| POST | `/projects/{id}/generate-video`  | 生成视频     |
| GET  | `/projects/{id}/video`           | 获取视频信息 |

### 静态文件服务

| 路径                                  | 描述         |
| ------------------------------------- | ------------ |
| `/api/images/{project_id}/{filename}` | 访问图片文件 |
| `/api/audio/{project_id}/{filename}`  | 访问音频文件 |
| `/api/videos/{project_id}/{filename}` | 访问视频文件 |

## 📁 文件结构

### 后端文件结构

```
backend/
├── src/
│   ├── projects/          # 项目管理模块
│   │   ├── project.entity.ts      # 项目实体
│   │   ├── projects.service.ts    # 项目服务
│   │   └── projects.controller.ts # 项目控制器
│   ├── scripts/           # 剧本管理模块
│   ├── images/            # 图片生成模块
│   ├── audio/             # 音频生成模块
│   ├── video/             # 视频合成模块（Phase 3）
│   └── main.ts            # 应用入口
├── data/                  # JSON数据存储
│   ├── projects.json      # 项目数据
│   ├── scripts.json       # 剧本数据
│   └── scenes.json        # 场景数据
├── project-files/         # 生成的文件
│   ├── {project_id}/
│   │   ├── temp/          # 临时文件
│   │   └── output/        # 最终输出
└── package.json           # 后端依赖
```

### 前端文件结构

```
frontend/
├── app/
│   ├── page.tsx           # 首页（项目列表）
│   ├── create/            # 创建项目页
│   │   └── page.tsx
│   ├── projects/          # 项目相关页面
│   │   ├── [id]/          # 项目详情页
│   │   │   └── page.tsx
│   │   └── page.tsx       # 项目列表页
│   └── layout.tsx         # 布局组件
├── components/            # 可复用组件
│   ├── ProjectCard.tsx    # 项目卡片
│   ├── ProgressTracker.tsx # 进度跟踪器
│   └── VideoPlayer.tsx    # 视频播放器
├── lib/
│   └── api.ts             # API客户端
└── package.json           # 前端依赖
```

## ⚠️ 注意事项

### 1. 环境配置

- **ffmpeg必需**: 视频生成功能需要ffmpeg，确保已安装：
  ```bash
  apt-get update && apt-get install -y ffmpeg
  ```
- **端口冲突**: 如果端口4000或3000被占用，可修改：
  - 后端端口：修改 `backend/src/main.ts` 中的 `port`
  - 前端端口：修改 `frontend/package.json` 中的 `dev` 脚本

### 2. 数据存储

- **JSON文件存储**: 当前使用JSON文件存储数据，适合开发和测试
- **文件路径**: 生成的文件保存在 `backend/` 目录下
- **数据备份**: 定期备份 `backend/data/` 目录

### 3. 性能考虑

- **内存使用**: 图片和视频生成可能占用较多内存
- **磁盘空间**: 确保有足够的磁盘空间存储生成的文件
- **并发处理**: 当前版本不支持并发处理多个项目

### 4. 错误处理

- **网络中断**: API调用失败时会显示错误信息
- **文件权限**: 确保应用有写入 `backend/data/` 和 `backend/project-files/` 的权限
- **ffmpeg错误**: 视频生成失败时检查ffmpeg是否安装正确

### 5. 安全注意事项

- **开发环境**: 当前为开发环境配置，生产环境需要：
  - 添加身份验证
  - 配置HTTPS
  - 设置文件上传限制
- **文件访问**: 静态文件服务开放了文件访问，注意文件权限管理
- **API保护**: 生产环境应添加API速率限制和认证

### 6. 测试数据

项目包含预生成的测试数据：

```bash
# 测试项目ID
proj_1776482389898_6g6g8m7p9

# 可以直接使用该ID测试视频生成
curl -X POST http://localhost:4000/projects/proj_1776482389898_6g6g8m7p9/generate-video
```

### 7. 开发调试

- **后端日志**: 查看 `backend/backend.log`
- **前端日志**: 查看 `frontend/frontend.log`
- **API测试**: 使用curl或Postman测试API
- **文件检查**: 直接查看生成的文件确认结果

## 🔄 工作流程状态

### 项目状态

- **draft**: 草稿状态（刚创建）
- **processing**: 处理中（生成剧本/图片/音频/视频）
- **completed**: 已完成（所有媒体生成完成）
- **failed**: 失败（某个步骤失败）

### 媒体状态

- **pending**: 等待生成
- **generating**: 生成中
- **completed**: 生成完成
- **failed**: 生成失败

## 🎯 最佳实践

### 故事编写建议

1. **长度适中**: 200-500字的故事效果最佳
2. **场景清晰**: 故事应有清晰的场景转换
3. **对话丰富**: 包含对话的场景更容易生成音频
4. **描述具体**: 具体的描述有助于生成准确的图片

### 性能优化

1. **分批处理**: 大量项目时建议分批处理
2. **监控资源**: 监控内存和CPU使用情况
3. **清理临时文件**: 定期清理 `backend/project-files/{project_id}/temp/` 目录
4. **日志管理**: 定期清理日志文件

### 故障排除

1. **检查服务状态**:

   ```bash
   # 检查后端
   curl http://localhost:4000/health

   # 检查前端
   curl http://localhost:3000
   ```

2. **检查依赖**:

   ```bash
   # 检查ffmpeg
   ffmpeg -version

   # 检查Node.js
   node --version
   ```

3. **查看日志**:

   ```bash
   # 后端日志
   tail -f backend/backend.log

   # 前端日志
   tail -f frontend/frontend.log
   ```

## 📈 扩展建议

### 短期改进

1. **进度显示**: 添加实时进度显示
2. **错误恢复**: 实现失败重试机制
3. **批量操作**: 支持批量生成媒体

### 长期规划

1. **数据库迁移**: 从JSON迁移到数据库（如PostgreSQL）
2. **队列系统**: 使用消息队列处理长时间任务
3. **云存储**: 集成云存储服务（如AWS S3）
4. **用户系统**: 添加用户认证和权限管理

## 📞 支持

### 常见问题

1. **Q: 图片生成失败？**
   A: 检查AI模拟服务，确保相关依赖已安装

2. **Q: 视频无法播放？**
   A: 检查ffmpeg安装，确保视频文件生成成功

3. **Q: API返回404？**
   A: 检查项目ID是否正确，服务是否正常运行

### 获取帮助

1. 查看项目文档
2. 检查日志文件
3. 测试API端点
4. 验证文件生成

---

_最后更新: 2026-04-18_
_版本: 1.0.0_
