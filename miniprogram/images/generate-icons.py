#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成TabBar图标
使用PIL库创建简单的图标文件
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("需要安装PIL库: pip install Pillow")
    exit(1)

# 图标配置
ICON_SIZE = 81

# 图标配置：使用简单的几何图形
ICON_CONFIG = [
    {
        "name": "home",
        "draw_func": lambda draw, size, margin: draw_home_icon(draw, size, margin),
        "normal_color": (122, 126, 131),  # #7A7E83
        "active_color": (15, 52, 96)      # #0f3460
    },
    {
        "name": "simulation",
        "draw_func": lambda draw, size, margin: draw_game_icon(draw, size, margin),
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    },
    {
        "name": "replay",
        "draw_func": lambda draw, size, margin: draw_replay_icon(draw, size, margin),
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    },
    {
        "name": "knowledge",
        "draw_func": lambda draw, size, margin: draw_book_icon(draw, size, margin),
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    },
    {
        "name": "profile",
        "draw_func": lambda draw, size, margin: draw_user_icon(draw, size, margin),
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    }
]

def draw_home_icon(draw, size, margin):
    """绘制首页图标（房子）"""
    center = size // 2
    house_size = size - margin * 2
    
    # 房子主体（矩形）
    house_width = house_size * 0.6
    house_height = house_size * 0.5
    house_x = center - house_width // 2
    house_y = center - house_height // 2 + house_size * 0.1
    
    draw.rectangle(
        [house_x, house_y, house_x + house_width, house_y + house_height],
        outline=(255, 255, 255, 255),
        width=3
    )
    
    # 屋顶（三角形）
    roof_points = [
        (center, margin + house_size * 0.15),
        (house_x, house_y),
        (house_x + house_width, house_y)
    ]
    draw.polygon(roof_points, outline=(255, 255, 255, 255), width=3)
    
    # 门（小矩形）
    door_width = house_width * 0.3
    door_height = house_height * 0.4
    door_x = center - door_width // 2
    door_y = house_y + house_height - door_height
    
    draw.rectangle(
        [door_x, door_y, door_x + door_width, door_y + door_height],
        outline=(255, 255, 255, 255),
        width=2
    )

def draw_game_icon(draw, size, margin):
    """绘制游戏图标（游戏手柄）"""
    center = size // 2
    icon_size = size - margin * 2
    
    # 手柄主体（圆角矩形）
    body_width = icon_size * 0.7
    body_height = icon_size * 0.5
    body_x = center - body_width // 2
    body_y = center - body_height // 2
    
    # 绘制圆角矩形（用多个小矩形和圆形模拟）
    draw.rectangle(
        [body_x, body_y + 5, body_x + body_width, body_y + body_height - 5],
        outline=(255, 255, 255, 255),
        width=3
    )
    draw.ellipse(
        [body_x, body_y, body_x + 10, body_y + 10],
        outline=(255, 255, 255, 255),
        width=3
    )
    draw.ellipse(
        [body_x + body_width - 10, body_y, body_x + body_width, body_y + 10],
        outline=(255, 255, 255, 255),
        width=3
    )
    
    # 左侧按钮
    btn1_x = body_x - icon_size * 0.15
    btn1_y = center - 8
    draw.ellipse(
        [btn1_x - 6, btn1_y - 6, btn1_x + 6, btn1_y + 6],
        outline=(255, 255, 255, 255),
        width=2
    )
    
    # 右侧按钮
    btn2_x = body_x + body_width + icon_size * 0.15
    btn2_y = center - 8
    draw.ellipse(
        [btn2_x - 6, btn2_y - 6, btn2_x + 6, btn2_y + 6],
        outline=(255, 255, 255, 255),
        width=2
    )

def draw_replay_icon(draw, size, margin):
    """绘制复盘图标（图表/折线图）"""
    center = size // 2
    icon_size = size - margin * 2
    
    # 绘制图表背景框
    chart_x = margin + icon_size * 0.1
    chart_y = margin + icon_size * 0.2
    chart_width = icon_size * 0.8
    chart_height = icon_size * 0.6
    
    draw.rectangle(
        [chart_x, chart_y, chart_x + chart_width, chart_y + chart_height],
        outline=(255, 255, 255, 255),
        width=2
    )
    
    # 绘制折线（模拟数据趋势）
    line_points = [
        (chart_x + chart_width * 0.1, chart_y + chart_height * 0.7),
        (chart_x + chart_width * 0.3, chart_y + chart_height * 0.4),
        (chart_x + chart_width * 0.5, chart_y + chart_height * 0.5),
        (chart_x + chart_width * 0.7, chart_y + chart_height * 0.2),
        (chart_x + chart_width * 0.9, chart_y + chart_height * 0.3)
    ]
    
    for i in range(len(line_points) - 1):
        draw.line(
            [line_points[i], line_points[i + 1]],
            fill=(255, 255, 255, 255),
            width=3
        )
    
    # 绘制数据点
    for point in line_points:
        draw.ellipse(
            [point[0] - 3, point[1] - 3, point[0] + 3, point[1] + 3],
            fill=(255, 255, 255, 255)
        )

def draw_book_icon(draw, size, margin):
    """绘制知识库图标（书本）"""
    center = size // 2
    icon_size = size - margin * 2
    
    # 书本主体
    book_width = icon_size * 0.6
    book_height = icon_size * 0.7
    book_x = center - book_width // 2
    book_y = center - book_height // 2
    
    # 书封面
    draw.rectangle(
        [book_x, book_y, book_x + book_width, book_y + book_height],
        outline=(255, 255, 255, 255),
        width=3
    )
    
    # 书页线
    for i in range(3):
        line_y = book_y + book_height * (0.3 + i * 0.15)
        draw.line(
            [book_x + 5, line_y, book_x + book_width - 5, line_y],
            fill=(255, 255, 255, 255),
            width=1
        )
    
    # 书脊
    draw.line(
        [book_x, book_y, book_x, book_y + book_height],
        fill=(255, 255, 255, 255),
        width=4
    )

def draw_user_icon(draw, size, margin):
    """绘制用户图标（人形）"""
    center = size // 2
    icon_size = size - margin * 2
    
    # 头部（圆形）
    head_radius = icon_size * 0.15
    head_y = margin + icon_size * 0.25
    draw.ellipse(
        [center - head_radius, head_y - head_radius, 
         center + head_radius, head_y + head_radius],
        outline=(255, 255, 255, 255),
        width=3
    )
    
    # 身体（矩形）
    body_width = icon_size * 0.4
    body_height = icon_size * 0.35
    body_x = center - body_width // 2
    body_y = head_y + head_radius + 5
    
    draw.rectangle(
        [body_x, body_y, body_x + body_width, body_y + body_height],
        outline=(255, 255, 255, 255),
        width=3
    )

def create_icon(name, draw_func, color, output_path):
    """创建图标"""
    # 创建透明背景
    img = Image.new('RGBA', (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制图标
    draw_func(draw, ICON_SIZE, 10)
    
    # 将白色轮廓转换为指定颜色
    # 这里简化处理：直接使用指定颜色填充图标区域
    # 实际应该更精细地处理，但为了简化，我们创建一个带颜色的版本
    
    # 创建带颜色的版本
    colored_img = Image.new('RGBA', (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    colored_draw = ImageDraw.Draw(colored_img)
    
    # 绘制圆形背景
    margin = 8
    colored_draw.ellipse(
        [margin, margin, ICON_SIZE - margin, ICON_SIZE - margin],
        fill=color + (200,)  # 添加透明度
    )
    
    # 重新绘制图标（白色）
    draw_func(colored_draw, ICON_SIZE, 10)
    
    # 保存图片
    colored_img.save(output_path, 'PNG')
    print(f"已创建: {output_path}")

def main():
    """主函数"""
    # 确保输出目录存在
    output_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 生成所有图标
    for config in ICON_CONFIG:
        # 普通状态图标
        normal_path = os.path.join(output_dir, f"{config['name']}.png")
        create_icon(
            config['name'],
            config['draw_func'],
            config['normal_color'],
            normal_path
        )
        
        # 激活状态图标
        active_path = os.path.join(output_dir, f"{config['name']}-active.png")
        create_icon(
            config['name'],
            config['draw_func'],
            config['active_color'],
            active_path
        )
    
    print("\n所有图标已生成完成！")
    print(f"图标保存在: {output_dir}")

if __name__ == "__main__":
    main()
