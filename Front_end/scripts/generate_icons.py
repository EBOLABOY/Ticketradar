#!/usr/bin/env python3
"""
图标生成脚本
将SVG图标转换为不同尺寸的PNG文件
"""

import os
import sys
from pathlib import Path

try:
    from cairosvg import svg2png
    from PIL import Image
    import io
except ImportError:
    print("错误: 缺少必要的依赖包")
    print("请运行: pip install cairosvg pillow")
    sys.exit(1)

def generate_png_from_svg(svg_path, output_path, size):
    """
    从SVG生成指定尺寸的PNG文件
    
    Args:
        svg_path (str): SVG文件路径
        output_path (str): 输出PNG文件路径
        size (int): 输出尺寸（正方形）
    """
    try:
        # 读取SVG文件
        with open(svg_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        # 转换SVG为PNG
        png_data = svg2png(
            bytestring=svg_content.encode('utf-8'),
            output_width=size,
            output_height=size
        )
        
        # 使用PIL优化PNG
        image = Image.open(io.BytesIO(png_data))
        
        # 确保是RGBA模式以支持透明度
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        # 保存优化后的PNG
        image.save(output_path, 'PNG', optimize=True)
        print(f"✓ 生成成功: {output_path} ({size}x{size})")
        
    except Exception as e:
        print(f"✗ 生成失败: {output_path} - {str(e)}")

def main():
    """主函数"""
    # 获取脚本所在目录
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # SVG源文件路径
    svg_path = project_root / "src" / "assets" / "images" / "blue_plane_icon.svg"
    
    # 输出目录
    public_dir = project_root / "public"
    
    # 检查SVG文件是否存在
    if not svg_path.exists():
        print(f"错误: SVG文件不存在: {svg_path}")
        sys.exit(1)
    
    # 确保输出目录存在
    public_dir.mkdir(exist_ok=True)
    
    # 定义要生成的图标尺寸和文件名
    icons_to_generate = [
        (16, "favicon-16x16.png"),
        (32, "favicon-32x32.png"),
        (64, "favicon-64x64.png"),
        (192, "logo192.png"),
        (512, "logo512.png")
    ]
    
    print("开始生成图标文件...")
    print(f"SVG源文件: {svg_path}")
    print(f"输出目录: {public_dir}")
    print("-" * 50)
    
    # 生成所有尺寸的PNG文件
    success_count = 0
    for size, filename in icons_to_generate:
        output_path = public_dir / filename
        generate_png_from_svg(str(svg_path), str(output_path), size)
        if output_path.exists():
            success_count += 1
    
    print("-" * 50)
    print(f"完成! 成功生成 {success_count}/{len(icons_to_generate)} 个图标文件")
    
    if success_count == len(icons_to_generate):
        print("所有图标文件生成成功! 🎉")
    else:
        print("部分图标文件生成失败，请检查错误信息")

if __name__ == "__main__":
    main()