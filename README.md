# Weekly Research & Growth Radar

面向博士科研方向与个人技术成长的每周情报站。

## 站点架构

- **GitHub Pages 是唯一网页入口与部署平台**
- **Supabase 只负责登录、会话、已读状态和私人笔记数据库**
- 私人笔记不会写入公开 GitHub、Markdown 或周报 JSON
- Higgsfield 不参与线上托管、登录或数据存储

## 每周更新

每周五自动更新，并按三层范围筛选：

1. 航空旅客需求预测、选择行为、需求不确定性、鲁棒航班计划、机型指派；
2. Transportation / OR / DFL / 概率预测 / 图学习 / 时空预测 / 行为 AI；
3. AI / ML / CV 中对未来方法迁移、Demo、GitHub 项目或实习准备有价值的高水平工作。

## 目录

- `index.html`：公开首页
- `login.html`：GitHub Pages 内登录页
- `workspace.html`：登录后的云端笔记周报
- `cloud.js`：Supabase Edge Function 客户端
- `data/current.json`：当前周公开推荐
- `data/archive.json`：历史索引
- `weekly/YYYY-MM-DD.md`：公开周报源文件
- `weekly/YYYY-MM-DD.json`：结构化周报数据
- `weekly/view.html`：周报阅读器

当前一期：[`2026-09-25`](weekly/view.html?week=2026-09-25)
