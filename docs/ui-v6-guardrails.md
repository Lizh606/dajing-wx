# AI智享平台 UI v6 执行护栏（微信小程序）

## 1. 强制禁止项

- 禁止在页面层使用 emoji 作为业务图标或状态图标。
- 禁止用“按钮堆叠”替代一级切换；一级切换必须优先使用 Tab 形态。
- 禁止“卡片套卡片”造成层级噪声；普通信息卡保持扁平弱阴影或无阴影。
- 禁止满屏高饱和蓝色背景；品牌蓝仅用于主 CTA、激活态和关键视觉点。
- 禁止仅用颜色表达状态，必须同时提供文字状态（如“待处理/已通过/已驳回”）。

## 2. 页面结构基线

- 每页优先采用三段式：`hero/banner`、`list-card/content`、`footer-safe-area`。
- 顶部区默认浅色沉浸式渐变，禁止重色块压屏。
- 列表卡片信息优先级统一：
  - 类型标签前置
  - 标题与机构信息居中层
  - 价格高优先级（橙色强化）
  - 次级标签弱化为低饱和灰底

## 3. 图标规范

- 主入口图标：面性、饱满、分色明确。
- 二级功能图标：线性、中灰、低优先级。
- 图标入口统一走 `AppIcon` 或统一映射资源，不得直接文本拼图标。

## 4. 组件语义接口

- `AppButton`
  - `tone`: `brand | neutral | success | warning | danger`
  - `variant`: `primary | secondary | ghost | tag`
  - `size`: `large | normal | small | mini`
- `AppTabs`
  - `tone`: `brand | neutral | success | warning | danger`
  - `variant`: `line | chip`
- `AppField`
  - `tone`: `brand | neutral | success | warning | danger`
  - `variant`: `outline | filled`
  - `size`: `large | normal | small`

## 5. 模块验收清单（每次提交前）

- 工程：`npm run type-check` 通过。
- 构建：`npm run build:mp-weixin` 通过。
- 视觉：
  - 蓝色占比受控
  - 服务卡价格与类型层级正确
  - Tab 形态正确且无按钮化堆叠
  - 图标规范符合主入口/二级入口分级
- 交互：
  - 可点击区域不小于 44x44
  - loading 防重复提交
  - 列表加载具备骨架反馈
