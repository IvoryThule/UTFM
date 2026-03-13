# University Food Map

大学城美食地图项目仓库

## 1. 项目简介

University Food Map 是一个面向大学城场景的美食发现与决策应用。
项目通过“场景化导航 + AI推荐 + 地图浏览”帮助用户更快完成用餐决策。

核心能力包括：

- 场景化入口（一个人吃/聚餐/约会/夜宵/穷鬼快乐餐）
- AI对话式推荐（可解释理由）
- 高校锚点地图（步行时长与同校热度）

## 2. 项目结构

- `agents/`：AI协作规范、工作流、技能和工具说明
- `docs/`：产品、设计、技术、交付文档
- `src/frontend/`：前端应用代码
- `src/backend/`：后端服务代码
- `config/`：项目配置相关文件

## 3. 目录结构

```text
university-food-map/
├── agents/
├── docs/
├── src/
│   ├── frontend/
│   └── backend/
├── config/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 4. 文档入口

- 文档索引：`docs/README.md`
- 产品需求：`docs/product/PRD.md`
- 功能规划：`docs/product/feature-list.md`
- 技术设计：`docs/tech/api-design.md`

## 5. 快速启动

```bash
npm install
npm run dev
```

默认访问：`http://localhost:3000`

## 6. 开发建议流程

1. 完善 `src/frontend` 页面与组件
2. 对齐 `src/backend` API能力
3. 联调主链路并补充测试
4. 根据文档进行迭代优化

## 7. 仓库说明

- 本仓库采用 TypeScript 组织前后端代码。
- 文档与代码并行维护，建议修改功能时同步更新文档。
- 提交前建议执行基础格式与静态检查。

---

更新时间：2026-03-13
