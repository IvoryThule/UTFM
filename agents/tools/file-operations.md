# Tool: 文件操作
## 工具概述
定义 Agent 对文件系统的安全读写规范，确保改动可追踪、可回滚、可联动。
## 允许操作
1. create_file
2. update_file
3. delete_file
4. move_file
5. read_file
## 路径白名单
- src/frontend/
- src/backend/
- docs/
- agents/
- public/
## 保护文件（默认不改）
- package.json
- tsconfig.json
- next.config.js
- .gitignore
- .env.local
## 命名规范
- React组件：PascalCase.tsx
- 页面：kebab-case/page.tsx
- 工具函数：camelCase.ts
- 文档：kebab-case.md 或固定名
## 操作规则
1. 写入前先读取上下文，避免覆盖用户改动。
2. 多文件联动修改时，必须列出受影响文件。
3. 删除文件前检查引用关系。
4. 输出需包含“改动原因 + 影响范围 + 后续建议”。
## 日志模板
```text
文件操作记录：
- [创建] path - reason
- [修改] path - reason
- [删除] path - reason
```
