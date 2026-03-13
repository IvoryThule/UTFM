# Workflow: 组件开发
## 触发条件
页面骨架已搭建，进入组件实现阶段。
## 开发步骤
### Step 1: 组件定义卡
每个组件先写清：
- 名称
- 所属层（ui/business/layout）
- 所在路径
- Props
- 依赖组件
### Step 2: 类型先行
先定义 Props interface，再写 JSX。
### Step 3: 编码实现
- 使用 TypeScript
- 使用 shadcn/ui 组合
- 保持单一职责
- 必要处加简短注释
### Step 4: 页面接入验证
- 数据空值
- 长文本
- 交互反馈
- 移动端显示
## 组件优先级
P0（先做）
- BottomNav
- TopBar
- PageContainer
- RestaurantCard
- AIEntryCard
- SceneEntry
- ChatMessage
- RecommendCard
P1（后做）
- FoodMap
- RankingCard
- ReviewItem
- DishCard
- ExploreProgress
## 目录约定
- src/frontend/components/ui/*
- src/frontend/components/business/*
- src/frontend/components/layout/*
## 完成标准
- [ ] 组件有明确类型定义
- [ ] 组件可复用，无页面内复制粘贴实现
- [ ] 关键组件通过移动端验收
- [ ] 无明显TypeScript错误
