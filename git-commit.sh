#!/bin/bash
# Git 自动提交脚本 - 根据当前分支类型自动选择提交信息前缀

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取当前分支名
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 检查是否在 git 仓库中
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 不在 Git 仓库中${NC}"
    exit 1
fi

echo -e "${BLUE}当前分支: ${CURRENT_BRANCH}${NC}"

# 根据分支类型确定提交前缀
if [[ $CURRENT_BRANCH == feature/* ]]; then
    PREFIX="feat"
    TYPE_NAME="新功能"
elif [[ $CURRENT_BRANCH == fix/* ]]; then
    PREFIX="fix"
    TYPE_NAME="Bug修复"
elif [[ $CURRENT_BRANCH == dev ]]; then
    PREFIX="chore"
    TYPE_NAME="开发维护"
else
    PREFIX="chore"
    TYPE_NAME="其他"
    echo -e "${YELLOW}警告: 当前分支不是 feature 或 fix 分支，使用默认前缀 'chore'${NC}"
fi

# 检查是否有未提交的更改
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}没有需要提交的更改${NC}"
    exit 0
fi

# 显示更改状态
echo -e "${YELLOW}检测到以下更改:${NC}"
git status --short

# 提示输入提交信息
echo ""
echo -e "${BLUE}提交类型: ${TYPE_NAME} (前缀: ${PREFIX})${NC}"
read -p "请输入提交信息: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    echo -e "${RED}错误: 提交信息不能为空${NC}"
    exit 1
fi

# 构建完整提交信息
FULL_MSG="${PREFIX}: ${COMMIT_MSG}"

# 确认提交
echo ""
echo -e "${YELLOW}提交信息: ${FULL_MSG}${NC}"
read -p "确认提交? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}已取消提交${NC}"
    exit 0
fi

# 添加所有更改
echo -e "${YELLOW}添加更改...${NC}"
git add .

# 提交
echo -e "${YELLOW}提交更改...${NC}"
git commit -m "$FULL_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 提交成功！${NC}"
    echo ""
    echo "下一步:"
    echo "  git push origin ${CURRENT_BRANCH}"
else
    echo -e "${RED}✗ 提交失败${NC}"
    exit 1
fi
