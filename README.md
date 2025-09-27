# TaskMaster - 任务管理应用

## 项目概述

TaskMaster是一个基于Web的任务管理应用，作为ISYS3001管理软件开发课程的配置管理和采购管理项目开发。该应用提供了直观的用户界面来管理日常任务，支持优先级设置、任务过滤和本地数据存储。

## 功能特性

- ✅ **任务管理**: 添加、编辑、删除和标记任务完成
- 🎯 **优先级系统**: 高、中、低三级优先级分类
- 🔍 **智能过滤**: 按状态筛选任务（全部/待完成/已完成）
- 💾 **本地存储**: 数据自动保存到浏览器本地存储
- 📱 **响应式设计**: 适配桌面和移动设备
- 🎨 **现代UI**: 美观的用户界面和流畅的动画效果
- 📊 **统计信息**: 实时显示任务完成情况

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Grid, Flexbox, CSS Animation
- **图标**: Font Awesome 6.0
- **存储**: localStorage API
- **部署**: Git版本控制

## 项目结构

```
taskmaster-app/
├── index.html          # 主HTML文件
├── styles.css          # 样式表
├── script.js           # 核心JavaScript功能
├── config.json         # 应用配置文件
├── package.json        # npm包管理文件
├── README.md           # 项目文档
├── .gitignore          # Git忽略文件
└── deploy.sh          # 简单部署脚本
```

## 安装和运行

### 直接使用

由于这是一个纯前端应用，您可以直接在浏览器中打开 `index.html` 文件使用。

### 本地服务器运行（可选）

如果需要使用本地服务器：

1. 克隆仓库:
```bash
git clone https://github.com/YOUR_USERNAME/taskmaster-isys3001.git
cd taskmaster-isys3001
```

2. 安装依赖:
```bash
npm install
```

3. 启动开发服务器:
```bash
npm start
```

4. 打开浏览器访问: `http://localhost:8080`

## 配置管理

### 版本控制策略

本项目采用Git进行版本控制，使用以下分支策略：

- `main`: 主分支，包含稳定的生产代码
- `develop`: 开发分支，用于集成新功能
- `feature/*`: 功能分支，用于开发具体功能
- `hotfix/*`: 热修复分支，用于紧急修复

### 环境配置

应用支持多环境配置，通过 `config.json` 文件管理：

- **开发环境**: 启用调试模式，使用本地存储
- **生产环境**: 禁用调试，使用远程API

### 部署配置

- **本地运行**: 直接打开 `index.html` 文件
- **服务器部署**: 使用 `deploy.sh` 脚本提交到Git仓库
- **GitHub托管**: 将代码推送到GitHub仓库

## 采购管理

### 所需工具和服务

1. **开发工具**:
   - Visual Studio Code (免费)
   - Git版本控制系统 (免费)
   - Node.js和npm (免费)

2. **第三方服务**:
   - GitHub仓库托管 (免费/付费)
   - Font Awesome图标库 (免费)
   - GitHub Pages部署 (免费)

3. **可选增强服务**:
   - 自定义域名服务
   - CDN加速服务
   - 监控和分析工具

详细的采购规划请参考项目提交的RFP文档。

## 开发规范

### 代码风格
- 使用ES6+语法
- 遵循驼峰命名规范
- 保持代码注释完整

### 提交规范
- 使用语义化提交信息
- 格式: `type(scope): description`
- 类型: feat, fix, docs, style, refactor, test, chore

### 测试规范
- 功能测试: 手动测试所有用户功能
- 兼容性测试: 测试主流浏览器兼容性
- 响应式测试: 测试不同设备尺寸

## 许可证

本项目采用MIT许可证。详情请参阅LICENSE文件。

## 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 联系信息

- 项目作者: ISYS3001学生
- 课程: ISYS3001 管理软件开发
- 学期: 2024年第二学期

## 项目状态

- ✅ 基础功能开发完成
- ✅ 配置管理实施
- ✅ 响应式设计完成
- 🔄 部署配置进行中
- 📋 文档编写进行中

---

*此项目是ISYS3001课程作业的一部分，展示了配置管理和采购管理的实际应用。*
