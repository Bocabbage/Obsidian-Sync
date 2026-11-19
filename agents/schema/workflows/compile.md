---
type: schema
schema: workflow
workflow: compile
updated: 2026-10-05
---

# Compile Workflow

Compile 将 Raw、Theme、其他 Workspace 材料或 Wiki Legacy 整理为可复用的长期知识。

## 流程

1. 明确本次编译的领域、问题、输出目标、版本范围和文件边界。
2. 区分来源事实、个人记录、既有综合结论和派生视图。
3. 检索现有 Wiki 页面，优先更新已有概念和实体，避免重复建页。
4. 合并重复信息，保留分歧、适用条件和不确定性。
5. 为核心结论建立 `sources`，必要时先创建来源页。
6. 更新相关 Map、索引和 `updated` 日期。
7. 回链相关 Theme、Daily 或 Workspace 材料，分别记录 Wiki、项目文档或其他目标的输出状态。
8. 在 `wiki/_meta/log.md` 记录编译范围和主要变化。

## 从 Theme 检索编译材料

- 从已有 Theme 开始编译时，优先读取 `materials` 中与本次问题相关的 Raw，再结合 Theme 正文说明、roadmap 链接的 Learning Note、相关 Task / Daily、Insight 和已有 Wiki 成果补充上下文；按文件去重，不把同一材料的多处引用算成多份证据。
- `materials` 是明确关联的起点，不是全部来源的边界。继续按标签和关键词补充检索；旧 Theme 缺少该字段或列表为空时，从已有正文链接和检索结果开始，不能认定没有材料。
- 未关联任何 Theme 的 Raw 仍可直接编译，不为配对而创建 Theme；关联只表示相关性，不表示来源已核实、学习已完成或材料必须进入 Wiki。
- 编译成果保留具体来源链，并按需回链 Theme 正文；不把 Wiki 产物混入只关联 Raw 的 `materials`。

## 从学习记录检索编译材料

- 按笔记的 `themes` 或 Theme 的阶段入口定位本次问题，读取相关的随手记录与阶段整理；不把生成的骨架、关注问题或整理提示当作用户已获得的知识。
- 区分课程或资料中的说法、个人理解、疑问和 Agent 建议。需要核实来源时沿实际链接回看 Raw 或 Zotero 等原始资料，个人解释不能替代来源核验。
- 只编译已具备来源链和复用价值的局部认识，不整份搬走学习记录。编译后在相应阶段或 Theme 正文补成果链接，保留原文与尚未解决的问题；成果与学习笔记均不加入 `materials`。

## 从 Insight 检索编译材料

- 围绕本次问题，按 Insight 条目的实际主题标签（含用户自带标签与 `#topic/主题`）跨日期检索，再沿每条 Daily / Raw 链接回看上下文；未补标签的旧条目仍需结合关键词检索，不能因没有标签漏掉。
- Obsidian 中可用 `path:"workspace/insights" tag:#topic/知识管理` 找相关月文件；需定位同一条想法时，用 `path:"workspace/insights" line:("#topic/知识管理" "编译")`，避免把同月不同条目的关键词混为一条证据。只在同一主行写标签，便于逐条提取。搜索语法见 [Obsidian Search](https://obsidian.md/help/plugins/search)。
- 先整理这些材料提出的共同问题、已有观察、分歧与待验证之处，再决定是否具备编译条件。Insight 属于个人记录；重复出现和拥有主题标签都不能替代来源核验，也不把疑问自动改写成结论。
- 编译后在相关 Insight 条目旁追加成果链接，保留原记录、来源和主题标签；标签不是完成状态。不得只把同标签条目拼接到 Wiki 就称为编译完成。

## 渐进编译

- Theme 可以只编译其中一个已经成熟的问题，其余内容继续留在 Workspace。
- Theme 中积累的暂定理解不能替代一手来源；Wiki 结论仍需链接 Raw、来源页或明确标注为个人判断。
- 涉及代码或产品行为时保留版本、提交或来源日期，不能把某一时点观察写成永久规则。
- 一个主题需要输出到 Wiki、项目文档或其他系统时，各目标分别记录结果，不能用其中一个完成状态代替全部。

## Legacy 编译

- Wiki 内 Legacy 可直接作为待整理材料，但不假定其字段或来源完整。
- Root Legacy 先按 `migrate-legacy.md` 拆分所有权，再分别进入 Raw、Workspace 或 Wiki。
- 不在一个未审阅批次中大规模重命名、拆分和改写多个领域。
