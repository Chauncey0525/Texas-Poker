# 图片资源说明

## TabBar图标（需要生成）

需要在 `miniprogram/images/` 目录下创建以下图标文件：

1. `home.png` / `home-active.png` - 首页图标
2. `simulation.png` / `simulation-active.png` - 模拟练习图标
3. `replay.png` / `replay-active.png` - 复盘分析图标
4. `knowledge.png` / `knowledge-active.png` - 知识库图标
5. `profile.png` / `profile-active.png` - 个人中心图标

## 快速生成图标

### 方法一：使用Python脚本（推荐）

1. **安装依赖**
   ```bash
   pip install Pillow
   ```

2. **运行脚本**
   ```bash
   cd miniprogram/images
   python generate-icons.py
   ```

3. **检查生成的文件**
   脚本会在 `miniprogram/images/` 目录下生成所有需要的图标文件。

### 方法二：使用在线工具

1. 访问 [IconFont](https://www.iconfont.cn/) 或 [Iconify](https://iconify.design/)
2. 搜索相关图标并下载PNG格式（81×81px）
3. 使用图片编辑工具调整颜色：
   - 普通状态：#7A7E83（灰色）
   - 激活状态：#0f3460（深蓝色）

## 图标规格

- **尺寸**：81px × 81px（必须）
- **格式**：PNG（支持透明背景）
- **颜色**：
  - 普通状态：#7A7E83
  - 激活状态：#0f3460

## 配置图标

图标生成后，在 `app.json` 中恢复图标配置：

```json
"tabBar": {
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页",
      "iconPath": "images/home.png",
      "selectedIconPath": "images/home-active.png"
    }
  ]
}
```

## 当前状态

目前 `app.json` 已暂时移除了图标配置，只使用文字标签，这样可以先让项目运行起来。等图标准备好后再添加即可。
