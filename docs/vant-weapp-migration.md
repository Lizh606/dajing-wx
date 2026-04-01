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

## 4. 当前已完成

- Vant Weapp 资源接入和同步脚本
- 全局 `usingComponents`
- `AppIcon`、`AppButton`、`AppCell`、`AppCellGroup`、`AppField`、`AppSwitch`
- `AppPopup`、`AppTabs`、`AppTab`、`AppActionSheet`、`AppPicker`、`AppList` 兼容层
- `showAppToast`、`showAppConfirm` 服务
- 首批迁移页面：`系统设置`、`立即咨询`
