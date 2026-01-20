#!/bin/bash
# Git 辅助脚本 - 自动创建和切换分支

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示使用说明
show_usage() {
    echo -e "${BLUE}Git 辅助脚本${NC}"
    echo ""
    echo "用法:"
    echo "  ./git-helper.sh <类型> <名称>"
    echo ""
    echo "类型:"
    echo "  feature  - 创建新功能分支"
    echo "  fix      - 创建Bug修复分支"
    echo ""
    echo "示例:"
    echo "  ./git-helper.sh feature user-login"
    echo "  ./git-helper.sh fix room-list-loading"
    echo ""
}

# 检查参数
if [ $# -lt 2 ]; then
    show_usage
    exit 1
fi

BRANCH_TYPE=$1
BRANCH_NAME=$2

# 验证分支类型
if [ "$BRANCH_TYPE" != "feature" ] && [ "$BRANCH_TYPE" != "fix" ]; then
    echo -e "${RED}错误: 分支类型必须是 'feature' 或 'fix'${NC}"
    show_usage
    exit 1
fi

# 验证分支名称
if [ -z "$BRANCH_NAME" ]; then
    echo -e "${RED}错误: 分支名称不能为空${NC}"
    show_usage
    exit 1
fi

# 生成完整分支名
FULL_BRANCH_NAME="${BRANCH_TYPE}/${BRANCH_NAME}"

echo -e "${BLUE}正在准备创建分支: ${FULL_BRANCH_NAME}${NC}"

# 1. 切换到 dev 分支
echo -e "${YELLOW}1. 切换到 dev 分支...${NC}"
git checkout dev
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 无法切换到 dev 分支${NC}"
    exit 1
fi

# 2. 拉取最新代码
echo -e "${YELLOW}2. 拉取最新代码...${NC}"
git pull origin dev
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}警告: 拉取代码失败，继续...${NC}"
fi

# 3. 检查分支是否已存在
if git show-ref --verify --quiet refs/heads/"${FULL_BRANCH_NAME}"; then
    echo -e "${YELLOW}分支 ${FULL_BRANCH_NAME} 已存在，切换到该分支...${NC}"
    git checkout "${FULL_BRANCH_NAME}"
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 无法切换到分支 ${FULL_BRANCH_NAME}${NC}"
        exit 1
    fi
    echo -e "${GREEN}已切换到分支: ${FULL_BRANCH_NAME}${NC}"
else
    # 4. 创建新分支
    echo -e "${YELLOW}3. 创建新分支: ${FULL_BRANCH_NAME}...${NC}"
    git checkout -b "${FULL_BRANCH_NAME}"
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 无法创建分支 ${FULL_BRANCH_NAME}${NC}"
        exit 1
    fi
    echo -e "${GREEN}已创建并切换到分支: ${FULL_BRANCH_NAME}${NC}"
fi

# 5. 显示当前分支信息
echo ""
echo -e "${GREEN}✓ 准备就绪！${NC}"
echo -e "${BLUE}当前分支: ${FULL_BRANCH_NAME}${NC}"
echo ""
echo "下一步:"
if [ "$BRANCH_TYPE" == "feature" ]; then
    echo "  1. 开始开发新功能"
    echo "  2. git add ."
    echo "  3. git commit -m \"feat: 功能描述\""
    echo "  4. git push origin ${FULL_BRANCH_NAME}"
else
    echo "  1. 开始修复Bug"
    echo "  2. git add ."
    echo "  3. git commit -m \"fix: 修复描述\""
    echo "  4. git push origin ${FULL_BRANCH_NAME}"
fi
