# Git 快速使用指南

## 🚀 快速开始

### 1. 创建功能分支（新功能开发）

**Linux/Mac:**
```bash
./git-helper.sh feature 功能名称
# 例如: ./git-helper.sh feature user-login
```

**Windows PowerShell:**
```powershell
.\git-helper.ps1 -Type feature -Name 功能名称
# 例如: .\git-helper.ps1 -Type feature -Name user-login
```

### 2. 创建修复分支（Bug修复）

**Linux/Mac:**
```bash
./git-helper.sh fix 问题描述
# 例如: ./git-helper.sh fix room-list-loading
```

**Windows PowerShell:**
```powershell
.\git-helper.ps1 -Type fix -Name 问题描述
# 例如: .\git-helper.ps1 -Type fix -Name room-list-loading
```

### 3. 开发并提交

**使用自动提交脚本（推荐）:**

**Linux/Mac:**
```bash
# 1. 进行开发...
# 2. 运行自动提交脚本
./git-commit.sh
# 3. 输入提交信息（脚本会自动添加正确的前缀）
# 4. 推送到远程
git push origin feature/功能名称
```

**Windows PowerShell:**
```powershell
# 1. 进行开发...
# 2. 运行自动提交脚本
.\git-commit.ps1
# 3. 输入提交信息（脚本会自动添加正确的前缀）
# 4. 推送到远程
git push origin feature/功能名称
```

**手动提交:**
```bash
git add .
git commit -m "feat: 功能描述"  # feature分支
# 或
git commit -m "fix: 修复描述"   # fix分支
git push origin feature/功能名称
```

### 4. 合并到 dev 分支

```bash
# 切换到 dev 分支
git checkout dev
git pull origin dev

# 合并功能分支
git merge feature/功能名称
# 或
git merge fix/问题描述

# 推送到远程
git push origin dev
```

## 📋 分支命名规范

### Feature 分支
- 格式：`feature/功能名称`
- 使用小写字母和连字符
- 示例：
  - `feature/user-login`
  - `feature/room-chat`
  - `feature/multiplayer-game`

### Fix 分支
- 格式：`fix/问题描述`
- 使用小写字母和连字符
- 示例：
  - `fix/room-list-loading`
  - `fix/socket-connection`
  - `fix/game-state-sync`

## 🎯 提交信息规范

脚本会自动根据分支类型添加前缀：

- **feature 分支** → `feat: 描述`
- **fix 分支** → `fix: 描述`
- **dev 分支** → `chore: 描述`

示例：
- `feat: 添加用户登录功能`
- `fix: 修复房间列表加载失败的问题`
- `chore: 更新依赖包`

## 📊 完整工作流程示例

```bash
# 1. 创建功能分支
./git-helper.sh feature user-profile

# 2. 开发功能...
# (编写代码)

# 3. 提交更改
./git-commit.sh
# 输入: 添加用户资料页面
# 实际提交: feat: 添加用户资料页面

# 4. 推送到远程
git push origin feature/user-profile

# 5. 合并到 dev
git checkout dev
git pull origin dev
git merge feature/user-profile
git push origin dev

# 6. 清理（可选）
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

## ⚠️ 注意事项

1. **始终从 dev 分支创建新分支**
   - 脚本会自动切换到 dev 并拉取最新代码

2. **提交前检查**
   - 确保代码可以正常编译
   - 确保没有明显的bug

3. **合并前测试**
   - 在本地测试功能
   - 确保没有破坏现有功能

4. **保持分支干净**
   - 功能完成后及时合并
   - 合并后可以删除本地和远程分支

## 🔧 故障排除

### 脚本无法执行（Linux/Mac）
```bash
chmod +x git-helper.sh git-commit.sh
```

### PowerShell 执行策略限制（Windows）
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 分支已存在
脚本会自动检测并切换到已存在的分支。

## 📚 更多信息

详细说明请查看 [.git-workflow.md](.git-workflow.md)
