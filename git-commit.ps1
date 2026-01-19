# Git 自动提交脚本 (PowerShell) - 根据当前分支类型自动选择提交信息前缀

# 颜色输出函数
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

# 获取当前分支名
$CurrentBranch = git rev-parse --abbrev-ref HEAD

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "错误: 不在 Git 仓库中"
    exit 1
}

Write-ColorOutput Cyan "当前分支: $CurrentBranch"

# 根据分支类型确定提交前缀
if ($CurrentBranch -match "^feature/") {
    $Prefix = "feat"
    $TypeName = "新功能"
} elseif ($CurrentBranch -match "^fix/") {
    $Prefix = "fix"
    $TypeName = "Bug修复"
} elseif ($CurrentBranch -eq "dev") {
    $Prefix = "chore"
    $TypeName = "开发维护"
} else {
    $Prefix = "chore"
    $TypeName = "其他"
    Write-ColorOutput Yellow "警告: 当前分支不是 feature 或 fix 分支，使用默认前缀 'chore'"
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-ColorOutput Yellow "没有需要提交的更改"
    exit 0
}

# 显示更改状态
Write-ColorOutput Yellow "检测到以下更改:"
git status --short

# 提示输入提交信息
Write-Output ""
Write-ColorOutput Cyan "提交类型: $TypeName (前缀: $Prefix)"
$CommitMsg = Read-Host "请输入提交信息"

if ([string]::IsNullOrWhiteSpace($CommitMsg)) {
    Write-ColorOutput Red "错误: 提交信息不能为空"
    exit 1
}

# 构建完整提交信息
$FullMsg = "$Prefix`: $CommitMsg"

# 确认提交
Write-Output ""
Write-ColorOutput Yellow "提交信息: $FullMsg"
$Confirm = Read-Host "确认提交? (y/n)"

if ($Confirm -ne "y" -and $Confirm -ne "Y") {
    Write-ColorOutput Yellow "已取消提交"
    exit 0
}

# 添加所有更改
Write-ColorOutput Yellow "添加更改..."
git add .

# 提交
Write-ColorOutput Yellow "提交更改..."
git commit -m $FullMsg

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput Green "✓ 提交成功！"
    Write-Output ""
    Write-Output "下一步:"
    Write-Output "  git push origin $CurrentBranch"
} else {
    Write-ColorOutput Red "✗ 提交失败"
    exit 1
}
