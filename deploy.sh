#!/bin/bash

# TaskMaster 简单部署脚本
# ISYS3001 配置管理项目

echo "🚀 开始部署 TaskMaster 应用..."

# 检查Git环境
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未找到Git，请先安装Git"
    exit 1
fi

echo "✅ 环境检查通过"

# 提交到Git
echo "📝 提交代码到Git..."
git add .

# 检查是否有变更
if git diff --staged --quiet; then
    echo "ℹ️  没有检测到代码变更"
else
    echo "输入提交信息 (按Enter使用默认信息):"
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="更新应用 $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    git commit -m "$commit_message"
    
    if [ $? -ne 0 ]; then
        echo "❌ Git提交失败"
        exit 1
    fi
    
    echo "✅ 代码提交完成"
fi

# 推送到远程仓库
echo "🔄 推送到远程仓库..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ 推送失败，请检查远程仓库配置"
    exit 1
fi

echo "✅ 推送完成"

echo "🎉 部署完成！"
echo ""
echo "🔗 相关链接:"
echo "   - GitHub仓库: https://github.com/YOUR_USERNAME/taskmaster-isys3001"
echo "   - 本地测试: 直接打开 index.html 文件"
