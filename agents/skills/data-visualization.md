# Skill: 数据可视化
## 技能概述
使用轻量组件直观呈现评分、热度、价格和排名，不引入重量级图表库。
## 设计原则
1. 优先可读性，移动端一眼可懂
2. 组件复用优先，避免页面内重复实现
3. 可视化必须服务“决策动作”
## 推荐组件清单
- StarRating：评分星级+分数
- RatingBar：结构化评分条
- RankBadge：榜单名次标识
- PopularityBadge：热度分级
- PriceLevel：价格档位
- StudentCount：社交证明数字
- WalkTime：步行时长标签
- ExploreProgress：足迹进度圈
## 目录约定
- src/frontend/components/ui/StarRating.tsx
- src/frontend/components/ui/RatingBar.tsx
- src/frontend/components/ui/RankBadge.tsx
- src/frontend/components/ui/PopularityBadge.tsx
- src/frontend/components/ui/PriceLevel.tsx
- src/frontend/components/ui/StudentCount.tsx
- src/frontend/components/ui/WalkTime.tsx
- src/frontend/components/ui/ExploreProgress.tsx
## 数字展示规范
- >=10000 显示为 x.x万
- >=1000 显示为 x.xk
- 评分保留1位小数
- 步行时长用 min
## 颜色建议
- 高分/高热度：暖色强调
- 步行近：绿色或蓝绿色
- 步行远：灰色弱化
## 动效建议
- 评分条宽度变化可用 500-700ms 过渡
- 排名徽章避免连续闪动动画
## 验收标准
- [ ] 星级显示与评分数值一致
- [ ] 热度分级正确
- [ ] 价格档位标签符合区间
- [ ] 步行时间颜色分层合理
- [ ] 移动端375下无拥挤和错位
- [ ] 大数字格式化正确
