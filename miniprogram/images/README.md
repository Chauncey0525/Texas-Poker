# 图片资源说明

## TabBar图标

本目录包含微信小程序 TabBar 所需的图标文件。

### 图标列表

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
2. 搜索以下图标：
   - 首页：home, house
   - 模拟：game, controller
   - 复盘：chart, replay
   - 知识库：book, library
   - 我的：user, profile
3. 下载PNG格式，尺寸选择 81×81px
4. 使用图片编辑工具调整颜色：
   - 普通状态：#7A7E83（灰色）
   - 激活状态：#0f3460（深蓝色）

### 方法三：使用SVG转PNG

1. 创建SVG图标文件
2. 使用在线工具转换为PNG：https://svgtopng.com/
3. 调整尺寸为 81×81px

## 图标规格要求

- **尺寸**：81px × 81px（必须）
- **格式**：PNG（支持透明背景）
- **颜色**：
  - 普通状态：#7A7E83（灰色）
  - 激活状态：#0f3460（深蓝色）

## 图标设计建议

1. **简洁明了**：图标应该一眼就能识别功能
2. **风格统一**：所有图标使用相同的设计风格
3. **对比度**：确保在白色背景上清晰可见
4. **尺寸适中**：图标内容不要太小，留出适当边距
5. **使用简洁的线条图标**

## 配置图标

图标文件准备好后，在 `app.json` 中已配置好图标路径：

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

只需确保图标文件存在即可，配置已经完成。
