# Vant Weapp 渐进迁移清单

## 1. 项目扫描结论

- 当前项目没有大面积依赖现成的第三方 UI 组件库，页面主要由原生标签加 SCSS 设计 token 组成。
- 项目保留了多端脚本入口，但当前页面逻辑以微信小程序为主，只有 5 个页面存在 `#ifdef H5` 条件块，适合采用“微信端优先、其他端保底”的渐进式迁移。
- `manifest.json` 已开启 `usingComponents`，适合按 `wxcomponents` 目录接入 Vant Weapp。
- `@vant/weapp@1.11.7` 中可用能力覆盖 `Button / Cell / Field / Popup / Dialog / Toast / Tabs / ActionSheet / Picker / Switch`，但没有独立的 `Form` 和 `List` 目录，因此本次补了 `AppForm`、`AppList` 兼容壳层。

## 2. 迁移清单

| 现状模式 | 使用文件数 | 推荐迁移目标 | 是否需要人工确认 |
| --- | ---: | --- | --- |
| 原生/手写输入框 `input` | 4 | `AppField -> van-field` | 否 |
| 原生/手写多行输入 `textarea` | 3 | `AppField(type=textarea) -> van-field` | 否 |
| 手写 CTA / 文本按钮 | 13 | `AppButton -> van-button` | 否 |
| 手写设置项/列表项 | 2 | `AppCell` / `AppCellGroup` | 否 |
| 手写开关 | 1 | `AppSwitch -> van-switch` | 否 |
| 手写 tabs 横向分类 | 7 | `AppTabs` / `AppTab -> van-tabs` | 否 |
| `uni.showToast` | 6 | `showAppToast -> vant toast` | 否 |
| `uni.showModal` | 2 | `showAppConfirm / showAppAlert -> vant dialog` | 否 |
| 手写筛选抽屉/弹层 | 2 | `AppPopup` / `AppActionSheet` | 是 |
| 旧图标直接写死为 emoji / 文本 / 图片 | 18 | `AppIcon` 双轨兼容 | 是 |

## 3. 分批计划

### 第 1 批：基础设施

- 接入 `@vant/weapp` 依赖并同步到根目录 `wxcomponents/vant`
- 全局注册 Vant 自定义组件
- 新建 `AppIcon`
- 新建 `Toast`、`Dialog` 适配层
- 新建常用桥接组件：`AppButton`、`AppCell`、`AppCellGroup`、`AppField`、`AppSwitch`

### 第 2 批：低风险页面样板

- `pages/settings/index`：切到 `AppCell` / `AppSwitch` / `AppButton` / `showAppConfirm`
- `pages/institution/consult`：切到 `AppField` / `AppButton` / `showSuccessToast`

### 第 3 批：列表与 tabs 页

- `pages/order/list`
- `pages/report/index`
- `pages/message/index`
- `pages/service/index`

### 第 4 批：复杂表单与弹层页

- `pages/order/create`
- `pages/demand/publish`
- `pages/institution/list`

### 第 5 批：业务列表与服务入口页

- `pages/detection/index`
- `pages/certification/index`
- `pages/mall/index`
- `pages/institution/services`

## 4. 当前已完成

- Vant Weapp 资源接入和同步脚本
- 全局 `usingComponents`
- 根目录 `wxcomponents` 与 `src/wxcomponents` 双目录同步方案，兼容 uni-app 微信小程序构建链路
- `AppIcon`、`AppButton`、`AppCell`、`AppCellGroup`、`AppField`、`AppSwitch`
- `AppPopup`、`AppTabs`、`AppTab`、`AppActionSheet`、`AppPicker`、`AppList`、`AppForm`、`AppSearchPlaceholder` 兼容层
- `showAppToast`、`showSuccessToast`、`showAppConfirm`、`showAppAlert` 服务
- 已完成页面层旧 emoji / 旧图标上下文收口，统一切到 `AppIcon + semantic iconName` 语义映射
- 已迁移页面：
  - `pages/index/index`
  - `pages/settings/index`
  - `pages/institution/consult`
  - `pages/institution/detail`
  - `pages/order/list`
  - `pages/order/detail`
  - `pages/message/index`
  - `pages/mine/index`
  - `pages/report/index`
  - `pages/service/index`
  - `pages/order/create`
  - `pages/demand/detail`
  - `pages/demand/publish`
  - `pages/institution/list`
  - `pages/detection/index`
  - `pages/certification/index`
  - `pages/mall/index`
  - `pages/institution/services`
- 当前页面层状态：`src/pages` 下全部业务页已完成 `App*` 适配层迁移，可按页面逐个回归验收
- 已完成一轮迁移收口：统一抽离多页复用的搜索占位条，减少页面级重复 UI 模板与 scoped 样式
- 已完成二轮迁移收口：抽离服务卡片公共样式 mixin，减少 `service / detection / certification / mall / institution/services` 页重复 CSS
- 已完成三轮迁移收口：抽离状态标签、胶囊 tag、角标 badge 通用 mixin，减少 `order / report / demand / institution / mine` 页重复 CSS
- 已完成图标语义化替换：补齐 `AppIcon` 语义映射表，并移除页面层对旧 `legacy-text` 的依赖
- 已完成验证：
  - `npm run sync:vant`
  - `npm run type-check`
  - `npm run build:mp-weixin`
  - `npm run build:h5`

## 5. 当前保留策略

- `Form`、`List` 暂时通过 `AppForm`、`AppList` 兼容壳层承接，不强行映射成不存在的 Vant Weapp 原生目录
- 图标采用双轨兼容，页面层逐步收敛到 `AppIcon`，旧 iconfont、本地图片、业务专属图标暂不删除
- 复杂交易页、详情页、强业务页面继续按批次迁移，不做一次性全量替换
