# PowerShell脚本：安全提交到Git（不自动push）
# 使用方法：.\提交脚本.ps1

# 设置编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Git提交助手 ===" -ForegroundColor Green
Write-Host ""

# 检查是否有未提交的更改
$status = git status --porcelain
if (-not $status) {
    Write-Host "没有需要提交的更改" -ForegroundColor Yellow
    exit
}

# 显示更改的文件
Write-Host "待提交的文件：" -ForegroundColor Cyan
git status --short
Write-Host ""

# 询问是否添加所有文件
$addAll = Read-Host "是否添加所有更改的文件？(Y/N，默认Y)"
if ($addAll -eq "" -or $addAll -eq "Y" -or $addAll -eq "y") {
    git add .
    Write-Host "已添加所有文件到暂存区" -ForegroundColor Green
} else {
    Write-Host "请手动使用 'git add <文件>' 添加文件" -ForegroundColor Yellow
    exit
}

Write-Host ""

# 创建临时commit信息文件
$commitMsgFile = "commit-msg-temp.txt"

# 询问commit类型
Write-Host "请选择commit类型：" -ForegroundColor Cyan
Write-Host "1. feat - 新功能"
Write-Host "2. fix - 修复bug"
Write-Host "3. docs - 文档更新"
Write-Host "4. style - 代码格式调整"
Write-Host "5. refactor - 代码重构"
Write-Host "6. perf - 性能优化"
Write-Host "7. test - 测试相关"
Write-Host "8. chore - 构建/工具/依赖更新"
Write-Host "9. 自定义"
$typeChoice = Read-Host "请输入选项 (1-9)"

$commitType = switch ($typeChoice) {
    "1" { "feat" }
    "2" { "fix" }
    "3" { "docs" }
    "4" { "style" }
    "5" { "refactor" }
    "6" { "perf" }
    "7" { "test" }
    "8" { "chore" }
    default { "" }
}

# 输入commit描述
Write-Host ""
$shortDesc = Read-Host "请输入简短的commit描述（必填）"
if (-not $shortDesc) {
    Write-Host "错误：commit描述不能为空" -ForegroundColor Red
    exit
}

# 构建commit信息
$commitMsg = ""
if ($commitType) {
    $commitMsg = "$commitType`: $shortDesc"
} else {
    $commitMsg = $shortDesc
}

# 询问是否需要详细说明
Write-Host ""
$needDetail = Read-Host "是否需要添加详细说明？(Y/N，默认N)"
if ($needDetail -eq "Y" -or $needDetail -eq "y") {
    Write-Host "请输入详细说明（每行一条，输入空行结束）：" -ForegroundColor Cyan
    $details = @()
    while ($true) {
        $line = Read-Host
        if (-not $line) {
            break
        }
        $details += "- $line"
    }
    if ($details.Count -gt 0) {
        $commitMsg += "`n`n" + ($details -join "`n")
    }
}

# 保存到文件（UTF-8编码）
[System.IO.File]::WriteAllText($commitMsgFile, $commitMsg, [System.Text.Encoding]::UTF8)

# 显示commit信息预览
Write-Host ""
Write-Host "=== Commit信息预览 ===" -ForegroundColor Green
Write-Host $commitMsg
Write-Host "======================" -ForegroundColor Green
Write-Host ""

# 确认提交
$confirm = Read-Host "确认提交？(Y/N，默认Y)"
if ($confirm -eq "" -or $confirm -eq "Y" -or $confirm -eq "y") {
    # 使用文件方式提交，确保UTF-8编码
    git commit -F $commitMsgFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "提交成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "请手动执行以下命令推送到远程：" -ForegroundColor Yellow
        Write-Host "  git push origin main" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "提交失败，请检查错误信息" -ForegroundColor Red
    }
} else {
    Write-Host "已取消提交" -ForegroundColor Yellow
}

# 清理临时文件
if (Test-Path $commitMsgFile) {
    Remove-Item $commitMsgFile
    Write-Host "已清理临时文件" -ForegroundColor Gray
}
