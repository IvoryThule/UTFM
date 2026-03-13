# Skill: AI 推荐对话
## 技能概述
实现“AI帮我选”的核心链路：自然语言输入 -> 意图解析 -> 餐厅筛选排序 -> 推荐理由生成 -> 对话UI展示。
## 架构
1. Intent Parser：提取预算/品类/场景/人数/口味/高校
2. Recommender：过滤 + 打分排序
3. Reason Generator：生成1-2条可解释理由
4. Chat UI：打字机、推荐卡片、快捷标签、异常引导
## 目录约定
- src/frontend/lib/ai-engine/intent-parser.ts
- src/frontend/lib/ai-engine/recommender.ts
- src/frontend/lib/ai-engine/reason-generator.ts
- src/frontend/lib/ai-engine/keywords.ts
- src/frontend/components/business/AIPick/*
- src/frontend/types/chat.ts
## 意图解析规则
必须支持：
- 预算：如“30以内”“20-40”
- 场景：solo/date/group/late-night/budget
- 品类：火锅/面食/中餐/日韩等
- 高校：北大/清华/人大/北理工
- 人数：如“5个人”
- 否定词：不要辣、不吃火锅
输出结构建议：
```ts
type ParsedIntent = {
  budget?: { min?: number; max?: number };
  category?: string;
  scene?: string;
  taste?: string[];
  excludeTaste?: string[];
  partySize?: number;
  nearUniversity?: string;
  confidence: number;
};
```
## 推荐打分建议
建议维度和权重：
- 预算匹配：25
- 品类匹配：25
- 同校热度：20
- 评分质量：15
- 距离可达：15
硬过滤建议：
- 超预算过多直接排除
- 步行超过20分钟优先排除
- 排除用户明确否定品类/口味
## 推荐理由生成
理由需“短且可解释”，优先级：
1. 预算匹配
2. 步行时长
3. 同校热度
4. 招牌菜/优惠
5. 场景匹配
每条结果至少 1 条，最多 2 条理由。
## 对话交互规范
1. 用户发送后立即显示用户气泡
2. AI显示 800-1200ms 思考态
3. 显示简短文字 + 推荐卡片
4. 无结果时给“放宽条件”建议
必须包含：
- 快捷标签
- 随机推荐
- 二选一PK（可P1实现）
## 空状态与异常
- 首次进入：引导文案 + 快捷标签
- 输入过短：提示补充预算/场景
- 无结果：建议放宽预算或距离
- 非美食问题：回到美食助手角色
## 验收标准
- [ ] 输入“人均30以内，想吃面，离北大近”返回3条合理推荐
- [ ] 每条推荐附可解释理由
- [ ] 思考态与打字机效果正常
- [ ] 快捷标签可填充输入框
- [ ] 随机推荐可用
- [ ] 无结果引导文案友好
- [ ] 移动端输入框不被键盘遮挡
