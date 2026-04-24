# 现场抽奖接口对接说明（后端）

- OpenAPI 文件：`docs/api/lottery-openapi.yaml`
- 文档版本：`v1.0.0`
- 适用场景：活动现场“注册即抽奖”小程序页

## 1. 业务口径（最终）

- 奖项等级：`FIRST | SECOND | THIRD`。
- 奖项配置：
  - 一等奖：3（固定上限）
  - 二等奖：20（固定上限）
  - 三等奖：`unlimited=true`（可继续发放）
- 资格规则：
  - 活动当天注册用户可抽奖（按活动时区 `Asia/Shanghai` 判断“当天”）
  - 每账号仅一次
  - 可选叠加企业维度仅一次（接口保留扩展字段）

## 2. 接口清单

1. `GET /api/marketing/lottery/campaign/current`
2. `GET /api/marketing/lottery/my-result?campaignId=...`
3. `POST /api/marketing/lottery/draw`
4. `POST /api/marketing/lottery/redeem`

> `draw` 必须返回 `wheelStopIndex(0-11)`，供前端动画落点。

## 3. 统一响应结构

建议统一返回以下结构（已写入 OpenAPI）：

```json
{
  "code": 200,
  "message": "操作成功",
  "success": true,
  "data": {}
}
```

字段说明：

- `code`：业务状态码（数字），`200` 表示成功。
- `message`：人类可读提示。
- `success`：是否成功。
- `data`：业务数据（失败时可为 `null`）。

## 4. 核心字段语义

### 4.1 PrizeLevel 枚举

- `FIRST`
- `SECOND`
- `THIRD`

### 4.2 奖项配置字段（campaign.prizes）

- `level`：奖项等级枚举值。
- `total`：固定总量（一等奖/二等奖建议必填）。
- `remain`：剩余数量（`unlimited=true` 的奖项可为 `null`）。
- `unlimited`：是否可继续发放（本期三等奖为 `true`）。

推荐返回示例（THIRD）：

```json
{
  "level": "THIRD",
  "total": null,
  "remain": null,
  "unlimited": true
}
```

### 4.3 时间字段格式

- 统一使用 `ISO-8601`，必须带时区偏移，例如：`2026-04-23T10:12:33+08:00`。
- `campaign.current.timezone` 返回 `Asia/Shanghai`。
- “当天注册”判定必须以活动时区自然日计算，不以服务器本地时区或 UTC 零点直接判断。

### 4.4 claimCode（领奖编号）

- 中奖必返。
- 建议采用可扩展格式：`LYYYYMMDD-000001`（例如 `L20260423-000327`）。
- 规则要求：全局唯一、可追溯、可用于现场核销。

## 5. 幂等与并发建议（重点）

### 5.1 draw 幂等

- 前端会重试，`POST /draw` 建议支持 `X-Idempotency-Key`。
- 同一账号在同一活动下重复请求：
  - 若已成功开奖，返回同一抽奖结果（推荐）或返回 `ALREADY_DRAWN`（也可）
  - 无论哪种，不能重复发奖。

### 5.2 draw 并发控制

- 必须在事务内做“资格校验 + 发奖 + 落库”。
- 一等奖/二等奖要做库存原子扣减，防止超发。
- 三等奖 `unlimited=true`，可不受总量上限限制，但需保持记录唯一性（`drawId` / `claimCode`）。

### 5.3 redeem 幂等

- `POST /redeem` 支持 `X-Idempotency-Key`。
- 对同一 `claimCode` 重复核销必须拒绝并返回明确错误（如 `ALREADY_REDEEMED`）。

## 6. 错误码建议

最少覆盖以下业务错误码（已在 OpenAPI 示例中体现）：

- `ALREADY_DRAWN`
- `NOT_TODAY_REGISTERED`
- `CAMPAIGN_ENDED`
- `CAMPAIGN_NOT_STARTED`
- `RISK_REJECTED`
- `SYSTEM_BUSY`

可选扩展：

- `ALREADY_REDEEMED`
- `UNAUTHORIZED`
- `BAD_REQUEST`

## 7. 前后端联调注意点

- `wheelStopIndex` 与 `prizeLevel` 必须一致，前端仅负责动画，不参与概率计算。
- `my-result` 要能在页面刷新后恢复状态（含 `hasDrawn`、`claimCode`、`redeemed`）。
- 若启用企业维度限制，后端应基于 `enterpriseDimension.key/value` 执行判重，未启用时可忽略。
