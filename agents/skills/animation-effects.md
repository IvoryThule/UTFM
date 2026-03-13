# Skill: 动效实现
## 技能概述
通过轻量动效提升反馈、引导和过渡体验，避免炫技和性能开销。
## 动效原则
1. 动效服务功能，不喧宾夺主
2. 优先使用 transform/opacity
3. 持续动画慎用，避免干扰阅读
4. 支持 reduced-motion 降级
## 推荐动效场景
- 按钮反馈：active:scale-95
- 卡片进场：slide-up + fade
- AI思考中：typing dots
- 推荐卡片：逐个延迟出现
- 收藏操作：heartbeat
- 底部面板：translateY 过渡
## Tailwind建议
- 常规过渡：duration-200
- 进出场：duration-300
- 大块内容：duration-500
## 目录约定
- src/frontend/styles/globals.css
- src/frontend/hooks/useScrollAnimation.ts
- src/frontend/components/business/AIPick/TypingIndicator.tsx
## 关键实现建议
1. 列表滚动渐入使用 IntersectionObserver，一次触发后注销。
2. 打字机效果速度控制在 20-40ms/字符。
3. 地图和长列表页面避免复杂阴影动画。
## 可访问性
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
## 验收标准
- [ ] 首屏组件按顺序进场
- [ ] AI思考动效稳定，无闪烁
- [ ] 推荐卡片分段进入，节奏自然
- [ ] 收藏反馈可感知
- [ ] 低性能设备无明显卡顿
- [ ] reduced-motion 可正常降级
