# Code Style - 代码风格与规范约束
## 1. 目录规范
当前代码目录：
- src/frontend/app：页面路由
- src/frontend/components：组件（ui/layout/business）
- src/frontend/data：模拟数据
- src/frontend/hooks：业务hooks
- src/frontend/lib：工具函数
- src/frontend/types：类型定义
- src/backend/api：接口层
- src/backend/services：业务逻辑层
- src/backend/models：模型定义
- src/backend/utils：工具层
## 2. 命名规范
- 文件名：kebab-case
- 组件名：PascalCase
- 函数名：camelCase
- 类型名：PascalCase
- 常量名：UPPER_SNAKE_CASE
## 3. TypeScript 规范
- 禁止 any。
- interface 定义对象结构，type 定义联合类型。
- 类型集中管理，不在页面散落重复定义。
示例：
```ts
export interface Restaurant {
  id: string;
  name: string;
  avgPrice: number;
  rating: number;
  tags: string[];
}
export type Scene = 'solo' | 'date' | 'group' | 'night' | 'budget';
```
## 4. React 规范
- 函数组件优先，Props 必须有类型。
- 仅在需要客户端交互时使用 use client。
- 页面组件负责组合，复杂逻辑放 hooks/lib。
## 5. Tailwind 规范
- 不使用内联样式。
- 类名顺序：布局 -> 尺寸 -> 间距 -> 背景 -> 边框 -> 文字 -> 动效。
- 移动端优先，颜色与间距遵循设计Token。
## 6. shadcn/ui 规范
- 基础组件优先使用 shadcn/ui。
- 业务组件在 shadcn/ui 基础上组合扩展。
- 避免重复造轮子（Button/Card/Dialog/Input/Tabs）。
## 7. 注释规范
- 关键业务规则写中文注释。
- 临时方案用 TODO 标注。
- 禁止无意义注释。
## 8. 导入顺序
1. React/Next
2. 第三方库
3. 项目内组件
4. 数据/工具
5. 类型导入
## 9. 文档联动
- 新增 API 更新 docs/tech/api-design.md
- 新增字段更新 docs/tech/data-schema.md
- 新增功能更新 docs/product/feature-list.md
