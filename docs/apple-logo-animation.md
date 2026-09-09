# 苹果 Logo 描边动画

## 实现说明

- 页面仅使用 React 输出的静态 HTML、内联 SVG 与 CSS 动画，不依赖 JavaScript 动画库。
- 两条 SVG 路径均通过 `pathLength="1"` 归一化长度，并以 `stroke-dasharray` 和 `stroke-dashoffset` 完成描边。
- 描边结束后提升 `fill-opacity`，再对完整图形、环境光与投影应用低幅度循环缩放，形成呼吸效果。
- `prefers-reduced-motion: reduce` 下会直接显示完成态，避免强制播放动画。
- 小屏布局会由左右排布切换为上下排布，并保持图形和文案居中。

## 动画节奏

1. 0–2.8 秒：主体与叶片轮廓依次绘制。
2. 2.8–4.2 秒：银白渐变填充出现，描边变细。
3. 4.65 秒后：图形、光晕与投影进入轻微循环呼吸。
