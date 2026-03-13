# 组件设计规范（Component Spec）

## 1. 文档目标
统一关键组件的职责、输入输出与交互规则，避免实现阶段风格和行为不一致。

基础UI约束：

- 基础层统一采用 shadcn/ui 组件体系。
- 业务组件在 shadcn/ui 基础上做组合，不重复造基础轮子。

## 2. 核心组件清单

1. SchoolSwitcher（学校切换器）
2. SceneEntryCard（场景入口卡）
3. AiEntryBanner（AI入口横幅）
4. RestaurantCard（餐厅卡片）
5. RecommendationPanel（推荐结果面板）
6. FilterBar（筛选条）
7. MapView（地图容器）
8. ActionFooter（详情行动栏）

## 3. 组件规范

### 3.1 SchoolSwitcher

- 作用：切换高校上下文，刷新全局数据。
- 输入：`schools[]`, `currentSchoolId`
- 输出事件：`onSchoolChange(schoolId)`
- 规则：切换后保留当前页面，但数据必须同步更新。

### 3.2 SceneEntryCard

- 作用：提供高频场景快速入口。
- 输入：`sceneType`, `title`, `icon`, `description`
- 输出事件：`onClick(sceneType)`
- 规则：支持横向滑动；单卡可在首屏识别场景语义。

### 3.3 AiEntryBanner

- 作用：引导进入AI推荐核心链路。
- 输入：`title`, `subTitle`, `ctaText`
- 输出事件：`onEnterAI()`
- 规则：首页首屏必须可见，样式强调高于普通模块。

### 3.4 RestaurantCard

- 作用：呈现候选餐厅核心决策信息。
- 输入：
	- `restaurantId`
	- `name`
	- `avgPrice`
	- `walkMinutes`
	- `rating`
	- `studentHeat`
	- `tags[]`
	- `reasons[]`
- 输出事件：`onViewDetail(id)`, `onFavorite(id)`
- 规则：信息顺序固定，避免不同页面展示逻辑不一致。

### 3.5 RecommendationPanel

- 作用：承载AI推荐结果集。
- 输入：`queryEcho`, `items[]`, `loading`, `error`
- 输出事件：`onRefresh()`, `onCompare(a,b)`
- 规则：空态、错态、加载态三态齐全。

### 3.6 FilterBar

- 作用：地图/列表统一筛选入口。
- 输入：`priceRange`, `category`, `maxWalkMinutes`, `scene`
- 输出事件：`onFilterChange(filters)`
- 规则：筛选变更后500ms内触发更新反馈。

### 3.7 MapView

- 作用：展示空间分布与点位交互。
- 输入：`center`, `markers[]`, `zoom`
- 输出事件：`onMarkerClick(id)`
- 规则：点位点击必须和列表联动高亮。

### 3.8 ActionFooter

- 作用：详情页行动闭环（导航/收藏/分享）。
- 输入：`restaurantId`, `canNavigate`, `isFavorited`
- 输出事件：`onNavigate()`, `onFavorite()`, `onShare()`
- 规则：导航按钮为主按钮，视觉权重最高。

## 4. 组件状态约定

- `loading`：显示骨架或占位，不可点击主交互。
- `empty`：显示引导文案和可执行建议。
- `error`：显示错误提示 + 重试按钮。
- `disabled`：保留结构但降低视觉权重并提示原因。

## 5. 命名与文件建议

- 业务组件放在：`src/frontend/components/business`
- 基础组件放在：`src/frontend/components/ui`（以 shadcn/ui 生成为主）
- 布局组件放在：`src/frontend/components/layout`
- 文件命名：`PascalCase` 组件导出，文件采用语义小写或同名规则。

## 6. 验收标准（组件级）

1. 关键组件均有明确输入输出事件。
2. 三态（loading/empty/error）至少覆盖核心组件。
3. RestaurantCard和ActionFooter在不同页面展示一致。

---

更新记录

- V1.0（2026-03-13）：首版组件规范，面向快速协同开发。
