const fs = require('fs');
const path = require('path');

// 创建一个简单的PNG图标生成器
// 由于没有SVG转换工具，我们将创建一个基于Canvas的简单飞机图标

function createSimplePlaneIcon(size) {
    // 创建一个简单的base64编码的PNG数据
    // 这是一个蓝色飞机图标的简化版本
    
    const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="transparent"/>
        <!-- 飞机主体 -->
        <path d="M32 8L48 24L40 28L32 20L24 28L16 24L32 8Z" fill="#1a73e8"/>
        <!-- 飞机机身 -->
        <path d="M32 20L38 32L32 48L26 32L32 20Z" fill="#1a73e8"/>
        <!-- 左翼 -->
        <path d="M16 24L26 32L20 36L8 28L16 24Z" fill="#1565c0"/>
        <!-- 右翼 -->
        <path d="M48 24L56 28L44 36L38 32L48 24Z" fill="#1565c0"/>
        <!-- 尾翼 -->
        <path d="M26 32L32 48L38 32L34 40L30 40L26 32Z" fill="#0d47a1"/>
        <!-- 机头高光 -->
        <path d="M32 8L40 16L32 20L24 16L32 8Z" fill="#4285f4" opacity="0.8"/>
        <!-- 机身中央线 -->
        <path d="M32 20L32 48" stroke="#0d47a1" stroke-width="1" opacity="0.6"/>
    </svg>`;
    
    return canvas;
}

// 生成所有需要的图标尺寸
const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 64, name: 'favicon-64x64.png' },
    { size: 192, name: 'logo192.png' },
    { size: 512, name: 'logo512.png' }
];

const publicDir = path.join(__dirname, '..', 'public');

console.log('开始生成图标文件...');
console.log('注意：由于系统限制，将创建SVG版本的图标文件');

sizes.forEach(({ size, name }) => {
    const svgContent = createSimplePlaneIcon(size);
    const outputPath = path.join(publicDir, name.replace('.png', '.svg'));
    
    fs.writeFileSync(outputPath, svgContent);
    console.log(`✓ 生成成功: ${name.replace('.png', '.svg')} (${size}x${size})`);
});

console.log('图标生成完成！');