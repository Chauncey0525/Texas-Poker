# Git 辅助脚本 (PowerShell) - 自动创建和切换分支

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("feature", "fix")]
    [string]$Type,
    
    [Parameter(Mandatory=$true)]
    [string]$Name
)

# 颜色输出函数
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

# 生成完整分支名
$FullBranchName = "$Type/$Name"

Write-ColorOutput Cyan "正在准备创建分支: $FullBranchName"

# 1. 切换到 dev 分支
Write-ColorOutput Yellow "1. 切换到 dev 分支..."
git checkout dev
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "错误: 无法切换到 dev 分支"
    exit 1
}

# 2. 拉取最新代码
Write-ColorOutput Yellow "2. 拉取最新代码..."
git pull origin dev
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Yellow "警告: 拉取代码失败，继续..."
}

# 3. 检查分支是否已存在
$branchExists = git show-ref --verify --quiet "refs/heads/$FullBranchName" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput Yellow "分支 $FullBranchName 已存在，切换到该分支..."
    git checkout $FullBranchName
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "错误: 无法切换到分支 $FullBranchName"
        exit 1
    }
    Write-ColorOutput Green "已切换到分支: $FullBranchName"
} else {
    # 4. 创建新分支
    Write-ColorOutput Yellow "3. 创建新分支: $FullBranchName..."
    git checkout -b $FullBranchName
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "错误: 无法创建分支 $FullBranchName"
        exit 1
    }
    Write-ColorOutput Green "已创建并切换到分支: $FullBranchName"
}

# 5. 显示当前分支信息
Write-Output ""
Write-ColorOutput Green "✓ 准备就绪！"
Write-ColorOutput Cyan "当前分支: $FullBranchName"
Write-Output ""

Write-Output "下一步:"
if ($Type -eq "feature") {
    Write-Output "  1. 开始开发新功能"
    Write-Output "  2. git add ."
    Write-Output "  3. git commit -m `"feat: 功能描述`""
    Write-Output "  4. git push origin $FullBranchName"
} else {
    Write-Output "  1. 开始修复Bug"
    Write-Output "  2. git add ."
    Write-Output "  3. git commit -m `"fix: 修复描述`""
    Write-Output "  4. git push origin $FullBranchName"
}
