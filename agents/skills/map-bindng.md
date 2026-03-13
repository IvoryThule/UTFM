# Skill: 地图集成
## 技能概述
为大学城美食地图提供以高校为中心的地图浏览能力，支持餐厅点位、筛选和信息卡交互。
## 方案选型
### 方案A：高德地图 JS API（推荐）
- 国内可用性高，中文POI友好
- 交互完整：缩放、拖拽、信息窗体
- 适合展示“以高校为锚点”的空间决策能力
### 方案B：纯CSS模拟地图（兜底）
- 无需Key，零外部依赖
- 适合时间紧或网络受限场景
- 可点击但交互能力弱于真实地图
## 对比
| 维度 | 高德API | CSS模拟 |
|---|---|---|
| 真实感 | 高 | 中 |
| 交互能力 | 缩放/拖拽/点位交互 | 仅点击 |
| 接入成本 | 需要Key | 无 |
| 推荐场景 | 演示出彩优先 | 快速兜底优先 |
## 目录约定
- src/frontend/components/business/FoodMap/index.tsx
- src/frontend/components/business/FoodMap/MapMarker.tsx
- src/frontend/components/business/FoodMap/InfoCard.tsx
- src/frontend/components/business/FoodMap/MapFilter.tsx
- src/frontend/components/business/FoodMap/WalkCircle.tsx
## 关键实现规范
### 1. 地图中心点
以当前高校坐标作为中心点，切换高校时平滑更新。
### 2. Marker编码
- 颜色按品类编码
- 尺寸按热度编码
- 点击Marker弹出InfoCard
### 3. 步行时间圈
按 80m/min 估算 5/10/15 分钟圈层，强调可达性。
### 4. 筛选联动
筛选条件建议包含：
- category
- priceRange
- maxWalkMinutes
- timeSlot
变化后需同步：
- 地图点位
- 列表数据
- 结果计数
## 高德API接入最小步骤
1. 安装依赖
```bash
npm install @amap/amap-jsapi-loader
```
2. 申请Key并放入环境变量
```env
NEXT_PUBLIC_AMAP_KEY=your_key
```
3. 客户端懒加载地图，初始展示骨架屏。
## CSS兜底实现思路
1. 使用底图图片（public/images/map-background.png）
2. 经纬度转换为像素坐标
3. 使用 absolute 放置点位并支持点击
## 性能建议
1. 点位数量控制在 20-30，Demo无需聚合
2. 地图组件 dynamic import
3. 同时只允许一个信息窗体打开
4. 移动端手势冲突要做限制（地图区域内优先地图手势）
## 验收标准
- [ ] 地图按高校中心正确渲染
- [ ] 切换高校后中心点与点位同步更新
- [ ] 点位颜色和品类一致
- [ ] 点击点位可见信息卡片
- [ ] 筛选后点位数量实时变化
- [ ] 移动端375宽度可正常交互
